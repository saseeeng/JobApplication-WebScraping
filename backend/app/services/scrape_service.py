"""Runs the live scrapers and ingests the results. Shared by the CLI and the refresh API."""

import logging
import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.repositories.job_repository import JobRepository
from app.scrapers.kalibrr_scraper import KalibrrNCRScraper
from app.scrapers.onlinejobs_scraper import OnlineJobsPHScraper
from app.services.job_service import JobService

logger = logging.getLogger(__name__)


@dataclass
class ScrapeStatus:
    running: bool = False
    started_at: datetime | None = None
    finished_at: datetime | None = None
    created: int = 0
    updated: int = 0
    error: str | None = None
    sources: list[str] = field(default_factory=list)


_status = ScrapeStatus()
_lock = threading.Lock()


def get_status() -> ScrapeStatus:
    return _status


def try_start() -> bool:
    """Claim the single scrape slot. False if a scrape is already running."""
    with _lock:
        if _status.running:
            return False
        _status.running = True
        _status.started_at = datetime.now(timezone.utc)
        _status.finished_at = None
        _status.created = _status.updated = 0
        _status.error = None
        _status.sources = []
        return True


def run_scrape(pages: int = 2) -> None:
    """Scrape every source and store results. Must be preceded by ``try_start``."""
    try:
        scrapers = [KalibrrNCRScraper(max_pages=pages), OnlineJobsPHScraper(max_pages=1)]
        with SessionLocal() as db:
            service = JobService(JobRepository(db))
            for scraper in scrapers:
                jobs = scraper.run()
                result = service.ingest(jobs)
                _status.created += result.created
                _status.updated += result.updated
                _status.sources.append(scraper.source_name)
                logger.info("%s: %d jobs (%d new)", scraper.source_name, len(jobs), result.created)
    except Exception as exc:  # noqa: BLE001 - surfaced through the status endpoint
        logger.exception("Scrape failed")
        _status.error = type(exc).__name__
    finally:
        _status.finished_at = datetime.now(timezone.utc)
        _status.running = False
