from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.order import CheckoutSessionRequest, CheckoutSessionResponse
from app.services.stripe_service import create_stripe_checkout_session

router = APIRouter(tags=["Checkout"])

@router.post("/checkout/create-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    payload: CheckoutSessionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts cart items and customer email, creates a PENDING order,
    and returns a Stripe Checkout URL to redirect the user to.
    """
    items_dicts = [item.model_dump() for item in payload.items]
    session_id, checkout_url, order_id = await create_stripe_checkout_session(
        db=db,
        items=items_dicts,
        customer_email=str(payload.customer_email),
        customer_name=payload.customer_name
    )

    return CheckoutSessionResponse(
        session_id=session_id,
        checkout_url=checkout_url,
        order_id=order_id
    )

