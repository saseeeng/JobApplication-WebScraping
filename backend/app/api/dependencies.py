"""Shared FastAPI dependencies (DB session + service providers)."""

from collections.abc import Iterator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.repositories.job_repository import JobRepository
from app.services.analytics_service import AnalyticsService
from app.services.job_service import JobService


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_job_repository(db: Session = Depends(get_db)) -> JobRepository:
    return JobRepository(db)


def get_job_service(repo: JobRepository = Depends(get_job_repository)) -> JobService:
    return JobService(repo)


def get_analytics_service(repo: JobRepository = Depends(get_job_repository)) -> AnalyticsService:
    return AnalyticsService(repo)
