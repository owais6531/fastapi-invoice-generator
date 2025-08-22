// Temporary Companies service with dummy endpoints
// This will be replaced with actual API integration

import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
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

export class CompaniesService {
  /**
   * Read Company
   * Retrieve company for the current user.
   */
  public static readCompany(): CancelablePromise<CompanyPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/companies/",
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Companies
   * Retrieve companies for the current user (wrapper for compatibility).
   */
  public static readCompanies({
    skip = 0,
    limit = 100,
  }: {
    skip?: number
    limit?: number
  } = {}): CancelablePromise<CompaniesPublic> {
    // Since backend only supports one company per user, we wrap the single company response
    // Note: skip and limit parameters are ignored since we only have one company
    void skip; void limit; // Suppress unused parameter warnings
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/companies/me",
      errors: {
        422: "Validation Error",
      },
    }).then((company: unknown): CompaniesPublic => ({
      data: [company as CompanyPublic],
      count: 1,
    })) as CancelablePromise<CompaniesPublic>
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
    return __request(OpenAPI, {
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
   * Update Company
   * Update the current user's company.
   */
  public static updateCompany({
    requestBody,
  }: {
    requestBody: CompanyUpdate
  }): CancelablePromise<CompanyPublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/companies/",
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
   * Delete the current user's company.
   */
  public static deleteCompany(): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/companies/",
      errors: {
        404: "Not Found",
        422: "Validation Error",
      },
    })
  }
}
