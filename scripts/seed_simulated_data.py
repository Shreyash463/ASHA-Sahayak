"""Simulated Dataset Generator for ASHA Sahayak.
Generates ~600 realistic, anonymized triage records across Maharashtra districts
over a 30-day window, tagged source='simulated'.
Includes intentional syndromic clusters for outbreak alert verification.
"""

import sys
import uuid
import random
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models import TriageRecord, RiskLevel
from app.engine import engine, VALID_MODULES
from app.storage import storage

DISTRICTS_AND_BLOCKS = {
    "Gadchiroli": ["Kurkheda", "Dhanora", "Armori", "Chamorshi", "Aheri"],
    "Nandurbar": ["Dhadgaon", "Akkalkuwa", "Taloda", "Shahada", "Navapur"],
    "Pune": ["Haveli", "Ambegaon", "Junnar", "Khed", "Shirur"],
    "Nashik": ["Trimbak", "Igatpuri", "Surgana", "Peint", "Kalwan"],
    "Amravati": ["Dharni", "Chikhaldara", "Achalpur", "Morshi"],
    "Thane": ["Shahapur", "Murbad", "Bhiwandi", "Kalyan"],
    "Satara": ["Jawali", "Patan", "Mahabaleshwar", "Wai"],
}

LANGUAGES = ["mr", "mr", "mr", "hi", "en"]  # 60% Marathi, 20% Hindi, 20% English


def generate_simulated_dataset(target_count: int = 600) -> None:
    print(f"Generating {target_count} simulated cases across Maharashtra...")

    now = datetime.now(timezone.utc)
    cases = []

    # Get valid signs for each module
    module_signs = {mod: engine.get_signs_for_module(mod) for mod in VALID_MODULES}

    # Generate general random cases across past 30 days
    for i in range(target_count - 20):
        mod = random.choice(VALID_MODULES)
        signs = module_signs[mod]
        dist = random.choice(list(DISTRICTS_AND_BLOCKS.keys()))
        block = random.choice(DISTRICTS_AND_BLOCKS[dist])
        lang = random.choice(LANGUAGES)

        # Distribute over past 30 days
        days_ago = random.uniform(0.1, 29.5)
        case_dt = now - timedelta(days=days_ago)
        ts = case_dt.isoformat()

        # Decide simulated clinical risk level distribution:
        # ~60% HOME_CARE, ~25% VISIT_PHC, ~15% URGENT_REFERRAL
        roll = random.random()
        answers = {}
        triggered_ids = []
        measurements = None

        if mod == "newborn":
            age = round(random.uniform(1, 58), 0)
        elif mod == "child":
            age = round(random.uniform(2, 59), 0)
        elif mod == "pregnancy":
            age = round(random.uniform(18, 38), 0)
        else:
            age = round(random.uniform(19, 75), 0)

        if roll < 0.60:
            # HOME_CARE: all NO
            level = RiskLevel.HOME_CARE.value
            for s in signs:
                answers[s.id] = False
        elif roll < 0.85:
            # VISIT_PHC: pick 1 or 2 REFER signs, no URGENT
            level = RiskLevel.VISIT_PHC.value
            refer_signs = [s for s in signs if s.level == "REFER"]
            urgent_signs = [s for s in signs if s.level == "URGENT"]
            chosen = random.sample(refer_signs, min(len(refer_signs), random.randint(1, 2))) if refer_signs else []
            for s in signs:
                if s in chosen:
                    answers[s.id] = True
                    triggered_ids.append(s.id)
                else:
                    answers[s.id] = False
        else:
            # URGENT_REFERRAL: pick 1 or 2 URGENT signs
            level = RiskLevel.URGENT_REFERRAL.value
            urgent_signs = [s for s in signs if s.level == "URGENT"]
            chosen = random.sample(urgent_signs, min(len(urgent_signs), random.randint(1, 2))) if urgent_signs else []
            for s in signs:
                if s in chosen:
                    answers[s.id] = True
                    triggered_ids.append(s.id)
                else:
                    answers[s.id] = False

        record = TriageRecord(
            case_id=f"SIM-{uuid.uuid4().hex[:8].upper()}",
            timestamp=ts,
            module=mod,
            age=age,
            level=level,
            rules_level=level,
            llm_suggested_level=None,
            triggered_signs=triggered_ids,
            answers=answers,
            measurements=None,
            language=lang,
            district=dist,
            block=block,
            source="simulated",
        )
        cases.append(record)

    # -------------------------------------------------------------------------
    # Intentional Cluster 1: Gadchiroli, Kurkheda block -> 8 cases of
    # newborn fast breathing (nb_fast_breathing) in past 48 hours (Critical Alert)
    # -------------------------------------------------------------------------
    print("Injecting intentional syndromic outbreak cluster in Gadchiroli / Kurkheda...")
    for j in range(8):
        hours_ago = random.uniform(2, 44)
        c_dt = now - timedelta(hours=hours_ago)
        rec = TriageRecord(
            case_id=f"SIM-CLUST1-{uuid.uuid4().hex[:6].upper()}",
            timestamp=c_dt.isoformat(),
            module="newborn",
            age=round(random.uniform(3, 25), 0),
            level=RiskLevel.URGENT_REFERRAL.value,
            rules_level=RiskLevel.URGENT_REFERRAL.value,
            llm_suggested_level=None,
            triggered_signs=["nb_fast_breathing"],
            answers={"nb_fast_breathing": True},
            measurements={"respiratory_rate": random.randint(62, 75)},
            language="mr",
            district="Gadchiroli",
            block="Kurkheda",
            source="simulated",
        )
        cases.append(rec)

    # -------------------------------------------------------------------------
    # Intentional Cluster 2: Nandurbar, Dhadgaon block -> 7 cases of
    # child persistent fever/some dehydration in past 60 hours (Warning Alert)
    # -------------------------------------------------------------------------
    print("Injecting intentional syndromic cluster in Nandurbar / Dhadgaon...")
    for k in range(7):
        hours_ago = random.uniform(4, 58)
        c_dt = now - timedelta(hours=hours_ago)
        rec = TriageRecord(
            case_id=f"SIM-CLUST2-{uuid.uuid4().hex[:6].upper()}",
            timestamp=c_dt.isoformat(),
            module="child",
            age=round(random.uniform(8, 36), 0),
            level=RiskLevel.VISIT_PHC.value,
            rules_level=RiskLevel.VISIT_PHC.value,
            llm_suggested_level=None,
            triggered_signs=["ch_some_dehydration"],
            answers={"ch_some_dehydration": True},
            measurements=None,
            language="mr",
            district="Nandurbar",
            block="Dhadgaon",
            source="simulated",
        )
        cases.append(rec)

    # Save all cases to storage
    saved_count = 0
    for c in cases:
        if storage.save_case(c):
            saved_count += 1

    print(f"Successfully seeded {saved_count} simulated cases into {type(storage).__name__} storage.")


if __name__ == "__main__":
    generate_simulated_dataset()
