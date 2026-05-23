"""
Multi-Agent B2B Marketing Pipeline using LangGraph + LangChain Google GenAI.

Agents:
  1. Researcher: B2B Market & Competitor Intelligence
  2. Planner:    Strategy Playbook (ROI, Compliance, Specs, etc.)
  3. Creator:    Distinct B2B target copy variants (Value, Tech, Trust)
  4. Designer:   B2B professional visual image prompts
  5. Critic:     Factual & Brand safety audit (APPROVE or REVISE)
"""

import os
import io
import base64
import logging
from typing import TypedDict, Annotated, Optional, List
from typing import Literal
import operator

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from google import genai
from google.genai import types

logger = logging.getLogger("agents")

# ---------------------------------------------------------------------------
# 1. State definition
# ---------------------------------------------------------------------------

class CampaignState(TypedDict):
    # Input
    user_prompt: str
    knowledge_text: str          # extracted text from uploaded files
    target_industry: str         # B2B industry focus
    buyer_persona: str           # B2B target persona/role
    b2b_strategy: str            # B2B campaign goal

    # Agent outputs
    research_data: str           # Researcher output (market intelligence)
    strategy: str                # Planner output (strategy playbook)
    copies: List[str]            # Creator output – list of B2B copy variants
    image_prompts: List[str]     # Designer output – premium image generation prompts
    review_result: str           # Critic output: "APPROVE" or "REVISE: <reason>"

    # Control
    retry_count: int
    final_copies: List[str]
    final_image_prompts: List[str]
    error: Optional[str]
    google_search: bool

def _get_client(api_key: str) -> genai.Client:
    return genai.Client(api_key=api_key)

def _extract_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for part in content:
            if isinstance(part, str):
                texts.append(part)
            elif isinstance(part, dict) and "text" in part:
                texts.append(part["text"])
            else:
                texts.append(str(part))
        return "".join(texts)
    return str(content)

# ---------------------------------------------------------------------------
# 2. Researcher Agent
# ---------------------------------------------------------------------------

RESEARCHER_SYSTEM = """
You are an expert **B2B Market & Competitor Intelligence Researcher AI** (Researcher Agent).
Your goal is to investigate and compile a high-impact B2B market report based on the target settings:
- **Target Industry**: {target_industry}
- **Buyer Persona**: {buyer_persona}
- **B2B Strategy Focus**: {b2b_strategy}

Identify and summarize:
1. Core pain points, business/technical objections, and purchasing triggers of the buyer persona in this industry.
2. Market trends, regulatory rules, or environmental/sustainability/safety compliance (especially chemical sustainability or green battery specs if related to LG Chem).
3. Strategic suggestions on B2B marketing channels and messaging focus.

Keep your report concise, fact-driven, highly technical, and commercial-excellence oriented. Use Markdown format.
"""

def researcher_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    
    prompt = (
        f"# B2B Market Research Request\n"
        f"- Target Industry: {state.get('target_industry', 'Chemicals & Advanced Materials')}\n"
        f"- Buyer Persona / Role: {state.get('buyer_persona', 'Purchasing & Procurement Manager')}\n"
        f"- B2B Campaign Goal: {state.get('b2b_strategy', 'Lead Generation')}\n\n"
        f"Internal Knowledge context (if any):\n{state['knowledge_text'] or '(None)'}"
    )
    
    config_params = {}
    if state.get("google_search"):
        config_params["tools"] = [types.Tool(google_search=types.GoogleSearchRetrieval())]
        
    config = types.GenerateContentConfig(
        system_instruction=RESEARCHER_SYSTEM.format(
            target_industry=state.get('target_industry', 'Chemicals & Advanced Materials'),
            buyer_persona=state.get('buyer_persona', 'Purchasing & Procurement Manager'),
            b2b_strategy=state.get('b2b_strategy', 'Lead Generation')
        ),
        temperature=0.4,
        **config_params
    )
    
    try:
        resp = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=config
        )
        research_data = resp.text
        logger.info("Researcher node done.")
        return {**state, "research_data": research_data, "error": None}
    except Exception as e:
        logger.exception("Researcher error")
        return {**state, "error": str(e)}

# ---------------------------------------------------------------------------
# 3. Planner Agent
# ---------------------------------------------------------------------------

