from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Company,
    CompanyCreate,
    CompanyPublic,
    CompanyUpdate,
    Message,
)

router = APIRouter()


@router.get("/", response_model=CompanyPublic)
def read_company(
    session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Retrieve company information for the current user.
    """
    statement = select(Company).where(Company.owner_id == current_user.id)
    company = session.exec(statement).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("/", response_model=CompanyPublic)
def create_company(
    *, session: SessionDep, current_user: CurrentUser, company_in: CompanyCreate
) -> Any:
    """
    Create new company for the current user.
    """
    # Check if user already has a company
    statement = select(Company).where(Company.owner_id == current_user.id)
    existing_company = session.exec(statement).first()
    if existing_company:
        raise HTTPException(
            status_code=400, detail="User already has a company registered"
        )
    
    company = Company.model_validate(company_in, update={"owner_id": current_user.id})
    session.add(company)
    session.commit()
    session.refresh(company)
    return company


@router.put("/", response_model=CompanyPublic)
def update_company(
    *, session: SessionDep, current_user: CurrentUser, company_in: CompanyUpdate
) -> Any:
    """
    Update company information.
    """
    statement = select(Company).where(Company.owner_id == current_user.id)
    company = session.exec(statement).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_dict = company_in.model_dump(exclude_unset=True)
    company.sqlmodel_update(update_dict)
    session.add(company)
    session.commit()
    session.refresh(company)
    return company


@router.delete("/")
def delete_company(
    session: SessionDep, current_user: CurrentUser
) -> Message:
    """
    Delete company.
    """
    statement = select(Company).where(Company.owner_id == current_user.id)
    company = session.exec(statement).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    session.delete(company)
    session.commit()
    return Message(message="Company deleted successfully")