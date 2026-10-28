"""Unit Tests for Pure Deterministic Clinical Rules Engine.
Tests every module, danger sign, threshold boundary, and safety escalation rule.
"""

import pytest
from app.engine import RulesEngine, VALID_MODULES
from app.models import RiskLevel, Measurements


@pytest.fixture
def engine():
    return RulesEngine()


def test_all_modules_loaded(engine):
    assert len(engine.rules) == 4
    for mod in VALID_MODULES:
        assert mod in engine.rules
        signs = engine.get_signs_for_module(mod)
        assert len(signs) >= 8


def test_every_sign_has_translations_and_source(engine):
    for mod in VALID_MODULES:
        signs = engine.get_signs_for_module(mod)
        for s in signs:
            assert s.id
            assert s.level in ("URGENT", "REFER")
            assert s.question.en and s.question.hi and s.question.mr
            assert s.why_it_matters.en and s.why_it_matters.hi and s.why_it_matters.mr
            assert s.source


# -------------------------------------------------------------
# Newborn Module Tests
# -------------------------------------------------------------
def test_newborn_all_negative_is_home_care(engine):
    res = engine.evaluate(
        module="newborn",
        age=7,
        answers={},
        measurements=Measurements(respiratory_rate=45, temperature_celsius=36.7),
    )
    assert res["level"] == RiskLevel.HOME_CARE
    assert len(res["triggered_signs"]) == 0
    assert len(res["home_care_advice"]) > 0


def test_newborn_urgent_sign_yields_urgent_referral(engine):
    res = engine.evaluate(
        module="newborn",
        age=10,
        answers={"nb_convulsions": True},
    )
    assert res["level"] == RiskLevel.URGENT_REFERRAL
    assert "nb_convulsions" in res["triggered_sign_ids"]


def test_newborn_respiratory_rate_boundary(engine):
    # Cutoff is 60 breaths/min
    res_below = engine.evaluate(
        module="newborn",
        age=5,
        answers={},
        measurements=Measurements(respiratory_rate=59),
    )
    assert res_below["level"] == RiskLevel.HOME_CARE

    res_at_cutoff = engine.evaluate(
        module="newborn",
        age=5,
        answers={},
        measurements=Measurements(respiratory_rate=60),
    )
    assert res_at_cutoff["level"] == RiskLevel.URGENT_REFERRAL
    assert "nb_fast_breathing" in res_at_cutoff["triggered_sign_ids"]


def test_newborn_temperature_boundaries(engine):
    # Normal range: 35.5 to 37.4
    res_norm = engine.evaluate("newborn", 5, {}, Measurements(temperature_celsius=36.8))
    assert res_norm["level"] == RiskLevel.HOME_CARE

    # Fever threshold: >= 37.5
    res_fever = engine.evaluate("newborn", 5, {}, Measurements(temperature_celsius=37.5))
    assert res_fever["level"] == RiskLevel.URGENT_REFERRAL
    assert "nb_temp_abnormal" in res_fever["triggered_sign_ids"]

    # Hypothermia threshold: < 35.5
    res_hypo = engine.evaluate("newborn", 5, {}, Measurements(temperature_celsius=35.4))
    assert res_hypo["level"] == RiskLevel.URGENT_REFERRAL
    assert "nb_temp_abnormal" in res_hypo["triggered_sign_ids"]


def test_newborn_refer_sign_yields_visit_phc(engine):
    res = engine.evaluate(
        module="newborn",
        age=5,
        answers={"nb_mild_jaundice_face": True},
    )
    assert res["level"] == RiskLevel.VISIT_PHC
    assert "nb_mild_jaundice_face" in res["triggered_sign_ids"]


def test_newborn_dont_know_on_urgent_escalates_to_visit_phc(engine):
    res = engine.evaluate(
        module="newborn",
        age=12,
        answers={"nb_feeding_stop": "dont_know"},
    )
    assert res["level"] == RiskLevel.VISIT_PHC
    assert "nb_feeding_stop" in res["unknown_urgent_signs"]


# -------------------------------------------------------------
# Pregnancy Module Tests
# -------------------------------------------------------------
def test_pregnancy_all_negative_is_home_care(engine):
    res = engine.evaluate("pregnancy", 24, {})
    assert res["level"] == RiskLevel.HOME_CARE


