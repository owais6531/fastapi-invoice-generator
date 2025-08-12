from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from sqlmodel import func, select
import json
import pandas as pd
from io import BytesIO

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    FBRInvoice,
    FBRInvoiceCreate,
    FBRInvoicePublic,
    FBRInvoicesPublic,
    FBRInvoiceUpdate,
    FBRInvoiceItem,
    FBRInvoiceItemCreate,
    Customer,
    Company,
    Product,
    Message,
)

router = APIRouter()


@router.get("/", response_model=FBRInvoicesPublic)
def read_fbr_invoices(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    status: str = Query(default=None),
) -> Any:
    """
    Retrieve FBR invoices for the current user.
    """
    query_filter = FBRInvoice.owner_id == current_user.id
    if status:
        query_filter = query_filter & (FBRInvoice.status == status)
    
    count_statement = select(func.count()).select_from(FBRInvoice).where(query_filter)
    count = session.exec(count_statement).one()
    
    statement = (
        select(FBRInvoice)
        .where(query_filter)
        .offset(skip)
        .limit(limit)
        .order_by(FBRInvoice.created_at.desc())
    )
    invoices = session.exec(statement).all()
    
    return FBRInvoicesPublic(data=invoices, count=count)


@router.get("/{invoice_id}", response_model=FBRInvoicePublic)
def read_fbr_invoice(
    invoice_id: UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get FBR invoice by ID.
    """
    invoice = session.get(FBRInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return invoice


@router.post("/", response_model=FBRInvoicePublic)
def create_fbr_invoice(
    *, session: SessionDep, current_user: CurrentUser, invoice_in: FBRInvoiceCreate
) -> Any:
    """
    Create new FBR invoice.
    """
    # Validate customer exists
    if invoice_in.customer_id:
        customer = session.get(Customer, invoice_in.customer_id)
        if not customer or customer.owner_id != current_user.id:
            raise HTTPException(status_code=400, detail="Invalid customer")
    
    # Validate company exists
    if invoice_in.company_id:
        company = session.get(Company, invoice_in.company_id)
        if not company or company.owner_id != current_user.id:
            raise HTTPException(status_code=400, detail="Invalid company")
    
    invoice = FBRInvoice.model_validate(invoice_in, update={"owner_id": current_user.id})
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice


@router.put("/{invoice_id}", response_model=FBRInvoicePublic)
def update_fbr_invoice(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    invoice_id: UUID,
    invoice_in: FBRInvoiceUpdate,
) -> Any:
    """
    Update an FBR invoice.
    """
    invoice = session.get(FBRInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Don't allow updates to submitted/posted invoices
    if invoice.status in ["submitted", "posted"]:
        raise HTTPException(
            status_code=400, 
            detail="Cannot update submitted or posted invoices"
        )
    
    update_dict = invoice_in.model_dump(exclude_unset=True)
    invoice.sqlmodel_update(update_dict)
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}")
def delete_fbr_invoice(
    session: SessionDep, current_user: CurrentUser, invoice_id: UUID
) -> Message:
    """
    Delete an FBR invoice.
    """
    invoice = session.get(FBRInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Don't allow deletion of submitted/posted invoices
    if invoice.status in ["submitted", "posted"]:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete submitted or posted invoices"
        )
    
    session.delete(invoice)
    session.commit()
    return Message(message="Invoice deleted successfully")


@router.post("/{invoice_id}/items", response_model=dict)
def add_invoice_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    invoice_id: UUID,
    item_in: FBRInvoiceItemCreate,
) -> Any:
    """
    Add item to FBR invoice.
    """
    invoice = session.get(FBRInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Don't allow adding items to submitted/posted invoices
    if invoice.status in ["submitted", "posted"]:
        raise HTTPException(
            status_code=400, 
            detail="Cannot modify submitted or posted invoices"
        )
    
    # Validate product if provided
    if item_in.product_id:
        product = session.get(Product, item_in.product_id)
        if not product or product.owner_id != current_user.id:
            raise HTTPException(status_code=400, detail="Invalid product")
    
    item = FBRInvoiceItem.model_validate(item_in, update={"invoice_id": invoice_id})
    session.add(item)
    session.commit()
    session.refresh(item)
    
    # Recalculate invoice totals
    _recalculate_invoice_totals(session, invoice)
    
    return {"message": "Item added successfully", "item_id": item.id}


@router.post("/{invoice_id}/calculate-totals")
def calculate_invoice_totals(
    session: SessionDep, current_user: CurrentUser, invoice_id: UUID
) -> dict:
    """
    Calculate and update invoice totals.
    """
    invoice = session.get(FBRInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    totals = _recalculate_invoice_totals(session, invoice)
    return totals


@router.post("/{invoice_id}/submit-to-fbr")
def submit_to_fbr(
    session: SessionDep, current_user: CurrentUser, invoice_id: UUID
) -> dict:
    """
    Submit invoice to FBR API.
    """
    invoice = session.get(FBRInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    if invoice.status != "draft":
        raise HTTPException(
            status_code=400, 
            detail="Only draft invoices can be submitted"
        )
    
    # TODO: Implement actual FBR API integration
    # For now, just mark as submitted
    invoice.status = "submitted"
    invoice.fbr_reference = f"FBR-{invoice.invoice_ref_no}"
    session.add(invoice)
    session.commit()
    
    return {
        "message": "Invoice submitted to FBR successfully",
        "fbr_reference": invoice.fbr_reference,
        "status": invoice.status
    }


@router.post("/upload-excel")
async def upload_excel_invoices(
    session: SessionDep,
    current_user: CurrentUser,
    file: UploadFile = File(...)
) -> dict:
    """
    Upload invoices from Excel file.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Only Excel files (.xlsx, .xls) are allowed"
        )
    
    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))
        
        # TODO: Implement Excel parsing logic based on FBR format
        # This is a placeholder implementation
        created_invoices = []
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Parse row data and create invoice
                # This would need to be implemented based on the actual Excel format
                pass
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
        
        return {
            "message": f"Processed {len(df)} rows",
            "created_invoices": len(created_invoices),
            "errors": errors
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Error processing Excel file: {str(e)}"
        )


