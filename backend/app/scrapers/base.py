"""Scraper abstractions: fetching, parsing and normalization are separate concerns.

Persistence is deliberately NOT part of the scraper; scrapers return normalized
``JobCreate`` records and ``JobService.ingest`` stores them.
"""

import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser

import requests
from pydantic import ValidationError

from app.schemas.job import JobCreate
from app.utils.text import (
    clean_text,
    make_external_id,
    normalize_employment_type,
    normalize_url,
    parse_datetime,
    parse_int,
)

logger = logging.getLogger(__name__)


class ScraperError(Exception):
    """Raised when a source cannot be fetched (network error, robots.txt, non-2xx...)."""


@dataclass(frozen=True)
class RawJob:
    """Unnormalized values exactly as extracted from the source."""

    title: str = ""
    company: str = ""
    location: str = ""
    employment_type: str = ""
    category: str = ""
    description: str = ""
    skills: list[str] = field(default_factory=list)
    salary_min: str | None = None
    salary_max: str | None = None
    salary_currency: str | None = None
    url: str = ""
    external_id: str | None = None
    posted_at: str | None = None


class Fetcher(Protocol):
    def fetch(self, url: str) -> str: ...


class FileFetcher:
    """Reads a local HTML file instead of the network. Handy for offline parser tests."""

    def fetch(self, url: str) -> str:
        try:
            return Path(url).read_text(encoding="utf-8")
        except OSError as exc:
            raise ScraperError(f"Could not read fixture {url}: {exc}") from exc


class HttpFetcher:
    """Polite HTTP fetcher: honours robots.txt, a request timeout and a delay between requests.

    It never attempts to bypass logins, CAPTCHAs or anti-bot protections. Only use it
    against sources whose terms permit automated access.
    """

    def __init__(self, user_agent: str, timeout: float = 60.0, delay_seconds: float = 10.0) -> None:
        self.user_agent = user_agent
        self.timeout = timeout
        self.delay_seconds = delay_seconds
        self._session = requests.Session()
        self._session.headers["User-Agent"] = user_agent
        self._robots: dict[str, RobotFileParser | None] = {}
        self._last_request = 0.0

    def _allowed(self, url: str) -> bool:
        parts = urlsplit(url)
        origin = f"{parts.scheme}://{parts.netloc}"
        if origin not in self._robots:
            parser = RobotFileParser()
            try:
                response = self._session.get(f"{origin}/robots.txt", timeout=self.timeout)
                if response.status_code in (401, 403):
                    parser.disallow_all = True
                elif response.status_code >= 400:
                    parser.allow_all = True
                else:
                    parser.parse(response.text.splitlines())
                self._robots[origin] = parser
            except requests.RequestException as exc:
                logger.warning("Could not read robots.txt for %s: %s", origin, type(exc).__name__)
                self._robots[origin] = None
        parser = self._robots[origin]
        # If robots.txt cannot be retrieved we err on the side of not scraping.
        return parser is not None and parser.can_fetch(self.user_agent, url)

    def fetch(self, url: str) -> str:
        if not self._allowed(url):
            raise ScraperError(f"robots.txt does not allow fetching {url}")
        wait = self.delay_seconds - (time.monotonic() - self._last_request)
        if wait > 0:
            time.sleep(wait)
        try:
            response = self._session.get(url, timeout=self.timeout)
            self._last_request = time.monotonic()
            response.raise_for_status()
        except requests.RequestException as exc:
            raise ScraperError(f"Request failed for {url}: {type(exc).__name__}") from exc
        return response.text


class BaseScraper(ABC):
    """Template: fetch -> parse -> normalize -> de-duplicate."""

    source_name: str

    def __init__(self, fetcher: Fetcher) -> None:
        self.fetcher = fetcher

    @abstractmethod
    def source_urls(self) -> list[str]:
        """Pages to fetch."""

    @abstractmethod
    def parse(self, html: str) -> list[RawJob]:
        """Extract raw records from HTML. Must tolerate malformed markup."""

    def normalize(self, raw: RawJob) -> JobCreate | None:
        """Convert a raw record to the consistent schema; None if it is unusable."""
        url = clean_text(raw.url)
        title, company = clean_text(raw.title), clean_text(raw.company)
        if not (title and company and url):
            logger.warning("Skipping incomplete record (title=%r, company=%r)", title, company)
            return None

        salary_min, salary_max = parse_int(raw.salary_min), parse_int(raw.salary_max)
        if salary_min is not None and salary_max is not None and salary_min > salary_max:
            salary_min, salary_max = salary_max, salary_min
        currency = clean_text(raw.salary_currency).upper()
        has_salary = salary_min is not None or salary_max is not None

        skills = list(dict.fromkeys(clean_text(s) for s in raw.skills if clean_text(s)))
        ext_id = clean_text(raw.external_id)
        if not ext_id or len(ext_id) > 64:
            ext_id = make_external_id(self.source_name, ext_id or url)

        try:
            return JobCreate(
                external_id=ext_id,
                title=title,
                company=company,
                location=clean_text(raw.location) or "Unspecified",
                employment_type=normalize_employment_type(raw.employment_type),
                category=clean_text(raw.category) or "Other",
                description=clean_text(raw.description),
                skills=skills,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=currency if has_salary and len(currency) == 3 else None,
                source_name=self.source_name,
                source_url=normalize_url(url),
                posted_at=parse_datetime(raw.posted_at),
            )
        except ValidationError as exc:
            logger.warning("Skipping invalid record %r: %s", title, exc.errors()[0]["msg"])
            return None

    def run(self) -> list[JobCreate]:
        """Scrape all sources, tolerating individual failures, returning unique records."""
        unique: dict[str, JobCreate] = {}
        for url in self.source_urls():
            try:
                html = self.fetcher.fetch(url)
                raw_jobs = self.parse(html)
            except ScraperError as exc:
                logger.error("Scrape failed: %s", exc)
                continue
            except Exception:  # noqa: BLE001 - parsers must never crash the whole run
                logger.exception("Unexpected parse error for %s", url)
                continue
            for raw in raw_jobs:
                job = self.normalize(raw)
                if job is None:
                    continue
                if job.external_id in unique:
                    logger.info("Duplicate listing skipped: %s", job.external_id)
                    continue
                unique[job.external_id] = job
        return list(unique.values())
