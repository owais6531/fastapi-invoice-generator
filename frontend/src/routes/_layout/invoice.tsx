import { Container } from "@chakra-ui/react";
import InvoiceForm from "@/components/InvoiceForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/invoice")({
    component: InvoicePage,
});

function InvoicePage() {
    return (
        <Container maxW="full" pt={8}>
            <InvoiceForm />
        </Container>
    );
}
