from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_db
from app.db.base import Base
from app.main import app
from app.repositories.job_repository import JobRepository
from app.schemas.job import JobCreate
from app.services.job_service import JobService


def _job(n: int, title: str, company: str, location: str, employment: str, skills: list[str], **kw) -> JobCreate:
    return JobCreate(
        external_id=f"t-{n}",
        title=title,
        company=company,
        location=location,
        employment_type=employment,
        category=kw.pop("category", "Information Technology"),
        description=kw.pop("description", f"{title} role"),
        skills=skills,
        source_name="Test Source",
        source_url=f"https://example.test/jobs/{n}",
        posted_at=datetime(2026, 10, n, tzinfo=timezone.utc),
        **kw,
    )


TEST_JOBS = [
    _job(1, "Junior Software Developer", "Acme PH", "Makati, Metro Manila", "Full-time", ["Python", "SQL"],
         salary_min=30000, salary_max=45000, salary_currency="PHP"),
    _job(2, "Web Developer", "Bright Labs", "Taguig, Metro Manila", "Full-time", ["JavaScript", "React", "Python"]),
    _job(3, "IT Support Specialist", "Helpdesk Inc", "Pasig, Metro Manila", "Contract", ["Networking"]),
    _job(4, "QA Tester", "Quality Co", "Quezon City, Metro Manila", "Part-time", ["Selenium"]),
    _job(5, "Cybersecurity Analyst", "SecureNet", "Manila, Metro Manila", "Full-time", ["Cybersecurity", "Python"],
         description="Security operations and monitoring"),
    _job(6, "Backend Developer (Remote)", "OnlineJobs.ph Employer", "Remote (Philippines)", "Contract", ["Python", "FastAPI"]),
]


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    from app import models  # noqa: F401

    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def seeded_session(db_session):
    JobService(JobRepository(db_session)).ingest(TEST_JOBS)
    return db_session


@pytest.fixture()
def client(seeded_session):
    app.dependency_overrides[get_db] = lambda: seeded_session
    # No context manager: skips lifespan so the real database file is never touched.
    yield TestClient(app)
    app.dependency_overrides.clear()
