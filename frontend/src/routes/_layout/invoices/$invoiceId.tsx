import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  Table,

  Separator,
  Grid,
  GridItem,

  Dialog,
  useDisclosure,
  Tooltip,
  IconButton,
  Menu,
  Spinner,
  Alert,
} from "@chakra-ui/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { toaster } from "@/components/ui/toaster"
import { useRef } from "react"
import { format } from "date-fns"
import {
  FiEdit,
  FiDownload,
  FiSend,
  FiCopy,
  FiArrowLeft,
  FiMoreVertical,
  FiPrinter,
  FiFileText,
  FiUser,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi"

import { type ApiError } from "@/client"
import {
  type FBRInvoicePublic,
  FBRInvoicesService,
} from "@/client/fbr-service"

const statusColors = {
  draft: "gray",
  submitted: "blue",
  posted: "green",
  error: "red",
}

const statusLabels = {
  draft: "Draft",
  submitted: "Submitted",
  posted: "Posted",
  error: "Error",
}

export const Route = createFileRoute("/_layout/invoices/$invoiceId")({ 
  component: InvoiceDetailPage,
})

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Query to get invoice details
  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["fbr-invoice", invoiceId],
    queryFn: () => FBRInvoicesService.readFbrInvoice({ invoiceId }),
  })

  // Mutation to submit invoice to FBR
  const submitToFBRMutation = useMutation({
    mutationFn: () => FBRInvoicesService.submitToFbr({ invoiceId }),
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Invoice submitted to FBR successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["fbr-invoice", invoiceId] })
      queryClient.invalidateQueries({ queryKey: ["fbr-invoices"] })
      onClose()
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message || "Failed to submit invoice to FBR",
        type: "error",
      })
    },
  })

  // Mutation to clone invoice
  const cloneMutation = useMutation({
    mutationFn: () => FBRInvoicesService.cloneFbrInvoice({ invoiceId }),
    onSuccess: (newInvoice) => {
      toaster.create({
        title: "Success",
        description: "Invoice cloned successfully",
        type: "success",
      })
      navigate({ to: `/invoices/${newInvoice.id}/edit` })
    },
    onError: (err: ApiError) => {
      toaster.create({
        title: "Error",
        description: err.message || "Failed to clone invoice",
        type: "error",
      })
    },
  })

  const handleDownloadPDF = async () => {
    try {
      const response = await FBRInvoicesService.generateFbrInvoicePdf({ invoiceId })
      // Handle PDF download
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice?.invoice_ref_no || invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Failed to download PDF",
        type: "error",
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading invoice...</Text>
          </VStack>
        </Flex>
      </Container>
    )
  }

  if (isError || !invoice) {
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

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Button
              as={Link}
              to="/invoices"
              leftIcon={<FiArrowLeft />}
              variant="ghost"
            >
              Back to Invoices
            </Button>
            <Separator orientation="vertical" h="6" />
            <VStack align="start" spacing={0}>
              <Heading size="lg">Invoice {invoice.invoice_ref_no}</Heading>
              <HStack>
                <Badge colorScheme={statusColors[invoice.status as keyof typeof statusColors]}>
                  {statusLabels[invoice.status as keyof typeof statusLabels]}
                </Badge>
                {invoice.fbr_reference && (
                  <Text fontSize="sm" color="gray.600">
                    FBR Ref: {invoice.fbr_reference}
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>

          <HStack>
            <Button leftIcon={<FiPrinter />} onClick={handlePrint} variant="outline">
              Print
            </Button>
            <Button leftIcon={<FiDownload />} onClick={handleDownloadPDF}>
              Download PDF
            </Button>
            
            {invoice.status === "draft" && (
              <Button
                as={Link}
                to={`/invoices/${invoiceId}/edit`}
                leftIcon={<FiEdit />}
                colorScheme="blue"
              >
                Edit
              </Button>
            )}
            
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label="More actions"
                  variant="outline"
                >
                  <FiMoreVertical />
                </IconButton>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item onClick={() => cloneMutation.mutate()}>
                  <FiCopy />
                  Clone Invoice
                </Menu.Item>
                {invoice.status === "draft" && (
                  <Menu.Item onClick={onOpen}>
                    <FiSend />
                    Submit to FBR
                  </Menu.Item>
                )}
              </Menu.Content>
            </Menu.Root>
          </HStack>
        </Flex>

        {/* Invoice Overview */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiCalendar color="gray" />
                  <Text fontSize="sm" color="gray.600">Invoice Date</Text>
                </HStack>
                <Text fontWeight="bold">
                  {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiDollarSign color="gray" />
                  <Text fontSize="sm" color="gray.600">Total Amount</Text>
                </HStack>
                <Text fontWeight="bold" fontSize="lg" color="green.500">
                  Rs. {invoice.total_invoice_value.toLocaleString()}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          {invoice.due_date && (
            <Card>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <FiCalendar color="gray" />
                    <Text fontSize="sm" color="gray.600">Due Date</Text>
                  </HStack>
                  <Text fontWeight="bold">
                    {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
          
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiFileText color="gray" />
                  <Text fontSize="sm" color="gray.600">Invoice Type</Text>
                </HStack>
                <Text fontWeight="bold" textTransform="capitalize">
                  {invoice.invoice_type.replace('_', ' ')}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Seller and Buyer Information */}
        <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
          {/* Seller Information */}
          <Card>
            <CardHeader>
              <HStack>
                <FiUser />
                <Heading size="md">Seller Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {invoice.seller_business_name}
                  </Text>
                  <Text color="gray.600">NTN: {invoice.seller_ntn}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium">Address:</Text>
                  <Text>{invoice.seller_address}</Text>
                  <Text>{invoice.seller_city}, {invoice.seller_province}</Text>
                </Box>
                {invoice.seller_phone && (
                  <Text>Phone: {invoice.seller_phone}</Text>
                )}
                {invoice.seller_email && (
                  <Text>Email: {invoice.seller_email}</Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Buyer Information */}
          <Card>
            <CardHeader>
              <HStack>
                <FiUser />
                <Heading size="md">Buyer Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {invoice.buyer_business_name}
                  </Text>
                  <Text color="gray.600">
                    {invoice.buyer_registration_type.toUpperCase()}: {invoice.buyer_ntn || invoice.buyer_cnic}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="medium">Address:</Text>
                  <Text>{invoice.buyer_address}</Text>
                  <Text>{invoice.buyer_city}, {invoice.buyer_province}</Text>
                </Box>
                {invoice.buyer_phone && (
                  <Text>Phone: {invoice.buyer_phone}</Text>
                )}
                {invoice.buyer_email && (
                  <Text>Email: {invoice.buyer_email}</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <Heading size="md">Invoice Items</Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table.Root variant="simple">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>HS Code</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Quantity</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Unit Price</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Discount</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Tax Rate</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Tax Amount</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {invoice.items?.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{item.item_description}</Table.Cell>
                      <Table.Cell fontFamily="mono">{item.hs_code}</Table.Cell>
                      <Table.Cell textAlign="end">{item.quantity}</Table.Cell>
                      <Table.Cell textAlign="end">Rs. {item.unit_price.toLocaleString()}</Table.Cell>
                      <Table.Cell textAlign="end">Rs. {item.discount_amount.toLocaleString()}</Table.Cell>
                      <Table.Cell textAlign="end">{item.sales_tax_rate}%</Table.Cell>
                      <Table.Cell textAlign="end">Rs. {item.sales_tax_amount.toLocaleString()}</Table.Cell>
                      <Table.Cell textAlign="end" fontWeight="bold">
                        Rs. {item.total_amount.toLocaleString()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Invoice Totals */}
            <Separator my={6} />
            <Flex justify="flex-end">
              <VStack align="flex-end" spacing={2} minW="300px">
                <HStack justify="space-between" w="full">
                  <Text>Subtotal:</Text>
                  <Text fontWeight="medium">
                    Rs. {(invoice.total_invoice_value - invoice.total_sales_tax + invoice.total_discount).toLocaleString()}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text>Total Discount:</Text>
                  <Text fontWeight="medium" color="red.500">
                    -Rs. {invoice.total_discount.toLocaleString()}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text>Total Sales Tax:</Text>
                  <Text fontWeight="medium">
                    Rs. {invoice.total_sales_tax.toLocaleString()}
                  </Text>
                </HStack>
                <Separator />
                <HStack justify="space-between" w="full">
                  <Text fontSize="lg" fontWeight="bold">Total Amount:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    Rs. {invoice.total_invoice_value.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Additional Information */}
        {(invoice.payment_terms || invoice.notes) && (
          <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
            {invoice.payment_terms && (
              <Card>
                <CardHeader>
                  <Heading size="sm">Payment Terms</Heading>
                </CardHeader>
                <CardBody>
                  <Text>{invoice.payment_terms}</Text>
                </CardBody>
              </Card>
            )}
            
            {invoice.notes && (
              <Card>
                <CardHeader>
                  <Heading size="sm">Notes</Heading>
                </CardHeader>
                <CardBody>
                  <Text>{invoice.notes}</Text>
                </CardBody>
              </Card>
            )}
          </Grid>
        )}
      </VStack>

      {/* Submit to FBR Confirmation Dialog */}
      <Dialog.Root open={isOpen} onOpenChange={(e) => e.open ? onOpen() : onClose()} role="alertdialog">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize="lg" fontWeight="bold">
                Submit Invoice to FBR
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              Are you sure you want to submit this invoice to FBR? This action cannot be undone.
              <br /><br />
              <Text fontSize="sm" color="gray.600">
                Invoice: {invoice.invoice_ref_no}<br />
                Amount: Rs. {invoice.total_invoice_value.toLocaleString()}
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={() => submitToFBRMutation.mutate()}
                ml={3}
                loading={submitToFBRMutation.isPending}
                loadingText="Submitting..."
              >
                Submit to FBR
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Container>
  )
}