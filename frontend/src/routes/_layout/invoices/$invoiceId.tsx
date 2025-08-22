import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { toaster } from "@/components/ui/toaster"
import {
  Alert,
  Badge,
  Box,
  Container,
  Dialog,
  Flex,
  Grid,
  HStack,
  Heading,
  IconButton,
  Separator,
  Spinner,
  Table,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { useRef } from "react"
import {
  FiArrowLeft,
  FiCalendar,
  FiCopy,
  FiDollarSign,
  FiDownload,
  FiEdit,
  FiFileText,
  FiMoreVertical,
  FiPrinter,
  FiSend,
  FiUser,
} from "react-icons/fi"

import type { ApiError } from "@/client"
import { FBRInvoicesService } from "@/client/fbr-service"

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

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { open, onOpen, onClose } = useDisclosure()
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

  // Query to get invoice items
  const {
    data: invoiceItemsData,
    isLoading: isItemsLoading,
  } = useQuery({
    queryKey: ["fbr-invoice-items", invoiceId],
    queryFn: () => FBRInvoicesService.readInvoiceItems({ invoiceId }),
    enabled: !!invoiceId,
  })

  const invoiceItems = invoiceItemsData?.data || []

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
      navigate({ to: "/invoices/$invoiceId/edit", params: { invoiceId: newInvoice.id } })
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
      // TODO: Implement PDF generation service method
      toaster.create({
        title: "Info",
        description: "PDF generation feature coming soon",
        type: "info",
      })
      // const response = await FBRInvoicesService.generateFbrInvoicePdf({
      //   invoiceId,
      // })
      // // Handle PDF download
      // const blob = new Blob([response], { type: "application/pdf" })
      // const url = window.URL.createObjectURL(blob)
      // const a = document.createElement("a")
      // a.href = url
      // a.download = `invoice-${invoice?.invoice_ref_no || invoiceId}.pdf`
      // document.body.appendChild(a)
      // a.click()
       // window.URL.revokeObjectURL(url)
       // document.body.removeChild(a)
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

  if (isLoading || isItemsLoading) {
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
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Link to="/invoices">
              <Button variant="ghost">
                <FiArrowLeft />
                Back to Invoices
              </Button>
            </Link>
            <Separator orientation="vertical" h="6" />
            <VStack align="start" gap={0}>
              <Heading size="lg">Invoice {invoice.invoice_ref_no}</Heading>
              <HStack>
                <Badge
                  colorScheme={
                    statusColors[invoice.status as keyof typeof statusColors]
                  }
                >
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
            <Button onClick={handlePrint} variant="outline">
              <FiPrinter />
              Print
            </Button>
            <Button onClick={handleDownloadPDF}>
              <FiDownload />
              Download PDF
            </Button>

            {invoice.status === "draft" && (
              <Link to="/invoices/$invoiceId/edit" params={{ invoiceId }}>
                <Button colorPalette="blue">
                  <FiEdit />
                  Edit
                </Button>
              </Link>
            )}

            <MenuRoot>
              <MenuTrigger asChild>
                <IconButton aria-label="More actions" variant="outline">
                  <FiMoreVertical />
                </IconButton>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="clone" onClick={() => cloneMutation.mutate()}>
                  <FiCopy />
                  Clone Invoice
                </MenuItem>
                {invoice.status === "draft" && (
                  <MenuItem value="submit" onClick={onOpen}>
                    <FiSend />
                    Submit to FBR
                  </MenuItem>
                )}
              </MenuContent>
            </MenuRoot>
          </HStack>
        </Flex>

        {/* Invoice Overview */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          <Card>
            <CardBody>
              <VStack align="start" gap={2}>
                <HStack>
                  <FiCalendar color="gray" />
                  <Text fontSize="sm" color="gray.600">
                    Invoice Date
                  </Text>
                </HStack>
                <Text fontWeight="bold">
                  {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" gap={2}>
                <HStack>
                  <FiDollarSign color="gray" />
                  <Text fontSize="sm" color="gray.600">
                    Total Amount
                  </Text>
                </HStack>
                <Text fontWeight="bold" fontSize="lg" color="green.500">
                  Rs. {invoice.total_invoice_value.toLocaleString()}
                </Text>
              </VStack>
            </CardBody>
          </Card>



          <Card>
            <CardBody>
              <VStack align="start" gap={2}>
                <HStack>
                  <FiFileText color="gray" />
                  <Text fontSize="sm" color="gray.600">
                    Invoice Type
                  </Text>
                </HStack>
                <Text fontWeight="bold" textTransform="capitalize">
                  {invoice.invoice_type.replace("_", " ")}
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
              <VStack align="start" gap={3}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {invoice.seller_business_name}
                  </Text>
                  <Text color="gray.600">NTN: {invoice.seller_ntn}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium">Address:</Text>
                  <Text>{invoice.seller_address}</Text>
                  <Text>
                    {invoice.seller_city}, {invoice.seller_province}
                  </Text>
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
              <VStack align="start" gap={3}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {invoice.buyer_business_name}
                  </Text>
                  <Text color="gray.600">
                    {invoice.buyer_registration_type.toUpperCase()}:{" "}
                    {invoice.buyer_ntn || invoice.buyer_cnic}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="medium">Address:</Text>
                  <Text>{invoice.buyer_address}</Text>
                  <Text>
                    {invoice.buyer_city}, {invoice.buyer_province}
                  </Text>
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
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>HS Code</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      Quantity
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      Unit Price
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      Discount
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      Tax Rate
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      Tax Amount
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      Total
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {invoiceItems.map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{item.product_description}</Table.Cell>
                      <Table.Cell fontFamily="mono">{item.hs_code || 'N/A'}</Table.Cell>
                      <Table.Cell textAlign="end">{item.quantity}</Table.Cell>
                      <Table.Cell textAlign="end">
                        Rs. {item.unit_price.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell textAlign="end">
                        Rs. {(item.discount || 0).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell textAlign="end">
                        {((item.sales_tax_applicable / item.value_sales_excluding_st) * 100).toFixed(1)}%
                      </Table.Cell>
                      <Table.Cell textAlign="end">
                        Rs. {item.sales_tax_applicable.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell textAlign="end" fontWeight="bold">
                        Rs. {item.total_value.toLocaleString()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Invoice Totals */}
            <Separator my={6} />
            <Flex justify="flex-end">
              <VStack align="flex-end" gap={2} minW="300px">
                <HStack justify="space-between" w="full">
                  <Text>Sales Value:</Text>
                  <Text fontWeight="medium">
                    Rs. {invoice.total_sales_value.toLocaleString()}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text>Total Tax:</Text>
                  <Text fontWeight="medium">
                    Rs. {invoice.total_tax_amount.toLocaleString()}
                  </Text>
                </HStack>
                <Separator />
                <HStack justify="space-between" w="full">
                  <Text fontSize="lg" fontWeight="bold">
                    Total Amount:
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    Rs. {invoice.total_invoice_value.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </CardBody>
        </Card>


      </VStack>

      {/* Submit to FBR Confirmation Dialog */}
      <Dialog.Root
        open={open}
        onOpenChange={(e) => (e.open ? onOpen() : onClose())}
        role="alertdialog"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize="lg" fontWeight="bold">
                Submit Invoice to FBR
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              Are you sure you want to submit this invoice to FBR? This action
              cannot be undone.
              <br />
              <br />
              <Text fontSize="sm" color="gray.600">
                Invoice: {invoice.invoice_ref_no}
                <br />
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

export const Route = createFileRoute("/_layout/invoices/$invoiceId")({
  component: InvoiceDetailPage,
})
