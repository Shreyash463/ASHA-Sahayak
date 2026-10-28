"""Anonymized Structured Storage Interface for ASHA Sahayak.
Zero-PII Storage: No patient names, phone numbers, GPS, or free-text transcripts.
Default backend: SQLite (zero-config local file).
P1 backend: Firestore adapter behind the same storage interface.
"""

import os
import json
import sqlite3
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pathlib import Path

from app.models import TriageRecord

logger = logging.getLogger("asha_sahayak.storage")
DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "asha_sahayak.sqlite"


class StorageBackend(ABC):
    @abstractmethod
    def save_case(self, record: TriageRecord) -> bool:
        pass

    @abstractmethod
    def get_case(self, case_id: str) -> Optional[TriageRecord]:
        pass

    @abstractmethod
    def get_cases(
        self,
        district: Optional[str] = None,
        block: Optional[str] = None,
        module: Optional[str] = None,
        source: Optional[str] = None,
        limit: int = 2000,
    ) -> List[TriageRecord]:
        pass

    @abstractmethod
    def clear_all(self) -> None:
        """For testing only."""
        pass


class SQLiteStorage(StorageBackend):
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = str(db_path or DEFAULT_DB_PATH)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS cases (
                    case_id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    module TEXT NOT NULL,
                    age REAL,
                    level TEXT NOT NULL,
                    rules_level TEXT NOT NULL,
                    llm_suggested_level TEXT,
                    triggered_signs TEXT NOT NULL,
                    answers TEXT NOT NULL,
                    measurements TEXT,
                    language TEXT NOT NULL,
                    district TEXT,
                    block TEXT,
                    source TEXT NOT NULL DEFAULT 'live'
                )
                """
            )
            conn.execute("CREATE INDEX IF NOT EXISTS idx_cases_timestamp ON cases(timestamp)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_cases_district_block ON cases(district, block)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_cases_source ON cases(source)")
            conn.commit()

    def save_case(self, record: TriageRecord) -> bool:
        try:
            with self._get_connection() as conn:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO cases (
                        case_id, timestamp, module, age, level, rules_level,
                        llm_suggested_level, triggered_signs, answers, measurements,
                        language, district, block, source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record.case_id,
                        record.timestamp,
                        record.module,
                        record.age,
                        record.level,
                        record.rules_level,
                        record.llm_suggested_level,
                        json.dumps(record.triggered_signs, ensure_ascii=False),
                        json.dumps(record.answers, ensure_ascii=False),
                        json.dumps(record.measurements, ensure_ascii=False) if record.measurements else None,
                        record.language,
                        record.district,
                        record.block,
                        record.source,
                    ),
                )
                conn.commit()
            return True
        except Exception as e:
            logger.error(f"SQLite save_case error: {e}")
            return False

    def get_case(self, case_id: str) -> Optional[TriageRecord]:
        try:
            with self._get_connection() as conn:
                cursor = conn.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
                row = cursor.fetchone()
                if not row:
                    return None
                return self._row_to_record(row)
        except Exception as e:
            logger.error(f"SQLite get_case error: {e}")
            return None

    def get_cases(
        self,
        district: Optional[str] = None,
        block: Optional[str] = None,
        module: Optional[str] = None,
        source: Optional[str] = None,
        limit: int = 2000,
    ) -> List[TriageRecord]:
        try:
            query = "SELECT * FROM cases WHERE 1=1"
            params: List[Any] = []

            if district:
                query += " AND district = ?"
                params.append(district)
            if block:
                query += " AND block = ?"
                params.append(block)
            if module:
                query += " AND module = ?"
                params.append(module)
            if source:
                query += " AND source = ?"
                params.append(source)

            query += " ORDER BY timestamp DESC LIMIT ?"
            params.append(limit)

            with self._get_connection() as conn:
                cursor = conn.execute(query, tuple(params))
                rows = cursor.fetchall()
                return [self._row_to_record(r) for r in rows]
        except Exception as e:
            logger.error(f"SQLite get_cases error: {e}")
            return []

    def clear_all(self) -> None:
        with self._get_connection() as conn:
            conn.execute("DELETE FROM cases")
            conn.commit()

    def _row_to_record(self, row: sqlite3.Row) -> TriageRecord:
        return TriageRecord(
            case_id=row["case_id"],
            timestamp=row["timestamp"],
            module=row["module"],
            age=row["age"],
            level=row["level"],
            rules_level=row["rules_level"],
            llm_suggested_level=row["llm_suggested_level"],
            triggered_signs=json.loads(row["triggered_signs"] or "[]"),
            answers=json.loads(row["answers"] or "{}"),
            measurements=json.loads(row["measurements"]) if row["measurements"] else None,
            language=row["language"],
            district=row["district"],
            block=row["block"],
            source=row["source"],
        )


class FirestoreStorage(StorageBackend):
    """P1: Firestore Storage Adapter selected when credentials are provided."""

    def __init__(self):
        self.client = None
        self._init_client()

    def _init_client(self) -> None:
        try:
            from google.cloud import firestore
            creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
            if creds_json:
                from google.oauth2 import service_account
                creds_dict = json.loads(creds_json)
                credentials = service_account.Credentials.from_service_account_info(creds_dict)
                self.client = firestore.Client(credentials=credentials)
            else:
                self.client = firestore.Client()
            logger.info("Firestore client initialized successfully.")
        except Exception as e:
            logger.warning(f"Firestore initialization failed: {e}. Falling back to SQLite.")
            self.client = None

    def save_case(self, record: TriageRecord) -> bool:
        if not self.client:
            return False
        try:
            doc_ref = self.client.collection("cases").document(record.case_id)
            doc_ref.set(record.model_dump())
            return True
        except Exception as e:
            logger.error(f"Firestore save error: {e}")
            return False

    def get_case(self, case_id: str) -> Optional[TriageRecord]:
        if not self.client:
            return None
        try:
            doc = self.client.collection("cases").document(case_id).get()
            if doc.exists:
                return TriageRecord(**doc.to_dict())
            return None
        except Exception as e:
            logger.error(f"Firestore get error: {e}")
            return None

    def get_cases(
        self,
        district: Optional[str] = None,
        block: Optional[str] = None,
        module: Optional[str] = None,
        source: Optional[str] = None,
        limit: int = 2000,
    ) -> List[TriageRecord]:
        if not self.client:
            return []
        try:
            query = self.client.collection("cases")
            if district:
                query = query.where("district", "==", district)
            if block:
                query = query.where("block", "==", block)
            if module:
                query = query.where("module", "==", module)
            if source:
                query = query.where("source", "==", source)
            query = query.limit(limit)
            docs = query.stream()
            return [TriageRecord(**d.to_dict()) for d in docs]
        except Exception as e:
            logger.error(f"Firestore query error: {e}")
            return []

    def clear_all(self) -> None:
        if not self.client:
            return
        docs = self.client.collection("cases").limit(500).stream()
        for doc in docs:
            doc.reference.delete()


def create_storage() -> StorageBackend:
    """Factory creating appropriate storage backend."""
    storage_type = os.getenv("STORAGE_BACKEND", "sqlite").lower()
    has_firebase = bool(os.getenv("FIREBASE_CREDENTIALS_JSON") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

    if storage_type == "firestore" or has_firebase:
        fs = FirestoreStorage()
        if fs.client is not None:
            return fs
        logger.info("Falling back to SQLite storage.")

    return SQLiteStorage()


# Global default storage singleton
storage = create_storage()
