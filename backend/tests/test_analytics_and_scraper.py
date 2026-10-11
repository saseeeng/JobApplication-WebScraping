import json
from unittest.mock import MagicMock

from app.scrapers.base import RawJob
from app.scrapers.kalibrr_scraper import KalibrrNCRScraper, is_it_job
from app.scrapers.onlinejobs_scraper import OnlineJobsPHScraper
from app.services import scrape_service


def test_analytics_overview(client):
    body = client.get("/api/v1/analytics/overview").json()
    assert body["total_jobs"] == 6
    assert body["total_companies"] == 6
    assert body["total_locations"] == 6


def test_analytics_skills_sorted(client):
    body = client.get("/api/v1/analytics/skills", params={"limit": 3}).json()
    assert body[0]["name"] == "Python"
    assert body[0]["count"] == 4
    counts = [i["count"] for i in body]
    assert counts == sorted(counts, reverse=True)


def test_analytics_locations_companies_categories(client):
    for name in ("locations", "companies", "categories"):
        response = client.get(f"/api/v1/analytics/{name}", params={"limit": 3})
        assert response.status_code == 200
        assert len(response.json()) >= 1


def _kalibrr_page(*items: dict) -> str:
    data = {"props": {"pageProps": {"jobs": list(items)}}}
    return f'<html><script id="__NEXT_DATA__" type="application/json">{json.dumps(data)}</script></html>'


def _kalibrr_item(job_id: int, name: str, region: str, function: str = "Information Technology") -> dict:
    return {
        "id": job_id,
        "name": name,
        "slug": name.lower().replace(" ", "-"),
        "company": {"name": "Acme", "code": "acme"},
        "googleLocation": {"addressComponents": {"city": "Makati", "region": region, "country": "Philippines"}},
        "function": function,
        "description": "<p>We use Python and SQL.</p>",
        "qualifications": "",
        "tenure": "Full time",
        "baseSalary": 40000,
        "maximumSalary": 60000,
        "salaryCurrency": "PHP",
        "activationDate": "2026-10-01T00:00:00+00:00",
    }


def test_kalibrr_keeps_only_it_jobs_in_ncr():
    scraper = KalibrrNCRScraper(fetcher=MagicMock())
    html = _kalibrr_page(
        _kalibrr_item(1, "Software Developer", "Metro Manila"),
        _kalibrr_item(2, "Software Developer", "Cebu"),  # outside NCR
        _kalibrr_item(3, "Real Estate Business Developer", "Metro Manila", "Sales"),  # not IT
    )
    raws = scraper.parse(html)
    assert [r.title for r in raws] == ["Software Developer"]
    job = scraper.normalize(raws[0])
    assert job is not None
    assert job.location == "Makati, Metro Manila"
    assert (job.salary_min, job.salary_max, job.salary_currency) == (40000, 60000, "PHP")
    assert "Python" in job.skills and "SQL" in job.skills


def test_kalibrr_urls_target_metro_manila():
    urls = KalibrrNCRScraper(fetcher=MagicMock(), max_pages=1, search_terms=["devops"]).source_urls()
    assert urls == ["https://www.kalibrr.com/job-board/te/devops/1?location=Metro+Manila"]


def test_is_it_job():
    assert is_it_job("Junior Web Developer")
    assert is_it_job("Analyst", "Information Technology")
    assert not is_it_job("Real Estate Business Developer")
    assert not is_it_job("Delivery Driver")


def test_onlinejobs_parse_it_only():
    html = """
    <div class="jobpost-cat-box"><dl><dt><h4>Backend Developer <span class="badge">Full Time</span></h4></dt></dl>
      <p data-temp-2="2026-10-10 22:00:00"><em>Posted on 2026-10-11</em></p>
      <dd>$1,500/month</dd>
      <div class="desc">Build APIs with Python and FastAPI. <a href="/jobseekers/job/backend-1">See More</a></div>
      <div class="job-tag"><a class="badge" href="#">Web Development</a></div></div>
    <div class="jobpost-cat-box"><dl><dt><h4>Virtual Assistant <span class="badge">Part Time</span></h4></dt></dl>
      <div class="desc">Admin work <a href="/jobseekers/job/va-2">See More</a></div></div>
    """
    scraper = OnlineJobsPHScraper(fetcher=MagicMock())
    raws = scraper.parse(html)
    assert len(raws) == 1
    job = scraper.normalize(raws[0])
    assert job is not None
    assert job.title == "Backend Developer"  # badge text removed from the title
    assert job.company == "OnlineJobs.ph Employer"
    assert job.employment_type == "Full-time"
    assert (job.salary_min, job.salary_currency) == (1500, "USD")
    assert "Python" in job.skills


def test_scraper_handles_missing_and_malformed_data():
    scraper = KalibrrNCRScraper(fetcher=MagicMock())
    assert scraper.parse("") == []
    assert scraper.parse("<html><script id='__NEXT_DATA__'>{not json</script>") == []
    assert scraper.normalize(RawJob(title="Only title")) is None


def test_normalize_does_not_invent_salary():
    job = KalibrrNCRScraper(fetcher=MagicMock()).normalize(
        RawJob(title="X", company="Y", url="https://e.com/a/", employment_type="full time")
    )
    assert job is not None
    assert job.salary_min is None and job.salary_max is None and job.salary_currency is None
    assert job.employment_type == "Full-time"
    assert job.location == "Unspecified"


def test_refresh_endpoint_runs_and_blocks_concurrent(client, monkeypatch):
    calls: list[int] = []
    monkeypatch.setattr(scrape_service, "run_scrape", lambda pages: calls.append(pages))
    monkeypatch.setattr(scrape_service, "_status", scrape_service.ScrapeStatus())

    first = client.post("/api/v1/scrape", params={"pages": 1})
    assert first.status_code == 202 and first.json()["running"] is True
    assert calls == [1]
    # The patched runner never clears the running flag, so a second request is rejected.
    assert client.post("/api/v1/scrape").status_code == 409
    assert client.get("/api/v1/scrape/status").json()["running"] is True
