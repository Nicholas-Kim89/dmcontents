# 🚀 Synthetix AI 마케팅 앱 배포 가이드 (Deployment Guide)

본 가이드는 **AI 마케팅 앱** (FastAPI 백엔드 + Vite React 프론트엔드)을 두 가지 주요 타겟 환경에 배포하고 구성하기 위한 상세 안내서입니다.
1. **리눅스 기반 개발 서버 (Python 3.11)** - 회사 클라우드 네트워크 구조(내부 포트 `9101`, 프록시를 통한 외부 `aws.lgchem.com/32202` 접속 환경)에 최적화된 설정입니다.
2. **Google Cloud Platform (GCP)** - 서버리스 환경(**Cloud Run**) 및 가상 머신(**Compute Engine**) 배포 방식을 다룹니다.

---

# 🏗️ 추천 아키텍처: 단일 포트 통합 배포 (Single-Port Deployment)
현재 React 프론트엔드는 여러 컴포넌트에 백엔드 주소(`http://localhost:8000`)가 하드코딩되어 있으며, 프론트엔드와 백엔드가 각각 별개의 포트로 실행되도록 구성되어 있습니다.
그러나 실제 개발 서버나 운영 서버 배포 환경(사내 프록시 포함)에서 **FastAPI와 Vite 개발 서버를 각각 별도의 포트로 띄우는 방식은 권장하지 않습니다**.

### 💡 해결 방안 (단일 포트 통합 아키텍처):
1. **React 프론트엔드 컴파일**: `npm run build` 명령어를 실행하여 React 코드를 정적 파일(`dist/` 폴더)로 빌드합니다.
2. **FastAPI 정적 파일 서빙**: FastAPI 백엔드 코드 내에서 루트 경로(`/`)에 이 빌드된 정적 파일들을 서빙하도록 `StaticFiles` 설정을 적용합니다.
3. **상대 경로(Relative Path) 전환**: React 코드 내부의 API 호출 경로를 하드코딩된 주소 대신 상대 경로(예: `/auth/login`)로 수정합니다.
4. **포트 9101 단일 실행**: 백엔드와 프론트엔드가 모두 하나의 포트 **`9101`**에서 원활하게 작동하여, CORS 문제가 완전히 해결되고 프록시 연동이 극도로 간편해집니다.

---

# 📖 Part 1: 리눅스 기반 개발 서버 배포 가이드 (Python 3.11)

사내 클라우드 프록시 환경의 리눅스 개발 서버에서 Python 3.11 기반으로 전체 애플리케이션을 구동하기 위한 연동 및 배포 절차입니다.

### 1. 단일 포트 통합을 위한 사전 코드 수정 (권장)

#### A. 프론트엔드: API 경로를 상대 경로로 전환
React 파일들에서 API 호출 시 주소를 상대 경로(예: `/auth/login`)로 사용하도록 변경합니다.
로컬 개발 환경에서는 Vite의 자체 프록시 기능을 이용해 `/auth/*`, `/projects/*` 등의 요청을 백엔드(`http://localhost:8000`)로 전달되게 설정할 수 있습니다.

`vite.config.ts` 파일에 아래와 같이 `proxy` 설정을 추가합니다:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/projects': 'http://localhost:8000',
      '/teams': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/assets': 'http://localhost:8000',
      '/generate': 'http://localhost:8000',
      '/prompt': 'http://localhost:8000',
      '/campaign': 'http://localhost:8000',
      '/storage': 'http://localhost:8000',
    }
  }
})
```

#### B. 백엔드: `main.py`에 프론트엔드 정적 파일 마운트
`backend/main.py` 파일의 하단부(Uvicorn 실행 코드 직전)에 프론트엔드 정적 파일 마운트 설정을 추가합니다:

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# 1. 파일 업로드용 스토리지 디렉토리 마운트
app.mount("/storage", StaticFiles(directory=str(BASE_DIR / "storage")), name="storage")

# 2. 컴파일된 React 프론트엔드 정적 파일 마운트 (dist 디렉토리 필요)
# 프론트엔드가 먼저 빌드되어 "../dist" 경로가 존재해야 정상 작동합니다.
DIST_DIR = BASE_DIR.parent / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="frontend")
    
    # 3. React SPA 라우팅 지원 (404 발생 시 index.html로 Fallback)
    @app.exception_handler(404)
    async def custom_404_handler(request, exc):
        return FileResponse(str(DIST_DIR / "index.html"))
```

