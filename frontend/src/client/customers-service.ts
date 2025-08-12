// Temporary Customers service with dummy endpoints
// This will be replaced with actual API integration

import type { CancelablePromise } from "./core/CancelablePromise"
import { request as __request } from "./core/request"

export interface CustomerPublic {
  id: string
  business_name: string
  ntn_cnic: string
  province: string
  city: string
  address: string
  registration_type: string
  phone?: string
  email?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface CustomersPublic {
  data: CustomerPublic[]
  count: number
}

export interface CustomerCreate {
  business_name: string
  ntn_cnic: string
  province: string
  city: string
  address: string
  registration_type: string
  phone?: string
  email?: string
}

export interface CustomerUpdate {
  business_name?: string
  ntn_cnic?: string
  province?: string
  city?: string
  address?: string
  registration_type?: string
  phone?: string
  email?: string
}

export type { CustomerCreate, CustomerUpdate }

export class CustomersService {
  /**
   * Read Customers
   * Retrieve customers for the current user.
   */
  public static readCustomers({
    skip = 0,
    limit = 100,
    search,
  }: {
    skip?: number
    limit?: number
    search?: string
  } = {}): CancelablePromise<CustomersPublic> {
    return __request({
      method: "GET",
      url: "/api/v1/customers/",
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
   * Create Customer
   * Create new customer.
   */
  public static createCustomer({
    requestBody,
  }: {
    requestBody: CustomerCreate
  }): CancelablePromise<CustomerPublic> {
    return __request({
      method: "POST",
      url: "/api/v1/customers/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Customer
   * Get customer by ID.
   */
  public static readCustomer({
    customerId,
  }: {
    customerId: string
  }): CancelablePromise<CustomerPublic> {
    return __request({
      method: "GET",
      url: `/api/v1/customers/${customerId}`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Customer
   * Update a customer.
   */
  public static updateCustomer({
    customerId,
    requestBody,
  }: {
    customerId: string
    requestBody: CustomerUpdate
  }): CancelablePromise<CustomerPublic> {
    return __request({
      method: "PUT",
      url: `/api/v1/customers/${customerId}`,
      body: requestBody,
      mediaType: "application/json",
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Customer
   * Delete a customer.
   */
  public static deleteCustomer({
    customerId,
  }: {
    customerId: string
  }): CancelablePromise<{ message: string }> {
    return __request({
      method: "DELETE",
      url: `/api/v1/customers/${customerId}`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }
}