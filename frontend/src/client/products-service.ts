// Temporary Products service with dummy endpoints
// This will be replaced with actual API integration

import type { CancelablePromise } from "./core/CancelablePromise"
import { request as __request } from "./core/request"

export interface ProductPublic {
  id: string
  hs_code: string
  description: string
  uom: string
  unit_price: number
  tax_rate: number
  fixed_notified_value?: number
  sales_tax_withheld_rate?: number
  extra_tax_rate?: number
  further_tax_rate?: number
  fed_payable_rate?: number
  sro_schedule_no?: string
  sro_item_serial_no?: string
  sale_type: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface ProductsPublic {
  data: ProductPublic[]
  count: number
}

export interface ProductCreate {
  hs_code: string
  description: string
  uom: string
  unit_price: number
  tax_rate: number
  fixed_notified_value?: number
  sales_tax_withheld_rate?: number
  extra_tax_rate?: number
  further_tax_rate?: number
  fed_payable_rate?: number
  sro_schedule_no?: string
  sro_item_serial_no?: string
  sale_type?: string
}

export interface ProductUpdate {
  hs_code?: string
  description?: string
  uom?: string
  unit_price?: number
  tax_rate?: number
  fixed_notified_value?: number
  sales_tax_withheld_rate?: number
  extra_tax_rate?: number
  further_tax_rate?: number
  fed_payable_rate?: number
  sro_schedule_no?: string
  sro_item_serial_no?: string
  sale_type?: string
}

export type { ProductCreate, ProductUpdate }

export class ProductsService {
  /**
   * Read Products
   * Retrieve products for the current user.
   */
  public static readProducts({
    skip = 0,
    limit = 100,
    search,
  }: {
    skip?: number
    limit?: number
    search?: string
  } = {}): CancelablePromise<ProductsPublic> {
    return __request({
      method: "GET",
      url: "/api/v1/products/",
      query: {
        skip,
        limit,
        search,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Product
   * Create new product.
   */
  public static createProduct({
    requestBody,
  }: {
    requestBody: ProductCreate
  }): CancelablePromise<ProductPublic> {
    return __request({
      method: "POST",
      url: "/api/v1/products/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Product
   * Get product by ID.
   */
  public static readProduct({
    productId,
  }: {
    productId: string
  }): CancelablePromise<ProductPublic> {
    return __request({
      method: "GET",
      url: `/api/v1/products/${productId}`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Product
   * Update a product.
   */
  public static updateProduct({
    productId,
    requestBody,
  }: {
    productId: string
    requestBody: ProductUpdate
  }): CancelablePromise<ProductPublic> {
    return __request({
      method: "PUT",
      url: `/api/v1/products/${productId}`,
      body: requestBody,
      mediaType: "application/json",
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Product
   * Delete a product.
   */
  public static deleteProduct({
    productId,
  }: {
    productId: string
  }): CancelablePromise<{ message: string }> {
    return __request({
      method: "DELETE",
      url: `/api/v1/products/${productId}`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }
}