---

### 2. 리눅스 서버 배포 단계별 실행 명령어

#### 1단계: 필수 시스템 패키지 설치
서버에 Python 3.11, pip, virtualenv, 그리고 Node.js(v18 이상)가 구성되어 있는지 확인하고 설치를 진행합니다:
```bash
# 시스템 패키지 리스트 업데이트
sudo apt update && sudo apt upgrade -y

# Python 3.11 및 빌드 도구 설치
sudo apt install python3.11 python3.11-venv python3.11-dev python3-pip build-essential -y

# Node.js v18 설치 (NodeSource 저장소 이용)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 2단계: 소스코드 복제 및 디렉토리 설정
프로젝트 코드를 서버의 배포 경로로 복제하고 이동합니다:
```bash
git clone <your-repo-url> /var/www/ai-marketing-app
cd /var/www/ai-marketing-app
```

#### 3단계: 환경 변수 설정
`backend` 디렉토리에 `.env` 설정 파일을 생성합니다:
```bash
cd backend
cp .env.example .env   # 예시 파일이 있다면 복제, 없다면 신규 생성
nano .env
```
아래 형식에 맞게 환경설정 값을 채워 넣습니다:
```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-user@gmail.com
SMTP_PASSWORD=your-smtp-app-password
ADMIN_EMAIL=kimeunyong@lgchem.com
JWT_SECRET=your-secure-jwt-secret-string
EMAIL_DOMAIN=lgchem.com
# 사용하실 활성 Gemini API Key를 입력하세요:
GEMINI_API_KEY=AIzaSyAZp6XELMchsp08ICW1H6snTO8R9MG9T_o
```

#### 4단계: React 프론트엔드 빌드
프로젝트 루트 디렉토리로 이동하여 의존성 패키지를 설치하고 최적화 빌드를 수행합니다:
```bash
cd /var/www/ai-marketing-app
npm install
npm run build
```
빌드가 완료되면 `/var/www/ai-marketing-app/dist` 폴더에 경량화된 정적 HTML/JS/CSS 파일들이 생성됩니다.

#### 5단계: 파이썬 가상환경 구성 및 백엔드 패키지 설치
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate

# pip 업그레이드 및 종속성 패키지 설치
pip install --upgrade pip
pip install -r requirements.txt
```

#### 6단계: 데이터베이스 및 기본 정보 마이그레이션 (필요시)
처음 서비스를 초기화하거나 테스트 유저를 생성하고 싶을 경우 실행합니다:
```bash
python trigger_migration.py
python add_mock_users.py
```

#### 7단계: 포트 `9101`로 서버 기동
외부 접속이 가능하도록 호스트 주소를 `0.0.0.0`으로 설정하고 포트 `9101`을 지정하여 FastAPI 백엔드 서버를 시작합니다:
```bash
# 가상환경이 활성화된 상태에서 실행
uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4
```

SSH 터미널 접속을 종료한 후에도 서버가 중단 없이 백그라운드에서 동작하도록 실행하려면 아래 방법 중 하나를 선택합니다:

**방법 A: 간단한 백그라운드 실행 (`nohup` 사용)**
```bash
nohup venv/bin/uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4 > out.log 2> error.log &
```

**방법 B: 운영용 프로세스 상시 서비스 등록 (`systemd` 사용 - 강력 권장)**
시스템 서비스 파일을 생성합니다:
```bash
sudo nano /etc/systemd/system/ai-marketing.service
```
아래 세부 설정을 붙여넣습니다:
```ini
[Unit]
Description=Synthetix AI Marketing App Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/ai-marketing-app/backend
ExecStart=/var/www/ai-marketing-app/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 9101 --workers 4
Restart=always
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```
서비스를 활성화하고 서버를 구동합니다:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-marketing
sudo systemctl start ai-marketing

