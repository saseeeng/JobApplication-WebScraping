"""CLI: ``python -m app.scripts.scrape [--pages N]`` scrapes live IT jobs in NCR, Philippines."""

import argparse
import logging

from app.core.config import get_settings
from app.db.session import init_db
from app.services import scrape_service


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape IT jobs in NCR, Philippines (Kalibrr) with BeautifulSoup.")
    parser.add_argument("--pages", type=int, default=2, help="Result pages per search term (default: 2)")
    args = parser.parse_args()

    logging.basicConfig(level=get_settings().log_level, format="%(levelname)s %(name)s: %(message)s")
    init_db()
    scrape_service.try_start()
    scrape_service.run_scrape(args.pages)
    status = scrape_service.get_status()
    if status.error:
        print(f"Scrape failed: {status.error}")
    else:
        print(f"Scrape complete: {status.created} new, {status.updated} updated")


if __name__ == "__main__":
    main()
