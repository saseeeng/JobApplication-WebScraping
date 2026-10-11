"""All database queries for jobs live here."""

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import Select, func, select
from sqlalchemy.orm import InstrumentedAttribute, Session

from app.models.job import Job
from app.schemas.job import JobCreate, SortField, SortOrder
from app.utils.text import utcnow

_SORT_COLUMNS: dict[str, InstrumentedAttribute] = {
    "posted_at": Job.posted_at,
    "title": Job.title,
    "company": Job.company,
    "location": Job.location,
}


@dataclass(frozen=True)
class JobQuery:
    search: str | None = None
    location: str | None = None
    category: str | None = None
    employment_type: str | None = None
    sort_by: SortField = "posted_at"
    sort_order: SortOrder = "desc"
    page: int = 1
    page_size: int = 20


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


class JobRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    # ---- reads ---------------------------------------------------------
    @staticmethod
    def _apply_filters(stmt: Select, q: JobQuery) -> Select:
        if q.search:
            pattern = f"%{_escape_like(q.search.strip())}%"
            stmt = stmt.where(
                Job.title.ilike(pattern, escape="\\")
                | Job.company.ilike(pattern, escape="\\")
                | Job.description.ilike(pattern, escape="\\")
            )
        if q.location:
            stmt = stmt.where(Job.location == q.location)
        if q.category:
            stmt = stmt.where(Job.category == q.category)
        if q.employment_type:
            stmt = stmt.where(Job.employment_type == q.employment_type)
        return stmt

    def list_jobs(self, q: JobQuery) -> tuple[list[Job], int]:
        base = self._apply_filters(select(Job), q)
        total = self.db.scalar(select(func.count()).select_from(base.subquery())) or 0

        column = _SORT_COLUMNS[q.sort_by]
        ordered = column.asc() if q.sort_order == "asc" else column.desc()
        stmt = base.order_by(column.is_(None), ordered, Job.id.desc())
        stmt = stmt.offset((q.page - 1) * q.page_size).limit(q.page_size)
        return list(self.db.scalars(stmt)), total

    def get(self, job_id: int) -> Job | None:
        return self.db.get(Job, job_id)

    def count(self) -> int:
        return self.db.scalar(select(func.count(Job.id))) or 0

    def distinct_values(self, column: InstrumentedAttribute) -> list[str]:
        return list(self.db.scalars(select(column).distinct().order_by(column)))

    def count_distinct(self, column: InstrumentedAttribute) -> int:
        return self.db.scalar(select(func.count(func.distinct(column)))) or 0

    def count_by(self, column: InstrumentedAttribute, limit: int) -> list[tuple[str, int]]:
        count = func.count(Job.id)
        stmt = select(column, count).group_by(column).order_by(count.desc(), column).limit(limit)
        return [(name, n) for name, n in self.db.execute(stmt)]

    def all_skill_lists(self) -> list[list[str]]:
        return [s or [] for s in self.db.scalars(select(Job.skills))]

    def latest_posted_at(self) -> datetime | None:
        return self.db.scalar(select(func.max(Job.posted_at)))

    # ---- writes --------------------------------------------------------
    def upsert(self, data: JobCreate) -> bool:
        """Insert or update by (source_name, external_id). Returns True if a row was created."""
        now = utcnow()
        existing = self.db.scalar(
            select(Job).where(Job.source_name == data.source_name, Job.external_id == data.external_id)
        )
        values = data.model_dump()
        if existing is None:
            self.db.add(Job(**values, first_seen_at=now, last_seen_at=now))
            return True
        for key, value in values.items():
            setattr(existing, key, value)
        existing.last_seen_at = now
        return False

    def commit(self) -> None:
        self.db.commit()
