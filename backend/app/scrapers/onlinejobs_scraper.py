"""OnlineJobs.ph scraper: remote IT jobs open to Filipino applicants.

OnlineJobs.ph does not publish the employer name or an NCR location on listings, so
company is "OnlineJobs.ph Employer" and location is "Remote (Philippines)".
Only IT-related listings are kept.
"""

import logging
import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from app.core.config import get_settings
from app.scrapers.base import BaseScraper, Fetcher, HttpFetcher, RawJob
from app.scrapers.kalibrr_scraper import extract_skills_from_text, is_it_job

logger = logging.getLogger(__name__)

IT_KEYWORDS = [
    "developer", "programmer", "software engineer", "web developer", "qa tester",
    "devops", "it support", "data analyst", "cybersecurity", "wordpress", "ui ux",
]


class OnlineJobsPHScraper(BaseScraper):
    source_name = "OnlineJobs PH"
    base_url = "https://www.onlinejobs.ph"

    def __init__(
        self,
        fetcher: Fetcher | None = None,
        max_pages: int = 1,
        keywords: list[str] | None = None,
    ) -> None:
        if fetcher is None:
            settings = get_settings()
            fetcher = HttpFetcher(
                user_agent=settings.scraper_user_agent,
                timeout=settings.scraper_timeout_seconds,
                delay_seconds=settings.scraper_delay_seconds,
            )
        super().__init__(fetcher)
        self.max_pages = max_pages
        self.keywords = keywords or IT_KEYWORDS

    def source_urls(self) -> list[str]:
        urls: list[str] = []
        for keyword in self.keywords:
            q = keyword.replace(" ", "+")
            for page in range(self.max_pages):
                path = "/jobseekers/jobsearch" + (f"/{page * 30}" if page else "")
                urls.append(f"{self.base_url}{path}?jobkeyword={q}")
        return urls

    def parse(self, html: str) -> list[RawJob]:
        if not html:
            return []
        soup = BeautifulSoup(html, "html.parser")
        jobs: list[RawJob] = []

        for card in soup.select(".jobpost-cat-box"):
            h4 = card.select_one("h4")
            link = card.find("a", href=lambda h: h and "/jobseekers/job/" in h)
            if not h4 or not link:
                continue

            badge = h4.select_one(".badge")
            employment = badge.get_text(strip=True) if badge else ""
            if badge:
                badge.extract()
            title = h4.get_text(" ", strip=True)

            tags = [a.get_text(strip=True) for a in card.select(".job-tag a.badge")]
            if not is_it_job(title, " ".join(tags)):
                continue

            card_text = card.get_text(" ", strip=True)
            salary_min = salary_max = currency = None
            usd = re.search(r"\$\s*([\d,]+)(?:\s*(?:to|-)\s*\$?\s*([\d,]+))?", card_text)
            php = re.search(r"(?:₱|PHP)\s*([\d,]+)(?:\s*(?:to|-)\s*(?:₱|PHP)?\s*([\d,]+))?", card_text)
            match, currency = (usd, "USD") if usd else (php, "PHP") if php else (None, None)
            if match:
                salary_min = match.group(1)
                salary_max = match.group(2) or match.group(1)

            posted = card.select_one("p[data-temp-2]")
            desc = card.select_one(".desc")
            desc_text = desc.get_text(" ", strip=True) if desc else title
            desc_text = re.sub(r"\s*See More\s*$", "", desc_text)

            jobs.append(
                RawJob(
                    title=title,
                    company="OnlineJobs.ph Employer",
                    location="Remote (Philippines)",
                    employment_type=employment,
                    category="Information Technology",
                    description=desc_text,
                    skills=list(dict.fromkeys(tags + extract_skills_from_text(f"{title} {desc_text}")))[:12],
                    salary_min=salary_min,
                    salary_max=salary_max,
                    salary_currency=currency,
                    url=urljoin(self.base_url, link["href"]),
                    posted_at=(posted["data-temp-2"].replace(" ", "T") if posted else None),
                )
            )
        return jobs
