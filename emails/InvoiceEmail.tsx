import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

type InvoiceEmailProps = {
  freelancerName: string;
  amount: string;
  dueDate: string;
  projectName: string;
  paymentLink: string;
  brandColor?: string;
};

export function InvoiceEmail({ freelancerName, amount, dueDate, projectName, paymentLink, brandColor = "#534AB7" }: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{freelancerName} size {amount} tutarında fatura gönderdi</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Yeni fatura</Heading>
          <Text style={amountStyle}>{amount}</Text>
          <Text style={text}>Proje: {projectName}</Text>
          <Text style={text}>Son ödeme tarihi: {dueDate}</Text>
          <Section style={{ marginTop: "20px" }}>
            <Button href={paymentLink} style={{ ...button, backgroundColor: brandColor }}>Şimdi Öde</Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#F4F3F0", fontFamily: "Arial, sans-serif" };
const container = { backgroundColor: "#FFFFFF", borderRadius: "12px", margin: "32px auto", padding: "24px", width: "520px" };
const heading = { color: "#1A1A1A", fontSize: "20px", fontWeight: 500, margin: "0 0 12px" };
const amountStyle = { color: "#1A1A1A", fontSize: "32px", fontWeight: 500, margin: "0 0 12px" };
const text = { color: "#6B6A66", fontSize: "14px", lineHeight: "1.6", margin: "4px 0" };
const button = { borderRadius: "8px", color: "#FFFFFF", fontSize: "13px", fontWeight: 500, padding: "10px 14px", textDecoration: "none" };
