from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderRead

router = APIRouter(tags=["Orders"])

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

@router.get("/orders", response_model=List[OrderRead])
async def list_orders(
    status: Optional[OrderStatus] = Query(None, description="Filter orders by status"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to list customer orders with items."""
    query = select(Order).options(selectinload(Order.items)).order_by(Order.id.desc()).limit(limit)
    if status:
        query = query.where(Order.status == status)

    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/orders/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to update order fulfillment status."""
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    await db.commit()

    query = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    result = await db.execute(query)
    return result.scalar_one()

@router.get("/orders/{order_id}", response_model=OrderRead)
async def get_order_by_id(order_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch order details and current status."""
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order

@router.get("/orders/by-session/{session_id}", response_model=OrderRead)
async def get_order_by_stripe_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch order details by Stripe Checkout session ID (used on confirmation page)."""
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.stripe_checkout_session_id == session_id)
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found for session")

    return order

