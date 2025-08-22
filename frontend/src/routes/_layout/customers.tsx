import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { InputGroup } from "@/components/ui/input-group"
import { Select } from "@/components/ui/select"
import { toaster } from "@/components/ui/toaster"
import {
  Badge,
  Field as ChakraField,
  Container,
  Dialog,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Table,
  Text,
  Textarea,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiEdit, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi"
import { z } from "zod"

import type { ApiError } from "@/client"
import {
  type CustomerPublic,
  type CustomerUpdate,
  CustomersService,
} from "@/client"

interface CustomerFormData {
  business_name: string
  ntn_cnic: string
  province: string
  city: string
  address: string
  registration_type: string
  phone?: string
  email?: string
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

const registrationTypes = [
  { value: "Registered", label: "Registered" },
  { value: "Unregistered", label: "Unregistered" },
]

const customersSearchSchema = z.object({
  page: z.number().catch(1),
  search: z.string().catch(""),
})

const PER_PAGE = 10

export const Route = createFileRoute("/_layout/customers")({
  component: () => <CustomersPage />,
  validateSearch: customersSearchSchema,
})

function CustomersPage() {
  const { page = 1, search = "" } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()

  const { open, onOpen, onClose } = useDisclosure()
  const [editingCustomer, setEditingCustomer] = useState<CustomerPublic | null>(
    null,
  )
  const [searchTerm, setSearchTerm] = useState(search)

  // Use ChakraField components directly

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>()

  // Query to get customers
  const {
    data: customers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "customers",
      { skip: (page - 1) * PER_PAGE, limit: PER_PAGE, search },
    ],
    queryFn: () =>
      CustomersService.readCustomers({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        search: search,
      }),
  })

  // Mutation to create customer
  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      CustomersService.createCustomer({ requestBody: data }),
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Customer created successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onClose()
      reset()
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
        duration: 5000,
      })
    },
  })

  // Mutation to update customer
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: CustomerFormData
    }) =>
      CustomersService.updateCustomer({
        customerId: id,
        requestBody: data as CustomerUpdate,
      }),
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Customer updated successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onClose()
      reset()
      setEditingCustomer(null)
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
      })
    },
  })

  // Mutation to delete customer
  const deleteMutation = useMutation({
    mutationFn: (id: string) => CustomersService.deleteCustomer({ customerId: id }),
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Customer deleted successfully",
        type: "success",
        duration: 5000,
      })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
      })
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (customer: CustomerPublic) => {
    setEditingCustomer(customer)
    reset({
      business_name: customer.business_name,
      ntn_cnic: customer.ntn_cnic,
      province: customer.province,
      city: customer.city,
      address: customer.address,
      registration_type: customer.registration_type,
      phone: customer.phone || "",
      email: customer.email || "",
    })
    onOpen()
  }

  const handleAdd = () => {
    setEditingCustomer(null)
    reset()
    onOpen()
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id)
    }
  }

  const handleSearch = () => {
    navigate({
      search: { page: 1, search: searchTerm },
    })
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack gap={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Customer Management</Heading>
          <Button colorPalette="blue" onClick={handleAdd}>
            <FiPlus />
            Add Customer
          </Button>
        </Flex>

        {/* Search Bar */}
        <Card>
          <CardBody>
            <Flex gap={4}>
              <InputGroup flex={1} startElement={<FiSearch />}>
                <Input
                  placeholder="Search customers by name, NTN/CNIC, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </InputGroup>
              <Button onClick={handleSearch}>Search</Button>
            </Flex>
          </CardBody>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardBody>
            {isLoading ? (
              <Text>Loading customers...</Text>
            ) : isError ? (
              <Text color="red.500">Error loading customers</Text>
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Business Name</Table.ColumnHeader>
                    <Table.ColumnHeader>NTN/CNIC</Table.ColumnHeader>
                    <Table.ColumnHeader>Location</Table.ColumnHeader>
                    <Table.ColumnHeader>Registration</Table.ColumnHeader>
                    <Table.ColumnHeader>Contact</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {customers?.data.map((customer: CustomerPublic) => (
                    <Table.Row key={customer.id}>
                      <Table.Cell>
                        <Text fontWeight="medium">
                          {customer.business_name}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{customer.ntn_cnic}</Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {customer.city}, {customer.province}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorScheme={
                            customer.registration_type === "Registered"
                              ? "green"
                              : "orange"
                          }
                        >
                          {customer.registration_type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <VStack align="start" gap={0}>
                          {customer.phone && (
                            <Text fontSize="sm">{customer.phone}</Text>
                          )}
                          {customer.email && (
                            <Text fontSize="sm">{customer.email}</Text>
                          )}
                        </VStack>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={2}>
                          <IconButton
                            aria-label="Edit customer"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <FiEdit />
                          </IconButton>
                          <IconButton
                            aria-label="Delete customer"
                            size="sm"
                            colorPalette="red"
                            variant="ghost"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}

            {customers?.data.length === 0 && (
              <Text textAlign="center" py={8} color="gray.500">
                No customers found. Add your first customer to get started.
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Add/Edit Customer Dialog */}
      <Dialog.Root
        open={open}
        onOpenChange={(e) => !e.open && onClose()}
        size="xl"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <VStack gap={4}>
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
                      placeholder="Enter business name"
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

                  <Flex gap={4} w="full">
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
                  </Flex>

                  <ChakraField.Root required invalid={!!errors.address}>
                    <ChakraField.Label>Address</ChakraField.Label>
                    <Textarea
                      {...register("address", {
                        required: "Address is required",
                        maxLength: { value: 500, message: "Address too long" },
                      })}
                      placeholder="Enter complete address"
                      rows={3}
                    />
                    {errors.address && (
                      <ChakraField.ErrorText>
                        {errors.address.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>

                  <ChakraField.Root
                    required
                    invalid={!!errors.registration_type}
                  >
                    <ChakraField.Label>Registration Type</ChakraField.Label>
                    <Select
                      {...register("registration_type", {
                        required: "Registration type is required",
                      })}
                      placeholder="Select registration type"
                    >
                      {registrationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    {errors.registration_type && (
                      <ChakraField.ErrorText>
                        {errors.registration_type.message}
                      </ChakraField.ErrorText>
                    )}
                  </ChakraField.Root>

                  <Flex gap={4} w="full">
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
                  </Flex>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={
                    isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  loadingText={editingCustomer ? "Updating..." : "Creating..."}
                >
                  {editingCustomer ? "Update" : "Create"}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Container>
  )
}
