"""Deterministic Clinical Rules Engine for ASHA Sahayak.
100% pure, deterministic, zero-network evaluation of danger signs,
numeric threshold cutoffs by age band, and safe risk escalation.
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import yaml

from app.models import (
    RiskLevel,
    Measurements,
    TriggeredSignInfo,
    DangerSign,
)
from app.i18n import get_text

def _resolve_rules_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parent.parent / "rules",
        Path.cwd() / "rules",
        Path("/var/task/rules"),
        Path(__file__).resolve().parent / "rules",
    ]
    for c in candidates:
        if c.exists() and (c / "newborn.yaml").exists():
            return c
    return Path(__file__).resolve().parent.parent / "rules"

RULES_DIR = _resolve_rules_dir()
VALID_MODULES = ["newborn", "pregnancy", "child", "adult"]


class RulesEngine:
    def __init__(self, rules_dir: Optional[Path] = None):
        self.rules_dir = rules_dir or RULES_DIR
        self.rules: Dict[str, Dict[str, Any]] = {}
        self.signs_by_id: Dict[str, DangerSign] = {}
        self.signs_by_module: Dict[str, List[DangerSign]] = {}
        self._load_all_rules()

    def _load_all_rules(self) -> None:
        for module in VALID_MODULES:
            rule_path = self.rules_dir / f"{module}.yaml"
            if not rule_path.exists():
                raise FileNotFoundError(f"Rule file not found for module '{module}': {rule_path}")
            with open(rule_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            self.rules[module] = data
            self.signs_by_module[module] = []

            for sign_dict in data.get("signs", []):
                sign = DangerSign(**sign_dict)
                self.signs_by_id[sign.id] = sign
                self.signs_by_module[module].append(sign)

    def get_signs_for_module(self, module: str) -> List[DangerSign]:
        if module not in self.signs_by_module:
            raise ValueError(f"Unknown module '{module}'. Valid modules: {VALID_MODULES}")
        return self.signs_by_module[module]

    def get_sign(self, sign_id: str) -> Optional[DangerSign]:
        return self.signs_by_id.get(sign_id)

    def get_module_data(self, module: str) -> Dict[str, Any]:
        if module not in self.rules:
            raise ValueError(f"Unknown module '{module}'.")
        return self.rules[module]

    def _is_yes(self, val: Any) -> bool:
        if val is True:
            return True
        if isinstance(val, str) and val.strip().lower() in ("yes", "y", "true", "1", "होय", "हाँ"):
            return True
        if isinstance(val, (int, float)) and val == 1:
            return True
        return False

    def _is_dont_know(self, val: Any) -> bool:
        if val is None:
            return False
        if isinstance(val, str) and val.strip().lower() in (
            "dont_know", "don't know", "dontknow", "unknown",
            "माहित नाही", "पता नहीं", "शंका आहे", "अस्पष्ट"
        ):
            return True
        return False

    def evaluate_measurements(
        self,
        module: str,
        age: Optional[float],
        measurements: Optional[Measurements],
    ) -> List[str]:
        """Check measurements against clinical thresholds and return triggered sign IDs."""
        if not measurements:
            return []

        triggered_ids: List[str] = []
        celsius = measurements.get_celsius()
        rr = measurements.respiratory_rate

        # 1. Newborn (0 to 59 days)
        if module == "newborn":
            if rr is not None and rr >= 60:
                triggered_ids.append("nb_fast_breathing")
            if celsius is not None:
                if celsius >= 37.5 or celsius < 35.5:
                    triggered_ids.append("nb_temp_abnormal")

        # 2. Pregnancy
        elif module == "pregnancy":
            if celsius is not None and celsius >= 38.0:
                triggered_ids.append("preg_high_fever")
            if rr is not None and rr >= 28:
                triggered_ids.append("preg_severe_breathlessness_pallor")

        # 3. Child (2 months to 5 years / 59 months)
        elif module == "child":
            if rr is not None:
                # Fast breathing thresholds:
                # 2 to 11 months: >= 50
                # 12 to 59 months: >= 40
                if age is not None:
                    if age < 12 and rr >= 50:
                        triggered_ids.append("ch_fast_breathing")
                    elif age >= 12 and rr >= 40:
                        triggered_ids.append("ch_fast_breathing")
                else:
                    # If age is unspecified, rr >= 50 is definitely fast; if rr >= 40, treat as fast for safety
                    if rr >= 40:
                        triggered_ids.append("ch_fast_breathing")

            if celsius is not None:
                if celsius >= 38.5:
                    triggered_ids.append("ch_fever_2_to_7d")

        # 4. Adult
        elif module == "adult":
            if rr is not None and (rr >= 30 or rr <= 8):
                triggered_ids.append("ad_difficulty_breathing_blue_lips")
            if celsius is not None:
                if celsius >= 39.0:
                    triggered_ids.append("ad_very_high_fever_weakness")
                elif celsius >= 38.0:
                    triggered_ids.append("ad_fever_over_3d")

        return triggered_ids

    def evaluate(
        self,
        module: str,
        age: Optional[float],
        answers: Dict[str, Any],
        measurements: Optional[Measurements] = None,
        language: str = "mr",
    ) -> Dict[str, Any]:
        """Pure deterministic triage evaluation.

        Returns:
            level: RiskLevel
            triggered_signs: List[TriggeredSignInfo]
            triggered_sign_ids: List[str]
            reasons: List[str]
            unknown_urgent_signs: List[str]
            home_care_advice: List[str]
            warning_signs: List[str]
        """
        if module not in VALID_MODULES:
            raise ValueError(f"Invalid module: {module}. Must be one of {VALID_MODULES}")

        signs = self.get_signs_for_module(module)
        triggered_sign_ids: List[str] = []
        unknown_urgent_signs: List[str] = []

        # Step 1: Evaluate objective numeric measurements
        measurement_triggered = self.evaluate_measurements(module, age, measurements)
        for s_id in measurement_triggered:
            if s_id not in triggered_sign_ids:
                triggered_sign_ids.append(s_id)

        # Step 2: Evaluate answers from questionnaire
        for sign in signs:
            user_ans = answers.get(sign.id)

            # Check if affirmative
            if self._is_yes(user_ans):
                if sign.id not in triggered_sign_ids:
                    triggered_sign_ids.append(sign.id)

            # Check if unknown / don't know on an URGENT sign
            elif sign.level == "URGENT" and self._is_dont_know(user_ans):
                unknown_urgent_signs.append(sign.id)

        # Step 3: Determine Risk Level
        # Invariant 3: Any URGENT sign yes -> URGENT_REFERRAL
        has_urgent_yes = any(
            self.signs_by_id[s_id].level == "URGENT"
            for s_id in triggered_sign_ids
            if s_id in self.signs_by_id
        )

        has_refer_yes = any(
            self.signs_by_id[s_id].level == "REFER"
            for s_id in triggered_sign_ids
            if s_id in self.signs_by_id
        )

        has_unknown_urgent = len(unknown_urgent_signs) > 0

        if has_urgent_yes:
            level = RiskLevel.URGENT_REFERRAL
        elif has_refer_yes or has_unknown_urgent:
            # Invariant 4: "don't know" on urgent sign counts as at least VISIT_PHC
            level = RiskLevel.VISIT_PHC
        else:
            level = RiskLevel.HOME_CARE

        # Step 4: Assemble clinical reasons and triggered sign details
        triggered_sign_infos: List[TriggeredSignInfo] = []
        reasons: List[str] = []

        for s_id in triggered_sign_ids:
            sign = self.signs_by_id.get(s_id)
            if not sign:
                continue
            q_text = getattr(sign.question, language, sign.question.en)
            why_text = getattr(sign.why_it_matters, language, sign.why_it_matters.en)
            triggered_sign_infos.append(
                TriggeredSignInfo(
                    id=sign.id,
                    level=sign.level,
                    question=q_text,
                    why_it_matters=why_text,
                )
            )
            reasons.append(f"[{sign.level}] {why_text}")

        # If there are unknown urgent signs, add an explicit clinical reason
        for u_id in unknown_urgent_signs:
            sign = self.signs_by_id.get(u_id)
            if sign:
                q_text = getattr(sign.question, language, sign.question.en)
                reasons.append(
                    f"[DON'T KNOW] {get_text('unknown_urgent_alert', language)} ({q_text})"
                )

        # Step 5: Advice & Warnings from module rules
        mod_data = self.get_module_data(module)
        advice_dict = mod_data.get("home_care_advice", {})
        warning_dict = mod_data.get("warning_signs", {})

        home_care_advice = advice_dict.get(language, advice_dict.get("en", []))
        warning_signs = warning_dict.get(language, warning_dict.get("en", []))

        return {
            "level": level,
            "triggered_signs": triggered_sign_infos,
            "triggered_sign_ids": triggered_sign_ids,
            "reasons": reasons,
            "unknown_urgent_signs": unknown_urgent_signs,
            "home_care_advice": home_care_advice,
            "warning_signs": warning_signs,
        }

    def generate_referral_note(
        self,
        case_id: str,
        module: str,
        age: Optional[float],
        level: RiskLevel,
        triggered_sign_ids: List[str],
        measurements: Optional[Measurements] = None,
        language: str = "mr",
        district: Optional[str] = None,
        block: Optional[str] = None,
    ) -> str:
        """Deterministic referral note generator."""
        mod_data = self.get_module_data(module)
        target_group = mod_data.get("target_group", {}).get(language, module)

        dist_str = district or "Gadchiroli"
        blk_str = block or "Kurkheda"

        # Age string formatting
        if age is not None:
            if module == "newborn":
                age_str = f"{int(age)} days (दिवस)"
            elif module == "child":
                age_str = f"{int(age)} months (महिने)"
            else:
                age_str = f"{int(age)} years (वर्षे)"
        else:
            age_str = "Not specified"

        level_str = get_text(f"level_{level.value}", language)

        signs_lines = []
        for s_id in triggered_sign_ids:
            sign = self.signs_by_id.get(s_id)
            if sign:
                q_text = getattr(sign.question, language, sign.question.en)
                why_text = getattr(sign.why_it_matters, language, sign.why_it_matters.en)
                signs_lines.append(f" • [{sign.level}] {q_text}\n   -> {why_text}")

        if not signs_lines:
            signs_lines.append(" • No acute red-flag danger signs recorded at home visit.")

        vitals_lines = []
        if measurements:
            if measurements.respiratory_rate is not None:
                vitals_lines.append(f" • Respiratory Rate: {measurements.respiratory_rate} breaths/min")
            celsius = measurements.get_celsius()
            if celsius is not None:
                vitals_lines.append(f" • Temperature: {celsius}°C ({round(celsius*9/5+32, 1)}°F)")

        vitals_text = "\n".join(vitals_lines) if vitals_lines else " • Clinical observation only; no digital vitals."
        signs_text = "\n".join(signs_lines)

        disclaimer_text = get_text("disclaimer", language)

        note = f"""====================================================
ASHA SAHAYAK - PRIMARY HEALTH REFERRAL SLIP
आशा सहाय्यक - प्राथमिक आरोग्य संदर्भ चिठ्ठी
====================================================
Case Reference ID: {case_id}
Location: District {dist_str}, Block {blk_str}
Patient Category: {target_group}
Age / वय: {age_str}
TRIAGE RISK LEVEL: {level.value}
({level_str})
----------------------------------------------------
OBSERVED VITALS / मोजलेली लक्षणे:
{vitals_text}
----------------------------------------------------
IDENTIFIED DANGER SIGNS / धोक्याची लक्षणे:
{signs_text}
----------------------------------------------------
ACTIONS TAKEN BY ASHA / आशा सेविकेने केलेली कृती:
 • Assessed patient danger signs using NHM protocol.
 • Counseled family on warmth, hydration, and immediate facility referral.
 • Facilitated emergency transport (108 / 102 Ambulance).
----------------------------------------------------
NOTE FOR MEDICAL OFFICER:
This referral was initiated by frontline community decision support.
Please perform urgent clinical evaluation and initiate facility-level management.

DISCLAIMER: {disclaimer_text}
===================================================="""
        return note.strip()


# Global default engine singleton
engine = RulesEngine()