PLANNER_SYSTEM = """
You are a **Senior B2B Marketing Strategist AI** (Strategic Planner Agent) specializing in Commercial Excellence.
Your job is to analyze the provided brand knowledge assets, target B2B settings, and the Market Research report.
Output a highly-strategic **B2B Campaign Strategy Playbook** in markdown.

CRITICAL: Regardless of the language of the input brand knowledge assets, target settings, or user prompts (even if they are in English, Chinese, etc.), you MUST write the entire B2B Campaign Strategy Playbook strictly and completely in natural, professional, high-quality Korean (반드시 모든 내용 및 기획서를 완벽한 한국어로 상세히 작성). Use an authoritative, clear business tone suitable for Korean B2B commercial excellence and marketing teams. DO NOT translate terms literally if they have established professional Korean equivalents.

Your playbook must map the product/brand advantages to the buyer persona's core drivers (e.g. procurement cares about Total Cost of Ownership/ROI; sustainability auditor cares about eco-certification/carbon footprint/regulation; engineer cares about technical reliability/spec sheets).

Output format (strict):
## B2B 캠페인 마케팅 기획서 (Strategy Playbook)
- **B2B 캠페인 목표 (B2B Campaign Objective)**: <한 문장의 핵심 마케팅 전략 목표 - 반드시 완벽한 한국어로 작성>
- **타겟 고객군 및 구매자 페르소나 (Target Audience & Buyer Persona)**: <세부 타겟 기업 설명 및 페르소나가 당면한 현실적인 고충(Pain Point)과 구매 동인 분석 - 반드시 완벽한 한국어로 작성>
- **핵심 가치 드라이버 (Core Value Driver)**: <ROI/비용 절감, ESG/친환경 규제 준수, 독보적인 기술 규격, 또는 파트너십 신뢰 중 핵심 포커스 선정 - 반드시 완벽한 한국어로 작성>
- **핵심 메시지 및 주요 세일즈 포인트 (Core Message & Key Claims)**: <데이터 및 실증 자료에 기반한 고영향력 제품 세일즈 카피 라이팅 - 반드시 완벽한 한국어로 작성>
- **캠페인 톤앤매너 (Tone & Voice)**: <B2B 시장에 신뢰감을 주는 정중하고 기술 중심적인 전문 마케팅 톤앤매너 설계 - 반드시 완벽한 한국어로 작성>
- **브랜드 준수사항 및 규제 제약 요소 (Brand & Regulatory Constraints)**: <LG화학 등 자사 가이드라인 부합 요소 및 준수해야 할 글로벌 B2B 규제 정보 수록 - 반드시 완벽한 한국어로 작성>
- **전략적 광고 카피 라이팅 프레임워크 (Strategic Copywriting Framework)**: <각 구매 주체별 3가지 맞춤형 광고 소구점 구성 전략 설계 - 반드시 완벽한 한국어로 작성>
- **전문 B2B 시각 디자인 가이드라인 (Professional B2B Visual Style)**: <컨셉 이미지 생성을 위한 고품질 테크니컬/연구실/친환경 공장 비주얼 디렉션 제안 - 반드시 완벽한 한국어로 작성>
"""

def planner_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    knowledge = state["knowledge_text"] or "(No additional knowledge assets provided.)"
    
    prompt = (
        f"# B2B Brand Knowledge Assets\n{knowledge}\n\n"
        f"# B2B Market Research Data\n{state.get('research_data', 'No market research data available.')}\n\n"
        f"# User Prompt / Campaign Request\n{state['user_prompt']}\n\n"
        f"# Target settings:\n"
        f"- Target Industry: {state.get('target_industry', 'Chemicals & Advanced Materials')}\n"
        f"- Buyer Persona: {state.get('buyer_persona', 'Purchasing & Procurement Manager')}\n"
        f"- B2B Campaign Goal: {state.get('b2b_strategy', 'Lead Generation')}\n"
    )
    
    config_params = {}
    if state.get("google_search"):
        config_params["tools"] = [types.Tool(google_search=types.GoogleSearchRetrieval())]
    
    config = types.GenerateContentConfig(
        system_instruction=PLANNER_SYSTEM,
        temperature=0.6,
        **config_params
    )
    
    try:
        resp = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=config
        )
        strategy = resp.text
        logger.info("Planner done.")
        return {**state, "strategy": strategy, "error": None}
    except Exception as e:
        logger.exception("Planner error")
        return {**state, "error": str(e)}

