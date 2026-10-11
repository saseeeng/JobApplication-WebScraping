"""Analytics business logic."""

from collections import Counter

from app.models.job import Job
from app.repositories.job_repository import JobRepository
from app.schemas.analytics import CountItem, OverviewResponse


class AnalyticsService:
    def __init__(self, repository: JobRepository) -> None:
        self.repository = repository

    def overview(self) -> OverviewResponse:
        repo = self.repository
        return OverviewResponse(
            total_jobs=repo.count(),
            total_companies=repo.count_distinct(Job.company),
            total_locations=repo.count_distinct(Job.location),
            total_categories=repo.count_distinct(Job.category),
            latest_posted_at=repo.latest_posted_at(),
        )

    def skills(self, limit: int) -> list[CountItem]:
        # Skills are stored as a JSON list per job; counting happens in Python which is
        # fine at this scale. A normalized job_skills table is a future improvement.
        counter: Counter[str] = Counter()
        for skills in self.repository.all_skill_lists():
            counter.update({s.strip() for s in skills if s and s.strip()})
        ranked = sorted(counter.items(), key=lambda kv: (-kv[1], kv[0].lower()))[:limit]
        return [CountItem(name=n, count=c) for n, c in ranked]

    def locations(self, limit: int) -> list[CountItem]:
        return self._items(Job.location, limit)

    def companies(self, limit: int) -> list[CountItem]:
        return self._items(Job.company, limit)

    def categories(self, limit: int) -> list[CountItem]:
        return self._items(Job.category, limit)

    def _items(self, column, limit: int) -> list[CountItem]:  # type: ignore[no-untyped-def]
        return [CountItem(name=n, count=c) for n, c in self.repository.count_by(column, limit)]
