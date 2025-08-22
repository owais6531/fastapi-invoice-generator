import os
from datetime import datetime

from fpdf import FPDF


def generate_invoice_pdf(
    client_name: str,
    client_phone: str = "",
    client_email: str = "",
    service_description: list[str] | None = None,
    quantity: list[int] | None = None,
    unit_price: list[float] | None = None,
    notes: str = ""
) -> str:
    if service_description is None:
        service_description = []
    if quantity is None:
        quantity = []
    if unit_price is None:
        unit_price = []
    subtotal = 0
    line_totals = []
    for i in range(len(service_description)):
        line_total = quantity[i] * unit_price[i]
        line_totals.append(line_total)
        subtotal += line_total
    tax = subtotal * 0.17  # 17% VAT
    total = subtotal + tax
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(200, 10, "INVOICE", ln=True, align="C")
    pdf.set_font("Arial", "", 12)
    pdf.ln(10)
    pdf.cell(100, 10, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)
    pdf.cell(100, 10, f"Client: {client_name}", ln=True)
    if client_email:
        pdf.cell(100, 10, f"Email: {client_email}", ln=True)
    if client_phone:
        pdf.cell(100, 10, f"Phone: {client_phone}", ln=True)
    pdf.ln(10)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(80, 10, "Description", 1)
    pdf.cell(30, 10, "Quantity", 1)
    pdf.cell(40, 10, "Unit Price", 1)
    pdf.cell(40, 10, "Total", 1)
    pdf.ln()
    pdf.set_font("Arial", "", 12)
    for i in range(len(service_description)):
        pdf.cell(80, 10, service_description[i], 1)
        pdf.cell(30, 10, str(quantity[i]), 1)
        pdf.cell(40, 10, f"${unit_price[i]:.2f}", 1)
        pdf.cell(40, 10, f"${line_totals[i]:.2f}", 1)
        pdf.ln()
    pdf.ln(5)
    pdf.cell(100, 10, f"Subtotal: ${subtotal:.2f}", ln=True)
    pdf.cell(100, 10, f"Tax (17%): ${tax:.2f}", ln=True)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(100, 10, f"Total: ${total:.2f}", ln=True)
    if notes:
        pdf.ln(10)
        pdf.set_font("Arial", "", 12)
        pdf.multi_cell(0, 10, f"Notes: {notes}")
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"invoice_{client_name.replace(' ', '_')}_{date_str}.pdf"
    output_dir = os.path.join(os.path.dirname(__file__), "..", "generated")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, filename)
    pdf.output(output_path)
    return filename
