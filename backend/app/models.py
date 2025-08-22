import uuid
from datetime import date, datetime
from typing import Union

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    company: Union["Company", None] = Relationship(back_populates="owner", cascade_delete=True)
    customers: list["Customer"] = Relationship(back_populates="owner", cascade_delete=True)
    products: list["Product"] = Relationship(back_populates="owner", cascade_delete=True)
    fbr_invoices: list["FBRInvoice"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


# Company/Seller models
class CompanyBase(SQLModel):
    business_name: str = Field(max_length=255)
    ntn_cnic: str = Field(max_length=50)
    province: str = Field(max_length=100)
    city: str = Field(max_length=100)
    address: str = Field(max_length=500)
    logo_url: str | None = Field(default=None, max_length=255)


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    business_name: str | None = Field(default=None, max_length=255)
    ntn_cnic: str | None = Field(default=None, max_length=50)
    province: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=500)
    logo_url: str | None = Field(default=None, max_length=255)


class Company(CompanyBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    owner: User | None = Relationship(back_populates="company")


class CompanyPublic(CompanyBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# Customer models
class CustomerBase(SQLModel):
    business_name: str = Field(max_length=255)
    ntn_cnic: str = Field(max_length=50)
    province: str = Field(max_length=100)
    city: str = Field(max_length=100)
    address: str = Field(max_length=500)
    registration_type: str = Field(max_length=20)  # "Registered" or "Unregistered"


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    business_name: str | None = Field(default=None, max_length=255)
    ntn_cnic: str | None = Field(default=None, max_length=50)
    province: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=500)
    registration_type: str | None = Field(default=None, max_length=20)


class Customer(CustomerBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    owner: User | None = Relationship(back_populates="customers")


class CustomerPublic(CustomerBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class CustomersPublic(SQLModel):
    data: list[CustomerPublic]
    count: int


# Product models
class ProductBase(SQLModel):
    hs_code: str = Field(max_length=20)
    description: str = Field(max_length=500)
    uom: str = Field(max_length=20)  # Unit of Measure
    unit_price: float = Field(ge=0)
    tax_rate: float = Field(ge=0, le=100)  # Percentage
    fixed_notified_value: float | None = Field(default=None, ge=0)
    sales_tax_withheld_rate: float | None = Field(default=None, ge=0, le=100)
    extra_tax_rate: float | None = Field(default=None, ge=0, le=100)
    further_tax_rate: float | None = Field(default=None, ge=0, le=100)
    fed_payable_rate: float | None = Field(default=None, ge=0, le=100)
    sro_schedule_no: str | None = Field(default=None, max_length=50)
    sro_item_serial_no: str | None = Field(default=None, max_length=50)
    sale_type: str = Field(default="standard", max_length=20)  # "standard" or "exempt"


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    hs_code: str | None = Field(default=None, max_length=20)
    description: str | None = Field(default=None, max_length=500)
    uom: str | None = Field(default=None, max_length=20)
    unit_price: float | None = Field(default=None, ge=0)
    tax_rate: float | None = Field(default=None, ge=0, le=100)
    fixed_notified_value: float | None = Field(default=None, ge=0)
    sales_tax_withheld_rate: float | None = Field(default=None, ge=0, le=100)
    extra_tax_rate: float | None = Field(default=None, ge=0, le=100)
    further_tax_rate: float | None = Field(default=None, ge=0, le=100)
    fed_payable_rate: float | None = Field(default=None, ge=0, le=100)
    sro_schedule_no: str | None = Field(default=None, max_length=50)
    sro_item_serial_no: str | None = Field(default=None, max_length=50)
    sale_type: str | None = Field(default=None, max_length=20)


class Product(ProductBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    owner: User | None = Relationship(back_populates="products")


class ProductPublic(ProductBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int


# FBR Invoice models
class FBRInvoiceBase(SQLModel):
    invoice_ref_no: str = Field(max_length=50)
    invoice_date: date = Field(default_factory=date.today)
    invoice_type: str = Field(default="Sale Invoice", max_length=50)
    scenario_id: str | None = Field(default=None, max_length=50)  # For testing

    # Seller Information
    seller_ntn_cnic: str = Field(max_length=50)
    seller_business_name: str = Field(max_length=255)
    seller_province: str = Field(max_length=100)
    seller_address: str = Field(max_length=500)

    # Buyer Information
    buyer_ntn_cnic: str = Field(max_length=50)
    buyer_business_name: str = Field(max_length=255)
    buyer_province: str = Field(max_length=100)
    buyer_address: str = Field(max_length=500)
    buyer_registration_type: str = Field(max_length=20)

    # Totals
    total_sales_value: float = Field(ge=0)
    total_tax_amount: float = Field(ge=0)
    total_invoice_value: float = Field(ge=0)


class FBRInvoiceCreate(FBRInvoiceBase):
    customer_id: uuid.UUID
    company_id: uuid.UUID


class FBRInvoiceUpdate(FBRInvoiceBase):
    invoice_ref_no: str | None = Field(default=None, max_length=50)
    invoice_date: date | None = Field(default=None)
    invoice_type: str | None = Field(default=None, max_length=50)
    scenario_id: str | None = Field(default=None, max_length=50)
    seller_ntn_cnic: str | None = Field(default=None, max_length=50)
    seller_business_name: str | None = Field(default=None, max_length=255)
    seller_province: str | None = Field(default=None, max_length=100)
    seller_address: str | None = Field(default=None, max_length=500)
    buyer_ntn_cnic: str | None = Field(default=None, max_length=50)
    buyer_business_name: str | None = Field(default=None, max_length=255)
    buyer_province: str | None = Field(default=None, max_length=100)
    buyer_address: str | None = Field(default=None, max_length=500)
    buyer_registration_type: str | None = Field(default=None, max_length=20)
    total_sales_value: float | None = Field(default=None, ge=0)
    total_tax_amount: float | None = Field(default=None, ge=0)
    total_invoice_value: float | None = Field(default=None, ge=0)
    customer_id: uuid.UUID | None = Field(default=None)
    company_id: uuid.UUID | None = Field(default=None)


class FBRInvoice(FBRInvoiceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    # Status and FBR Integration
    status: str = Field(default="draft", max_length=20)  # draft, submitted, posted, error
    fbr_reference: str | None = Field(default=None, max_length=100)
    fbr_response: str | None = Field(default=None)  # JSON response from FBR

    # Relationships
    customer_id: uuid.UUID = Field(foreign_key="customer.id", nullable=False)
    company_id: uuid.UUID = Field(foreign_key="company.id", nullable=False)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer | None = Relationship()
    company: Company | None = Relationship()
    owner: User | None = Relationship(back_populates="fbr_invoices")
    items: list["FBRInvoiceItem"] = Relationship(back_populates="invoice", cascade_delete=True)


class FBRInvoicePublic(FBRInvoiceBase):
    id: uuid.UUID
    status: str
    fbr_reference: str | None
    customer_id: uuid.UUID
    company_id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class FBRInvoicesPublic(SQLModel):
    data: list[FBRInvoicePublic]
    count: int


# FBR Invoice Item models
class FBRInvoiceItemBase(SQLModel):
    # Item Details
    hs_code: str = Field(max_length=20)
    product_description: str = Field(max_length=500)
    uom: str = Field(max_length=20)
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)

    # Tax Calculations
    value_sales_excluding_st: float = Field(ge=0)
    sales_tax_applicable: float = Field(ge=0)
    sales_tax_withheld_at_source: float | None = Field(default=None, ge=0)
    extra_tax: float | None = Field(default=None, ge=0)
    further_tax: float | None = Field(default=None, ge=0)
    fed_payable: float | None = Field(default=None, ge=0)

    # Additional Fields
    fixed_notified_value: float | None = Field(default=None, ge=0)
    discount: float | None = Field(default=None, ge=0)
    sro_schedule_no: str | None = Field(default=None, max_length=50)
    sro_item_serial_no: str | None = Field(default=None, max_length=50)
    sale_type: str = Field(default="standard", max_length=20)

    # Calculated Total
    total_value: float = Field(ge=0)


class FBRInvoiceItemCreate(FBRInvoiceItemBase):
    product_id: uuid.UUID


class FBRInvoiceItemUpdate(FBRInvoiceItemBase):
    hs_code: str | None = Field(default=None, max_length=20)
    product_description: str | None = Field(default=None, max_length=500)
    uom: str | None = Field(default=None, max_length=20)
    quantity: float | None = Field(default=None, gt=0)
    unit_price: float | None = Field(default=None, ge=0)
    value_sales_excluding_st: float | None = Field(default=None, ge=0)
    sales_tax_applicable: float | None = Field(default=None, ge=0)
    sales_tax_withheld_at_source: float | None = Field(default=None, ge=0)
    extra_tax: float | None = Field(default=None, ge=0)
    further_tax: float | None = Field(default=None, ge=0)
    fed_payable: float | None = Field(default=None, ge=0)
    fixed_notified_value: float | None = Field(default=None, ge=0)
    discount: float | None = Field(default=None, ge=0)
    sro_schedule_no: str | None = Field(default=None, max_length=50)
    sro_item_serial_no: str | None = Field(default=None, max_length=50)
    sale_type: str | None = Field(default=None, max_length=20)
    total_value: float | None = Field(default=None, ge=0)
    product_id: uuid.UUID | None = Field(default=None)


class FBRInvoiceItem(FBRInvoiceItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    invoice_id: uuid.UUID = Field(foreign_key="fbrinvoice.id", nullable=False)
    product_id: uuid.UUID = Field(foreign_key="product.id", nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    invoice: FBRInvoice | None = Relationship(back_populates="items")
    product: Product | None = Relationship()


class FBRInvoiceItemPublic(FBRInvoiceItemBase):
    id: uuid.UUID
    invoice_id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime


class FBRInvoiceItemsPublic(SQLModel):
    data: list[FBRInvoiceItemPublic]
    count: int
