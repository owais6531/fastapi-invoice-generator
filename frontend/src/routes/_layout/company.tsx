import {
  Box,
  Button,
  Container,
  Field as ChakraField,
  Heading,
  Input,
  Stack,
  Textarea,
  VStack,
  Card,
  CardBody,
  Select,
  Image,
  Text,
  Flex,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { useState } from "react"

import { type ApiError } from "@/client"
import { toaster } from "@/components/ui/toaster"

import {
  type CompanyPublic,
  type CompanyUpdate,
  CompaniesService,
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

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>()

  // Query to get company data
  const {
    data: company,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["company"],
    queryFn: () => CompaniesService.readCompanies({ skip: 0, limit: 1 }),
    select: (data) => data.data[0] || null,
  })

  // Mutation to create/update company
  const mutation = useMutation({
    mutationFn: (data: CompanyFormData) => {
      if (company?.id) {
        return CompaniesService.updateCompany({
          companyId: company.id,
          requestBody: data as CompanyUpdate,
        })
      } else {
        return CompaniesService.createCompany({
          requestBody: data,
        })
      }
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: company?.id ? "Company updated successfully" : "Company created successfully",
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
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Company Profile</Heading>
        <Text color="gray.600">
          Manage your business information for FBR invoicing. This information will be used as seller details in all invoices.
        </Text>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={6} align="stretch">
                {/* Logo Upload Section */}
                <ChakraField.Root>
                  <ChakraField.Label>Company Logo</ChakraField.Label>
                  <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
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
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <ChakraField.Root required invalid={!!errors.business_name}>
                    <ChakraField.Label>Business Name</ChakraField.Label>
                    <Input
                      {...register("business_name", {
                        required: "Business name is required",
                        maxLength: { value: 255, message: "Business name too long" },
                      })}
                      defaultValue={company?.business_name || ""}
                      placeholder="Enter your business name"
                    />
                    {errors.business_name && (
                      <ChakraField.ErrorText>{errors.business_name.message}</ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>

                  <ChakraField.Root required invalid={!!errors.ntn_cnic}>
                    <ChakraField.Label>NTN/CNIC</ChakraField.Label>
                    <Input
                      {...register("ntn_cnic", {
                        required: "NTN/CNIC is required",
                        maxLength: { value: 50, message: "NTN/CNIC too long" },
                      })}
                      defaultValue={company?.ntn_cnic || ""}
                      placeholder="Enter NTN or CNIC"
                    />
                    {errors.ntn_cnic && (
                      <ChakraField.ErrorText>{errors.ntn_cnic.message}</ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>
                </Stack>

                {/* Location Information */}
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <ChakraField.Root required invalid={!!errors.province}>
                    <ChakraField.Label>Province</ChakraField.Label>
                    <Select
                      {...register("province", {
                        required: "Province is required",
                      })}
                      defaultValue={company?.province || ""}
                      placeholder="Select province"
                    >
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </Select>
                    {errors.province && (
                      <ChakraField.ErrorText>{errors.province.message}</ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>

                  <ChakraField.Root required invalid={!!errors.city}>
                    <ChakraField.Label>City</ChakraField.Label>
                    <Input
                      {...register("city", {
                        required: "City is required",
                        maxLength: { value: 100, message: "City name too long" },
                      })}
                      defaultValue={company?.city || ""}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <ChakraField.ErrorText>{errors.city.message}</ChakraField.ErrorText>
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
                    defaultValue={company?.address || ""}
                    placeholder="Enter complete business address"
                    rows={3}
                  />
                  {errors.address && (
                    <ChakraField.ErrorText>{errors.address.message}</ChakraField.ErrorText>
                  )}
                </ChakraField.Root>

                {/* Contact Information */}
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <ChakraField.Root invalid={!!errors.phone}>
                    <ChakraField.Label>Phone (Optional)</ChakraField.Label>
                    <Input
                      {...register("phone", {
                        maxLength: { value: 20, message: "Phone number too long" },
                      })}
                      defaultValue={company?.phone || ""}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <ChakraField.ErrorText>{errors.phone.message}</ChakraField.ErrorText>
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
                      defaultValue={company?.email || ""}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <ChakraField.ErrorText>{errors.email.message}</ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>
                </Stack>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={isSubmitting || mutation.isPending}
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