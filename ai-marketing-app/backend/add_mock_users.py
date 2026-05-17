import json
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
db_path = "c:/Users/kimeu/Documents/dmcontents/ai-marketing-app/backend/db.json"

import os

if os.path.exists(db_path):
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)
else:
    db = {
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
        "projects": [
            {"id": "proj-1", "name": "Q3 Campaign Sprint", "description": "Q3 마케팅 스프린트", "type": "Marketing Strategy", "created_at": "2026-05-15 10:00:00", "created_by": "kimeunyong", "members": []},
            {"id": "proj-2", "name": "Neural Brand Voice", "description": "AI 브랜드 보이스 튜닝", "type": "AI Tuning", "created_at": "2026-05-14 15:30:00", "created_by": "kimeunyong", "members": []},
        ]
    }

mock_users = [
    {"id": "leeminho1", "name": "이민호", "department": "R&D센터.AI선행연구팀"},
    {"id": "leeminho2", "name": "이민호", "department": "경영지원담당.인사기획팀"},
    {"id": "kimjiwon", "name": "김지원", "department": "마케팅담당.디지털마케팅팀"},
    {"id": "parkseojun", "name": "박서준", "department": "영업본부.국내영업1팀"},
    {"id": "choiwooshik", "name": "최우식", "department": "전략기획실.신사업기획팀"},
    {"id": "jungyumi", "name": "정유미", "department": "디자인센터.UX/UI팀"},
    {"id": "gongyoo", "name": "공유", "department": "PR기획팀.미디어홍보1팀"},
    {"id": "suzy", "name": "배수지", "department": "글로벌영업본부.해외영업팀"},
    {"id": "iu", "name": "이지은", "department": "경영AX담당.데이터분석팀"},
    {"id": "parkbogeum", "name": "박보검", "department": "생산기술센터.자동화설비팀"},
]

for u in mock_users:
    # 이미 존재하는 아이디는 스킵
    if any(existing["id"] == u["id"] for existing in db["users"]):
        continue
    new_user = {
        "id": u["id"],
        "name": u["name"],
        "email": f"{u['id']}@lgchem.com",
        "password_hash": pwd_context.hash("password123!"),
        "department": u["department"],
        "role": "user",
        "status": "approved", # 멤버 검색에 나오도록 즉시 승인 처리
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    db["users"].append(new_user)

with open(db_path, "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Added 10 users successfully!")