def test_pregnancy_urgent_signs(engine):
    urgent_keys = [
        "preg_vaginal_bleed",
        "preg_convulsions_fits",
        "preg_severe_headache_vision",
        "preg_severe_abdominal_pain",
        "preg_leaking_water",
        "preg_reduced_movements",
        "preg_labour_over_12h",
        "preg_postpartum_heavy_bleed_fever",
    ]
    for k in urgent_keys:
        res = engine.evaluate("pregnancy", 25, {k: True})
        assert res["level"] == RiskLevel.URGENT_REFERRAL, f"Expected {k} to yield URGENT_REFERRAL"


def test_pregnancy_refer_signs(engine):
    refer_keys = ["preg_mild_pallor", "preg_swelling_feet_only", "preg_missed_anc_ifa"]
    for k in refer_keys:
        res = engine.evaluate("pregnancy", 25, {k: True})
        assert res["level"] == RiskLevel.VISIT_PHC, f"Expected {k} to yield VISIT_PHC"


# -------------------------------------------------------------
# Child Module Tests & Age Band Thresholds
# -------------------------------------------------------------
def test_child_respiratory_rate_by_age_band(engine):
    # Band 1: 2 to 11 months, cutoff >= 50
    res_infant_49 = engine.evaluate("child", 6, {}, Measurements(respiratory_rate=49))
    assert res_infant_49["level"] == RiskLevel.HOME_CARE

    res_infant_50 = engine.evaluate("child", 6, {}, Measurements(respiratory_rate=50))
    assert res_infant_50["level"] == RiskLevel.VISIT_PHC
    assert "ch_fast_breathing" in res_infant_50["triggered_sign_ids"]

    # Band 2: 12 to 59 months, cutoff >= 40
    res_toddler_39 = engine.evaluate("child", 24, {}, Measurements(respiratory_rate=39))
    assert res_toddler_39["level"] == RiskLevel.HOME_CARE

    res_toddler_40 = engine.evaluate("child", 24, {}, Measurements(respiratory_rate=40))
    assert res_toddler_40["level"] == RiskLevel.VISIT_PHC
    assert "ch_fast_breathing" in res_toddler_40["triggered_sign_ids"]


def test_child_general_danger_signs_urgent(engine):
    for sign_id in ["ch_unable_to_drink", "ch_vomits_everything", "ch_convulsions", "ch_chest_indrawing_stridor"]:
        res = engine.evaluate("child", 18, {sign_id: True})
        assert res["level"] == RiskLevel.URGENT_REFERRAL, f"Expected {sign_id} to be URGENT_REFERRAL"


# -------------------------------------------------------------
# Adult Module Tests
# -------------------------------------------------------------
def test_adult_all_negative_is_home_care(engine):
    res = engine.evaluate("adult", 35, {})
    assert res["level"] == RiskLevel.HOME_CARE


def test_adult_red_flags(engine):
    for sign_id in [
        "ad_difficulty_breathing_blue_lips",
        "ad_chest_pain",
        "ad_confusion_stiff_neck",
        "ad_unable_fluids",
    ]:
        res = engine.evaluate("adult", 50, {sign_id: True})
        assert res["level"] == RiskLevel.URGENT_REFERRAL, f"Expected {sign_id} to be URGENT_REFERRAL"


def test_adult_presumptive_tb_referral(engine):
    res = engine.evaluate("adult", 45, {"ad_cough_2w": True})
    assert res["level"] == RiskLevel.VISIT_PHC
    assert "ad_cough_2w" in res["triggered_sign_ids"]


def test_referral_note_generation(engine):
    note = engine.generate_referral_note(
        case_id="TEST-1234",
        module="child",
        age=18,
        level=RiskLevel.URGENT_REFERRAL,
        triggered_sign_ids=["ch_chest_indrawing_stridor"],
        measurements=Measurements(respiratory_rate=54, temperature_celsius=38.4),
        language="mr",
        district="Gadchiroli",
        block="Kurkheda",
    )
    assert "TEST-1234" in note
    assert "Gadchiroli" in note
    assert "URGENT_REFERRAL" in note
    assert "54 breaths/min" in note
