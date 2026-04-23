import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

type PortalInviteEmailProps = {
  freelancerName: string;
  clientName: string;
  projectTitle: string;
  portalLink: string;
  brandColor?: string;
};

export function PortalInviteEmail({
  freelancerName,
  clientName,
  projectTitle,
  portalLink,
  brandColor = "#534AB7"
}: PortalInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{freelancerName} sizinle bir proje paylaştı</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: brandColor }}>
            <Text style={logo}>● PortalKit</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>Merhaba {clientName},</Heading>
            <Text style={text}>
              {freelancerName}, &apos;{projectTitle}&apos; projesini sizinle paylaştı.
            </Text>
            <Button href={portalLink} style={{ ...button, backgroundColor: brandColor }}>
              Projeyi Görüntüle
            </Button>
            <Text style={footer}>Bu davet {freelancerName} tarafından gönderildi.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#F4F3F0", fontFamily: "Arial, sans-serif", margin: 0 };
const container = { backgroundColor: "#FFFFFF", borderRadius: "12px", margin: "32px auto", overflow: "hidden", width: "560px" };
const header = { padding: "18px 24px" };
const logo = { color: "#FFFFFF", fontSize: "15px", fontWeight: 500, margin: 0 };
const content = { padding: "24px" };
const heading = { color: "#1A1A1A", fontSize: "20px", fontWeight: 500, margin: "0 0 12px" };
const text = { color: "#6B6A66", fontSize: "14px", lineHeight: "1.6" };
const button = { borderRadius: "8px", color: "#FFFFFF", display: "inline-block", fontSize: "13px", fontWeight: 500, padding: "10px 14px", textDecoration: "none" };
const footer = { color: "#9E9D99", fontSize: "12px", marginTop: "24px" };
