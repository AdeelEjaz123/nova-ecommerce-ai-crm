from fastapi import APIRouter
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.checkout import router as checkout_router
from app.api.webhooks import router as webhooks_router
from app.api.crm import router as crm_router
from app.api.admin import router as admin_router

api_router = APIRouter()

api_router.include_router(products_router, prefix="/api")
api_router.include_router(orders_router, prefix="/api")
api_router.include_router(checkout_router, prefix="/api")
api_router.include_router(webhooks_router, prefix="/api")
api_router.include_router(crm_router, prefix="/api")
api_router.include_router(admin_router, prefix="/api")

