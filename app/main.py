"""ASHA Sahayak - FastAPI Web Application.
Mobile-first frontline clinical decision support tool for village health workers.
"""

import os
import uuid
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Request, Response, status, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.models import (
    TriageRequest,
    TriageResponse,
    ExtractRequest,
    ExtractResponse,
    ReferralNoteRequest,
    ReferralNoteResponse,
    TriageRecord,
    DashboardAggregates,
    RiskLevel,
)
from app.engine import engine, VALID_MODULES
from app.llm import gemini_service, apply_llm_escalation_cap
from app.storage import storage
from app.dashboard import get_dashboard_data
from app.i18n import get_text, get_all_strings, LANGUAGES

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="ASHA Sahayak API",
    description="Deterministic Decision Support & Anonymized Triage for Frontline Health Workers",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple Rate Limiting & Body Size Limit Middleware
MAX_BODY_BYTES = 1024 * 1024  # 1 MB
RATE_LIMIT_REQUESTS = 120
RATE_LIMIT_WINDOW_SECS = 60
client_request_times: Dict[str, list[float]] = {}


class SecurityAndRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Content-Length check
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_BODY_BYTES:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Request body exceeds maximum size (1MB)."},
            )

        # 2. Simple IP-based rate limiting for API endpoints
        if request.url.path.startswith("/api/"):
            client_ip = request.client.host if request.client else "127.0.0.1"
            now = time.time()
            req_history = client_request_times.setdefault(client_ip, [])
            # Filter timestamps inside window
            client_request_times[client_ip] = [t for t in req_history if now - t < RATE_LIMIT_WINDOW_SECS]
            if len(client_request_times[client_ip]) >= RATE_LIMIT_REQUESTS:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests. Please wait before retrying."},
                )
            client_request_times[client_ip].append(now)

        response = await call_next(request)
        return response


app.add_middleware(SecurityAndRateLimitMiddleware)


