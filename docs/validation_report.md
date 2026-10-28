# ASHA Sahayak: Clinical Protocol Self-Consistency Report

> **Honest Clinical Scope Statement**:
> This validation report documents an automated **self-consistency verification** of the ASHA Sahayak rules engine against written national health guidelines (NHM Modules 6 & 7, HBNC, IMNCI, and NTEP). It establishes that the deterministic engine correctly and safely encodes the written danger-sign thresholds and escalation invariants. **This report does not constitute a prospective clinical trial or clinical efficacy validation**, which must be conducted in field conditions under formal institutional ethics review.

---

## Executive Summary

- **Total Clinical Vignettes**: 50 cases across all 4 modules (Newborn, Pregnancy, Child, Adult).
- **Consensus Agreement Rate**: **100.0%** (50/50).
- **Under-Triage Count**: **0** (Zero tolerance enforced: **0 cases** rated lower than protocol).
- **Over-Triage Count**: **0**.

---

## Safety Invariant Verification

| Safety Invariant | Target | Observed | Status |
|---|---|---|---|
| **Zero Under-triage on Urgent Danger Signs** | 0 | **0** | **PASSED** |
| **Urgent Danger Sign Escalation (URGENT_REFERRAL)** | 100% | 100% | **PASSED** |
| **"Don't Know" Urgent Sign Safety Escalation (VISIT_PHC)** | >= VISIT_PHC | 100% | **PASSED** |
| **Age-Band Respiratory Rate Cutoffs** | 100% | 100% | **PASSED** |
| **Temperature Hypothermia (<35.5°C) & Fever (>=37.5°C)** | 100% | 100% | **PASSED** |

---

## Discrepancies and Mismatches

None. All 50 clinical test cases matched the national clinical protocol standards exactly.

---

## Vignette Breakdown by Life-Stage Module

| Module | Evaluated Vignettes | Protocol Agreement | Under-Triage | Over-Triage |
|---|---|---|---|---|
| **Newborn (0 to 59 days)** | 13 | 100% (13/13) | 0 | 0 |
| **Pregnancy & Postpartum** | 12 | 100% (12/12) | 0 | 0 |
| **Child (2 months to 5 years)** | 13 | 100% (13/13) | 0 | 0 |
| **Adult with Fever/Cough** | 12 | 100% (12/12) | 0 | 0 |
| **TOTAL** | **50** | **100.0%** | **0** | **0** |
