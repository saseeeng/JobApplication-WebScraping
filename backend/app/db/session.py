"""Engine, session factory and database initialization."""

import logging
from pathlib import Path

from sqlalchemy import Engine, create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.db.base import Base

logger = logging.getLogger(__name__)


def build_engine(database_url: str) -> Engine:
    url = make_url(database_url)
    kwargs: dict[str, object] = {"pool_pre_ping": True}
    if url.get_backend_name() == "sqlite":
        kwargs["connect_args"] = {"check_same_thread": False}
        if url.database and url.database != ":memory:":
            Path(url.database).parent.mkdir(parents=True, exist_ok=True)
    return create_engine(database_url, **kwargs)


engine = build_engine(get_settings().database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, class_=Session)


def init_db(bind: Engine | None = None) -> None:
    """Create tables if they do not exist.

    This is intentionally isolated so it can be swapped for Alembic migrations later.
    """
    from app import models  # noqa: F401  (registers models on Base.metadata)

    Base.metadata.create_all(bind=bind or engine)
    logger.info("Database initialized")
