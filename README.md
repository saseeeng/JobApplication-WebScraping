# Philippine IT Job Market Tracker

A full-stack web application that scrapes, stores, and visualizes live IT job postings across **NCR (Metro Manila), Philippines** and Philippine remote roles.

---

## Features

- **Live IT Job Scraping**: Extracts listings from **Kalibrr PH** (NCR only) and **OnlineJobs.ph** using **BeautifulSoup**.
- **On-Demand Refresh**: Trigger scraping with the **"Refresh jobs"** button in the dashboard header or via CLI.
- **Analytics & Insights**: Overview metrics, top in-demand skills, and salary breakdowns.
- **Job Search & Filters**: Search keywords and filter by NCR location, employment type, and sort by date or title.
- **Polite & Compliant**: Respects `robots.txt` and enforces rate-limiting delays between requests.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: FastAPI, Uvicorn, Pydantic, SQLAlchemy, SQLite.
- **Scraping**: BeautifulSoup4, Requests.

---

## Quick Start (Local Run)

### 1. Backend (FastAPI + SQLite)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs at: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
Open in browser: `http://localhost:3000`

---

## Scraping & Refreshing Data

You can fetch fresh IT jobs at any time using:

1. **Web Dashboard**: Click the **"Refresh jobs"** button in the top navigation bar.
2. **Command Line (CLI)**:
   ```bash
   cd backend
   python -m app.scripts.scrape --pages 2
   ```

---

## Running Tests

```bash
cd backend
pytest
```

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/routes/       # Endpoints (jobs, analytics, scrape)
│   │   ├── scrapers/         # BeautifulSoup scrapers (Kalibrr & OnlineJobs)
│   │   ├── services/         # Business logic & ingestion
│   │   └── models/           # SQLAlchemy DB models
│   └── tests/                # Automated pytest suite
├── frontend/
│   └── src/
│       ├── app/              # Next.js pages (dashboard, jobs list)
│       └── components/       # UI components & charts
└── data/
    └── job_tracker.db        # SQLite database
```