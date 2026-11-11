import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure engine parameters depending on DB dialect
engine_kwargs = {
    "echo": (settings.ENVIRONMENT == "development"),
    "future": True,
}

if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db() -> None:
    """Create database tables if they do not exist."""
    from app.models.base import Base
    # Import all models to register them with Base.metadata
    from app.models.product import Category, Product # noqa: F401
    from app.models.order import Order, OrderItem # noqa: F401
    from app.models.crm_doc import KnowledgeDocument # noqa: F401

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")

        # Seed initial RAG knowledge documents if none exist
        from sqlalchemy import select
        async with AsyncSessionLocal() as session:
            check_doc = await session.execute(select(KnowledgeDocument))
            if not check_doc.scalars().first():
                default_docs = [
                    {
                        "title": "Shipping & Delivery Policy",
                        "category": "shipping",
                        "content": "NOVA provides free standard shipping on orders over $100. Domestic shipping takes 2-4 business days. International shipping takes 5-8 business days with real-time tracking."
                    },
                    {
                        "title": "30-Day Return & Refund Guarantee",
                        "category": "returns",
                        "content": "All products include a 30-day money-back guarantee. Returns must be in original condition. Refunds are processed back to your original payment method within 3-5 business days."
                    },
                    {
                        "title": "Hardware Warranty",
                        "category": "warranty",
                        "content": "All electronic products (AcousticPro Headphones, Studio Keyboards, Chronos Watches) come with a 2-year warranty covering manufacturer defects and component failures."
                    },
                    {
                        "title": "About NOVA Commerce",
                        "category": "company",
                        "content": "NOVA creates precision-engineered gear for minimalists and creators. We prioritize high-grade aluminum, Japanese quartz, and sustainable organic fabrics."
                    }
                ]
                for doc in default_docs:
                    session.add(KnowledgeDocument(**doc))
                await session.commit()
                logger.info("Initialized default CRM Knowledge Documents.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
        # Note: If PostgreSQL is not running yet, the server will continue to boot
        # but db calls will fail until the DB is reachable.

