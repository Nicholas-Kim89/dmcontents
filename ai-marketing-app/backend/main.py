import os
import json
import base64
import asyncio
import uuid
import secrets
import string
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from google import genai
from google.genai import types
from agents import build_campaign_graph, parse_file

import logging

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("error.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("backend")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "xxxxxxxxxx"
client = genai.Client(api_key=API_KEY)

# ─── Config ───────────────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "kimeunyong@lgchem.com")
JWT_SECRET = os.getenv("JWT_SECRET", "synthetix-lgchem-secret-2026")
EMAIL_DOMAIN = os.getenv("EMAIL_DOMAIN", "lgchem.com")
JWT_ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# ─── JSON 파일 기반 DB ─────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "db.json"

def load_db() -> dict:
    default_db = {
        "users": [
            {
                "id": "kimeunyong",
                "name": "김은용",
                "email": "kimeunyong@lgchem.com",
                "password_hash": pwd_context.hash("kimeunyong"),
                "department": "경영AX담당.경영혁신AX팀",
                "role": "admin",
                "status": "approved",
                "created_at": "2026-01-01 00:00:00"
            }
        ],
        "projects": [],
        "teams": [
            {
                "id": "team-default",
                "name": "공통 워크스페이스",
                "description": "기본 팀 공간입니다.",
                "created_at": "2026-01-01 00:00:00",
                "created_by": "system"
            }
        ],
        "team_members": [
            {
                "team_id": "team-default",
                "user_id": "kimeunyong",
                "role": "OWNER"
            }
        ],
        "assets": []
    }

    if DB_PATH.exists():
        with open(DB_PATH, "r", encoding="utf-8") as f:
            db = json.load(f)
            
            # Migration: Ensure new keys exist
            if "teams" not in db:
                db["teams"] = default_db["teams"]
                db["team_members"] = default_db["team_members"]
                db["assets"] = []
                
                # Migrate existing projects to default team
                for proj in db.get("projects", []):
                    if "team_id" not in proj:
                        proj["team_id"] = "team-default"
                
                # Add all existing users to default team as members if not already there
                for user in db.get("users", []):
                    if not any(m["user_id"] == user["id"] and m["team_id"] == "team-default" for m in db["team_members"]):
                        db["team_members"].append({
                            "team_id": "team-default",
                            "user_id": user["id"],
                            "role": "EDITOR" if user["role"] != "admin" else "OWNER"
                        })
                save_db(db)
            return db
    return default_db

def save_db(data: dict):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ─── Email ─────────────────────────────────────────────────
async def send_email(to: str, subject: str, html_body: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning(f"SMTP not configured. Would send to {to}: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USER
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )
        logger.info(f"Email sent to {to}")
    except Exception as e:
        logger.error(f"Email sending failed: {e}")

# ─── JWT ───────────────────────────────────────────────────
def create_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    user_id = decode_token(token)
    db = load_db()
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user["status"] != "approved":
        raise HTTPException(status_code=403, detail="Account pending approval")
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ─── Models ────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    id: str
    name: str
    password: str
    department: str

class LoginRequest(BaseModel):
    id: str
    password: str

class ForgotPasswordRequest(BaseModel):
    id: str

class UpdateDepartmentRequest(BaseModel):
    department: str

class CreateProjectRequest(BaseModel):
    name: str
    description: str = ""
    members: List[str] = []  # user ids
    team_id: Optional[str] = "team-default"

class TeamCreateRequest(BaseModel):
    name: str
    description: str = ""

class AssetCreateRequest(BaseModel):
    team_id: str
    type: str
    metadata: dict = {}

class GenerateRequest(BaseModel):
    model: str
    prompt: str
    aspect_ratio: str = "1:1"
    image_size: str = "1K"
    use_search: bool = False
    base_image: Optional[str] = None
    project_id: Optional[str] = None

class VariationsRequest(BaseModel):
    prompt: str
    count: int = 3

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: List[ChatMessage] = []
    google_search: bool = False

# ─── Auth Endpoints ────────────────────────────────────────
@app.post("/auth/register")
async def register(req: RegisterRequest):
    db = load_db()
    
    # 아이디 중복 체크
    if any(u["id"] == req.id for u in db["users"]):
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다.")

    email = f"{req.id}@{EMAIL_DOMAIN}"
    new_user = {
        "id": req.id,
        "name": req.name,
        "email": email,
        "password_hash": pwd_context.hash(req.password),
        "department": req.department,
        "role": "user",
        "status": "pending",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    db["users"].append(new_user)
    save_db(db)

    # 관리자에게 알림 메일
    admin_html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f1a;color:#fff;border-radius:12px;">
      <h2 style="color:#8b5cf6;">🔔 Synthetix AI - 신규 가입 신청</h2>
      <p>새로운 사용자가 가입을 신청했습니다. 관리자 승인이 필요합니다.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;color:#a1a1aa;">이름</td><td style="padding:8px;color:#fff;">{req.name}</td></tr>
        <tr><td style="padding:8px;color:#a1a1aa;">아이디</td><td style="padding:8px;color:#fff;">{req.id}</td></tr>
        <tr><td style="padding:8px;color:#a1a1aa;">이메일</td><td style="padding:8px;color:#8b5cf6;">{email}</td></tr>
        <tr><td style="padding:8px;color:#a1a1aa;">소속</td><td style="padding:8px;color:#fff;">{req.department}</td></tr>
        <tr><td style="padding:8px;color:#a1a1aa;">신청일시</td><td style="padding:8px;color:#fff;">{new_user['created_at']}</td></tr>
      </table>
      <p style="margin-top:20px;color:#a1a1aa;">Synthetix 관리자 패널에서 승인 또는 거절 처리를 해주세요.</p>
    </div>
    """
    await send_email(ADMIN_EMAIL, f"[Synthetix] 신규 가입 신청 - {req.name} ({req.id})", admin_html)

    return {"message": "가입 신청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다."}

@app.post("/auth/login")
async def login(req: LoginRequest):
    db = load_db()
    user = next((u for u in db["users"] if u["id"] == req.id), None)
    
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    
    if user["status"] == "pending":
        raise HTTPException(status_code=403, detail="PENDING")
    if user["status"] == "rejected":
        raise HTTPException(status_code=403, detail="REJECTED")

    token = create_token(user["id"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "department": user["department"],
            "role": user["role"]
        }
    }

@app.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    db = load_db()
    user = next((u for u in db["users"] if u["id"] == req.id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="존재하지 않는 아이디입니다.")

    # 임시 비밀번호 생성 (8자리 영숫자)
    chars = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(chars) for _ in range(8))
    
    # DB 업데이트
    for u in db["users"]:
        if u["id"] == req.id:
            u["password_hash"] = pwd_context.hash(temp_password)
    save_db(db)

    # 임시 비밀번호 이메일 발송
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f1a;color:#fff;border-radius:12px;">
      <h2 style="color:#8b5cf6;">🔑 Synthetix AI - 임시 비밀번호 안내</h2>
      <p>안녕하세요, <strong>{user['name']}</strong>님.</p>
      <p>요청하신 임시 비밀번호를 발급해 드립니다.</p>
      <div style="background:#1e1e2e;border:1px solid #8b5cf6;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#a1a1aa;margin:0 0 8px;">임시 비밀번호</p>
        <p style="font-size:28px;font-weight:bold;color:#8b5cf6;letter-spacing:4px;margin:0;">{temp_password}</p>
      </div>
      <p style="color:#f87171;">⚠️ 보안을 위해 로그인 후 반드시 비밀번호를 변경해 주세요.</p>
    </div>
    """
    await send_email(user["email"], "[Synthetix] 임시 비밀번호 안내", html)
    
    return {"message": f"임시 비밀번호가 {user['email']}로 발송되었습니다."}

# ─── User Endpoints ────────────────────────────────────────
@app.get("/users/search")
async def search_users(q: str, current_user: dict = Depends(get_current_user)):
    q = q.strip().lower()
    if not q:
        return []
    db = load_db()
    results = []
    for u in db["users"]:
        name = u.get("name", "").lower()
        uid = u.get("id", "").lower()
        # 이름이나 ID에 검색어가 포함되어 있고, 승인된 사용자인 경우
        if (q in name or q in uid) and u.get("status") == "approved":
            results.append({
                "id": u["id"],
                "name": u["name"],
                "department": u["department"],
                "email": u["email"]
            })
    
    # 디버깅을 위한 출력 (서버 로그에서 확인 가능)
    print(f"Search query: '{q}', Results found: {len(results)}")
    return results

@app.patch("/users/me/department")
async def update_department(req: UpdateDepartmentRequest, current_user: dict = Depends(get_current_user)):
    db = load_db()
    for u in db["users"]:
        if u["id"] == current_user["id"]:
            u["department"] = req.department
    save_db(db)
    return {"message": "소속이 업데이트되었습니다."}

@app.get("/users/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "department": current_user["department"],
        "role": current_user["role"]
    }

# ─── Admin Endpoints ───────────────────────────────────────
@app.get("/admin/pending-users")
async def get_pending_users(admin: dict = Depends(get_admin_user)):
    db = load_db()
    return [
        {"id": u["id"], "name": u["name"], "email": u["email"], "department": u["department"], "created_at": u["created_at"]}
        for u in db["users"] if u["status"] == "pending"
    ]

@app.post("/admin/approve/{user_id}")
async def approve_user(user_id: str, admin: dict = Depends(get_admin_user)):
    db = load_db()
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    user["status"] = "approved"
    save_db(db)

    # 승인 안내 메일
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f0f1a;color:#fff;border-radius:12px;">
      <h2 style="color:#22c55e;">✅ Synthetix AI - 가입이 승인되었습니다!</h2>
      <p>안녕하세요, <strong>{user['name']}</strong>님.</p>
      <p>Synthetix AI 계정이 승인되었습니다. 이제 로그인하실 수 있습니다.</p>
      <div style="background:#1e1e2e;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:4px 0;color:#a1a1aa;">아이디: <span style="color:#fff;">{user['id']}</span></p>
        <p style="margin:4px 0;color:#a1a1aa;">이메일: <span style="color:#8b5cf6;">{user['email']}</span></p>
      </div>
    </div>
    """
    await send_email(user["email"], "[Synthetix] 가입 승인 안내", html)
    return {"message": f"{user['name']}({user['id']}) 계정이 승인되었습니다."}

@app.post("/admin/reject/{user_id}")
async def reject_user(user_id: str, admin: dict = Depends(get_admin_user)):
    db = load_db()
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    user["status"] = "rejected"
    save_db(db)
    return {"message": f"{user['name']} 계정이 거절되었습니다."}

# ─── Project Endpoints ─────────────────────────────────────
@app.get("/projects")
async def list_projects(team_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    db = load_db()
    projects = db["projects"]
    if team_id:
        projects = [p for p in projects if p.get("team_id") == team_id]
    return projects

@app.post("/projects")
async def create_project(req: CreateProjectRequest, current_user: dict = Depends(get_current_user)):
    db = load_db()
    
    # 멤버 상세 정보 조회
    member_details = []
    for uid in req.members:
        u = next((u for u in db["users"] if u["id"] == uid), None)
        if u:
            member_details.append({"id": u["id"], "name": u["name"], "department": u["department"]})

    new_project = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "description": req.description,
        "type": "New Campaign",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "created_by": current_user["id"],
        "members": member_details,
        "team_id": req.team_id
    }
    db["projects"].insert(0, new_project)
    save_db(db)
    return new_project

# ─── Team Endpoints ────────────────────────────────────────
@app.get("/teams")
async def list_teams(current_user: dict = Depends(get_current_user)):
    db = load_db()
    # 사용자가 속한 팀만 반환
    user_team_ids = [m["team_id"] for m in db["team_members"] if m["user_id"] == current_user["id"]]
    return [t for t in db["teams"] if t["id"] in user_team_ids]

@app.post("/teams")
async def create_team(req: TeamCreateRequest, current_user: dict = Depends(get_current_user)):
    db = load_db()
    team_id = f"team-{str(uuid.uuid4())[:8]}"
    new_team = {
        "id": team_id,
        "name": req.name,
        "description": req.description,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "created_by": current_user["id"]
    }
    db["teams"].append(new_team)
    db["team_members"].append({
        "team_id": team_id,
        "user_id": current_user["id"],
        "role": "OWNER"
    })
    save_db(db)
    return new_team

class AddTeamMemberRequest(BaseModel):
    user_id: str
    role: str = "EDITOR"

@app.post("/teams/{team_id}/members")
async def add_team_member(team_id: str, req: AddTeamMemberRequest, current_user: dict = Depends(get_current_user)):
    db = load_db()
    
    # Check if team exists
    if not any(t["id"] == team_id for t in db["teams"]):
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if member already exists
    if any(m["team_id"] == team_id and m["user_id"] == req.user_id for m in db["team_members"]):
        raise HTTPException(status_code=400, detail="User is already a member of this team")

    # Check if user to add exists
    if not any(u["id"] == req.user_id for u in db["users"]):
        raise HTTPException(status_code=404, detail="User not found")
        
    db["team_members"].append({
        "team_id": team_id,
        "user_id": req.user_id,
        "role": req.role
    })
    save_db(db)
    return {"status": "success", "message": "Team member added"}

@app.get("/teams/{team_id}/members")
async def list_team_members(team_id: str, current_user: dict = Depends(get_current_user)):
    db = load_db()
    members = [m for m in db["team_members"] if m["team_id"] == team_id]
    result = []
    for m in members:
        user = next((u for u in db["users"] if u["id"] == m["user_id"]), None)
        if user:
            result.append({
                "id": user["id"],
                "name": user["name"],
                "role": m["role"],
                "department": user["department"]
            })
    return result

# ─── Asset Endpoints ────────────────────────────────────────
STORAGE_DIR = BASE_DIR / "storage" / "assets"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/assets")
async def list_assets(team_id: str, current_user: dict = Depends(get_current_user)):
    db = load_db()
    return [a for a in db["assets"] if a["team_id"] == team_id]

@app.post("/assets/upload")
async def upload_asset(
    team_id: str = Form(...),
    asset_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    db = load_db()
    file_id = str(uuid.uuid4())
    ext = Path(file.filename).suffix
    file_name = f"{file_id}{ext}"
    file_path = STORAGE_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    new_asset = {
        "id": file_id,
        "team_id": team_id,
        "type": asset_type,
        "name": file.filename,
        "file_url": f"/storage/assets/{file_name}",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "created_by": current_user["id"]
    }
    db["assets"].append(new_asset)
    save_db(db)
    return new_asset

app.mount("/storage", StaticFiles(directory=str(BASE_DIR / "storage")), name="storage")

# ─── Image Generation ──────────────────────────────────────
def _run_imagen(request: GenerateRequest):
    response = client.models.generate_images(
        model=request.model,
        prompt=request.prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio=request.aspect_ratio,
            image_size=request.image_size,
            safety_filter_level="BLOCK_LOW_AND_ABOVE"
        )
    )
    if not response.generated_images:
        raise ValueError("Imagen generated no images.")
    image_bytes = response.generated_images[0].image.image_bytes
    return base64.b64encode(image_bytes).decode("utf-8"), "image/png"

def _run_gemini(request: GenerateRequest):
    contents = []
    if request.base_image:
        b64_data = request.base_image.split(",")[1] if "," in request.base_image else request.base_image
        contents.append(types.Part.from_bytes(data=base64.b64decode(b64_data), mime_type="image/png"))
        system_instruction = (
            "IMPORTANT: Any red/green strokes, semi-transparent shapes, or text overlays visible in the provided image "
            "are purely user annotations indicating WHERE to edit or what to modify. "
            "DO NOT include these red/green annotation colors or strokes in your final output image. "
            "Treat them strictly as a mask/guide. Seamlessly blend your generated content with the original background."
        )
        contents.append(f"{system_instruction}\n\nUser Request: Based on the provided image, {request.prompt}. Maintain {request.aspect_ratio} ratio.")
    else:
        contents.append(f"{request.prompt}\n\n[Requirements: aspect ratio {request.aspect_ratio}, resolution {request.image_size}]")

    config_kwargs = {"response_modalities": ["TEXT", "IMAGE"]}
    if request.use_search:
        config_kwargs["tools"] = [types.Tool(google_search=types.GoogleSearch())]

    response = client.models.generate_content(
        model=request.model,
        contents=contents,
        config=types.GenerateContentConfig(**config_kwargs)
    )

    for candidate in response.candidates:
        if candidate.content and candidate.content.parts:
            for part in candidate.content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return base64.b64encode(part.inline_data.data).decode("utf-8"), part.inline_data.mime_type or "image/png"
    raise ValueError("No image found.")

@app.post("/generate")
async def generate_image(request: GenerateRequest):
    try:
        logger.info(f"Generate Request for Project: {request.project_id}")
        timeout_seconds = 120
        if "imagen" in request.model.lower():
            b64, mime = await asyncio.wait_for(asyncio.to_thread(_run_imagen, request), timeout=timeout_seconds)
        else:
            b64, mime = await asyncio.wait_for(asyncio.to_thread(_run_gemini, request), timeout=timeout_seconds)
        return {"image": f"data:{mime};base64,{b64}"}
    except Exception as e:
        logger.exception("Generation failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/prompt/variations")
async def get_prompt_variations(request: VariationsRequest):
    try:
        system_instruction = (
            "You are a creative visual prompt engineer. Given a user's basic image prompt, "
            "generate a list of conceptually diverse and visually interesting variations. "
            "Each variation should explore a different mood, environment, lighting, or artistic style "
            "while maintaining the core subject of the original prompt. "
            "Return the result as a simple JSON list of strings. No extra text."
        )
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[f"{system_instruction}\n\nOriginal Prompt: {request.prompt}\nGenerate {request.count} variations."],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        variations = json.loads(text)
        if isinstance(variations, dict) and "variations" in variations:
            variations = variations["variations"]
        return {"variations": variations}
    except Exception as e:
        logger.exception("Variation generation failed")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Campaign Pipeline ─────────────────────────────────────
campaign_sessions: dict = {}

@app.post("/campaign/upload")
async def campaign_upload(
    session_id: str = Form(...),
    files: List[UploadFile] = File(...),
    team_id: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    # 인증 토큰 파싱 (선택적)
    current_user_id = "anonymous"
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "")
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            current_user_id = payload.get("sub", "anonymous")
        except Exception:
            pass

    db = load_db()
    texts = []
    saved_assets = []

    for file in files:
        content = await file.read()

        # 1. 텍스트 파싱 (기존 로직)
        parsed = parse_file(file.filename or "unknown", content)
        if parsed:
            texts.append(f"--- {file.filename} ---\n{parsed}")

        # 2. Asset Library에 파일 저장
        file_id = str(uuid.uuid4())
        ext = Path(file.filename or "unknown").suffix
        file_name = f"{file_id}{ext}"
        file_path = STORAGE_DIR / file_name

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # 3. DB의 assets에 등록
        new_asset = {
            "id": file_id,
            "team_id": team_id or "team-default",
            "type": "document",
            "name": file.filename,
            "file_url": f"/storage/assets/{file_name}",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "created_by": current_user_id,
            "session_id": session_id  # 캠페인 세션과 연결
        }
        db["assets"].append(new_asset)
        saved_assets.append(new_asset)

    save_db(db)

    combined_text = "\n\n".join(texts)
    campaign_sessions[session_id] = {"knowledge_text": combined_text}
    return {
        "session_id": session_id,
        "files_parsed": len(files),
        "total_chars": len(combined_text),
        "preview": combined_text[:500] if combined_text else "(empty)",
        "saved_assets": saved_assets
    }

@app.post("/campaign/generate")
async def campaign_generate(
    session_id: str = Form(...),
    prompt: str = Form(...),
    project_id: Optional[str] = Form(None),
    google_search: bool = Form(False)
):
    knowledge_text = campaign_sessions.get(session_id, {}).get("knowledge_text", "")
    initial_state = {
        "user_prompt": prompt, "knowledge_text": knowledge_text, "strategy": "",
        "copies": [], "image_prompts": [], "review_result": "", "retry_count": 0,
        "final_copies": [], "final_image_prompts": [], "error": None,
        "google_search": google_search
    }
    try:
        campaign_graph = build_campaign_graph(API_KEY)
        final_state = await asyncio.wait_for(asyncio.to_thread(campaign_graph.invoke, initial_state), timeout=180)
        if final_state.get("error"):
            raise HTTPException(status_code=500, detail=final_state["error"])
        return {
            "strategy": final_state.get("strategy", ""), "copies": final_state.get("final_copies", []),
            "image_prompts": final_state.get("final_image_prompts", []), "review_result": final_state.get("review_result", ""),
            "retry_count": final_state.get("retry_count", 0),
        }
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Campaign generation timed out (>3 min).")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Campaign generation error")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/campaign/chat")
async def campaign_chat(req: ChatRequest):
    knowledge_text = campaign_sessions.get(req.session_id, {}).get("knowledge_text", "")
    system_instruction = (
        "You are an AI Marketing Assistant. Use the provided Knowledge Base to answer the user's questions.\n"
        f"--- KNOWLEDGE BASE ---\n{knowledge_text}\n----------------------\n"
        "If the answer is not in the knowledge base, answer based on your general marketing knowledge."
    )
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=system_instruction)])]
    contents.append(types.Content(role="model", parts=[types.Part.from_text(text="Understood. I will answer based on the knowledge base.")]))
    for msg in req.history:
        role = "user" if msg.role == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=req.message)]))
    try:
        config_params = {}
        if req.google_search:
            config_params["tools"] = [types.Tool(google_search=types.GoogleSearchRetrieval())]
        
        config = types.GenerateContentConfig(
            **config_params
        )
        
        response = client.models.generate_content(
            model='gemini-3-flash-preview', 
            contents=contents,
            config=config
        )
        return {"response": response.text}
    except Exception as e:
        logger.exception("Chat generation error")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Frontend Static Files Serve ───────────────────────────
from fastapi.responses import FileResponse

DIST_DIR = BASE_DIR.parent / "dist"

logger.info(f"Checking frontend static files path: {DIST_DIR} | exists: {DIST_DIR.exists()}")

if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="frontend")
    
    @app.exception_handler(404)
    async def custom_404_handler(request, exc):
        return FileResponse(str(DIST_DIR / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)