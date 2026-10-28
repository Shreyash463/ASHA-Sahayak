"""Completeness and Localization Tests for i18n Strings.
Verifies that all 4 modules, every clinical sign, advice, warning list,
and UI translation key exist across Marathi (mr), Hindi (hi), and English (en).
"""

import pytest
from app.engine import engine, VALID_MODULES
from app.i18n import TRANSLATIONS, LANGUAGES, get_text, get_all_strings


def test_ui_translation_keys_completeness():
    assert len(TRANSLATIONS) >= 20
    for key, lang_map in TRANSLATIONS.items():
        for lang in LANGUAGES:
            assert lang in lang_map, f"Missing language '{lang}' for UI key '{key}'"
            assert lang_map[lang].strip(), f"Empty string for '{key}' in language '{lang}'"


def test_signs_i18n_completeness():
    for mod in VALID_MODULES:
        signs = engine.get_signs_for_module(mod)
        assert len(signs) > 0, f"Module '{mod}' has no signs"
        for s in signs:
            # Check question in all 3 languages
            for lang in LANGUAGES:
                q = getattr(s.question, lang, None)
                assert q is not None and len(q.strip()) > 5, (
                    f"Sign '{s.id}' in module '{mod}' missing valid question in '{lang}'"
                )
                why = getattr(s.why_it_matters, lang, None)
                assert why is not None and len(why.strip()) > 5, (
                    f"Sign '{s.id}' in module '{mod}' missing valid why_it_matters in '{lang}'"
                )


def test_module_advice_and_warnings_i18n_completeness():
    for mod in VALID_MODULES:
        data = engine.get_module_data(mod)
        advice = data.get("home_care_advice", {})
        warnings = data.get("warning_signs", {})

        for lang in LANGUAGES:
            assert lang in advice, f"Module '{mod}' missing home_care_advice in '{lang}'"
            assert len(advice[lang]) >= 3, f"Module '{mod}' has fewer than 3 advice items in '{lang}'"
            for item in advice[lang]:
                assert isinstance(item, str) and item.strip()

            assert lang in warnings, f"Module '{mod}' missing warning_signs in '{lang}'"
            assert len(warnings[lang]) >= 3, f"Module '{mod}' has fewer than 3 warning signs in '{lang}'"
            for item in warnings[lang]:
                assert isinstance(item, str) and item.strip()


def test_get_text_fallback():
    # Unknown key returns key itself
    assert get_text("non_existent_key_xyz", "mr") == "non_existent_key_xyz"
    # Unknown language falls back to default language (mr)
    assert get_text("btn_yes", "fr") == "होय"
