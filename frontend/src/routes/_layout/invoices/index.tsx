import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/invoices/')({
  component: () => <div>Hello /_layout/invoices/!</div>
})