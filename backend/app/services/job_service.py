"""Business logic for jobs."""

import logging
import math

from app.models.job import Job
from app.repositories.job_repository import JobQuery, JobRepository
from app.schemas.job import IngestResult, JobCreate, JobFilterOptions, JobListResponse, JobRead

logger = logging.getLogger(__name__)


class JobNotFoundError(Exception):
    def __init__(self, job_id: int) -> None:
        super().__init__(f"Job {job_id} not found")
        self.job_id = job_id


class JobService:
    def __init__(self, repository: JobRepository) -> None:
        self.repository = repository

    def list_jobs(self, query: JobQuery) -> JobListResponse:
        jobs, total = self.repository.list_jobs(query)
        return JobListResponse(
            items=[JobRead.model_validate(j) for j in jobs],
            total=total,
            page=query.page,
            page_size=query.page_size,
            pages=math.ceil(total / query.page_size) if total else 0,
        )

    def get_job(self, job_id: int) -> JobRead:
        job = self.repository.get(job_id)
        if job is None:
            raise JobNotFoundError(job_id)
        return JobRead.model_validate(job)

    def filter_options(self) -> JobFilterOptions:
        return JobFilterOptions(
            locations=self.repository.distinct_values(Job.location),
            categories=self.repository.distinct_values(Job.category),
            employment_types=self.repository.distinct_values(Job.employment_type),
        )

    def ingest(self, jobs: list[JobCreate]) -> IngestResult:
        """Persist normalized jobs, de-duplicating on (source_name, external_id)."""
        result = IngestResult()
        for job in jobs:
            if self.repository.upsert(job):
                result.created += 1
            else:
                result.updated += 1
        self.repository.commit()
        logger.info("Ingested jobs: %d created, %d updated", result.created, result.updated)
        return result