# 구동 상태 확인
sudo systemctl status ai-marketing
```

---

### 3. 사내 프록시 및 네트워크 보안 설정
사내 클라우드 프록시 인프라를 통해 `aws.lgchem.com/32202` 주소로 외부 호출이 인입되면 게이트웨이가 배포 서버의 내부 포트 `9101`로 요청을 전달합니다.

정상적인 프록시 연결을 보장하기 위해 리눅스 서버 방화벽에서 포트 `9101` 인바운드 TCP 트래픽을 열어야 합니다:
```bash
# UFW 방화벽을 사용하는 경우
sudo ufw allow 9101/tcp
```
UFW 외 별도 보안 그룹 솔루션을 사용하는 경우, 회사 보안 관리 대시보드에서 해당 포트를 활성화해 주시기 바랍니다.

---

# ☁️ Part 2: Google Cloud Platform (GCP) 배포 가이드

GCP 배포 환경의 경우 다음과 같은 두 가지 대표적인 방식을 권장합니다:
*   **방법 A: Google Cloud Run (강력 추천)** - 컨테이너 기반, 트래픽 유입에 따른 자동 확장(Serverless).
*   **방법 B: Google Compute Engine (VM)** - 일반적인 우분투 리눅스 가상머신 서버 구축 방식.

---

## 방법 A: Google Cloud Run에 배포하기 (서버리스 및 높은 확장성)

Cloud Run은 컨테이너 기반의 서버리스 서비스로, 호출이 없을 때는 요금이 발생하지 않는 방식으로 작동되어 클라우드 비용 절감에 극도로 유리합니다.

### 1. 멀티 스테이지 `Dockerfile` 생성
React 프론트엔드를 빌드하고 최적화한 뒤 Python 백엔드와 패키징하는 통합 `Dockerfile`을 프로젝트 루트 경로(`ai-marketing-app/`)에 작성합니다:

```dockerfile
# --- Stage 1: React 프론트엔드 소스 빌드 ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Python FastAPI 백엔드 실행 환경 구축 ---
FROM python:3.11-slim
WORKDIR /app

# 시스템에 필요한 컴파일 도구 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 파이썬 의존성 패키지 설치
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 파일 복제 및 빌드 완료된 프론트엔드 정적 파일 연동
COPY backend/ /app/backend/
COPY --from=frontend-builder /app/dist /app/dist

# 포트 개방 (Cloud Run은 기본 환경 변수로 PORT를 주입하며, 대개 8080 포트를 사용합니다)
EXPOSE 8080

WORKDIR /app/backend
# Uvicorn 기동 명령 설정
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2
```

### 2. Google Cloud CLI (`gcloud`)를 통한 컨테이너 배포

#### 1단계: CLI 로그인 및 GCP 프로젝트 설정
로컬 터미널에서 구글 클라우드 계정에 로그인하고 활성 프로젝트 ID를 세팅합니다:
```bash
gcloud auth login
gcloud config set project <YOUR-GCP-PROJECT-ID>
```

#### 2단계: GCP Artifact Registry에 도커 이미지 빌드 및 업로드
개발 PC에 Docker가 별도로 설치되어 있지 않더라도, GCP의 서버 기반 빌드 솔루션인 **Cloud Build** 서비스를 이용하면 클라우드에서 바로 도커 이미지를 만들어 빌드할 수 있습니다:
```bash
# GCP의 Artifact Registry 및 Cloud Run API 활성화
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com

# Artifact Registry 도커 리포지토리 생성
gcloud artifacts repositories create ai-marketing-repo \
    --repository-format=docker \
    --location=asia-northeast3 \
    --description="AI 마케팅 통합 배포 리포지토리"

# Cloud Build에 소스 업로드하여 도커 빌드 완료
gcloud builds submit --tag asia-northeast3-docker.pkg.dev/<YOUR-GCP-PROJECT-ID>/ai-marketing-repo/app:latest .
```

#### 3단계: Cloud Run 서비스 인스턴스 배포
환경 변수를 포함하여 생성한 이미지를 Cloud Run 인스턴스에 배포합니다:
```bash
gcloud run deploy ai-marketing-app \
    --image asia-northeast3-docker.pkg.dev/<YOUR-GCP-PROJECT-ID>/ai-marketing-repo/app:latest \
    --platform managed \
    --region asia-northeast3 \
    --allow-unauthenticated \
    --set-env-vars="GEMINI_API_KEY=AIzaSyAZp6XELMchsp08ICW1H6snTO8R9MG9T_o,JWT_SECRET=synthetix-lgchem-secret-2026,ADMIN_EMAIL=kimeunyong@lgchem.com"
