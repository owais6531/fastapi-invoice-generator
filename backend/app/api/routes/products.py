from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Product,
    ProductCreate,
    ProductPublic,
    ProductsPublic,
    ProductUpdate,
)

router = APIRouter()


@router.get("/", response_model=ProductsPublic)
def read_products(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Retrieve products for the current user.
    """
    count_statement = select(func.count()).select_from(Product).where(Product.owner_id == current_user.id)
    count = session.exec(count_statement).one()

    statement = (
        select(Product)
        .where(Product.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    products = session.exec(statement).all()

    return ProductsPublic(data=products, count=count)


@router.get("/{product_id}", response_model=ProductPublic)
def read_product(
    product_id: UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get product by ID.
    """
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return product


@router.post("/", response_model=ProductPublic)
def create_product(
    *, session: SessionDep, current_user: CurrentUser, product_in: ProductCreate
) -> Any:
    """
    Create new product.
    """
    product = Product.model_validate(product_in, update={"owner_id": current_user.id})
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductPublic)
def update_product(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    product_id: UUID,
    product_in: ProductUpdate,
) -> Any:
    """
    Update a product.
    """
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    update_dict = product_in.model_dump(exclude_unset=True)
    product.sqlmodel_update(update_dict)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    session: SessionDep, current_user: CurrentUser, product_id: UUID
) -> Message:
    """
    Delete a product.
    """
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    session.delete(product)
    session.commit()
    return Message(message="Product deleted successfully")


@router.get("/search/{query}", response_model=ProductsPublic)
def search_products(
    query: str,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Search products by description or HS code.
    """
    search_filter = (
        (Product.description.ilike(f"%{query}%")) |
        (Product.hs_code.ilike(f"%{query}%"))
    )

    count_statement = (
        select(func.count())
        .select_from(Product)
        .where(Product.owner_id == current_user.id)
        .where(search_filter)
    )
    count = session.exec(count_statement).one()

    statement = (
        select(Product)
        .where(Product.owner_id == current_user.id)
        .where(search_filter)
        .offset(skip)
        .limit(limit)
    )
    products = session.exec(statement).all()

    return ProductsPublic(data=products, count=count)


@router.get("/by-hs-code/{hs_code}", response_model=ProductsPublic)
def get_products_by_hs_code(
    hs_code: str,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Get products by HS code.
    """
    count_statement = (
        select(func.count())
        .select_from(Product)
        .where(Product.owner_id == current_user.id)
        .where(Product.hs_code == hs_code)
    )
    count = session.exec(count_statement).one()

    statement = (
        select(Product)
        .where(Product.owner_id == current_user.id)
        .where(Product.hs_code == hs_code)
        .offset(skip)
        .limit(limit)
    )
    products = session.exec(statement).all()

    return ProductsPublic(data=products, count=count)
