import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

type PaymentReceivedClientEmailProps = {
  amount: string;
  invoiceNumber: string;
  pdfLink: string;
  brandColor?: string;
};

export function PaymentReceivedClientEmail({ amount, invoiceNumber, pdfLink, brandColor = "#534AB7" }: PaymentReceivedClientEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Ödemeniz alındı — Teşekkürler</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Ödemeniz alındı</Heading>
          <Text style={text}>Teşekkürler. {invoiceNumber} numaralı fatura için {amount} ödemeniz başarıyla alındı.</Text>
          <Button href={pdfLink} style={{ ...button, backgroundColor: brandColor }}>Makbuzu İndir</Button>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#F4F3F0", fontFamily: "Arial, sans-serif" };
const container = { backgroundColor: "#FFFFFF", borderRadius: "12px", margin: "32px auto", padding: "24px", width: "520px" };
const heading = { color: "#1A1A1A", fontSize: "20px", fontWeight: 500 };
const text = { color: "#6B6A66", fontSize: "14px", lineHeight: "1.6" };
const button = { borderRadius: "8px", color: "#FFFFFF", display: "inline-block", fontSize: "13px", fontWeight: 500, marginTop: "16px", padding: "10px 14px", textDecoration: "none" };
