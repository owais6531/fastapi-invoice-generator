import { Table as ChakraTable } from "@chakra-ui/react"
import { forwardRef } from "react"
import type { ReactNode } from "react"

interface TableProps {
  children: ReactNode
  [key: string]: any
}

interface TableHeaderProps {
  children: ReactNode
  [key: string]: any
}

interface TableBodyProps {
  children: ReactNode
  [key: string]: any
}

interface TableRowProps {
  children: ReactNode
  [key: string]: any
}

interface TableCellProps {
  children: ReactNode
  [key: string]: any
}

interface TableColumnHeaderProps {
  children: ReactNode
  [key: string]: any
}

// Main Table component that wraps Table.Root
const TableRoot = forwardRef<HTMLTableElement, TableProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraTable.Root ref={ref} {...props}>
        {children}
      </ChakraTable.Root>
    )
  },
)

TableRoot.displayName = "Table"

// TableHeader component that wraps Table.Header
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ children, ...props }, ref) => {
  return (
    <ChakraTable.Header ref={ref} {...props}>
      {children}
    </ChakraTable.Header>
  )
})

TableHeader.displayName = "TableHeader"

// TableBody component that wraps Table.Body
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraTable.Body ref={ref} {...props}>
        {children}
      </ChakraTable.Body>
    )
  },
)

TableBody.displayName = "TableBody"

// TableRow component that wraps Table.Row
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraTable.Row ref={ref} {...props}>
        {children}
      </ChakraTable.Row>
    )
  },
)

TableRow.displayName = "TableRow"

// TableCell component that wraps Table.Cell
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraTable.Cell ref={ref} {...props}>
        {children}
      </ChakraTable.Cell>
    )
  },
)

TableCell.displayName = "TableCell"

// TableColumnHeader component that wraps Table.ColumnHeader
export const TableColumnHeader = forwardRef<
  HTMLTableCellElement,
  TableColumnHeaderProps
>(({ children, ...props }, ref) => {
  return (
    <ChakraTable.ColumnHeader ref={ref} {...props}>
      {children}
    </ChakraTable.ColumnHeader>
  )
})

TableColumnHeader.displayName = "TableColumnHeader"

// Create compound component structure
const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  ColumnHeader: TableColumnHeader,
})

export { Table }
export default Table