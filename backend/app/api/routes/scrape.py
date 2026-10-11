from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status
from pydantic import BaseModel

from app.services import scrape_service

router = APIRouter(prefix="/scrape", tags=["scrape"])


class ScrapeStatusResponse(BaseModel):
    running: bool
    started_at: datetime | None = None
    finished_at: datetime | None = None
    created: int = 0
    updated: int = 0
    error: str | None = None
    sources: list[str] = []


def _status() -> ScrapeStatusResponse:
    s = scrape_service.get_status()
    return ScrapeStatusResponse(**s.__dict__)


@router.post("", response_model=ScrapeStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def start_scrape(
    background: BackgroundTasks,
    pages: int = Query(1, ge=1, le=5, description="Result pages per search term"),
    quick: bool = Query(True, description="Quick scrape mode (top terms only)"),
) -> ScrapeStatusResponse:
    """Manually refresh job listings. Runs in the background; poll GET /scrape/status."""
    if not scrape_service.try_start():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A scrape is already running")
    background.add_task(scrape_service.run_scrape, pages, quick)
    return _status()


@router.get("/status", response_model=ScrapeStatusResponse)
def scrape_status() -> ScrapeStatusResponse:
    return _status()
