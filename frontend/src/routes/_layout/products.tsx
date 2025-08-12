import {
  Badge,
  Box,
  Button,
  Container,
  Dialog,
  Field as ChakraField,
  Flex,
  Heading,
  Input,
  NumberInput,
  Table,
  Text,
  useDisclosure,
  VStack,
  Card,
  CardBody,
  HStack,
  IconButton,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { FiSearch, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi"
import { z } from "zod"

import { type ApiError } from "@/client"
import {
  type ProductPublic,
  type ProductCreate,
  type ProductUpdate,
  ProductsService,
} from "@/client/products-service"

interface ProductFormData {
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
}

const unitOfMeasures = [
  "PCS", "KG", "LTR", "MTR", "SQM", "CUM", "TON", "BOX", "PACK", "SET",
  "PAIR", "DOZEN", "GROSS", "BUNDLE", "ROLL", "SHEET", "BOTTLE", "CAN",
  "BAG", "CARTON", "CASE", "DRUM", "GALLON", "YARD", "FOOT", "INCH"
]

const taxRates = [
  { value: 0, label: "0% (Exempt)" },
  { value: 5, label: "5%" },
  { value: 10, label: "10%" },
  { value: 12, label: "12%" },
  { value: 15, label: "15%" },
  { value: 17, label: "17%" },
  { value: 18, label: "18%" },
  { value: 20, label: "20%" },
  { value: 25, label: "25%" },
]

const productsSearchSchema = z.object({
  page: z.number().catch(1),
  search: z.string().catch(""),
})

const PER_PAGE = 10

export const Route = createFileRoute("/_layout/products")({ 
  component: ProductsPage,
  validateSearch: productsSearchSchema,
})

function ProductsPage() {
  const { page = 1, search = "" } = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingProduct, setEditingProduct] = useState<ProductPublic | null>(null)
  const [searchTerm, setSearchTerm] = useState(search)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      is_active: true,
      tax_rate: 18,
      unit_price: 0,
    },
  })

  // Query to get products
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", { skip: (page - 1) * PER_PAGE, limit: PER_PAGE, search }],
    queryFn: () => ProductsService.readProducts({
      skip: (page - 1) * PER_PAGE,
      limit: PER_PAGE,
    }),
  })

  // Mutation to create product
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      ProductsService.createProduct({
        requestBody: data,
      }),
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Product created successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
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

  // Mutation to update product
  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData & { productId: string }) => {
      const { productId, ...updateData } = data
      return ProductsService.updateProduct({
        productId,
        requestBody: updateData,
      })
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Product updated successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onClose()
      reset()
      setEditingProduct(null)
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
      })
    },
  })

  // Mutation to delete product
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductsService.deleteProduct({ productId: id }),
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Product deleted successfully",
        type: "success",
        duration: 5000,
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message,
        type: "error",
      })
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ ...data, productId: editingProduct.id })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (product: ProductPublic) => {
    setEditingProduct(product)
    reset({
      hs_code: product.hs_code,
      description: product.description,
      uom: product.uom,
      unit_price: product.unit_price,
      tax_rate: product.tax_rate,
      fixed_notified_value: product.fixed_notified_value,
      sales_tax_withheld_rate: product.sales_tax_withheld_rate,
      extra_tax_rate: product.extra_tax_rate,
      further_tax_rate: product.further_tax_rate,
      fed_payable_rate: product.fed_payable_rate,
      sro_schedule_no: product.sro_schedule_no,
      sro_item_serial_no: product.sro_item_serial_no,
      sale_type: product.sale_type,
    })
    onOpen()
  }

  const handleAdd = () => {
    setEditingProduct(null)
    reset({
      hs_code: '',
      description: '',
      uom: '',
      unit_price: 0,
      tax_rate: 0,
      sale_type: 'standard',
    })
    onOpen()
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
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
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Product Management</Heading>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleAdd}>
            Add Product
          </Button>
        </Flex>

        {/* Search Bar */}
        <Card>
          <CardBody>
            <Flex gap={4}>
              <InputGroup flex={1} startElement={<FiSearch />}>
                <Input
                  placeholder="Search products by name, HS code, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </InputGroup>
              <Button onClick={handleSearch}>Search</Button>
            </Flex>
          </CardBody>
        </Card>

        {/* Products Table */}
        <Card>
          <CardBody>
            {isLoading ? (
              <Text>Loading products...</Text>
            ) : isError ? (
              <Text color="red.500">Error loading products</Text>
            ) : (
              <Table.Root variant="simple">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>HS Code</Table.ColumnHeader>
                    <Table.ColumnHeader>UOM</Table.ColumnHeader>
                    <Table.ColumnHeader>Unit Price</Table.ColumnHeader>
                    <Table.ColumnHeader>Tax Rate</Table.ColumnHeader>
                    <Table.ColumnHeader>Sale Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {products?.data.map((product) => (
                    <Table.Row key={product.id}>
                      <Table.Cell>
                        <Text fontWeight="medium">{product.description}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontFamily="mono" fontSize="sm">
                          {product.hs_code}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{product.uom}</Table.Cell>
                      <Table.Cell>
                        <Text fontWeight="medium">
                          Rs. {product.unit_price.toLocaleString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{product.tax_rate}%</Table.Cell>
                      <Table.Cell>
                        <Badge colorScheme="blue">
                          {product.sale_type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit product"
                            icon={<FiEdit />}
                            size="sm"
                            onClick={() => handleEdit(product)}
                          />
                          <IconButton
                            aria-label="Delete product"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(product.id)}
                          />
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}

            {products?.data.length === 0 && (
              <Text textAlign="center" py={8} color="gray.500">
                No products found. Add your first product to get started.
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Add/Edit Product Dialog */}
      <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
              <VStack spacing={4}>
                <ChakraField.Root required invalid={!!errors.description}>
                  <ChakraField.Label>Description</ChakraField.Label>
                  <Textarea
                    {...register("description", {
                      required: "Description is required",
                      maxLength: { value: 500, message: "Description too long" },
                    })}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </ChakraField.Root>

                <Flex gap={4} w="full">
                  <ChakraField.Root required invalid={!!errors.hs_code}>
                    <ChakraField.Label>HS Code</ChakraField.Label>
                    <Input
                      {...register("hs_code", {
                        required: "HS Code is required",
                        maxLength: { value: 20, message: "HS Code too long" },
                      })}
                      placeholder="e.g., 8471.30.00"
                    />
                  </ChakraField.Root>

                  <ChakraField.Root required invalid={!!errors.uom}>
                    <ChakraField.Label>Unit of Measure</ChakraField.Label>
                    <Select
                      {...register("uom", {
                        required: "Unit of measure is required",
                      })}
                      placeholder="Select UOM"
                    >
                      {unitOfMeasures.map((uom) => (
                        <option key={uom} value={uom}>
                          {uom}
                        </option>
                      ))}
                    </Select>
                  </ChakraField.Root>

                 </Flex>

                <Flex gap={4} w="full">
                  <ChakraField.Root required invalid={!!errors.unit_price}>
                    <ChakraField.Label>Unit Price (Rs.)</ChakraField.Label>
                    <Controller
                      name="unit_price"
                      control={control}
                      rules={{
                        required: "Unit price is required",
                        min: { value: 0, message: "Price must be positive" },
                      }}
                      render={({ field }) => (
                        <NumberInput.Root
                          {...field}
                          min={0}
                          step={0.01}
                          formatOptions={{
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }}
                        >
                          <NumberInput.Input placeholder="0.00" />
                          <NumberInput.Control />
                        </NumberInput.Root>
                      )}
                    />
                  </ChakraField.Root>

                   <ChakraField.Root required invalid={!!errors.tax_rate}>
                    <ChakraField.Label>Tax Rate</ChakraField.Label>
                    <Select
                      {...register("tax_rate", {
                        required: "Tax rate is required",
                        valueAsNumber: true,
                      })}
                      placeholder="Select tax rate"
                    >
                      {taxRates.map((rate) => (
                        <option key={rate.value} value={rate.value}>
                          {rate.label}
                        </option>
                      ))}
                    </Select>
                  </ChakraField.Root>
                </Flex>

                <ChakraField.Root required invalid={!!errors.sale_type}>
                  <ChakraField.Label>Sale Type</ChakraField.Label>
                  <Select
                    {...register("sale_type", {
                      required: "Sale type is required",
                    })}
                    placeholder="Select sale type"
                  >
                    <option value="standard">Standard</option>
                    <option value="export">Export</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="retail">Retail</option>
                  </Select>
                </ChakraField.Root>
              </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                  loadingText={editingProduct ? "Updating..." : "Creating..."}
                >
                  {editingProduct ? "Update" : "Create"}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Container>
  )
}