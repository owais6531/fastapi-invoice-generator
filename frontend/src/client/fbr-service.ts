// Temporary FBR service with dummy endpoints
// This will be replaced with actual FBR API integration

import type { ApiError } from "./core/ApiError"
import type { CancelablePromise } from "./core/CancelablePromise"
import { request as __request } from "./core/request"

export interface FBRInvoicePublic {
  id: string
  invoice_ref_no: string
  invoice_date: string
  invoice_type: string
  seller_business_name: string
  buyer_business_name: string
  total_invoice_value: number
  status: string
  fbr_reference?: string
  customer_id: string
  company_id: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface FBRInvoicesPublic {
  data: FBRInvoicePublic[]
  count: number
}

export interface FBRInvoiceCreate {
  invoice_ref_no: string
  invoice_date: string
  invoice_type: string
  seller_ntn_cnic: string
  seller_business_name: string
  seller_province: string
  seller_address: string
  buyer_ntn_cnic: string
  buyer_business_name: string
  buyer_province: string
  buyer_address: string
  buyer_registration_type: string
  total_sales_value: number
  total_tax_amount: number
  total_invoice_value: number
  customer_id: string
  company_id: string
}

export interface FBRInvoiceUpdate {
  invoice_ref_no?: string
  invoice_date?: string
  invoice_type?: string
  seller_ntn_cnic?: string
  seller_business_name?: string
  seller_province?: string
  seller_address?: string
  buyer_ntn_cnic?: string
  buyer_business_name?: string
  buyer_province?: string
  buyer_address?: string
  buyer_registration_type?: string
  total_sales_value?: number
  total_tax_amount?: number
  total_invoice_value?: number
}

export interface FBRInvoiceItemCreate {
  product_id: string
  description: string
  hs_code?: string
  quantity: number
  unit_price: number
  discount_amount: number
  sales_tax_rate: number
  sales_tax_amount: number
  total_amount: number
}

export type { FBRInvoiceCreate, FBRInvoiceUpdate, FBRInvoiceItemCreate }

export class FBRInvoicesService {
  /**
   * Read FBR Invoices
   * Retrieve FBR invoices for the current user.
   */
  public static readFbrInvoices({
    skip = 0,
    limit = 100,
    status,
  }: {
    skip?: number
    limit?: number
    status?: string
  } = {}): CancelablePromise<FBRInvoicesPublic> {
    return __request({
      method: "GET",
      url: "/api/v1/fbr-invoices/",
      query: {
        skip,
        limit,
        status,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create FBR Invoice
   * Create new FBR invoice.
   */
  public static createFbrInvoice({
    requestBody,
  }: {
    requestBody: FBRInvoiceCreate
  }): CancelablePromise<FBRInvoicePublic> {
    return __request({
      method: "POST",
      url: "/api/v1/fbr-invoices/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read FBR Invoice
   * Get FBR invoice by ID.
   */
  public static readFbrInvoice({
    invoiceId,
  }: {
    invoiceId: string
  }): CancelablePromise<FBRInvoicePublic> {
    return __request({
      method: "GET",
      url: `/api/v1/fbr-invoices/${invoiceId}`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Update FBR Invoice
   * Update an FBR invoice.
   */
  public static updateFbrInvoice({
    invoiceId,
    requestBody,
  }: {
    invoiceId: string
    requestBody: FBRInvoiceUpdate
  }): CancelablePromise<FBRInvoicePublic> {
    return __request({
      method: "PUT",
      url: `/api/v1/fbr-invoices/${invoiceId}`,
      body: requestBody,
      mediaType: "application/json",
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Clone FBR Invoice
   * Clone an existing FBR invoice.
   */
  public static cloneFbrInvoice({
    invoiceId,
  }: {
    invoiceId: string
  }): CancelablePromise<FBRInvoicePublic> {
    return __request({
      method: "POST",
      url: `/api/v1/fbr-invoices/${invoiceId}/clone`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Submit to FBR (Dummy Implementation)
   * Submit invoice to FBR API - currently using dummy endpoint.
   */
  public static submitToFbr({
    invoiceId,
  }: {
    invoiceId: string
  }): CancelablePromise<{
    message: string
    fbr_reference: string
    status: string
  }> {
    return __request({
      method: "POST",
      url: `/api/v1/fbr-invoices/${invoiceId}/submit-to-fbr`,
      errors: {
        400: "Bad Request",
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Generate FBR JSON
   * Generate FBR JSON format for the invoice.
   */
  public static getFbrJson({
    invoiceId,
  }: {
    invoiceId: string
  }): CancelablePromise<Record<string, any>> {
    return __request({
      method: "GET",
      url: `/api/v1/fbr-invoices/${invoiceId}/fbr-json`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Generate PDF
   * Generate PDF for the invoice.
   */
  public static generatePdf({
    invoiceId,
  }: {
    invoiceId: string
  }): CancelablePromise<Blob> {
    return __request({
      method: "GET",
      url: `/api/v1/fbr-invoices/${invoiceId}/pdf`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }
}