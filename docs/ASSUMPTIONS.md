# Architectural and Clinical Assumptions

This document records sensible, safe engineering choices and operational assumptions made during development when requirements permitted design latitude.

## 1. Clinical Risk Escalation Safety Invariant
- **Rule Decides**: The rules engine is 100% deterministic code executing pure logic on validated sign inputs.
- **LLM Boundary**: The LLM suggestion can **never** lower a triage level under any circumstances. It may only elevate `HOME_CARE` to `VISIT_PHC` if an extra contextual risk is articulated in free text/voice. The LLM is strictly prohibited from asserting `URGENT_REFERRAL` autonomously to prevent hallucinated panic or unnecessary ambulance dispatch; urgent escalation must be anchored in deterministic danger signs.
- **Formula**: `final_level = max(rules_level, min(llm_suggested_level, VISIT_PHC))`.

## 2. "Don't Know" Handling on Danger Signs
- If an ASHA responds "Don't Know" / "माहित नाही" / "पता नहीं" to an `URGENT` danger sign, the app treats this as safety-first precaution: triage is elevated to at least `VISIT_PHC`, and the user interface explicitly flags the sign with instructions to re-examine the patient before making a definitive home-care decision.

## 3. Storage and Zero-PII Policy
- No Patient Names, Phone Numbers, Aadhaar IDs, or House Numbers are accepted or persisted.
- Free-text transcripts and raw voice audio are processed transiently in-memory and discarded immediately after structured symptom extraction.
- Persisted records contain only: `case_id` (UUIDv4), `timestamp`, `module`, `age` / `age_band`, `answers` (sign ID -> boolean), `measurements`, `level`, `triggered_signs`, `language`, `district`, `block`, and `source` (`"live"` or `"simulated"`).

## 4. Language Priority and Script
- **Marathi (मराठी)** is the default language because the app targets community health workers in Maharashtra.
- **Hindi (हिंदी)** and **English (en)** are fully supported with instant switching and local storage persistence.
- Fonts: Google Fonts `Noto Sans Devanagari` and `Noto Sans` loaded with system font fallbacks (`sans-serif`, Arial) to ensure zero render delay when offline.

## 5. Offline and PWA Strategy
- The application is a progressive web app (PWA) with a Service Worker caching the app shell and rule definitions.
- For offline triage, a 100% parity JavaScript port of the rules engine runs directly in the browser. Cases evaluated offline are queued in `IndexedDB` and synchronized with the backend once connectivity resumes.
- Parity between Python and JavaScript engines is verified by an automated test suite across all 50 vignettes.

## 6. District and Block Hierarchy (Maharashtra Context)
- For high-realism district reporting and outbreak alerts, coarse dropdowns are provided covering representative Maharashtra districts (e.g., Pune, Nashik, Gadchiroli, Nandurbar, Thane, Amravati, Satara) and their administrative blocks.

## 7. Outbreak Cluster Alerts
- An automated rule analyzes recent cases within a rolling window: if 5 or more cases exhibiting the same danger-sign cluster (e.g., fast breathing, prolonged fever, or diarrhea) occur in a single administrative block within 3 days, a "Possible Cluster Alert" is raised on the district dashboard. Configurable via environment variables `CLUSTER_ALERT_THRESHOLD_COUNT` and `CLUSTER_ALERT_DAYS`.
