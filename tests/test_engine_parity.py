"""Python and JavaScript Rules Engine Parity Verification Test.
Executes all 50 clinical vignettes against both the Python RulesEngine
and the JavaScript AshaRulesEngine (via Node.js) and asserts 100% identical outputs.
"""

import json
import subprocess
import pytest
from pathlib import Path

from app.engine import engine
from app.models import Measurements

ROOT_DIR = Path(__file__).resolve().parent.parent
VIGNETTES_FILE = ROOT_DIR / "tests" / "vignettes.json"
JS_ENGINE_FILE = ROOT_DIR / "static" / "rules_engine.js"


def test_python_js_engine_full_parity():
    with open(VIGNETTES_FILE, "r", encoding="utf-8") as f:
        vignettes = json.load(f)

    # JavaScript script to evaluate all vignettes using static/rules_engine.js
    js_script = f"""
    const fs = require('fs');
    const engine = require('{JS_ENGINE_FILE.as_posix()}');
    const vignettes = JSON.parse(fs.readFileSync('{VIGNETTES_FILE.as_posix()}', 'utf8'));

    const results = vignettes.map(v => {{
      const res = engine.evaluate(
        v.module,
        v.age,
        v.answers,
        v.measurements,
        'en'
      );
      return {{
        id: v.id,
        level: res.level,
        triggered_sign_ids: res.triggered_sign_ids.sort()
      }};
    }});

    console.log(JSON.stringify(results));
    """

    # Run Node.js process
    proc = subprocess.run(
        ["node", "-e", js_script],
        capture_output=True,
        text=True,
        check=True,
    )
    js_results = json.loads(proc.stdout)
    js_results_by_id = {r["id"]: r for r in js_results}

    assert len(js_results) == len(vignettes)

    mismatches = []
    for v in vignettes:
        vid = v["id"]
        meas_dict = v.get("measurements")
        meas = Measurements(**meas_dict) if meas_dict else None

        # Python evaluation
        py_res = engine.evaluate(
            module=v["module"],
            age=v.get("age"),
            answers=v.get("answers", {}),
            measurements=meas,
            language="en",
        )
        py_level = py_res["level"].value
        py_signs = sorted(py_res["triggered_sign_ids"])

        # JS evaluation
        js_res = js_results_by_id[vid]
        js_level = js_res["level"]
        js_signs = sorted(js_res["triggered_sign_ids"])

        if py_level != js_level or py_signs != js_signs:
            mismatches.append({
                "id": vid,
                "py": {"level": py_level, "signs": py_signs},
                "js": {"level": js_level, "signs": js_signs},
            })

    assert len(mismatches) == 0, f"Parity discrepancies found: {mismatches}"