```
배포가 정상적으로 완료되면 구글에서 범용으로 접속 가능한 HTTPS 공용 주소(예: `https://ai-marketing-app-xxxxxx-an.a.run.app`)를 출력합니다. 해당 주소로 접속하면 별도의 CORS 설정 없이 프론트/백엔드가 하나로 즉시 작동합니다.

---

## 방법 B: Google Compute Engine (가상 VM 머신)

전형적인 가상 VM 서버 형태를 유지하여 관리하기 편리한 아키텍처 방식입니다.

### 1. Compute Engine 인프라 가상 머신(VM) 생성
1. GCP 콘솔 접속 ➡️ **Compute Engine** ➡️ **VM 인스턴스** ➡️ **인스턴스 만들기** 클릭.
2. **머신 사양**: E2-medium (vCPU 2개, 메모리 4GB) 사양이면 테스트 및 초기 운영 용도로 충분합니다.
3. **부팅 디스크**: 운영체제는 **Ubuntu 22.04 LTS**(표준 영구 디스크, 용량 20GB 이상)를 선택합니다.
4. **방화벽 설정**: `HTTP 트래픽 허용` 및 `HTTPS 트래픽 허용`에 체크합니다.
5. **만들기**를 클릭하여 인스턴스를 시작합니다.

### 2. 가상머신용 방화벽 포트 9101 허용 규칙 작성
VM이 준비된 뒤 외부망에서 `9101` 포트로 다이렉트 통신을 시도하고자 하는 경우 방화벽 오픈 처리가 요구됩니다:
1. GCP 콘솔 검색 ➡️ **VPC 네트워크** ➡️ **방화벽** ➡️ **방화벽 규칙 만들기**를 클릭합니다.
2. **이름**: `allow-ai-marketing-backend`
3. **대상**: *네트워크의 모든 인스턴스*
4. **소스 IP 범위**: 사내 접속 대역이나 테스트망을 고려하여 `0.0.0.0/0` 또는 특정 VPN 대역을 세팅합니다.
5. **프로토콜 및 포트**: `지정된 프로토콜 및 포트` 체크 ➡️ `TCP` ➡️ `9101` 포트 기입.
6. **만들기**를 클릭해 방화벽 등록을 마칩니다.

### 3. VM 내부 애플리케이션 수동 구축
1. 콘솔에서 활성화된 GCE VM 인스턴스에 SSH로 접속합니다.
2. 이 문서의 **[Part 1: 리눅스 기반 개발 서버 배포 가이드]**의 내용과 동일하게 빌드/설치 명령어를 차례대로 입력합니다.
3. VM의 외부 고정 IP를 이용해 브라우저에서 `http://<VM-외부-IP>:9101/`로 접근하면 정상 접속됩니다.

---

# 🔒 실무 배포 단계 필수 보안 수칙
*   **Gemini API Key의 외부 노출 방지**: 어떠한 경우에도 API Key가 소스코드 파일 자체에 하드코딩되거나 깃허브 등 공개 저장소에 푸시되어서는 안 됩니다. 항상 `.env` 환경 변수 파일을 쓰거나 GCP **Secret Manager** 같은 통합 보안 인프라를 사용하십시오.
*   **사용자 업로드 파일 스토리지 영속화**: 백엔드 상에서 사용자가 업로드한 문서나 생성된 리소스는 `/var/www/ai-marketing-app/backend/storage` 경로에 적재됩니다. Cloud Run이나 컨테이너 기반 VM은 인스턴스 재기동 시 컨테이너 내부 파일이 유실될 우려가 있으므로, Cloud Storage 버킷 마운트나 영구 디스크 볼륨 결합 설정을 반드시 병행해야 소중한 데이터를 보호할 수 있습니다.
