// Temporary Companies service with dummy endpoints
// This will be replaced with actual API integration

import type { CancelablePromise } from "./core/CancelablePromise"
import { request as __request } from "./core/request"

export interface CompanyPublic {
  id: string
  business_name: string
  ntn_cnic: string
  province: string
  city: string
  address: string
  phone?: string
  email?: string
  logo_url?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface CompaniesPublic {
  data: CompanyPublic[]
  count: number
}

export interface CompanyCreate {
  business_name: string
  ntn_cnic: string
  province: string
  city: string
  address: string
  phone?: string
  email?: string
  logo_url?: string
}

export interface CompanyUpdate {
  business_name?: string
  ntn_cnic?: string
  province?: string
  city?: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string
}

export type { CompanyUpdate }

export class CompaniesService {
  /**
   * Read Companies
   * Retrieve companies for the current user.
   */
  public static readCompanies({
    skip = 0,
    limit = 100,
  }: {
    skip?: number
    limit?: number
  } = {}): CancelablePromise<CompaniesPublic> {
    return __request({
      method: "GET",
      url: "/api/v1/companies/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Company
   * Create new company.
   */
  public static createCompany({
    requestBody,
  }: {
    requestBody: CompanyCreate
  }): CancelablePromise<CompanyPublic> {
    return __request({
      method: "POST",
      url: "/api/v1/companies/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Company
   * Get company by ID.
   */
  public static readCompany({
    companyId,
  }: {
    companyId: string
  }): CancelablePromise<CompanyPublic> {
    return __request({
      method: "GET",
      url: `/api/v1/companies/${companyId}`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Company
   * Update a company.
   */
  public static updateCompany({
    companyId,
    requestBody,
  }: {
    companyId: string
    requestBody: CompanyUpdate
  }): CancelablePromise<CompanyPublic> {
    return __request({
      method: "PUT",
      url: `/api/v1/companies/${companyId}`,
      body: requestBody,
      mediaType: "application/json",
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Company
   * Delete a company.
   */
  public static deleteCompany({
    companyId,
  }: {
    companyId: string
  }): CancelablePromise<{ message: string }> {
    return __request({
      method: "DELETE",
      url: `/api/v1/companies/${companyId}`,
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }
}