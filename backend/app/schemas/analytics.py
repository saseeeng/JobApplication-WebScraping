"""Pydantic schemas for analytics endpoints."""

from datetime import datetime

from pydantic import BaseModel


class CountItem(BaseModel):
    name: str
    count: int


class OverviewResponse(BaseModel):
    total_jobs: int
    total_companies: int
    total_locations: int
    total_categories: int
    latest_posted_at: datetime | None = None