# ---------------------------------------------------------------------------
# 4. Creator Agent (B2B Copywriter)
# ---------------------------------------------------------------------------

CREATOR_SYSTEM = """
You are a **Creative B2B Copywriter AI** (Creator Agent).
Given the B2B Campaign Strategy Playbook, produce the following and NOTHING ELSE:

## Ad Copy Variants
(Provide exactly 3 variants, each clearly labeled as Variant 1, Variant 2, and Variant 3)

You MUST follow this strategic structure for the copies:
- **Variant 1 (Value & ROI Focus)**: Focus on financial performance, total cost of ownership (TCO), scalability, supply chain reliability, and return on investment (ROI). Perfect for procurement managers and C-level.
- **Variant 2 (Technical & Spec Focus)**: Focus on concrete data sheets, chemical/materials/battery specs, engineering stability, rigorous lab testing, and safety standards. Perfect for technical R&D and product engineers.
- **Variant 3 (Relationship & Success Focus)**: Focus on industry leadership, custom co-development partnerships, sustainability/ECO compliance, customer success records, and long-term brand trust. Perfect for commercial and sustainability auditors/directors.

CRITICAL: Regardless of the language of the input strategy playbook, user settings, or any external inputs (even if they are in English or Chinese), you MUST write all the ad copy headlines, bodies, and call-to-actions strictly and completely in highly professional, natural Korean (반드시 모든 카피의 제목, 본문, 행동유도문구를 완벽한 한국어로 작성). The Korean B2B commercial voice must be authoritative, persuasive, and aligned with standard Korean business vocabulary. Do NOT write the copy bodies in English.

Keep the tone and constraints from the strategy playbook strictly. Ensure the copy sounds professional and authoritative.
"""

def creator_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    feedback = ""
    if state.get("review_result", "").startswith("REVISE"):
        feedback = f"\n\n⚠️ Previous attempt was rejected. Critic feedback:\n{state['review_result']}\nPlease revise accordingly."

    prompt = (
        f"# B2B Campaign Strategy Playbook\n{state['strategy']}\n\n"
        f"# Target settings:\n"
        f"- Target Industry: {state.get('target_industry', 'Chemicals & Advanced Materials')}\n"
        f"- Buyer Persona: {state.get('buyer_persona', 'Purchasing & Procurement Manager')}\n"
        f"- B2B Campaign Goal: {state.get('b2b_strategy', 'Lead Generation')}\n"
        f"{feedback}"
    )
    
    config_params = {}
    if state.get("google_search"):
        config_params["tools"] = [types.Tool(google_search=types.GoogleSearchRetrieval())]
    
    config = types.GenerateContentConfig(
        system_instruction=CREATOR_SYSTEM,
        temperature=0.7,
        **config_params
    )

    try:
        resp = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=config
        )
        raw = resp.text
        logger.info(f"Creator raw output length: {len(raw)}")

        copies = []
        
        # Extract ## Ad Copy section if present, else use full raw response
        import re
        if "## Ad Copy" in raw:
            copy_part = raw.split("## Ad Copy", 1)[1]
        else:
            copy_part = raw
            
        # Find all matches of "Variant \d" (allowing surrounding markdown bold markers, bullets, numbering, spaces, and Korean terms like 베리언트, 시안, 버전, 옵션)
        matches = list(re.finditer(r'(?i)(?:\*|-|\d+\.|\s)*(?:Variant|베리언트|시안|버전|옵션)\s*(\d+)', copy_part))
        
        if matches:
            for idx, match in enumerate(matches):
                start = match.start()
                end = matches[idx+1].start() if idx + 1 < len(matches) else len(copy_part)
                var_text = copy_part[start:end].strip()
                if var_text:
                    copies.append(var_text)

        # Fallbacks
        if not copies:
            copies = [
                "Variant 1 (Value/ROI Focus): High efficiency LG Chem B2B materials that reduce TCO and boost productivity.",
                "Variant 2 (Technical/Spec Focus): Advanced grade chemical compounds optimized for thermal stability and high tensile strength.",
                "Variant 3 (Relationship/Trust Focus): Partnering with LG Chem to co-develop sustainable green materials that meet global ECO standards."
            ]

        logger.info(f"Creator done. Copies: {len(copies)}")
        return {**state, "copies": copies, "error": None}
    except Exception as e:
        logger.exception("Creator error")
        return {**state, "error": str(e)}

