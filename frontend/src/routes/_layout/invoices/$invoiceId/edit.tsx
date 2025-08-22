import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { toaster } from "@/components/ui/toaster"
import {
  Alert,
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  IconButton,
  Input,
  NumberInput,
  Separator,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { format, parseISO } from "date-fns"
import React from "react"
import DatePicker from "react-datepicker"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  FiArrowLeft,
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
  type FBRInvoiceUpdate,
  FBRInvoicesService,
} from "@/client/fbr-service"
import { ProductsService } from "@/client/products-service"
import { Field } from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { Tooltip } from "@/components/ui/tooltip"

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
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>





function EditInvoicePage() {
  const { invoiceId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()




  // Query to get invoice details
  const {
    data: invoice,
    isLoading: isLoadingInvoice,
    isError: isInvoiceError,
  } = useQuery({
    queryKey: ["fbr-invoice", invoiceId],
    queryFn: () => FBRInvoicesService.readFbrInvoice({ invoiceId }),
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
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

  // Initialize form with invoice data
  React.useEffect(() => {
    if (invoice) {
      const formData: InvoiceFormData = {
        invoice_ref_no: invoice.invoice_ref_no,
        invoice_date: parseISO(invoice.invoice_date),
        invoice_type: invoice.invoice_type as
          | "normal"
          | "credit_note"
          | "debit_note",
        customer_id: invoice.customer_id || "",
        buyer_business_name: invoice.buyer_business_name,
        items: [
          // Default empty item since items come from separate API
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
      }
      reset(formData)
    }
  }, [invoice, reset])

  // Mutations
  const updateInvoiceMutation = useMutation({
    mutationFn: (data: FBRInvoiceUpdate) =>
      FBRInvoicesService.updateFbrInvoice({
        invoiceId,
        requestBody: data,
      }),
    onSuccess: (updatedInvoice) => {
      toaster.create({
        title: "Success",
        description: "Invoice updated successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["fbr-invoice", invoiceId] })
      queryClient.invalidateQueries({ queryKey: ["fbr-invoices"] })
      navigate({ to: "/invoices/$invoiceId", params: { invoiceId: updatedInvoice.id } })
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message || "Failed to update invoice",
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
    const item = watchedItems?.[index]
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
      const invoiceData: FBRInvoiceUpdate = {
        ...data,
        invoice_date: format(data.invoice_date, "yyyy-MM-dd"),

        seller_business_name: company?.business_name || "",
        seller_ntn_cnic: company?.ntn_cnic || "",
        seller_province: company?.province || "",
        seller_address: company?.address || "",
        total_invoice_value:
          watchedItems?.reduce((sum, item) => sum + item.total_amount, 0) || 0,
        total_tax_amount:
          watchedItems?.reduce((sum, item) => sum + item.sales_tax_amount, 0) || 0,
        

      }

      await updateInvoiceMutation.mutateAsync(invoiceData)

      if (submitToFBR) {
        await submitToFBRMutation.mutateAsync(invoiceId)
      }
    } catch (error) {
      // Error handling is done in mutation onError
    }
  }

  if (isLoadingInvoice) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading invoice...</Text>
          </VStack>
        </Flex>
      </Container>
    )
  }

  if (isInvoiceError || !invoice) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to load invoice. Please try again.</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      </Container>
    )
  }

  if (invoice.status !== "draft") {
    return (
      <Container maxW="7xl" py={8}>
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              This invoice cannot be edited because it has already been
              submitted to FBR.
            </Alert.Title>
          </Alert.Content>
          <Link to="/invoices/$invoiceId" params={{ invoiceId }}>
            <Button>View Invoice</Button>
          </Link>
        </Alert.Root>
      </Container>
    )
  }

  const totalInvoiceValue =
    watchedItems?.reduce((sum, item) => sum + item.total_amount, 0) || 0
  const totalSalesTax =
    watchedItems?.reduce((sum, item) => sum + item.sales_tax_amount, 0) || 0
  const totalDiscount =
    watchedItems?.reduce((sum, item) => sum + item.discount_amount, 0) || 0

  return (
    <Container maxW="7xl" py={8}>
      <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
        <VStack gap={6} align="stretch">
          <Flex justify="space-between" align="center">
            <HStack>
              <Link to="/invoices/$invoiceId" params={{ invoiceId }}>
                <Button variant="ghost">
                  <FiArrowLeft />
                  Back to Invoice
                </Button>
              </Link>
              <Button variant="ghost">
                <FiArrowLeft />
                Back to Invoice
              </Button>
              <Separator orientation="vertical" h="6" />
              <VStack align="start" gap={0}>
                <Heading size="lg">
                  Edit Invoice {invoice.invoice_ref_no}
                </Heading>
                <Badge colorPalette="gray">Draft</Badge>
              </VStack>
            </HStack>
            <HStack>
              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Saving..."
              >
                <FiSave />
                Save Changes
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
                <Field
                  label="Invoice Reference No."
                  invalid={!!errors.invoice_ref_no}
                  errorText={errors.invoice_ref_no?.message}
                >
                  <Input {...register("invoice_ref_no")} />
                </Field>

                <Field
                  label="Invoice Date"
                  invalid={!!errors.invoice_date}
                  errorText={errors.invoice_date?.message}
                >
                  <Controller
                    name="invoice_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        dateFormat="yyyy-MM-dd"
                        customInput={<Input />}
                      />
                    )}
                  />
                </Field>

                <Field label="Invoice Type">
                  <Controller
                    name="invoice_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                      >
                        <option value="normal">Normal</option>
                        <option value="credit_note">Credit Note</option>
                        <option value="debit_note">Debit Note</option>
                      </Select>
                    )}
                  />
                </Field>


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
                <Field
                  label="Select Customer"
                  invalid={!!errors.customer_id}
                  errorText={errors.customer_id?.message}
                >
                  <Controller
                    name="customer_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                          handleCustomerChange(e.target.value)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
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
                </Field>

                <Grid
                  templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                  gap={4}
                >
                  <Field
                    label="Business Name"
                    invalid={!!errors.buyer_business_name}
                    errorText={errors.buyer_business_name?.message}
                  >
                    <Input {...register("buyer_business_name")} />
                  </Field>






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
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value)
                                  handleProductChange(index, e.target.value)
                                }}
                                onBlur={field.onBlur}
                                name={field.name}
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
                            {watchedItems?.[index]?.sales_tax_amount?.toFixed(
                              2,
                            ) || "0.00"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm" fontWeight="bold">
                            Rs.{" "}
                            {watchedItems?.[index]?.total_amount?.toFixed(2) ||
                              "0.00"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Tooltip label="Remove item">
                            <IconButton
                              aria-label="Remove item"
                              size="sm"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Tooltip>
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

            </CardBody>
          </Card>
        </VStack>
      </form>
    </Container>
  )
}

export const Route = createFileRoute("/_layout/invoices/$invoiceId/edit")({
  component: EditInvoicePage,
})
