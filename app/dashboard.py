"""Dashboard Aggregations & Outbreak Cluster Alert Logic for ASHA Sahayak.
Anonymized syndromic surveillance analytics. No PII, no worker rankings.
"""

import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional

from app.models import DashboardAggregates, ClusterAlert, TriageRecord
from app.storage import StorageBackend, storage
from app.engine import engine

DEFAULT_ALERT_COUNT = int(os.getenv("CLUSTER_ALERT_THRESHOLD_COUNT", "5"))
DEFAULT_ALERT_DAYS = int(os.getenv("CLUSTER_ALERT_DAYS", "3"))


def compute_cluster_alerts(
    cases: List[TriageRecord],
    threshold_count: int = DEFAULT_ALERT_COUNT,
    window_days: int = DEFAULT_ALERT_DAYS,
) -> List[ClusterAlert]:
    """Flag a block when >= threshold_count cases with the same REFER or URGENT
    sign occur within window_days.
    """
    alerts: List[ClusterAlert] = []
    if not cases:
        return alerts

    # Group cases by (district, block, sign_id)
    # Parse timestamp and keep sorted
    dated_cases = []
    for c in cases:
        try:
            # Handle ISO string with or without Z
            ts_str = c.timestamp.replace("Z", "+00:00")
            dt = datetime.fromisoformat(ts_str)
            dated_cases.append((dt, c))
        except Exception:
            continue

    dated_cases.sort(key=lambda x: x[0])

    # Group by (district, block)
    block_groups: Dict[tuple[str, str], List[tuple[datetime, TriageRecord]]] = defaultdict(list)
    for dt, c in dated_cases:
        dist = c.district or "Unknown"
        blk = c.block or "Unknown"
        block_groups[(dist, blk)].append((dt, c))

    # Evaluate rolling window for each danger sign in each block
    for (dist, blk), items in block_groups.items():
        # Map sign_id -> list of datetimes
        sign_events: Dict[str, List[datetime]] = defaultdict(list)
        for dt, c in items:
            for s_id in c.triggered_signs:
                sign = engine.get_sign(s_id)
                # Only check REFER and URGENT danger signs
                if sign and sign.level in ("URGENT", "REFER"):
                    sign_events[s_id].append(dt)

        for s_id, timestamps in sign_events.items():
            sign = engine.get_sign(s_id)
            sign_name = sign.question.en if sign else s_id

            # Rolling window check: check if any subwindow of window_days has >= threshold_count
            for i in range(len(timestamps)):
                start_t = timestamps[i]
                end_t = start_t + timedelta(days=window_days)
                # Count events in [start_t, end_t]
                window_count = sum(1 for t in timestamps if start_t <= t <= end_t)
                if window_count >= threshold_count:
                    alert_level = "CRITICAL" if (sign and sign.level == "URGENT") else "WARNING"
                    alert = ClusterAlert(
                        district=dist,
                        block=blk,
                        sign_id=s_id,
                        sign_name=sign_name,
                        case_count=window_count,
                        threshold=threshold_count,
                        time_window_days=window_days,
                        alert_level=alert_level,
                    )
                    # Deduplicate alert for this (district, block, sign_id)
                    if not any(a.district == dist and a.block == blk and a.sign_id == s_id for a in alerts):
                        alerts.append(alert)
                    break

    return alerts


def get_dashboard_data(
    storage_backend: StorageBackend,
    district: Optional[str] = None,
    block: Optional[str] = None,
    include_simulated: bool = True,
) -> DashboardAggregates:
    """Compute all dashboard aggregates and syndromic cluster alerts."""
    source_filter = None if include_simulated else "live"
    cases = storage_backend.get_cases(
        district=district,
        block=block,
        source=source_filter,
        limit=5000,
    )

    total_cases = len(cases)
    cases_by_level = {"URGENT_REFERRAL": 0, "VISIT_PHC": 0, "HOME_CARE": 0}
    cases_by_module = {"newborn": 0, "pregnancy": 0, "child": 0, "adult": 0}
    daily_counts: Dict[str, int] = defaultdict(int)
    sign_counts: Dict[str, int] = defaultdict(int)
    has_simulated = any(c.source == "simulated" for c in cases)

    for c in cases:
        # Tally risk level
        if c.level in cases_by_level:
            cases_by_level[c.level] += 1

        # Tally module
        if c.module in cases_by_module:
            cases_by_module[c.module] += 1

        # Daily trend (YYYY-MM-DD)
        day_str = c.timestamp[:10] if len(c.timestamp) >= 10 else "Unknown"
        daily_counts[day_str] += 1

        # Tally triggered signs
        for s_id in c.triggered_signs:
            sign_counts[s_id] += 1

    # Format daily trends sorted by date
    daily_trends = [
        {"date": date, "count": count}
        for date, count in sorted(daily_counts.items(), key=lambda x: x[0])
    ]

    # Format top signs
    top_signs = []
    for s_id, count in sorted(sign_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        sign = engine.get_sign(s_id)
        name_en = sign.question.en if sign else s_id
        name_mr = sign.question.mr if sign else s_id
        level = sign.level if sign else "UNKNOWN"
        top_signs.append({
            "sign_id": s_id,
            "name_en": name_en,
            "name_mr": name_mr,
            "level": level,
            "count": count,
        })

    # Outbreak Cluster Alerts
    cluster_alerts = compute_cluster_alerts(cases)

    return DashboardAggregates(
        total_cases=total_cases,
        cases_by_level=cases_by_level,
        cases_by_module=cases_by_module,
        daily_trends=daily_trends,
        top_signs=top_signs,
        cluster_alerts=cluster_alerts,
        has_simulated_data=has_simulated,
    )
