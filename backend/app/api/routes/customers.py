from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Customer,
    CustomerCreate,
    CustomerPublic,
    CustomersPublic,
    CustomerUpdate,
    Message,
)

router = APIRouter()


@router.get("/", response_model=CustomersPublic)
def read_customers(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Retrieve customers for the current user.
    """
    count_statement = select(func.count()).select_from(Customer).where(Customer.owner_id == current_user.id)
    count = session.exec(count_statement).one()

    statement = (
        select(Customer)
        .where(Customer.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    customers = session.exec(statement).all()

    return CustomersPublic(data=customers, count=count)


@router.get("/{customer_id}", response_model=CustomerPublic)
def read_customer(
    customer_id: UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get customer by ID.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if customer.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return customer


@router.post("/", response_model=CustomerPublic)
def create_customer(
    *, session: SessionDep, current_user: CurrentUser, customer_in: CustomerCreate
) -> Any:
    """
    Create new customer.
    """
    customer = Customer.model_validate(customer_in, update={"owner_id": current_user.id})
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=CustomerPublic)
def update_customer(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    customer_id: UUID,
    customer_in: CustomerUpdate,
) -> Any:
    """
    Update a customer.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if customer.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    update_dict = customer_in.model_dump(exclude_unset=True)
    customer.sqlmodel_update(update_dict)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer


@router.delete("/{customer_id}")
def delete_customer(
    session: SessionDep, current_user: CurrentUser, customer_id: UUID
) -> Message:
    """
    Delete a customer.
    """
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if customer.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    session.delete(customer)
    session.commit()
    return Message(message="Customer deleted successfully")


@router.get("/search/{query}", response_model=CustomersPublic)
def search_customers(
    query: str,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Search customers by business name or NTN/CNIC.
    """
    search_filter = (
        (Customer.business_name.ilike(f"%{query}%")) |
        (Customer.ntn_cnic.ilike(f"%{query}%"))
    )

    count_statement = (
        select(func.count())
        .select_from(Customer)
        .where(Customer.owner_id == current_user.id)
        .where(search_filter)
    )
    count = session.exec(count_statement).one()

    statement = (
        select(Customer)
        .where(Customer.owner_id == current_user.id)
        .where(search_filter)
        .offset(skip)
        .limit(limit)
    )
    customers = session.exec(statement).all()

    return CustomersPublic(data=customers, count=count)
