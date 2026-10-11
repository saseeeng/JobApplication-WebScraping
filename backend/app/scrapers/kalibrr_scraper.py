"""Kalibrr Philippines scraper: IT jobs in NCR (Metro Manila) only.

Kalibrr pages are server-rendered Next.js pages. BeautifulSoup locates the
``<script id="__NEXT_DATA__">`` tag that carries the listing data as JSON; if that is
ever missing it falls back to reading the visible job cards from the HTML.

Two filters keep the dataset relevant:
* location: only listings whose region is Metro Manila / NCR are kept;
* field: only IT-related listings are kept (see ``is_it_job``).
"""

import json
import logging
import re
from typing import Any
from urllib.parse import quote_plus, urljoin

from bs4 import BeautifulSoup

from app.core.config import get_settings
from app.scrapers.base import BaseScraper, Fetcher, HttpFetcher, RawJob

logger = logging.getLogger(__name__)

# Search terms (BSIT-oriented). Each one is searched across NCR on Kalibrr.
IT_SEARCH_TERMS = [
    "software-developer",
    "web-developer",
    "software-engineer",
    "programmer",
    "mobile-developer",
    "full-stack-developer",
    "it-support",
    "network-engineer",
    "system-administrator",
    "database-administrator",
    "qa-tester",
    "data-analyst",
    "devops",
    "cybersecurity",
    "ui-ux-designer",
    "business-analyst",
]

_IT_TITLE = re.compile(
    r"\b(developer|programmer|software|web|frontend|front-end|backend|back-end|full[- ]?stack|"
    r"devops|sysad|system(s)? (admin|administrator|engineer|analyst)|network|it\b|"
    r"information technology|helpdesk|help desk|technical support|tech support|"
    r"data (analyst|engineer|scientist)|database|dba|qa\b|quality assurance|tester|"
    r"cyber|security (analyst|engineer)|cloud|ui/?ux|ux|machine learning|ai\b|"
    r"mobile|android|ios|react|java|python|php|laravel|\.net|salesforce|sap\b|"
    r"business analyst|scrum|solutions? (architect|engineer)|erp)\b",
    re.IGNORECASE,
)
_NON_IT_TITLE = re.compile(
    r"\b(real estate|business developer|sales|accountant|driver|nurse|dietitian|teller|"
    r"waiter|cashier|merchandiser|warehouse|sourcing|buyer)\b",
    re.IGNORECASE,
)
_NCR_REGIONS = {"metro manila", "ncr", "national capital region"}

COMMON_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "PHP", "C#", "C++", "Go", "Kotlin", "Swift",
    "React", "Angular", "Vue", "Node.js", "Next.js", "Laravel", "Django", "FastAPI", "Spring",
    ".NET", "HTML", "CSS", "Tailwind CSS", "SQL", "MySQL", "PostgreSQL", "MongoDB", "Oracle",
    "Redis", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Linux", "REST API",
    "Selenium", "Power BI", "Tableau", "Excel", "Figma", "Agile", "Scrum", "CI/CD",
    "Cybersecurity", "Networking", "Data Analysis", "Machine Learning", "Salesforce",
]


def is_it_job(title: str, category: str = "") -> bool:
    """True when the listing looks like an IT / software role."""
    if _NON_IT_TITLE.search(title):
        return False
    if "information technology" in category.lower():
        return True
    return bool(_IT_TITLE.search(title))


def is_ncr(region: str | None, city: str | None = "") -> bool:
    return (region or "").strip().lower() in _NCR_REGIONS


def extract_skills_from_text(text: str) -> list[str]:
    """Return known IT skills mentioned in ``text`` (word-boundary match)."""
    found: list[str] = []
    for skill in COMMON_SKILLS:
        if re.search(r"(?<![\w.+#])" + re.escape(skill) + r"(?![\w+#])", text or "", re.IGNORECASE):
            found.append(skill)
    return found


def clean_html(text: str) -> str:
    return BeautifulSoup(text or "", "html.parser").get_text(" ", strip=True)