@router.get("/{invoice_id}/fbr-json")
def get_fbr_json(
    session: SessionDep, current_user: CurrentUser, invoice_id: UUID
) -> dict:
    """
    Generate FBR JSON format for the invoice.
    """
    invoice = session.get(FBRInvoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Get invoice items
    items_statement = select(FBRInvoiceItem).where(FBRInvoiceItem.invoice_id == invoice_id)
    items = session.exec(items_statement).all()
    
    # Generate FBR JSON format
    fbr_json = {
        "InvoiceRefNo": invoice.invoice_ref_no,
        "InvoiceDate": invoice.invoice_date.isoformat(),
        "InvoiceType": invoice.invoice_type,
        "ScenarioId": invoice.scenario_id,
        "SellerNTNCNIC": invoice.seller_ntn_cnic,
        "SellerBusinessName": invoice.seller_business_name,
        "SellerProvince": invoice.seller_province,
        "SellerAddress": invoice.seller_address,
        "BuyerNTNCNIC": invoice.buyer_ntn_cnic,
        "BuyerBusinessName": invoice.buyer_business_name,
        "BuyerProvince": invoice.buyer_province,
        "BuyerAddress": invoice.buyer_address,
        "BuyerRegistrationType": invoice.buyer_registration_type,
        "TotalSalesValue": float(invoice.total_sales_value),
        "TotalTaxAmount": float(invoice.total_tax_amount),
        "TotalInvoiceValue": float(invoice.total_invoice_value),
        "Items": [
            {
                "HSCode": item.hs_code,
                "ProductDescription": item.product_description,
                "UOM": item.uom,
                "Quantity": float(item.quantity),
                "UnitPrice": float(item.unit_price),
                "ValueSalesExcludingST": float(item.value_sales_excluding_st),
                "SalesTaxApplicable": float(item.sales_tax_applicable),
                "SalesTaxWithheldAtSource": float(item.sales_tax_withheld_at_source or 0),
                "ExtraTax": float(item.extra_tax or 0),
                "FurtherTax": float(item.further_tax or 0),
                "FEDPayable": float(item.fed_payable or 0),
                "FixedNotifiedValue": float(item.fixed_notified_value or 0),
                "Discount": float(item.discount or 0),
                "SROScheduleNo": item.sro_schedule_no,
                "SROItemSerialNo": item.sro_item_serial_no,
                "SaleType": item.sale_type,
                "TotalValue": float(item.total_value)
            }
            for item in items
        ]
    }
    
    return fbr_json


def _recalculate_invoice_totals(session: SessionDep, invoice: FBRInvoice) -> dict:
    """
    Helper function to recalculate invoice totals.
    """
    items_statement = select(FBRInvoiceItem).where(FBRInvoiceItem.invoice_id == invoice.id)
    items = session.exec(items_statement).all()
    
    total_sales_value = sum(item.value_sales_excluding_st for item in items)
    total_tax_amount = sum(item.sales_tax_applicable for item in items)
    total_invoice_value = sum(item.total_value for item in items)
    
    invoice.total_sales_value = total_sales_value
    invoice.total_tax_amount = total_tax_amount
    invoice.total_invoice_value = total_invoice_value
    
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    return {
        "total_sales_value": total_sales_value,
        "total_tax_amount": total_tax_amount,
        "total_invoice_value": total_invoice_value
    }