# ---------------------------------------------------------------------------
# 5. Designer Agent (B2B Visual Director)
# ---------------------------------------------------------------------------

DESIGNER_SYSTEM = """
You are a **B2B Visual Design Director AI** (Designer Agent).
Given the B2B Campaign Strategy Playbook and the generated Ad Copy Variants, design exactly 3 detailed image prompts corresponding to each variant.

Each image prompt must describe a professional B2B visual environment and start with: "Photorealistic marketing image, ..."
Ensure prompts use professional, corporate, and clean B2B aesthetics (e.g. clean technical labs, advanced automatic factories, corporate boardrooms, premium product closeups with microstructures or advanced materials, clean data visualization dashboards).
Avoid generic cartoon, vector, or childish clip art styles.

Provide the prompts in the following markdown section:

## Image Generation Prompts
(Provide exactly 3 detailed image prompts corresponding to each variant.
 Each prompt must start with: "Photorealistic marketing image, ...")
"""

def designer_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    feedback = ""
    if state.get("review_result", "").startswith("REVISE"):
        feedback = f"\n\n⚠️ Previous attempt was rejected. Critic feedback:\n{state['review_result']}\nPlease revise accordingly."

    prompt = (
        f"# B2B Campaign Strategy Playbook\n{state['strategy']}\n\n"
        f"# Ad Copy Variants\n" + "\n".join(state.get("copies", [])) + "\n\n"
        f"{feedback}"
    )

    config_params = {}
    config = types.GenerateContentConfig(
        system_instruction=DESIGNER_SYSTEM,
        temperature=0.6,
        **config_params
    )

    try:
        resp = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=config
        )
        raw = resp.text
        logger.info(f"Designer raw output length: {len(raw)}")

        img_prompts = []
        
        current_section = None
        for line in raw.splitlines():
            line_s = line.strip()
            if not line_s: continue
            
            if "## Image Generation" in line_s or "## Image Prompts" in line_s or "Prompt" in line_s:
                current_section = "img"
                continue
            
            if current_section == "img" or line_s.startswith("Photorealistic"):
                if any(line_s.startswith(x) for x in ["Photorealistic", "Prompt", "1.", "2.", "3.", "-"]):
                    img_prompts.append(line_s)
                elif img_prompts:
                    img_prompts[-1] += " " + line_s

        # Clean prompts to ensure they start with Photorealistic...
        cleaned_prompts = []
        for p in img_prompts:
            p_clean = p.strip()
            # Strip prefixes like "Prompt 1: ", "1. ", etc.
            if "Photorealistic" in p_clean:
                idx = p_clean.find("Photorealistic")
                p_clean = p_clean[idx:]
            else:
                p_clean = "Photorealistic marketing image, " + p_clean
            cleaned_prompts.append(p_clean)

        # Fallbacks
        if not cleaned_prompts:
            cleaned_prompts = [
                "Photorealistic marketing image, modern clean corporate office with a large glass table and a data visualization dashboard displaying chemicals production analytics, vibrant blue tone.",
                "Photorealistic marketing image, premium advanced materials closeup, highlighting glossy polymer microstructures inside a clean R&D lab, high precision lighting.",
                "Photorealistic marketing image, professional B2B business partnership shaking hands in a futuristic eco-friendly processing facility, sunny warm daylight, green environment."
            ]

        # Ensure we have exactly 3
        while len(cleaned_prompts) < 3:
            cleaned_prompts.append("Photorealistic marketing image, professional B2B aesthetic, high resolution.")

        logger.info(f"Designer done. Prompts: {len(cleaned_prompts)}")
        return {**state, "image_prompts": cleaned_prompts[:3], "error": None}
    except Exception as e:
        logger.exception("Designer error")
        return {**state, "error": str(e)}

# ---------------------------------------------------------------------------
# 6. Critic Agent
# ---------------------------------------------------------------------------

