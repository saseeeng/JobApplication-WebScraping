"""Centralized, environment-based application configuration."""

from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Repository root (…/backend/app/core/config.py -> repo root). Only used for the
# local-development default; Docker sets DATABASE_URL explicitly.
_REPO_ROOT = Path(__file__).resolve().parents[3]
_DEFAULT_DB = (_REPO_ROOT / "data" / "job_tracker.db").as_posix()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Job Market Tracker API"
    environment: str = "development"  # development | production | test
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"

    database_url: str = f"sqlite:///{_DEFAULT_DB}"
    # Create tables on startup. Disable once migrations (e.g. Alembic) are adopted.
    auto_create_tables: bool = True

    # Comma-separated list of allowed browser origins.
    cors_origins: str = "http://localhost:3000"

    # Scraper settings
    scraper_timeout_seconds: float = 60.0
    scraper_delay_seconds: float = 60.0
    scraper_user_agent: str = "JobMarketTrackerBot/0.1 (+portfolio project; respects robots.txt)"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @model_validator(mode="after")
    def _forbid_wildcard_cors_in_production(self) -> "Settings":
        if self.is_production and "*" in self.cors_origin_list:
            raise ValueError("CORS_ORIGINS must not contain '*' in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
