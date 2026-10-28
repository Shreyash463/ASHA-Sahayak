from enum import Enum
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, ConfigDict


class RiskLevel(str, Enum):
    HOME_CARE = "HOME_CARE"
    VISIT_PHC = "VISIT_PHC"
    URGENT_REFERRAL = "URGENT_REFERRAL"

    @property
    def severity(self) -> int:
        levels = {
            RiskLevel.HOME_CARE: 0,
            RiskLevel.VISIT_PHC: 1,
            RiskLevel.URGENT_REFERRAL: 2,
        }
        return levels[self]

    def __ge__(self, other: "RiskLevel") -> bool:
        if not isinstance(other, RiskLevel):
            return NotImplemented
        return self.severity >= other.severity

    def __gt__(self, other: "RiskLevel") -> bool:
        if not isinstance(other, RiskLevel):
            return NotImplemented
        return self.severity > other.severity

    def __le__(self, other: "RiskLevel") -> bool:
        if not isinstance(other, RiskLevel):
            return NotImplemented
        return self.severity <= other.severity

    def __lt__(self, other: "RiskLevel") -> bool:
        if not isinstance(other, RiskLevel):
            return NotImplemented
        return self.severity < other.severity


class SignTranslation(BaseModel):
    en: str
    hi: str
    mr: str


class ThresholdConfig(BaseModel):
    type: str
    comparator: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    ranges: Optional[List[Dict[str, Any]]] = None
    bands: Optional[List[Dict[str, Any]]] = None


class DangerSign(BaseModel):
    id: str
    module: str
    level: str  # URGENT or REFER
    source: str
    verified: bool = True
    question: SignTranslation
    why_it_matters: SignTranslation
    threshold: Optional[Dict[str, Any]] = None


class Measurements(BaseModel):
    respiratory_rate: Optional[int] = Field(None, ge=5, le=150, description="Breaths per minute")
    temperature_celsius: Optional[float] = Field(None, ge=30.0, le=45.0, description="Temperature in Celsius")
    temperature_fahrenheit: Optional[float] = Field(None, ge=86.0, le=115.0, description="Temperature in Fahrenheit")

    def get_celsius(self) -> Optional[float]:
        if self.temperature_celsius is not None:
            return round(self.temperature_celsius, 1)
        if self.temperature_fahrenheit is not None:
            return round((self.temperature_fahrenheit - 32.0) * 5.0 / 9.0, 1)
        return None


class TriageRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    module: str
    age: Optional[float] = None  # Newborn: days; Child: months; Pregnancy/Adult: years
    answers: Dict[str, Any] = Field(default_factory=dict)
    measurements: Optional[Measurements] = None
    language: str = "mr"
    district: Optional[str] = "Gadchiroli"
    block: Optional[str] = "Kurkheda"


class TriggeredSignInfo(BaseModel):
    id: str
    level: str  # URGENT or REFER
    question: str
    why_it_matters: str


class TriageResponse(BaseModel):
    case_id: str
    level: RiskLevel
    rules_level: RiskLevel
    llm_suggested_level: Optional[RiskLevel] = None
    triggered_signs: List[TriggeredSignInfo]
    reasons: List[str]
    home_care_advice: List[str]
    warning_signs: List[str]
    unknown_urgent_signs: List[str] = Field(default_factory=list)
    explanation: str
    referral_note: str
    disclaimer: str
    timestamp: str
    language: str
    district: Optional[str] = None
    block: Optional[str] = None


class ExtractRequest(BaseModel):
    module: str
    language: str = "mr"
    transcript: str = Field(..., max_length=2000)


class ExtractResponse(BaseModel):
    suggested_signs: List[str]
    confidence_notes: Optional[str] = None


class ReferralNoteRequest(BaseModel):
    case_id: Optional[str] = None
    module: str
    age: Optional[float] = None
    level: RiskLevel
    triggered_sign_ids: List[str]
    measurements: Optional[Measurements] = None
    language: str = "mr"
    district: Optional[str] = None
    block: Optional[str] = None


class ReferralNoteResponse(BaseModel):
    referral_note: str


class TriageRecord(BaseModel):
    case_id: str
    timestamp: str
    module: str
    age: Optional[float] = None
    level: str
    rules_level: str
    llm_suggested_level: Optional[str] = None
    triggered_signs: List[str]
    answers: Dict[str, Any]
    measurements: Optional[Dict[str, Any]] = None
    language: str
    district: Optional[str] = None
    block: Optional[str] = None
    source: str = "live"  # "live" or "simulated"


class ClusterAlert(BaseModel):
    district: str
    block: str
    sign_id: str
    sign_name: str
    case_count: int
    threshold: int
    time_window_days: int
    alert_level: str = "WARNING"  # WARNING or CRITICAL


class DashboardAggregates(BaseModel):
    total_cases: int
    cases_by_level: Dict[str, int]
    cases_by_module: Dict[str, int]
    daily_trends: List[Dict[str, Any]]
    top_signs: List[Dict[str, Any]]
    cluster_alerts: List[ClusterAlert]
    has_simulated_data: bool
