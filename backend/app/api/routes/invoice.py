from fastapi import APIRouter, Form
from fastapi.responses import FileResponse, HTMLResponse
from typing import List
from app.services.invoice_pdf import generate_invoice_pdf
import os

router = APIRouter()

@router.post("/invoice/generate", response_class=HTMLResponse, tags=["invoice"])
async def generate_invoice(
    client_name: str = Form(...),
    client_phone: str = Form(""),
    client_email: str = Form(""),
    service_description: List[str] = Form(...),
    quantity: List[int] = Form(...),
    unit_price: List[float] = Form(...),
    notes: str = Form("")
):
    filename = generate_invoice_pdf(
        client_name=client_name,
        client_phone=client_phone,
        client_email=client_email,
        service_description=service_description,
        quantity=quantity,
        unit_price=unit_price,
        notes=notes
    )
    return f"""
    <div class='p-4 bg-green-100 rounded shadow'>
        <p class='text-green-800 font-semibold mb-2'>Invoice generated successfully!</p>
        <a href='/api/v1/invoice/download/{filename}' class='text-blue-700 underline'>Download Invoice</a>
    </div>
    """

@router.get("/invoice/download/{filename}", response_class=FileResponse, tags=["invoice"])
async def download_invoice(filename: str):
    file_path = os.path.join(os.path.dirname(__file__), "..", "..", "generated", filename)
    return FileResponse(path=file_path, filename=filename)
