"""Small, pure helpers used for normalizing scraped data."""

import hashlib
import re
from datetime import datetime, timezone
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

_WHITESPACE = re.compile(r"\s+")
_TRACKING_PARAMS = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "gclid", "fbclid"}

_EMPLOYMENT_TYPES = {
    "full-time": "Full-time",
    "full time": "Full-time",
    "fulltime": "Full-time",
    "permanent": "Full-time",
    "part-time": "Part-time",
    "part time": "Part-time",
    "contract": "Contract",
    "contractor": "Contract",
    "freelance": "Contract",
    "internship": "Internship",
    "intern": "Internship",
    "temporary": "Temporary",
    "temp": "Temporary",
}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def clean_text(value: str | None) -> str:
    """Collapse whitespace and strip; returns '' for None."""
    return _WHITESPACE.sub(" ", value or "").strip()


def normalize_url(url: str) -> str:
    """Lowercase scheme/host, drop fragments and tracking params, trim trailing slash."""
    parts = urlsplit(url.strip())
    query = urlencode(sorted((k, v) for k, v in parse_qsl(parts.query) if k.lower() not in _TRACKING_PARAMS))
    path = parts.path.rstrip("/") or ""
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, query, ""))


def make_external_id(source_name: str, url: str) -> str:
    """Stable identifier derived from the source and normalized URL."""
    digest = hashlib.sha256(f"{source_name.lower()}|{normalize_url(url)}".encode()).hexdigest()
    return digest[:32]


def normalize_employment_type(value: str | None) -> str:
    key = clean_text(value).lower()
    return _EMPLOYMENT_TYPES.get(key, "Other") if key else "Other"


def parse_int(value: str | None) -> int | None:
    """Parse '120,000' -> 120000. Returns None for empty/invalid input (never invents a value)."""
    digits = re.sub(r"[^\d]", "", value or "")
    return int(digits) if digits else None


def parse_datetime(value: str | None) -> datetime | None:
    """Parse an ISO-8601 date/datetime into an aware UTC datetime; None if invalid."""
    text = clean_text(value)
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)
