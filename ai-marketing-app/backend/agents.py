"""
Multi-Agent Marketing Pipeline using LangGraph + LangChain Google GenAI.

Agents:
  1. Planner:  Reads knowledge assets + user prompt → Campaign Strategy (JSON)
  2. Creator:  Strategy → Marketing Copy + Image Prompt
  3. Critic:   Validates copy/image prompt → APPROVE or REVISE with feedback
  4. (loop):   If REVISE, Creator regenerates (max 2 retries)
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

    # Agent outputs
    strategy: str                # Planner output (structured text / JSON-like)
    copies: List[str]            # Creator output – list of ad copy variants
    image_prompts: List[str]     # Creator output – image generation prompts
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
# 3. Planner Agent
# ---------------------------------------------------------------------------

PLANNER_SYSTEM = """
You are a **Senior Marketing Strategist AI** (Planner Agent).
Your job is to analyze the provided brand knowledge assets and the user's campaign request,
then output a concise, structured Campaign Strategy in markdown.

Output format (strict):
## Campaign Strategy
- **Objective**: <one sentence>
- **Target Audience**: <description>
- **Key Message**: <core value proposition>
- **Tone & Voice**: <e.g., energetic, professional, playful>
- **Brand Constraints**: <colors, do-nots, must-haves from the knowledge assets>
- **Suggested Copy Angles**: <3 bullet angles>
- **Visual Direction**: <description for image generation>
"""

def planner_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    knowledge = state["knowledge_text"] or "(No additional knowledge assets provided.)"
    prompt = (
        f"# Brand Knowledge Assets\n{knowledge}\n\n"
        f"# User Campaign Request\n{state['user_prompt']}"
    )
    
    config_params = {}
    if state.get("google_search"):
        config_params["tools"] = [types.Tool(google_search=types.GoogleSearchRetrieval())]
    
    config = types.GenerateContentConfig(
        system_instruction=PLANNER_SYSTEM,
        temperature=0.7,
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
# 4. Creator Agent
# ---------------------------------------------------------------------------

CREATOR_SYSTEM = """
You are a **Creative Copywriter & Visual Director AI** (Creator Agent).
Given a Campaign Strategy, produce the following and NOTHING ELSE:

## Ad Copy Variants
(Provide exactly 3 variants, each clearly labeled as Variant 1/2/3)

## Image Generation Prompts
(Provide exactly 3 detailed image prompts corresponding to each variant.
 Each prompt must start with: "Photorealistic marketing image, ...")

Keep the tone and constraints from the strategy strictly.
"""

def creator_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    feedback = ""
    if state.get("review_result", "").startswith("REVISE"):
        feedback = f"\n\n⚠️ Previous attempt was rejected. Critic feedback:\n{state['review_result']}\nPlease revise accordingly."

    prompt = f"# Campaign Strategy\n{state['strategy']}{feedback}"
    
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
        img_prompts = []
        
        current_section = None
        for line in raw.splitlines():
            line_s = line.strip()
            if not line_s: continue
            
            if "## Ad Copy" in line_s:
                current_section = "copy"
                continue
            elif "## Image Generation" in line_s:
                current_section = "img"
                continue
            
            if current_section == "copy":
                # Look for lines starting with Variant, 1., -, or just any text if we expect 3
                if any(line_s.startswith(x) for x in ["Variant", "1.", "2.", "3.", "-"]):
                    copies.append(line_s)
                elif copies:
                    copies[-1] += " " + line_s
            elif current_section == "img":
                if any(line_s.startswith(x) for x in ["Photorealistic", "Prompt", "1.", "2.", "3.", "-"]):
                    img_prompts.append(line_s)
                elif img_prompts:
                    img_prompts[-1] += " " + line_s

        # Fallbacks
        if not copies:
            copies = ["Variant 1: High quality marketing copy for your brand."]
        if not img_prompts:
            img_prompts = ["Photorealistic marketing image, vibrant, professional, high resolution."]

        # Ensure we have at least 1 image prompt even if it parsed garbage
        if len(img_prompts) == 0:
             img_prompts = ["Photorealistic marketing image, professional aesthetic."]

        logger.info(f"Creator done. Copies: {len(copies)}, ImgPrompts: {len(img_prompts)}")
        return {**state, "copies": copies, "image_prompts": img_prompts, "error": None}
    except Exception as e:
        logger.exception("Creator error")
        return {**state, "error": str(e)}

# ---------------------------------------------------------------------------
# 5. Critic Agent
# ---------------------------------------------------------------------------

CRITIC_SYSTEM = """
You are a **Brand Safety & Quality Reviewer AI** (Critic Agent).
Evaluate the provided ad copies and image prompts against the campaign strategy.

Check for:
1. Tone alignment with strategy
2. Brand constraint violations (colors, do-nots)
3. Factual or ethical issues (false claims, harmful content)
4. Clarity and impact of the message

Respond with EXACTLY one of:
- "APPROVE" — if everything is acceptable
- "REVISE: <concise bullet-point feedback>" — if changes are needed
"""

def critic_node(state: CampaignState, api_key: str) -> CampaignState:
    client = _get_client(api_key)
    content = (
        f"# Campaign Strategy\n{state['strategy']}\n\n"
        f"# Ad Copy Variants\n" + "\n".join(state.get("copies", [])) + "\n\n"
        f"# Image Generation Prompts\n" + "\n".join(state.get("image_prompts", []))
    )
    
    config_params = {}
    if state.get("google_search"):
        config_params["tools"] = [types.Tool(google_search=types.GoogleSearchRetrieval())]

    config = types.GenerateContentConfig(
        system_instruction=CRITIC_SYSTEM,
        temperature=0.7,
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
# 6. Routing logic
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
# 7. Build Graph
# ---------------------------------------------------------------------------

def build_campaign_graph(api_key: str):
    graph = StateGraph(CampaignState)

    # Bind api_key to nodes via closures
    graph.add_node("planner",  lambda s: planner_node(s, api_key))
    graph.add_node("creator",  lambda s: creator_node(s, api_key))
    graph.add_node("critic",   lambda s: critic_node(s, api_key))
    graph.add_node("retry",    increment_retry)
    graph.add_node("finalize", finalize_node)

    graph.set_entry_point("planner")
    graph.add_edge("planner", "creator")
    graph.add_edge("creator", "critic")
    graph.add_conditional_edges(
        "critic",
        should_revise,
        {"revise": "retry", "finalize": "finalize"}
    )
    graph.add_edge("retry", "creator")
    graph.add_edge("finalize", END)

    return graph.compile()

# ---------------------------------------------------------------------------
# 8. File Parsers
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
