from fastapi import APIRouter

from app.api.routes import (
    companies,
    customers,
    fbr_invoices,
    invoice,
    items,
    login,
    private,
    products,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(invoice.router)
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(fbr_invoices.router, prefix="/fbr-invoices", tags=["fbr-invoices"])


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
