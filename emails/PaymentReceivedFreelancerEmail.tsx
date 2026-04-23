import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

type PaymentReceivedFreelancerEmailProps = {
  clientName: string;
  amount: string;
  projectName: string;
  date: string;
};

export function PaymentReceivedFreelancerEmail({ clientName, amount, projectName, date }: PaymentReceivedFreelancerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{clientName} ödemesini tamamladı — {amount}</Preview>
      <Body style={body}>
        <Container style={container}>
          <div style={check}>✓</div>
          <Heading style={heading}>{clientName} ödemesini tamamladı</Heading>
          <Text style={amountStyle}>{amount}</Text>
          <Text style={text}>Proje: {projectName}</Text>
          <Text style={text}>Tarih: {date}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#F4F3F0", fontFamily: "Arial, sans-serif" };
const container = { backgroundColor: "#FFFFFF", borderRadius: "12px", margin: "32px auto", padding: "24px", width: "520px" };
const check = { alignItems: "center", backgroundColor: "#E1F5EE", borderRadius: "999px", color: "#0F6E56", display: "flex", fontSize: "24px", height: "44px", justifyContent: "center", width: "44px" };
const heading = { color: "#1A1A1A", fontSize: "20px", fontWeight: 500 };
const amountStyle = { color: "#0F6E56", fontSize: "32px", fontWeight: 500, margin: "0 0 12px" };
const text = { color: "#6B6A66", fontSize: "14px", lineHeight: "1.6", margin: "4px 0" };
