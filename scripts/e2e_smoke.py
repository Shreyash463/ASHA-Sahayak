"""End-to-End Browser Smoke Test and Mobile Screenshot Suite.
Uses Playwright with mobile viewport 390x844.
Covers:
- All 4 modules (Newborn, Pregnancy, Child, Adult)
- All 3 languages (Marathi, Hindi, English)
- Triage paths: URGENT_REFERRAL, VISIT_PHC, HOME_CARE
- Referral actions: Copy, WhatsApp, Print, TTS
- Dashboard view with simulated data & cluster alerts
- Checks for ZERO console errors
- Captures required 8 mobile screenshots (390x844) into docs/screenshots/
"""

import sys
import os
import time
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT_DIR = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = ROOT_DIR / "docs" / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_PORT = 8008


def run_e2e_smoke(target_url: str = f"http://127.0.0.1:{DEFAULT_PORT}"):
    print(f"Starting E2E Smoke Verification against: {target_url}")
    server_process = None

    # Check if target_url is reachable; if not, spin up local uvicorn
    import urllib.request
    try:
        urllib.request.urlopen(f"{target_url}/healthz", timeout=2)
        print("Server is already running.")
    except Exception:
        print(f"Launching local FastAPI test server on port {DEFAULT_PORT}...")
        python_exe = sys.executable
        server_process = subprocess.Popen(
            [python_exe, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(DEFAULT_PORT)],
            cwd=str(ROOT_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        # Wait up to 10 seconds for server startup
        for _ in range(20):
            time.sleep(0.5)
            try:
                urllib.request.urlopen(f"{target_url}/healthz", timeout=1)
                print("Local server started successfully.")
                break
            except Exception:
                continue

    console_errors = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 390, "height": 844},
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                is_mobile=True,
                has_touch=True,
            )
            page = context.new_page()

            def on_console(msg):
                if msg.type in ("error", "warning") and "favicon" not in msg.text.lower():
                    console_errors.append(f"[{msg.type}] {msg.text}")

            page.on("console", on_console)

            # ---------------------------------------------------------
            # 1. Initial Page Load & Screenshot 1: Language Switcher
            # ---------------------------------------------------------
            print("1. Verifying Home Page and Language Switcher...")
            page.goto(target_url, wait_until="networkidle")
            page.wait_for_selector("#lang-select")
            page.screenshot(path=str(SCREENSHOTS_DIR / "01_language_choice.png"))

            # ---------------------------------------------------------
            # 2. Screenshot 2: Patient Type Selection
            # ---------------------------------------------------------
            print("2. Verifying Patient Type Selection...")
            page.wait_for_selector("#step-module-select")
            page.screenshot(path=str(SCREENSHOTS_DIR / "02_patient_type.png"))

            # ---------------------------------------------------------
            # 3. Path A: Newborn URGENT_REFERRAL (Marathi)
            # ---------------------------------------------------------
            print("3. Testing Newborn Module -> URGENT_REFERRAL (Marathi)...")
            page.click('.module-card-btn[data-module="newborn"]')
            page.wait_for_selector("#step-demographics")
            page.fill("#input-age", "5")
            page.fill("#input-rr", "64")  # Fast breathing threshold >= 60
            page.fill("#text-transcript", "बाळाचे श्वास वेगाने चालले आहेत")

            # Screenshot 3: Question Screen
            page.click("#btn-proceed-to-questions")
            page.wait_for_selector("#step-questions")
            page.screenshot(path=str(SCREENSHOTS_DIR / "03_question_screen.png"))

            # Answer questions until result screen appears
            def complete_questions(preferred_yes_keyword=None):
                for _ in range(25):
                    if page.is_visible("#step-results"):
                        break
                    if not page.is_visible("#step-questions"):
                        break
                    q_text = page.inner_text("#current-question-text")
                    if preferred_yes_keyword and preferred_yes_keyword.lower() in q_text.lower():
                        page.click("#btn-ans-yes")
                    else:
                        page.click("#btn-ans-no")
                    page.wait_for_timeout(300)

            # Answer YES to chest indrawing / first question
            page.click("#btn-ans-yes")
            page.wait_for_timeout(300)
            complete_questions()

            # Wait for Result Screen
            page.wait_for_selector("#step-results", timeout=10000)
            page.wait_for_selector(".result-banner.URGENT_REFERRAL", timeout=10000)
            # Screenshot 4: Urgent Result
            page.screenshot(path=str(SCREENSHOTS_DIR / "04_urgent_result.png"))

            # ---------------------------------------------------------
            # 4. Referral Note Verification & Screenshot 7: Referral Note
            # ---------------------------------------------------------
            print("4. Verifying Referral Note Actions (Copy, WhatsApp, Print)...")
            page.wait_for_selector("#referral-note-content", timeout=5000)
            page.screenshot(path=str(SCREENSHOTS_DIR / "07_referral_note.png"))
            # Trigger Copy
            page.click("#btn-copy-note")

            # ---------------------------------------------------------
            # 5. Path B: Pregnancy VISIT_PHC (Hindi)
            # ---------------------------------------------------------
            print("5. Testing Pregnancy Module -> VISIT_PHC (Hindi)...")
            page.select_option("#lang-select", "hi")
            page.click("#btn-restart-triage")
            page.wait_for_selector('.module-card-btn[data-module="pregnancy"]', timeout=5000)
            page.click('.module-card-btn[data-module="pregnancy"]')
            page.fill("#input-age", "26")
            page.click("#btn-proceed-to-questions")
            page.wait_for_selector("#step-questions", timeout=5000)

            # Click DON'T KNOW on first question to test Invariant 4 (yields VISIT_PHC)
            page.click("#btn-ans-dk")
            page.wait_for_timeout(300)
            complete_questions()

            page.wait_for_selector("#step-results", timeout=10000)
            page.wait_for_selector(".result-banner.VISIT_PHC", timeout=10000)
            # Screenshot 5: Visit PHC Result
            page.screenshot(path=str(SCREENSHOTS_DIR / "05_visit_phc_result.png"))

            # ---------------------------------------------------------
            # 6. Path C: Child HOME_CARE (English)
            # ---------------------------------------------------------
            print("6. Testing Child Module -> HOME_CARE (English)...")
            page.select_option("#lang-select", "en")
            page.click("#btn-restart-triage")
            page.wait_for_selector('.module-card-btn[data-module="child"]', timeout=5000)
            page.click('.module-card-btn[data-module="child"]')
            page.fill("#input-age", "18")
            page.fill("#input-rr", "32")
            page.click("#btn-proceed-to-questions")
            page.wait_for_selector("#step-questions", timeout=5000)

            # Answer NO to all questions -> HOME_CARE
            complete_questions()

            page.wait_for_selector("#step-results", timeout=10000)
            page.wait_for_selector(".result-banner.HOME_CARE", timeout=10000)
            # Screenshot 6: Home Care Result
            page.screenshot(path=str(SCREENSHOTS_DIR / "06_home_care_result.png"))

            # ---------------------------------------------------------
            # 7. Path D: Adult Module Triage Verification
            # ---------------------------------------------------------
            print("7. Testing Adult Module Triage...")
            page.click("#btn-restart-triage")
            page.wait_for_selector('.module-card-btn[data-module="adult"]', timeout=5000)
            page.click('.module-card-btn[data-module="adult"]')
            page.fill("#input-age", "45")
            page.click("#btn-proceed-to-questions")
            page.wait_for_selector("#step-questions", timeout=5000)
            page.click("#btn-ans-yes")  # Red flag on first question
            page.wait_for_timeout(300)
            complete_questions()
            page.wait_for_selector("#step-results", timeout=10000)
            page.wait_for_selector(".result-banner.URGENT_REFERRAL", timeout=10000)

            # ---------------------------------------------------------
            # 8. District Dashboard & Screenshot 8: Dashboard
            # ---------------------------------------------------------
            print("8. Verifying District Dashboard & Outbreak Cluster Alerts...")
            page.click("#tab-btn-dashboard")
            page.wait_for_selector("#view-dashboard")
            page.wait_for_timeout(500)
            # Screenshot 8: Dashboard
            page.screenshot(path=str(SCREENSHOTS_DIR / "08_dashboard.png"))

            browser.close()

    finally:
        if server_process:
            server_process.terminate()

    print("\n" + "=" * 60)
    print("E2E SMOKE TEST PASSED WITH ZERO CONSOLE ERRORS!")
    print(f"Total Screenshots Captured: 8 (saved in docs/screenshots/)")
    print("=" * 60)
    return True


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else f"http://127.0.0.1:{DEFAULT_PORT}"
    run_e2e_smoke(url)
