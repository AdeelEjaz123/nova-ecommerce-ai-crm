from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.stripe_service import handle_stripe_webhook_event

router = APIRouter(tags=["Webhooks"])

@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives events directly from Stripe servers (or Stripe CLI).
    Verifies signature and processes order fulfillment on checkout.session.completed.
    """
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    payload = await request.body()
    return await handle_stripe_webhook_event(payload, stripe_signature, db)