class KalibrrNCRScraper(BaseScraper):
    """Scrapes IT job listings located in NCR, Philippines from Kalibrr."""

    source_name = "Kalibrr PH"
    base_url = "https://www.kalibrr.com"

    def __init__(
        self,
        fetcher: Fetcher | None = None,
        max_pages: int = 2,
        search_terms: list[str] | None = None,
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
        self.search_terms = search_terms or IT_SEARCH_TERMS

    def source_urls(self) -> list[str]:
        location = quote_plus("Metro Manila")
        return [
            f"{self.base_url}/job-board/te/{term}/{page}?location={location}"
            for term in self.search_terms
            for page in range(1, self.max_pages + 1)
        ]

    def parse(self, html: str) -> list[RawJob]:
        if not html:
            return []
        soup = BeautifulSoup(html, "html.parser")

        script = soup.find("script", id="__NEXT_DATA__")
        if script and script.string:
            try:
                data = json.loads(script.string)
                items = data.get("props", {}).get("pageProps", {}).get("jobs", [])
            except (json.JSONDecodeError, AttributeError):
                items = []
            if items:
                return [raw for item in items if (raw := self._parse_json_item(item))]

        return self._parse_cards(soup)

    def _parse_json_item(self, item: dict[str, Any]) -> RawJob | None:
        title = str(item.get("name") or "").strip()
        if not title:
            return None

        category = str(item.get("function") or "")
        address = (item.get("googleLocation") or {}).get("addressComponents") or {}
        if not is_ncr(address.get("region")):
            return None  # outside NCR
        if address.get("country") not in (None, "Philippines"):
            return None
        if not is_it_job(title, category):
            return None

        company_info = item.get("company") or {}
        company = company_info.get("name") or item.get("companyName") or ""
        code, job_id, slug = company_info.get("code"), item.get("id"), item.get("slug") or ""
        url = (
            f"{self.base_url}/c/{code}/jobs/{job_id}/{slug}"
            if code and job_id
            else f"{self.base_url}/job-board/{job_id}"
        )

        city = address.get("city") or "Metro Manila"
        description = clean_html(item.get("description") or "") or title
        qualifications = clean_html(item.get("qualifications") or "")
        skills = extract_skills_from_text(f"{title} {description} {qualifications}")

        tenure = str(item.get("tenure") or "")
        min_salary, max_salary = item.get("baseSalary"), item.get("maximumSalary")
        return RawJob(
            external_id=str(job_id) if job_id else None,
            title=title,
            company=str(company),
            location=f"{city}, Metro Manila",
            employment_type=tenure,
            category=category,
            description=description,
            skills=skills,
            salary_min=str(min_salary) if min_salary else None,
            salary_max=str(max_salary) if max_salary else None,
            salary_currency=str(item.get("salaryCurrency") or "") or None,
            url=url,
            posted_at=str(item.get("activationDate") or item.get("createdAt") or "") or None,
        )

    def _parse_cards(self, soup: BeautifulSoup) -> list[RawJob]:
        """Fallback: read visible cards (title/company/location only)."""
        jobs: list[RawJob] = []
        for h2 in soup.find_all("h2"):
            link = h2.find("a", href=True)
            card = h2.find_parent("div", class_=lambda c: c and "k-bg-white" in c)
            if not link or not card:
                continue
            title = link.get_text(strip=True)
            text = card.get_text(" ", strip=True)
            if "Metro Manila" not in text and "Philippines" not in text:
                continue
            if not is_it_job(title):
                continue
            company_link = card.find("a", href=lambda h: h and "action=Company%20Name" in h)
            jobs.append(
                RawJob(
                    title=title,
                    company=company_link.get_text(strip=True) if company_link else "",
                    location="Metro Manila",
                    employment_type="Full time" if "Full time" in text else "",
                    category="Information Technology",
                    description=title,
                    skills=extract_skills_from_text(text),
                    url=urljoin(self.base_url, link["href"]),
                )
            )
        return jobs
