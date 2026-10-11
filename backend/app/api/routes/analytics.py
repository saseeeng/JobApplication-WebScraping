from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_analytics_service
from app.schemas.analytics import CountItem, OverviewResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=OverviewResponse)
def overview(service: AnalyticsService = Depends(get_analytics_service)) -> OverviewResponse:
    return service.overview()


@router.get("/skills", response_model=list[CountItem])
def skills(
    limit: int = Query(15, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
) -> list[CountItem]:
    return service.skills(limit)


@router.get("/locations", response_model=list[CountItem])
def locations(
    limit: int = Query(10, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
) -> list[CountItem]:
    return service.locations(limit)


@router.get("/companies", response_model=list[CountItem])
def companies(
    limit: int = Query(10, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
) -> list[CountItem]:
    return service.companies(limit)


@router.get("/categories", response_model=list[CountItem])
def categories(
    limit: int = Query(10, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
) -> list[CountItem]:
    return service.categories(limit)
