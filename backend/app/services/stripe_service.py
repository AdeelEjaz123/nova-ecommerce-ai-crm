import stripe
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.core.config import settings
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

async def create_stripe_checkout_session(
    db: AsyncSession,
    items: List[Dict[str, Any]],
    customer_email: str,
    customer_name: str | None = None
) -> Tuple[str, str, int]:
    """
    Creates an Order record in PENDING status and creates a Stripe Checkout Session.
    Returns: (session_id, checkout_url, order_id)
    """
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Fetch products from DB to verify prices and stock
    product_ids = [item["product_id"] for item in items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products_by_id = {p.id: p for p in result.scalars().all()}

    total_amount = 0.0
    order_items: List[OrderItem] = []
    stripe_line_items = []

    for item in items:
        prod_id = item["product_id"]
        quantity = item["quantity"]
        if quantity <= 0:
            continue

        product = products_by_id.get(prod_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {prod_id} not found")

        if product.stock < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for '{product.name}'. Available: {product.stock}"
            )

        subtotal = float(product.price) * quantity
        total_amount += subtotal

        # Build DB Order Item
        order_item = OrderItem(
            product_id=product.id,
            product_name=product.name,
            price=float(product.price),
            quantity=quantity,
            subtotal=subtotal
        )
        order_items.append(order_item)

        # Build Stripe line item (Stripe expects unit_amount in cents)
        stripe_line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": product.name,
                    "description": product.description[:200] if product.description else None,
                    "images": [product.image_url] if product.image_url else [],
                },
                "unit_amount": int(round(float(product.price) * 100)),
            },
            "quantity": quantity,
        })

    # Create Order in DB
    order = Order(
        customer_email=customer_email,
        customer_name=customer_name,
        total_amount=round(total_amount, 2),
        status=OrderStatus.PENDING,
        items=order_items
    )
    db.add(order)
    await db.flush()  # populate order.id

    # If the user has not yet configured a real Stripe Secret Key, provide a dev mock session
    if settings.STRIPE_SECRET_KEY.startswith("sk_test_placeholder") or not settings.STRIPE_SECRET_KEY:
        mock_session_id = f"mock_cs_test_{order.id}"
        mock_checkout_url = f"{settings.FRONTEND_URL}/checkout/success?session_id={mock_session_id}&order_id={order.id}"
        order.stripe_checkout_session_id = mock_session_id
        await db.commit()
        await db.refresh(order)
        return mock_session_id, mock_checkout_url, order.id

    try:
        # Create real Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=stripe_line_items,
            mode="payment",
            customer_email=customer_email,
            shipping_address_collection={"allowed_countries": ["US", "CA", "GB", "AU", "DE"]},
            success_url=f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order.id}",
            cancel_url=f"{settings.FRONTEND_URL}/checkout/cancel?order_id={order.id}",
            metadata={
                "order_id": str(order.id),
                "customer_email": customer_email
            }
        )
        
        order.stripe_checkout_session_id = checkout_session.id
        await db.commit()
        await db.refresh(order)
        return checkout_session.id, checkout_session.url, order.id
    except Exception as e:
        logger.error(f"Error creating Stripe checkout session: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Payment provider error: {str(e)}")

async def handle_stripe_webhook_event(payload: bytes, sig_header: str, db: AsyncSession) -> Dict[str, Any]:
    """
    Verifies Stripe signature and fulfills the order on 'checkout.session.completed'.
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")

    event_type = event["type"]
    logger.info(f"Received Stripe event: {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        order_id_str = session.get("metadata", {}).get("order_id")
        session_id = session.get("id")

        query = select(Order).where(
            (Order.stripe_checkout_session_id == session_id) |
            (Order.id == int(order_id_str)) if order_id_str else (Order.stripe_checkout_session_id == session_id)
        )
        result = await db.execute(query)
        order = result.scalar_one_or_none()

        if order:
            order.status = OrderStatus.PAID
            order.stripe_payment_intent_id = session.get("payment_intent")
            order.shipping_details = session.get("shipping_details") or session.get("customer_details")
            
            # Decrement inventory stock
            order_items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
            items = order_items_result.scalars().all()
            for itm in items:
                if itm.product_id:
                    prod = await db.get(Product, itm.product_id)
                    if prod:
                        prod.stock = max(0, prod.stock - itm.quantity)
            
            await db.commit()
            logger.info(f"Order #{order.id} marked as PAID via Stripe webhook.")

    return {"status": "success", "event": event_type}

