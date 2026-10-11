def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_list_jobs_default_pagination(client):
    body = client.get("/api/v1/jobs").json()
    assert body["total"] == 6
    assert body["page"] == 1
    assert len(body["items"]) == 6
    dates = [j["posted_at"] for j in body["items"]]
    assert dates == sorted(dates, reverse=True)  # newest first


def test_pagination(client):
    body = client.get("/api/v1/jobs", params={"page_size": 4, "page": 2}).json()
    assert len(body["items"]) == 2
    assert body["pages"] == 2


def test_search_filter(client):
    body = client.get("/api/v1/jobs", params={"search": "security"}).json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Cybersecurity Analyst"


def test_combined_filters(client):
    body = client.get(
        "/api/v1/jobs", params={"location": "Remote (Philippines)", "employment_type": "Contract"}
    ).json()
    assert body["total"] == 1
    assert body["items"][0]["company"] == "OnlineJobs.ph Employer"


def test_sort_by_title(client):
    items = client.get("/api/v1/jobs", params={"sort_by": "title", "sort_order": "asc"}).json()["items"]
    titles = [j["title"] for j in items]
    assert titles == sorted(titles)


def test_invalid_sort_rejected(client):
    assert client.get("/api/v1/jobs", params={"sort_by": "bogus"}).status_code == 422


def test_get_job(client):
    first = client.get("/api/v1/jobs").json()["items"][0]
    response = client.get(f"/api/v1/jobs/{first['id']}")
    assert response.status_code == 200
    assert response.json()["title"] == first["title"]


def test_get_job_not_found(client):
    assert client.get("/api/v1/jobs/99999").status_code == 404


def test_missing_salary_is_null(client):
    items = client.get("/api/v1/jobs", params={"search": "QA Tester"}).json()["items"]
    assert items[0]["salary_min"] is None and items[0]["salary_currency"] is None


def test_filter_options_are_philippines_only(client):
    body = client.get("/api/v1/jobs/filters").json()
    assert "Makati, Metro Manila" in body["locations"]
    assert all("Metro Manila" in loc or "Philippines" in loc for loc in body["locations"])
    assert "Full-time" in body["employment_types"]
