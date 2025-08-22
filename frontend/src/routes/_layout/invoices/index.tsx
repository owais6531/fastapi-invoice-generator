import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { InputGroup } from "@/components/ui/input-group"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { Select } from "@/components/ui/select"
import { Table } from "@/components/ui/table"
import { toaster } from "@/components/ui/toaster"
import { Tooltip } from "@/components/ui/tooltip"
import {
  Alert,
  Badge,
  Box,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import { useState } from "react"
import {
  FiEdit,
  FiEye,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi"

import { FBRInvoicesService } from "@/client/fbr-service"
import type { FBRInvoicePublic } from "@/client/fbr-service"

export const Route = createFileRoute("/_layout/invoices/")({
  component: InvoicesPage,
})

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

function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const queryClient = useQueryClient()

  // Query to get invoices
  const {
    data: invoicesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["fbr-invoices", searchTerm, statusFilter],
    queryFn: () =>
      FBRInvoicesService.readFbrInvoices({
        skip: 0,
        limit: 100,
        // Add search and filter params when backend supports them
      }),
  })

  const invoices = invoicesData?.data || []

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice: FBRInvoicePublic) => {
    const matchesSearch =
      invoice.invoice_ref_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.buyer_business_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.seller_business_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await FBRInvoicesService.deleteFbrInvoice({ invoiceId })
      toaster.create({
        title: "Success",
        description: "Invoice deleted successfully",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["fbr-invoices"] })
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Failed to delete invoice",
        type: "error",
      })
    }
  }

  if (isLoading) {
    return (
      <Container maxW="full" py={8}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="lg" />
        </Flex>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container maxW="full" py={8}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              Failed to load invoices. Please try again.
            </Alert.Title>
          </Alert.Content>
        </Alert.Root>
      </Container>
    )
  }

  return (
    <Container maxW="full" py={8}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Invoices</Heading>
          <Button asChild>
            <Link to="/invoices/create">
              <FiPlus />
              Create Invoice
            </Link>
          </Button>
        </Flex>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack gap={4}>
              <InputGroup flex={1} startElement={<FiSearch />}>
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Box minW="200px">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="posted">Posted</option>
                  <option value="error">Error</option>
                </Select>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <Heading size="md">Invoices ({filteredInvoices.length})</Heading>
          </CardHeader>
          <CardBody>
            {filteredInvoices.length === 0 ? (
              <Flex justify="center" align="center" minH="200px">
                <VStack>
                  <Text color="gray.500">No invoices found</Text>
                  <Button asChild variant="outline">
                    <Link to="/invoices/create">
                      <FiPlus />
                      Create your first invoice
                    </Link>
                  </Button>
                </VStack>
              </Flex>
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Invoice #</Table.ColumnHeader>
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredInvoices.map((invoice: FBRInvoicePublic) => (
                    <Table.Row key={invoice.id}>
                      <Table.Cell>
                        <Text fontWeight="medium">
                          {invoice.invoice_ref_no}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>
                          {format(
                            new Date(invoice.invoice_date),
                            "MMM dd, yyyy",
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{invoice.buyer_business_name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontWeight="medium">
                          Rs. {invoice.total_invoice_value?.toFixed(2) || "0.00"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={
                            statusColors[
                              invoice.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {
                            statusLabels[
                              invoice.status as keyof typeof statusLabels
                            ]
                          }
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack>
                          <Tooltip label="View Invoice">
                            <IconButton
                              asChild
                              size="sm"
                              variant="ghost"
                              aria-label="View invoice"
                            >
                              <Link to="/invoices/$invoiceId" params={{ invoiceId: invoice.id }}>
                                <FiEye />
                              </Link>
                            </IconButton>
                          </Tooltip>

                          {invoice.status === "draft" && (
                            <Tooltip label="Edit Invoice">
                              <IconButton
                                asChild
                                size="sm"
                                variant="ghost"
                                aria-label="Edit invoice"
                              >
                                <Link to="/invoices/$invoiceId/edit" params={{ invoiceId: invoice.id }}>
                                  <FiEdit />
                                </Link>
                              </IconButton>
                            </Tooltip>
                          )}

                          <MenuRoot>
                            <MenuTrigger asChild>
                              <IconButton
                                size="sm"
                                variant="ghost"
                                aria-label="More actions"
                              >
                                <FiMoreVertical />
                              </IconButton>
                            </MenuTrigger>
                            <MenuContent>
                              <MenuItem
                                value="delete"
                                color="red.500"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                              >
                                <FiTrash2 />
                                Delete
                              </MenuItem>
                            </MenuContent>
                          </MenuRoot>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
