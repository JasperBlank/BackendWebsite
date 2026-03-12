"""Alerts CRUD — persisted to a JSON file (no external DB needed)."""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

ALERTS_FILE = Path(__file__).resolve().parent.parent.parent / "alerts.json"


# ── schemas ──────────────────────────────────────────────────────────
class AlertCreate(BaseModel):
    product: str
    topic: str
    threshold: float = Field(ge=0, le=100)


class AlertUpdate(BaseModel):
    active: Optional[bool] = None
    threshold: Optional[float] = Field(default=None, ge=0, le=100)


class AlertOut(BaseModel):
    id: str
    product: str
    topic: str
    threshold: float
    active: bool
    created_at: str


# ── helpers ──────────────────────────────────────────────────────────
def _read_alerts() -> list[dict]:
    if not ALERTS_FILE.exists():
        return []
    return json.loads(ALERTS_FILE.read_text())


def _write_alerts(alerts: list[dict]) -> None:
    ALERTS_FILE.write_text(json.dumps(alerts, indent=2))


# ── routes ───────────────────────────────────────────────────────────
@router.get("/alerts", response_model=list[AlertOut])
async def list_alerts(product: Optional[str] = None):
    alerts = _read_alerts()
    if product:
        alerts = [a for a in alerts if a["product"] == product]
    return alerts


@router.post("/alerts", response_model=AlertOut, status_code=201)
async def create_alert(body: AlertCreate):
    alerts = _read_alerts()
    alert = {
        "id": uuid.uuid4().hex[:12],
        "product": body.product,
        "topic": body.topic,
        "threshold": body.threshold,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    alerts.append(alert)
    _write_alerts(alerts)
    return alert


@router.put("/alerts/{alert_id}", response_model=AlertOut)
async def update_alert(alert_id: str, body: AlertUpdate):
    alerts = _read_alerts()
    for alert in alerts:
        if alert["id"] == alert_id:
            if body.active is not None:
                alert["active"] = body.active
            if body.threshold is not None:
                alert["threshold"] = body.threshold
            _write_alerts(alerts)
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")


@router.delete("/alerts/{alert_id}", status_code=204)
async def delete_alert(alert_id: str):
    alerts = _read_alerts()
    filtered = [a for a in alerts if a["id"] != alert_id]
    if len(filtered) == len(alerts):
        raise HTTPException(status_code=404, detail="Alert not found")
    _write_alerts(filtered)