CRITIC_SYSTEM = """
You are a **B2B Brand Safety & Quality Auditor AI** (Critic Agent).
Evaluate the provided B2B ad copies and image prompts against the B2B Strategy Playbook.

Check for:
1. B2B Tone Alignment: Is the tone authoritative, professional, and data-credible?
2. Brand & Industry compliance constraints.
3. Logical consistency between copy variants (ROI vs Technical vs Trust) and their visual prompts.
4. Factual correctness (check for obvious errors or unsafe B2B claims).

Respond with EXACTLY one of:
- "APPROVE" — if everything is acceptable
- "REVISE: <concise bullet-point feedback on copies/prompts>" — if changes are needed
"""

def critic_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    content = (
        f"# B2B Campaign Strategy Playbook\n{state['strategy']}\n\n"
        f"# Ad Copy Variants\n" + "\n".join(state.get("copies", [])) + "\n\n"
        f"# Image Generation Prompts\n" + "\n".join(state.get("image_prompts", []))
    )
    
    config_params = {}
    if state.get("google_search"):
        config_params["tools"] = [types.Tool(google_search=types.GoogleSearchRetrieval())]

    config = types.GenerateContentConfig(
        system_instruction=CRITIC_SYSTEM,
        temperature=0.4,
        **config_params
    )
    
    try:
        resp = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=content,
            config=config
        )
        review = resp.text.strip()
        logger.info(f"Critic result: {review[:80]}")
        return {**state, "review_result": review, "error": None}
    except Exception as e:
        logger.exception("Critic error")
        return {**state, "error": str(e), "review_result": "APPROVE"}  # fail-open

# ---------------------------------------------------------------------------
# 7. Routing logic
# ---------------------------------------------------------------------------

MAX_RETRIES = 2

def should_revise(state: CampaignState) -> Literal["revise", "finalize"]:
    review = state.get("review_result", "APPROVE")
    retry = state.get("retry_count", 0)
    if review.startswith("REVISE") and retry < MAX_RETRIES:
        return "revise"
    return "finalize"

def increment_retry(state: CampaignState) -> CampaignState:
    return {**state, "retry_count": state.get("retry_count", 0) + 1}

def finalize_node(state: CampaignState) -> CampaignState:
    return {
        **state,
        "final_copies": state.get("copies", []),
        "final_image_prompts": state.get("image_prompts", []),
    }

# ---------------------------------------------------------------------------
# 8. Build Graph
# ---------------------------------------------------------------------------

def build_campaign_graph(api_key: str):
    graph = StateGraph(CampaignState)

    # Bind api_key to nodes via closures
    graph.add_node("researcher",lambda s: researcher_node(s, api_key))
    graph.add_node("planner",   lambda s: planner_node(s, api_key))
    graph.add_node("creator",   lambda s: creator_node(s, api_key))
    graph.add_node("designer",  lambda s: designer_node(s, api_key))
    graph.add_node("critic",    lambda s: critic_node(s, api_key))
    graph.add_node("retry",     increment_retry)
    graph.add_node("finalize",  finalize_node)

    graph.set_entry_point("researcher")
    graph.add_edge("researcher", "planner")
    graph.add_edge("planner", "creator")
    graph.add_edge("creator", "designer")
    graph.add_edge("designer", "critic")
    graph.add_conditional_edges(
        "critic",
        should_revise,
        {"revise": "retry", "finalize": "finalize"}
    )
    graph.add_edge("retry", "creator")
    graph.add_edge("finalize", END)

    return graph.compile()

# ---------------------------------------------------------------------------
# 9. File Parsers
# ---------------------------------------------------------------------------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        logger.error(f"PDF parse error: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        logger.error(f"DOCX parse error: {e}")
        return ""

def extract_text_from_pptx(file_bytes: bytes) -> str:
    try:
        from pptx import Presentation
        prs = Presentation(io.BytesIO(file_bytes))
        texts = []
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    texts.append(shape.text.strip())
        return "\n".join(texts)
    except Exception as e:
        logger.error(f"PPTX parse error: {e}")
        return ""

def extract_text_from_txt(file_bytes: bytes) -> str:
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.error(f"TXT parse error: {e}")
        return ""

def parse_file(filename: str, file_bytes: bytes) -> str:
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == "docx":
        return extract_text_from_docx(file_bytes)
    elif ext in ("pptx", "ppt"):
        return extract_text_from_pptx(file_bytes)
    elif ext == "txt":
        return extract_text_from_txt(file_bytes)
    else:
        logger.warning(f"Unsupported file type: {ext}")
        return f"(Unsupported file type: {filename})"
