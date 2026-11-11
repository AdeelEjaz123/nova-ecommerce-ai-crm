from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from app.models.order import OrderStatus

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemRead(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    price: float
    quantity: int
    subtotal: float

    model_config = ConfigDict(from_attributes=True)

class OrderRead(BaseModel):
    id: int
    customer_email: str
    customer_name: Optional[str] = None
    total_amount: float
    status: OrderStatus
    created_at: datetime
    shipping_details: Optional[Any] = None
    items: List[OrderItemRead] = []

    model_config = ConfigDict(from_attributes=True)

class CartItemPayload(BaseModel):
    product_id: int
    quantity: int

class CheckoutSessionRequest(BaseModel):
    items: List[CartItemPayload]
    customer_email: str
    customer_name: Optional[str] = None

class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str
    order_id: int

