from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_job_service
from app.repositories.job_repository import JobQuery
from app.schemas.job import JobFilterOptions, JobListResponse, JobRead, SortField, SortOrder
from app.services.job_service import JobNotFoundError, JobService

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=JobListResponse)
def list_jobs(
    search: str | None = Query(None, max_length=100, description="Keyword in title, company or description"),
    location: str | None = Query(None, max_length=255),
    category: str | None = Query(None, max_length=100),
    employment_type: str | None = Query(None, max_length=50),
    sort_by: SortField = "posted_at",
    sort_order: SortOrder = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: JobService = Depends(get_job_service),
) -> JobListResponse:
    query = JobQuery(
        search=search or None,
        location=location or None,
        category=category or None,
        employment_type=employment_type or None,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    return service.list_jobs(query)


@router.get("/filters", response_model=JobFilterOptions)
def job_filters(service: JobService = Depends(get_job_service)) -> JobFilterOptions:
    """Distinct values available for the location/category/employment-type filters."""
    return service.filter_options()


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, service: JobService = Depends(get_job_service)) -> JobRead:
    try:
        return service.get_job(job_id)
    except JobNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
