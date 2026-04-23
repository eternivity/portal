import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

type FileApprovalRequestEmailProps = {
  freelancerName: string;
  count: number;
  files: Array<{ name: string; size: string }>;
  portalLink: string;
  brandColor?: string;
};

export function FileApprovalRequestEmail({ freelancerName, count, files, portalLink, brandColor = "#534AB7" }: FileApprovalRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{freelancerName} dosyalarınızın onayını bekliyor</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{count} dosya incelemenizi bekliyor</Heading>
          {files.map((file) => (
            <Section key={file.name} style={fileRow}>
              <Text style={fileName}>{file.name}</Text>
              <Text style={fileSize}>{file.size}</Text>
            </Section>
          ))}
          <Button href={portalLink} style={{ ...button, backgroundColor: brandColor }}>Dosyaları İncele</Button>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#F4F3F0", fontFamily: "Arial, sans-serif" };
const container = { backgroundColor: "#FFFFFF", borderRadius: "12px", margin: "32px auto", padding: "24px", width: "520px" };
const heading = { color: "#1A1A1A", fontSize: "20px", fontWeight: 500, margin: "0 0 16px" };
const fileRow = { borderBottom: "0.5px solid rgba(0,0,0,0.10)", padding: "10px 0" };
const fileName = { color: "#1A1A1A", fontSize: "13px", margin: 0 };
const fileSize = { color: "#6B6A66", fontSize: "12px", margin: "2px 0 0" };
const button = { borderRadius: "8px", color: "#FFFFFF", display: "inline-block", fontSize: "13px", fontWeight: 500, marginTop: "20px", padding: "10px 14px", textDecoration: "none" };
