from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.crm_doc import KnowledgeDocument

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

class AdminDashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    pending_orders: int
    paid_orders: int
    total_products: int
    low_stock_count: int
    total_knowledge_docs: int

@router.get("/stats", response_model=AdminDashboardStats)
async def get_admin_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Fetch aggregated business KPIs and metrics for the admin dashboard."""
    # 1. Revenue from PAID orders
    rev_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0.0)).where(Order.status == OrderStatus.PAID)
    )
    total_revenue = float(rev_result.scalar_one())

    # 2. Total orders
    orders_count_res = await db.execute(select(func.count(Order.id)))
    total_orders = orders_count_res.scalar_one()

    # 3. Pending orders
    pending_res = await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING))
    pending_orders = pending_res.scalar_one()

    # 4. Paid orders
    paid_res = await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.PAID))
    paid_orders = paid_res.scalar_one()

    # 5. Products count & Low stock (<10)
    prod_count_res = await db.execute(select(func.count(Product.id)))
    total_products = prod_count_res.scalar_one()

    low_stock_res = await db.execute(select(func.count(Product.id)).where(Product.stock < 10))
    low_stock_count = low_stock_res.scalar_one()

    # 6. Total Knowledge Docs
    docs_res = await db.execute(select(func.count(KnowledgeDocument.id)))
    total_docs = docs_res.scalar_one()

    return AdminDashboardStats(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        pending_orders=pending_orders,
        paid_orders=paid_orders,
        total_products=total_products,
        low_stock_count=low_stock_count,
        total_knowledge_docs=total_docs
    )

