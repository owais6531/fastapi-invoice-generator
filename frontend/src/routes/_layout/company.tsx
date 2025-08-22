import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import {
  Box,
  Field as ChakraField,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import type { ApiError } from "@/client"
import { toaster } from "@/components/ui/toaster"

import {
  CompaniesService,
  type CompanyUpdate,
} from "@/client/companies-service"

interface CompanyFormData {
  business_name: string
  ntn_cnic: string
  province: string
  city: string
  address: string
  phone?: string
  email?: string
  logo_url?: string
}

const provinces = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
]

export const Route = createFileRoute("/_layout/company")({
  component: CompanyProfile,
})

function CompanyProfile() {
  const queryClient = useQueryClient()

  const [, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Query to get company data
  const {
    data: company,
    isLoading,
  } = useQuery({
    queryKey: ["company"],
    queryFn: () => CompaniesService.readCompany(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>()

  // Reset form when company data is loaded
  useEffect(() => {
    if (company) {
      reset({
        business_name: company.business_name || "",
        ntn_cnic: company.ntn_cnic || "",
        province: company.province || "",
        city: company.city || "",
        address: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
        logo_url: company.logo_url || "",
      })
    }
  }, [company, reset])

  // Mutation to create/update company
  const mutation = useMutation({
    mutationFn: (data: CompanyFormData) => {
      if (company?.id) {
        return CompaniesService.updateCompany({
          requestBody: data as CompanyUpdate,
        })
      }
      return CompaniesService.createCompany({
        requestBody: data,
      })
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: company?.id
          ? "Company updated successfully"
          : "Company created successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["company"] })
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
      })
    },
  })

  const onSubmit = async (data: CompanyFormData) => {
    mutation.mutate(data)
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack gap={8} align="stretch">
        <Heading size="lg">Company Profile</Heading>
        <Text color="gray.600">
          Manage your business information for FBR invoicing. This information
          will be used as seller details in all invoices.
        </Text>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack gap={6} align="stretch">
                {/* Logo Upload Section */}
                <ChakraField.Root>
                  <ChakraField.Label>Company Logo</ChakraField.Label>
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                    align="center"
                  >
                    <Box>
                      {(logoPreview || company?.logo_url) && (
                        <Image
                          src={logoPreview || company?.logo_url}
                          alt="Company Logo"
                          maxH="100px"
                          maxW="200px"
                          objectFit="contain"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          p={2}
                        />
                      )}
                    </Box>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      size="sm"
                      maxW="300px"
                    />
                  </Flex>
                </ChakraField.Root>

                {/* Business Information */}
                <Stack direction={{ base: "column", md: "row" }} gap={4}>
                  <ChakraField.Root required invalid={!!errors.business_name}>
                    <ChakraField.Label>Business Name</ChakraField.Label>
                    <Input
                      {...register("business_name", {
                        required: "Business name is required",
                        maxLength: {
                          value: 255,
                          message: "Business name too long",
                        },
                      })}
                      placeholder="Enter your business name"
                    />
                    {errors.business_name && (
                      <ChakraField.ErrorText>
                        {errors.business_name.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>

                  <ChakraField.Root required invalid={!!errors.ntn_cnic}>
                    <ChakraField.Label>NTN/CNIC</ChakraField.Label>
                    <Input
                      {...register("ntn_cnic", {
                        required: "NTN/CNIC is required",
                        maxLength: { value: 50, message: "NTN/CNIC too long" },
                      })}
                      placeholder="Enter NTN or CNIC"
                    />
                    {errors.ntn_cnic && (
                      <ChakraField.ErrorText>
                        {errors.ntn_cnic.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>
                </Stack>

                {/* Location Information */}
                <Stack direction={{ base: "column", md: "row" }} gap={4}>
                  <ChakraField.Root required invalid={!!errors.province}>
                    <ChakraField.Label>Province</ChakraField.Label>
                    <Select
                      {...register("province", {
                        required: "Province is required",
                      })}
                      placeholder="Select province"
                    >
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </Select>
                    {errors.province && (
                      <ChakraField.ErrorText>
                        {errors.province.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>

                  <ChakraField.Root required invalid={!!errors.city}>
                    <ChakraField.Label>City</ChakraField.Label>
                    <Input
                      {...register("city", {
                        required: "City is required",
                        maxLength: {
                          value: 100,
                          message: "City name too long",
                        },
                      })}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <ChakraField.ErrorText>
                        {errors.city.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>
                </Stack>

                {/* Address */}
                <ChakraField.Root required invalid={!!errors.address}>
                  <ChakraField.Label>Address</ChakraField.Label>
                  <Textarea
                    {...register("address", {
                      required: "Address is required",
                      maxLength: { value: 500, message: "Address too long" },
                    })}
                    placeholder="Enter complete business address"
                    rows={3}
                  />
                  {errors.address && (
                    <ChakraField.ErrorText>
                      {errors.address.message}
                    </ChakraField.ErrorText>
                  )}
                </ChakraField.Root>

                {/* Contact Information */}
                <Stack direction={{ base: "column", md: "row" }} gap={4}>
                  <ChakraField.Root invalid={!!errors.phone}>
                    <ChakraField.Label>Phone (Optional)</ChakraField.Label>
                    <Input
                      {...register("phone", {
                        maxLength: {
                          value: 20,
                          message: "Phone number too long",
                        },
                      })}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <ChakraField.ErrorText>
                        {errors.phone.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>

                  <ChakraField.Root invalid={!!errors.email}>
                    <ChakraField.Label>Email (Optional)</ChakraField.Label>
                    <Input
                      type="email"
                      {...register("email", {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <ChakraField.ErrorText>
                        {errors.email.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>
                </Stack>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorPalette="blue"
                  size="lg"
                  loading={isSubmitting || mutation.isPending}
                  loadingText={company?.id ? "Updating..." : "Creating..."}
                >
                  {company?.id ? "Update Company" : "Create Company"}
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
