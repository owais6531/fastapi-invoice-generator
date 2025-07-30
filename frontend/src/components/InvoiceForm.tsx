import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    Input,
    Textarea,
    Text,
    Heading
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface ServiceItem {
    service_description: string;
    quantity: number;
    unit_price: number;
}

export default function InvoiceForm() {
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<ServiceItem[]>([
        { service_description: "", quantity: 1, unit_price: 0 },
    ]);
    const [result, setResult] = useState<string>("");

    const handleItemChange = (idx: number, field: keyof ServiceItem, value: string | number) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === idx ? { ...item, [field]: field === "service_description" ? value : Number(value) } : item
            )
        );
    };

    const addItem = () => {
        setItems((prev) => [...prev, { service_description: "", quantity: 1, unit_price: 0 }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new URLSearchParams();
        formData.append("client_name", clientName);
        formData.append("client_phone", clientPhone);
        formData.append("client_email", clientEmail);
        items.forEach((item) => {
            formData.append("service_description", item.service_description);
            formData.append("quantity", String(item.quantity));
            formData.append("unit_price", String(item.unit_price));
        });
        formData.append("notes", notes);
        const res = await fetch("/api/v1/invoice/generate", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });
        setResult(await res.text());
    };

    return (
        <Container maxW="2xl" py={8} px={{ base: 2, md: 8 }} bg="white" borderRadius="lg" boxShadow="lg">
            <Heading as="h2" size="lg" textAlign="center" mb={6} color="purple.700">
                Professional Invoice Generator
            </Heading>
            <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection={{ base: "column", md: "row" }} gap={4} mb={4}>
                    <Box flex={1}>
                        <Text fontWeight="semibold" mb={1}>Client Name</Text>
                        <Input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
                    </Box>
                    <Box flex={1}>
                        <Text fontWeight="semibold" mb={1}>Phone</Text>
                        <Input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                    </Box>
                </Box>
                <Box mb={4}>
                    <Text fontWeight="semibold" mb={1}>Email</Text>
                    <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                </Box>
                <Box borderTopWidth={1} pt={4} mt={6}>
                    <Text fontWeight="bold" fontSize="lg" mb={2}>Service Details</Text>
                    <Box display="flex" flexDirection="column" gap={2}>
                        {items.map((item, idx) => (
                            <Box key={idx} display="flex" gap={4} mb={2}>
                                <Input type="text" value={item.service_description} onChange={e => handleItemChange(idx, "service_description", e.target.value)} placeholder="Description" required />
                                <Input type="number" value={item.quantity} min={1} onChange={e => handleItemChange(idx, "quantity", e.target.value)} placeholder="Qty" required />
                                <Input type="number" value={item.unit_price} min={0} step={0.01} onChange={e => handleItemChange(idx, "unit_price", e.target.value)} placeholder="Unit Price ($)" required />
                            </Box>
                        ))}
                        <Button onClick={addItem} size="sm" variant="ghost" colorScheme="purple" alignSelf="flex-start" mt={1}>
                            <FaPlus style={{ marginRight: 4 }} /> Add another service
                        </Button>
                    </Box>
                </Box>
                <Box mt={4} mb={2}>
                    <Text fontWeight="semibold" mb={1}>Billing Notes (Optional)</Text>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="e.g. Pay within 7 days via bank transfer or mobile money." />
                </Box>
                <Button type="submit" colorScheme="purple" w="full" fontWeight="bold" py={2} mt={2}>
                    Generate Invoice PDF
                </Button>
            </form>
            <Box id="result" mt={6} dangerouslySetInnerHTML={{ __html: result }} />
        </Container>
    );
}
