"""Pydantic schemas for jobs (validation + serialization)."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

SortField = Literal["posted_at", "title", "company", "location"]
SortOrder = Literal["asc", "desc"]


class JobBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    company: str = Field(min_length=1, max_length=255)
    location: str = Field(default="Unspecified", max_length=255)
    employment_type: str = Field(default="Other", max_length=50)
    category: str = Field(default="Other", max_length=100)
    description: str = ""
    skills: list[str] = Field(default_factory=list)
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    salary_currency: str | None = Field(default=None, min_length=3, max_length=3)
    source_name: str = Field(min_length=1, max_length=100)
    source_url: str = Field(min_length=1, max_length=1000)
    posted_at: datetime | None = None

    @model_validator(mode="after")
    def _validate_salary(self) -> "JobBase":
        if self.salary_min is not None and self.salary_max is not None and self.salary_min > self.salary_max:
            raise ValueError("salary_min must not exceed salary_max")
        return self


class JobCreate(JobBase):
    """Normalized record produced by scrapers and consumed by the ingestion service."""

    external_id: str = Field(min_length=1, max_length=64)


class JobRead(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_seen_at: datetime
    last_seen_at: datetime
    created_at: datetime
    updated_at: datetime


class JobListResponse(BaseModel):
    items: list[JobRead]
    total: int
    page: int
    page_size: int
    pages: int


class JobFilterOptions(BaseModel):
    locations: list[str]
    categories: list[str]
    employment_types: list[str]


class IngestResult(BaseModel):
    created: int = 0
    updated: int = 0
