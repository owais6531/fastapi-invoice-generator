import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { toaster } from "@/components/ui/toaster"
import {
  Box,
  Field as ChakraField,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  Input,
  NumberInput,
  Separator,
  Table,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import DatePicker from "react-datepicker"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiSave,
  FiSend,
  FiTrash2,
  FiUser,
} from "react-icons/fi"
import { z } from "zod"
import "react-datepicker/dist/react-datepicker.css"

import type { ApiError } from "@/client"
import { CompaniesService } from "@/client/companies-service"
import { CustomersService } from "@/client/customers-service"
import {
  type FBRInvoiceCreate,
  FBRInvoicesService,
} from "@/client/fbr-service"
import { ProductsService } from "@/client/products-service"

const invoiceItemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  item_description: z.string().min(1, "Description is required"),
  hs_code: z.string().min(1, "HS Code is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit_price: z.number().min(0.01, "Unit price must be greater than 0"),
  discount_amount: z.number().min(0).default(0),
  sales_tax_rate: z.number().min(0).max(100).default(17),
  sales_tax_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
})

const invoiceSchema = z.object({
  invoice_ref_no: z.string().min(1, "Invoice reference is required"),
  invoice_date: z.date(),
  invoice_type: z
    .enum(["normal", "credit_note", "debit_note"])
    .default("normal"),
  customer_id: z.string().min(1, "Customer is required"),
  buyer_business_name: z.string().min(1, "Buyer business name is required"),
  buyer_ntn: z.string().optional(),
  buyer_cnic: z.string().optional(),
  buyer_province: z.string().min(1, "Province is required"),
  buyer_city: z.string().min(1, "City is required"),
  buyer_address: z.string().min(1, "Address is required"),
  buyer_registration_type: z.enum(["Registered", "Unregistered"]).default("Registered"),
  buyer_phone: z.string().optional(),
  buyer_email: z.string().email().optional().or(z.literal("")),
  payment_terms: z.string().optional(),
  due_date: z.date().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

function CreateInvoicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_date: new Date(),
      invoice_type: "normal",
      buyer_registration_type: "Registered",
      items: [
        {
          product_id: "",
          item_description: "",
          hs_code: "",
          quantity: 1,
          unit_price: 0,
          discount_amount: 0,
          sales_tax_rate: 17,
          sales_tax_amount: 0,
          total_amount: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")

  // Queries
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers({ limit: 1000 }),
  })

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductsService.readProducts({ limit: 1000 }),
  })

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => CompaniesService.readCompany(),
  })

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: (data: FBRInvoiceCreate) =>
      FBRInvoicesService.createFbrInvoice({ requestBody: data }),
    onSuccess: (invoice) => {
      toaster.create({
        title: "Success",
        description: "Invoice created successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["fbr-invoices"] })
      navigate({
        to: `/invoices/${invoice.id}`,
        params: { invoiceId: invoice.id },
      })
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message || "Failed to create invoice",
        type: "error",
      })
    },
  })

  const submitToFBRMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      FBRInvoicesService.submitToFbr({ invoiceId }),
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Invoice submitted to FBR successfully",
        type: "success",
      })
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message || "Failed to submit to FBR",
        type: "error",
      })
    },
  })

  // Calculate item totals
  const calculateItemTotal = (index: number) => {
    const item = watchedItems[index]
    if (!item) return

    const subtotal = item.quantity * item.unit_price - item.discount_amount
    const taxAmount = (subtotal * item.sales_tax_rate) / 100
    const total = subtotal + taxAmount

    setValue(`items.${index}.sales_tax_amount`, taxAmount)
    setValue(`items.${index}.total_amount`, total)
  }

  // Auto-fill customer data
  const handleCustomerChange = (customerId: string) => {
    const customer = customers?.data.find((c) => c.id === customerId)
    if (customer) {
      setValue("buyer_business_name", customer.business_name)
      setValue("buyer_ntn", customer.ntn_cnic || "")
      setValue("buyer_cnic", customer.ntn_cnic || "")
      setValue("buyer_province", customer.province)
      setValue("buyer_city", customer.city)
      setValue("buyer_address", customer.address)
      setValue("buyer_registration_type", customer.registration_type as "Registered" | "Unregistered")
      setValue("buyer_phone", customer.phone || "")
      setValue("buyer_email", customer.email || "")
    }
  }

  // Auto-fill product data
  const handleProductChange = (index: number, productId: string) => {
    const product = products?.data.find((p) => p.id === productId)
    if (product) {
      setValue(`items.${index}.item_description`, product.description)
      setValue(`items.${index}.hs_code`, product.hs_code)
      setValue(`items.${index}.unit_price`, product.unit_price)
      setValue(`items.${index}.sales_tax_rate`, product.tax_rate)
      calculateItemTotal(index)
    }
  }

  const onSubmit = async (data: InvoiceFormData, submitToFBR = false) => {
    try {
      const invoiceData: FBRInvoiceCreate = {
        invoice_ref_no: data.invoice_ref_no,
        invoice_date: format(data.invoice_date, "yyyy-MM-dd"),
        invoice_type: data.invoice_type,
        seller_business_name: company?.business_name || "",
        seller_ntn_cnic: company?.ntn_cnic || "",
        seller_province: company?.province || "",
        seller_address: company?.address || "",
        buyer_ntn_cnic: data.buyer_ntn || data.buyer_cnic || "",
        buyer_business_name: data.buyer_business_name,
        buyer_province: data.buyer_province,
        buyer_address: data.buyer_address,
        buyer_registration_type: data.buyer_registration_type,
        total_sales_value: watchedItems.reduce(
          (sum, item) => sum + (item.total_amount - item.sales_tax_amount),
          0,
        ),
        total_tax_amount: watchedItems.reduce(
          (sum, item) => sum + item.sales_tax_amount,
          0,
        ),
        total_invoice_value: watchedItems.reduce(
          (sum, item) => sum + item.total_amount,
          0,
        ),
        customer_id: data.customer_id,
        company_id: company?.id || "",
      }

      const invoice = await createInvoiceMutation.mutateAsync(invoiceData)

      if (submitToFBR) {
        await submitToFBRMutation.mutateAsync(invoice.id)
      }
    } catch (error) {
      // Error handling is done in mutation onError
    }
  }

  const totalInvoiceValue = watchedItems.reduce(
    (sum, item) => sum + item.total_amount,
    0,
  )
  const totalSalesTax = watchedItems.reduce(
    (sum, item) => sum + item.sales_tax_amount,
    0,
  )
  const totalDiscount = watchedItems.reduce(
    (sum, item) => sum + item.discount_amount,
    0,
  )

  return (
    <Container maxW="7xl" py={8}>
      <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
        <VStack gap={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg">Create New Invoice</Heading>
            <HStack>
              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Saving..."
              >
                <FiSave />
                Save as Draft
              </Button>
              <Button
                onClick={handleSubmit((data) => onSubmit(data, true))}
                colorPalette="blue"
                loading={isSubmitting}
                loadingText="Submitting..."
              >
                <FiSend />
                Save & Submit to FBR
              </Button>
            </HStack>
          </Flex>

          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <HStack>
                <FiFileText />
                <Heading size="md">Invoice Details</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Grid
                templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                gap={6}
              >
                <ChakraField.Root invalid={!!errors.invoice_ref_no}>
                  <ChakraField.Label>Invoice Reference No.</ChakraField.Label>
                  <Input
                    {...register("invoice_ref_no")}
                    placeholder="INV-001"
                  />
                  <ChakraField.ErrorText>
                    {errors.invoice_ref_no?.message}
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <ChakraField.Root invalid={!!errors.invoice_date}>
                  <ChakraField.Label>Invoice Date</ChakraField.Label>
                  <Controller
                    name="invoice_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        dateFormat="yyyy-MM-dd"
                        className="chakra-input"
                      />
                    )}
                  />
                  <ChakraField.ErrorText>
                    {errors.invoice_date?.message}
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <ChakraField.Root>
                  <ChakraField.Label>Invoice Type</ChakraField.Label>
                  <Controller
                    name="invoice_type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onChange={field.onChange}>
                        <option value="normal">Normal Invoice</option>
                        <option value="credit_note">Credit Note</option>
                        <option value="debit_note">Debit Note</option>
                      </Select>
                    )}
                  />
                </ChakraField.Root>

                <ChakraField.Root>
                  <ChakraField.Label>Due Date</ChakraField.Label>
                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        dateFormat="yyyy-MM-dd"
                        customInput={<Input />}
                        isClearable
                      />
                    )}
                  />
                </ChakraField.Root>
              </Grid>
            </CardBody>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <HStack>
                <FiUser />
                <Heading size="md">Customer Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack gap={4} align="stretch">
                <ChakraField.Root invalid={!!errors.customer_id}>
                  <ChakraField.Label>Select Customer</ChakraField.Label>
                  <Controller
                    name="customer_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                          handleCustomerChange(e.target.value)
                        }}
                        placeholder="Choose a customer..."
                      >
                        {customers?.data.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.business_name} -{" "}
                            {customer.ntn_cnic}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <ChakraField.ErrorText>
                    {errors.customer_id?.message}
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <Grid
                  templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                  gap={4}
                >
                  <ChakraField.Root invalid={!!errors.buyer_business_name}>
                    <ChakraField.Label>Business Name</ChakraField.Label>
                    <Input {...register("buyer_business_name")} />
                    <ChakraField.ErrorText>
                      {errors.buyer_business_name?.message}
                    </ChakraField.ErrorText>
                  </ChakraField.Root>

                  <ChakraField.Root>
                    <ChakraField.Label>Registration Type</ChakraField.Label>
                    <Controller
                      name="buyer_registration_type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onChange={field.onChange}>
                          <option value="Registered">Registered</option>
                          <option value="Unregistered">Unregistered</option>
                        </Select>
                      )}
                    />
                  </ChakraField.Root>

                  <ChakraField.Root>
                    <ChakraField.Label>NTN</ChakraField.Label>
                    <Input {...register("buyer_ntn")} placeholder="1234567-8" />
                  </ChakraField.Root>

                  <ChakraField.Root>
                    <ChakraField.Label>CNIC</ChakraField.Label>
                    <Input
                      {...register("buyer_cnic")}
                      placeholder="12345-6789012-3"
                    />
                  </ChakraField.Root>

                  <ChakraField.Root invalid={!!errors.buyer_province}>
                    <ChakraField.Label>Province</ChakraField.Label>
                    <Controller
                      name="buyer_province"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select province"
                        >
                          <option value="Punjab">Punjab</option>
                          <option value="Sindh">Sindh</option>
                          <option value="KPK">Khyber Pakhtunkhwa</option>
                          <option value="Balochistan">Balochistan</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="AJK">Azad Jammu & Kashmir</option>
                          <option value="GB">Gilgit-Baltistan</option>
                        </Select>
                      )}
                    />
                    <ChakraField.ErrorText>
                      {errors.buyer_province?.message}
                    </ChakraField.ErrorText>
                  </ChakraField.Root>

                  <ChakraField.Root invalid={!!errors.buyer_city}>
                    <ChakraField.Label>City</ChakraField.Label>
                    <Input {...register("buyer_city")} />
                    <ChakraField.ErrorText>
                      {errors.buyer_city?.message}
                    </ChakraField.ErrorText>
                  </ChakraField.Root>

                  <ChakraField.Root invalid={!!errors.buyer_address}>
                    <ChakraField.Label>Address</ChakraField.Label>
                    <Textarea {...register("buyer_address")} />
                    <ChakraField.ErrorText>
                      {errors.buyer_address?.message}
                    </ChakraField.ErrorText>
                  </ChakraField.Root>

                  <ChakraField.Root>
                    <ChakraField.Label>Phone</ChakraField.Label>
                    <Input {...register("buyer_phone")} />
                  </ChakraField.Root>

                  <ChakraField.Root invalid={!!errors.buyer_email}>
                    <ChakraField.Label>Email</ChakraField.Label>
                    <Input {...register("buyer_email")} type="email" />
                    <ChakraField.ErrorText>
                      {errors.buyer_email?.message}
                    </ChakraField.ErrorText>
                  </ChakraField.Root>
                </Grid>
              </VStack>
            </CardBody>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <HStack>
                  <FiDollarSign />
                  <Heading size="md">Invoice Items</Heading>
                </HStack>
                <Button
                  size="sm"
                  onClick={() =>
                    append({
                      product_id: "",
                      item_description: "",
                      hs_code: "",
                      quantity: 1,
                      unit_price: 0,
                      discount_amount: 0,
                      sales_tax_rate: 17,
                      sales_tax_amount: 0,
                      total_amount: 0,
                    })
                  }
                >
                  <FiPlus />
                  Add Item
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Product</Table.ColumnHeader>
                      <Table.ColumnHeader>Description</Table.ColumnHeader>
                      <Table.ColumnHeader>HS Code</Table.ColumnHeader>
                      <Table.ColumnHeader>Qty</Table.ColumnHeader>
                      <Table.ColumnHeader>Unit Price</Table.ColumnHeader>
                      <Table.ColumnHeader>Discount</Table.ColumnHeader>
                      <Table.ColumnHeader>Tax %</Table.ColumnHeader>
                      <Table.ColumnHeader>Tax Amount</Table.ColumnHeader>
                      <Table.ColumnHeader>Total</Table.ColumnHeader>
                      <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {fields.map((field, index) => (
                      <Table.Row key={field.id}>
                        <Table.Cell>
                          <Controller
                            name={`items.${index}.product_id`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value)
                                  handleProductChange(index, e.target.value)
                                }}
                                size="sm"
                                placeholder="Select..."
                              >
                                {products?.data.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.description}
                                  </option>
                                ))}
                              </Select>
                            )}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Input
                            {...register(`items.${index}.item_description`)}
                            size="sm"
                            placeholder="Description"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Input
                            {...register(`items.${index}.hs_code`)}
                            size="sm"
                            placeholder="HS Code"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Controller
                            name={`items.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <NumberInput.Root
                                value={field.value?.toString() || ""}
                                size="sm"
                                min={0.01}
                                step={0.01}
                                onValueChange={(details) => {
                                  field.onChange(details.valueAsNumber)
                                  setTimeout(() => calculateItemTotal(index), 0)
                                }}
                                formatOptions={{
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }}
                              >
                                <NumberInput.Input />
                                <NumberInput.Control>
                                  <NumberInput.IncrementTrigger />
                                  <NumberInput.DecrementTrigger />
                                </NumberInput.Control>
                              </NumberInput.Root>
                            )}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Controller
                            name={`items.${index}.unit_price`}
                            control={control}
                            render={({ field }) => (
                              <NumberInput.Root
                                value={field.value?.toString() || ""}
                                size="sm"
                                min={0}
                                step={0.01}
                                onValueChange={(details) => {
                                  field.onChange(details.valueAsNumber)
                                  setTimeout(() => calculateItemTotal(index), 0)
                                }}
                                formatOptions={{
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }}
                              >
                                <NumberInput.Input />
                                <NumberInput.Control>
                                  <NumberInput.IncrementTrigger />
                                  <NumberInput.DecrementTrigger />
                                </NumberInput.Control>
                              </NumberInput.Root>
                            )}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Controller
                            name={`items.${index}.discount_amount`}
                            control={control}
                            render={({ field }) => (
                              <NumberInput.Root
                                value={field.value?.toString() || ""}
                                size="sm"
                                min={0}
                                step={0.01}
                                onValueChange={(details) => {
                                  field.onChange(details.valueAsNumber)
                                  setTimeout(() => calculateItemTotal(index), 0)
                                }}
                                formatOptions={{
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }}
                              >
                                <NumberInput.Input />
                                <NumberInput.Control>
                                  <NumberInput.IncrementTrigger />
                                  <NumberInput.DecrementTrigger />
                                </NumberInput.Control>
                              </NumberInput.Root>
                            )}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Controller
                            name={`items.${index}.sales_tax_rate`}
                            control={control}
                            render={({ field }) => (
                              <NumberInput.Root
                                value={field.value?.toString() || ""}
                                size="sm"
                                min={0}
                                max={100}
                                step={0.01}
                                onValueChange={(details) => {
                                  field.onChange(details.valueAsNumber)
                                  setTimeout(() => calculateItemTotal(index), 0)
                                }}
                                formatOptions={{
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }}
                              >
                                <NumberInput.Input />
                                <NumberInput.Control>
                                  <NumberInput.IncrementTrigger />
                                  <NumberInput.DecrementTrigger />
                                </NumberInput.Control>
                              </NumberInput.Root>
                            )}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm" fontWeight="medium">
                            Rs.{" "}
                            {watchedItems[index]?.sales_tax_amount?.toFixed(
                              2,
                            ) || "0.00"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm" fontWeight="bold">
                            Rs.{" "}
                            {watchedItems[index]?.total_amount?.toFixed(2) ||
                              "0.00"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            aria-label="Remove item"
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <FiTrash2 />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              {/* Invoice Totals */}
              <Separator my={4} />
              <Flex justify="flex-end">
                <VStack align="flex-end" gap={2}>
                  <HStack>
                    <Text>Subtotal:</Text>
                    <Text fontWeight="medium">
                      Rs.{" "}
                      {(
                        totalInvoiceValue -
                        totalSalesTax +
                        totalDiscount
                      ).toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text>Discount:</Text>
                    <Text fontWeight="medium" color="red.500">
                      -Rs. {totalDiscount.toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text>Sales Tax:</Text>
                    <Text fontWeight="medium">
                      Rs. {totalSalesTax.toFixed(2)}
                    </Text>
                  </HStack>
                  <Separator />
                  <HStack>
                    <Text fontSize="lg" fontWeight="bold">
                      Total:
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.500">
                      Rs. {totalInvoiceValue.toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <Heading size="md">Additional Information</Heading>
            </CardHeader>
            <CardBody>
              <Grid
                templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                gap={4}
              >
                <ChakraField.Root>
                  <ChakraField.Label>Payment Terms</ChakraField.Label>
                  <Textarea
                    {...register("payment_terms")}
                    placeholder="Net 30 days"
                  />
                </ChakraField.Root>
                <ChakraField.Root>
                  <ChakraField.Label>Notes</ChakraField.Label>
                  <Textarea
                    {...register("notes")}
                    placeholder="Additional notes"
                  />
                </ChakraField.Root>
              </Grid>
            </CardBody>
          </Card>
        </VStack>
      </form>
    </Container>
  )
}

export const Route = createFileRoute("/_layout/invoices/create")({
  component: CreateInvoicePage,
})