# -------------------------------------------------------------
# Health Check Endpoint
# -------------------------------------------------------------
@app.get("/healthz")
async def health_check():
    """System health check and feature capability status."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "llm_available": gemini_service.is_available,
        "llm_model": gemini_service.model_name,
        "storage_backend": type(storage).__name__,
        "supported_modules": VALID_MODULES,
        "supported_languages": LANGUAGES,
        "version": "1.0.0",
    }


# -------------------------------------------------------------
# Triage Endpoint
# -------------------------------------------------------------
@app.post("/api/triage", response_model=TriageResponse)
async def perform_triage(req: TriageRequest):
    """Deterministic danger-sign evaluation and clinical decision support.
    Enforces Safety Invariants:
    1. Rules decide. Danger signs are deterministic.
    2. LLM can only suggest, explain, or draft notes.
    3. LLM can NEVER lower risk level.
    4. LLM can NEVER trigger URGENT_REFERRAL alone (capped at VISIT_PHC).
    5. Don't know on urgent sign escalates to at least VISIT_PHC.
    """
    if req.module not in VALID_MODULES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid module '{req.module}'. Must be one of: {VALID_MODULES}",
        )

    lang = req.language if req.language in LANGUAGES else "mr"

    # Step 1: Pure deterministic rules engine evaluation
    eval_res = engine.evaluate(
        module=req.module,
        age=req.age,
        answers=req.answers,
        measurements=req.measurements,
        language=lang,
    )
    rules_level = eval_res["level"]

    # Step 2: LLM explanation (or template fallback)
    explanation_text, is_ai = gemini_service.generate_explanation(
        module=req.module,
        language=lang,
        level=rules_level,
        triggered_signs=eval_res["triggered_sign_ids"],
        reasons=eval_res["reasons"],
    )

    # If LLM failed, add the mandated standard guidance notice
    if not is_ai and gemini_service.is_available:
        fallback_notice = get_text("ai_fallback_notice", lang)
        explanation_text = f"{explanation_text}\n\n[{fallback_notice}]"

    # Step 3: Apply safety invariant: final_level = max(rules_level, min(llm_level, VISIT_PHC))
    # In standard triage, rules decide the primary level.
    final_level = apply_llm_escalation_cap(rules_level=rules_level, llm_suggested_level=None)

    # Step 4: Generate unique anonymous case ID and timestamp
    case_id = f"ASHA-{uuid.uuid4().hex[:8].upper()}"
    ts_now = datetime.now(timezone.utc).isoformat()

    # Step 5: Generate clinical referral note
    referral_note = engine.generate_referral_note(
        case_id=case_id,
        module=req.module,
        age=req.age,
        level=final_level,
        triggered_sign_ids=eval_res["triggered_sign_ids"],
        measurements=req.measurements,
        language=lang,
        district=req.district,
        block=req.block,
    )

    # Step 6: Persist anonymized structured record (Zero-PII)
    record = TriageRecord(
        case_id=case_id,
        timestamp=ts_now,
        module=req.module,
        age=req.age,
        level=final_level.value,
        rules_level=rules_level.value,
        llm_suggested_level=None,
        triggered_signs=eval_res["triggered_sign_ids"],
        answers=req.answers,
        measurements=req.measurements.model_dump() if req.measurements else None,
        language=lang,
        district=req.district,
        block=req.block,
        source="live",
    )
    storage.save_case(record)

    disclaimer = get_text("disclaimer", lang)

    return TriageResponse(
        case_id=case_id,
        level=final_level,
        rules_level=rules_level,
        llm_suggested_level=None,
        triggered_signs=eval_res["triggered_signs"],
        reasons=eval_res["reasons"],
        home_care_advice=eval_res["home_care_advice"],
        warning_signs=eval_res["warning_signs"],
        unknown_urgent_signs=eval_res["unknown_urgent_signs"],
        explanation=explanation_text,
        referral_note=referral_note,
        disclaimer=disclaimer,
        timestamp=ts_now,
        language=lang,
        district=req.district,
        block=req.block,
    )


# -------------------------------------------------------------
# Symptom Extraction Endpoint (Free-text / Voice transcript)
# -------------------------------------------------------------
@app.post("/api/extract", response_model=ExtractResponse)
async def extract_symptoms(req: ExtractRequest):
    """Extract candidate danger signs from untrusted user transcript for ASHA confirmation.
    The ASHA always confirms or modifies before submission.
    """
    if req.module not in VALID_MODULES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid module '{req.module}'. Must be one of: {VALID_MODULES}",
        )

    valid_signs = engine.get_signs_for_module(req.module)
    suggested = gemini_service.extract_symptoms(
        module=req.module,
        language=req.language,
        transcript=req.transcript,
        valid_signs=valid_signs,
    )

    notes = None
    if not gemini_service.is_available:
        notes = get_text("ai_fallback_notice", req.language)

    return ExtractResponse(suggested_signs=suggested, confidence_notes=notes)


# -------------------------------------------------------------
# Referral Note Regeneration Endpoint
# -------------------------------------------------------------
@app.post("/api/referral-note", response_model=ReferralNoteResponse)
async def regenerate_referral_note(req: ReferralNoteRequest):
    """Regenerate referral note on language change or field edit."""
    if req.module not in VALID_MODULES:
        raise HTTPException(status_code=400, detail=f"Invalid module: {req.module}")

    case_id = req.case_id or f"ASHA-{uuid.uuid4().hex[:8].upper()}"
    note = engine.generate_referral_note(
        case_id=case_id,
        module=req.module,
        age=req.age,
        level=req.level,
        triggered_sign_ids=req.triggered_sign_ids,
        measurements=req.measurements,
        language=req.language,
        district=req.district,
        block=req.block,
    )
    return ReferralNoteResponse(referral_note=note)


# -------------------------------------------------------------
# Rules Query Endpoint
# -------------------------------------------------------------
@app.get("/api/rules/{module}")
async def get_module_rules(module: str, lang: str = Query("mr")):
    """Get questions and signs for module in requested language."""
    if module not in VALID_MODULES:
        raise HTTPException(status_code=400, detail=f"Unknown module '{module}'")

    if lang not in LANGUAGES:
        lang = "mr"

    mod_data = engine.get_module_data(module)
    signs = engine.get_signs_for_module(module)

    formatted_signs = []
    for s in signs:
        q_text = getattr(s.question, lang, s.question.en)
        why_text = getattr(s.why_it_matters, lang, s.why_it_matters.en)
        formatted_signs.append({
            "id": s.id,
            "module": s.module,
            "level": s.level,
            "question": q_text,
            "why_it_matters": why_text,
            "threshold": s.threshold,
            "source": s.source,
            "verified": s.verified,
        })

    return {
        "module": module,
        "target_group": mod_data.get("target_group", {}).get(lang, module),
        "signs": formatted_signs,
        "home_care_advice": mod_data.get("home_care_advice", {}).get(lang, []),
        "warning_signs": mod_data.get("warning_signs", {}).get(lang, []),
    }


# -------------------------------------------------------------
# Dashboard Analytics Endpoint
# -------------------------------------------------------------
@app.get("/api/dashboard", response_model=DashboardAggregates)
async def get_dashboard(
    district: Optional[str] = None,
    block: Optional[str] = None,
    include_simulated: bool = Query(True),
):
    """Anonymized district aggregates and outbreak cluster alerts."""
    return get_dashboard_data(
        storage_backend=storage,
        district=district,
        block=block,
        include_simulated=include_simulated,
    )


# -------------------------------------------------------------
# UI Strings / Localization Endpoint
# -------------------------------------------------------------
@app.get("/api/i18n/{lang}")
async def get_i18n(lang: str):
    """Get UI string bundle for frontend."""
    return get_all_strings(lang)


# -------------------------------------------------------------
# Static Frontend Serving
# -------------------------------------------------------------
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

    @app.get("/")
    async def index_page():
        return FileResponse(str(STATIC_DIR / "index.html"))

    @app.get("/dashboard")
    async def dashboard_page():
        return FileResponse(str(STATIC_DIR / "index.html"))

    @app.get("/manifest.json")
    async def pwa_manifest():
        return FileResponse(str(STATIC_DIR / "manifest.json"), media_type="application/manifest+json")

    @app.get("/sw.js")
    async def service_worker():
        return FileResponse(str(STATIC_DIR / "sw.js"), media_type="application/javascript")
