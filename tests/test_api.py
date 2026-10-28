"""API Integration Tests for FastAPI Backend.
Tests endpoints, health check, triage flows, extraction, dashboard aggregates, and i18n.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import RiskLevel

client = TestClient(app)


def test_healthz():
    resp = client.get("/healthz")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "llm_available" in data
    assert "newborn" in data["supported_modules"]


def test_get_rules_valid():
    for mod in ["newborn", "pregnancy", "child", "adult"]:
        resp = client.get(f"/api/rules/{mod}?lang=mr")
        assert resp.status_code == 200
        data = resp.json()
        assert data["module"] == mod
        assert len(data["signs"]) > 0
        assert len(data["home_care_advice"]) > 0


def test_get_rules_invalid():
    resp = client.get("/api/rules/veterinary")
    assert resp.status_code == 400


def test_triage_home_care():
    payload = {
        "module": "pregnancy",
        "age": 24,
        "answers": {},
        "measurements": None,
        "language": "mr",
        "district": "Pune",
        "block": "Haveli",
    }
    resp = client.post("/api/triage", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["level"] == RiskLevel.HOME_CARE.value
    assert data["case_id"].startswith("ASHA-")
    assert len(data["referral_note"]) > 50
    assert "disclaimer" in data


def test_triage_urgent_referral():
    payload = {
        "module": "newborn",
        "age": 4,
        "answers": {"nb_chest_indrawing": True},
        "measurements": {"respiratory_rate": 65},
        "language": "hi",
        "district": "Gadchiroli",
        "block": "Kurkheda",
    }
    resp = client.post("/api/triage", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["level"] == RiskLevel.URGENT_REFERRAL.value
    assert len(data["triggered_signs"]) >= 1


def test_triage_dont_know_escalation():
    payload = {
        "module": "child",
        "age": 14,
        "answers": {"ch_convulsions": "dont_know"},
        "language": "en",
    }
    resp = client.post("/api/triage", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["level"] == RiskLevel.VISIT_PHC.value
    assert "ch_convulsions" in data["unknown_urgent_signs"]


def test_extract_symptoms_endpoint():
    payload = {
        "module": "child",
        "language": "mr",
        "transcript": "मुलाला श्वास घ्यायला त्रास होतोय आणि छाती आत ओढली जातेय",
    }
    resp = client.post("/api/extract", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "suggested_signs" in data
    assert isinstance(data["suggested_signs"], list)


def test_regenerate_referral_note():
    payload = {
        "case_id": "REF-9999",
        "module": "adult",
        "age": 45,
        "level": "VISIT_PHC",
        "triggered_sign_ids": ["ad_cough_2w"],
        "language": "mr",
        "district": "Nashik",
        "block": "Trimbak",
    }
    resp = client.post("/api/referral-note", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "REF-9999" in data["referral_note"]
    assert "Trimbak" in data["referral_note"]


def test_dashboard_endpoint():
    resp = client.get("/api/dashboard?include_simulated=true")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_cases" in data
    assert "cases_by_level" in data
    assert "cases_by_module" in data
    assert "cluster_alerts" in data
    assert isinstance(data["cluster_alerts"], list)


def test_i18n_endpoint():
    for lang in ["mr", "hi", "en"]:
        resp = client.get(f"/api/i18n/{lang}")
        assert resp.status_code == 200
        data = resp.json()
        assert "app_title" in data
        assert "disclaimer" in data
        assert "btn_yes" in data
