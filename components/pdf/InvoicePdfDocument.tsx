import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DashboardInvoice } from "@/lib/invoice-data";
import { calculateInvoiceTotals } from "@/lib/invoice-data";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, color: "#1A1A1A", fontFamily: "Helvetica" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 18, marginBottom: 2 },
  muted: { color: "#6B6A66" },
  badge: { backgroundColor: "#EEEDFE", color: "#534AB7", paddingHorizontal: 8, paddingVertical: 4 },
  section: { marginTop: 24 },
  tableHeader: { borderBottomWidth: 0.5, borderBottomColor: "rgba(0,0,0,0.10)", paddingBottom: 8, color: "#6B6A66" },
  line: { borderBottomWidth: 0.5, borderBottomColor: "rgba(0,0,0,0.10)", paddingVertical: 9 },
  total: { borderTopWidth: 0.5, borderTopColor: "rgba(0,0,0,0.10)", marginTop: 8, paddingTop: 8, fontSize: 15 },
  due: { marginTop: 24, padding: 12, backgroundColor: "#FAEEDA", color: "#854F0B" }
});

export function InvoicePdfDocument({ invoice }: { invoice: DashboardInvoice }) {
  const totals = calculateInvoiceTotals(invoice.line_items, invoice.tax_rate);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View>
            <Text style={styles.title}>{invoice.freelancer_name}</Text>
            <Text style={styles.muted}>{invoice.freelancer_email} · {invoice.freelancer_city}</Text>
          </View>
          <View>
            <Text style={styles.muted}>FATURA NO</Text>
            <Text>#{invoice.invoice_number}</Text>
            <Text style={styles.badge}>{invoice.status}</Text>
          </View>
        </View>

        <View style={[styles.row, styles.section]}>
          <View>
            <Text style={styles.muted}>GONDEREN</Text>
            <Text>{invoice.freelancer_name}</Text>
            <Text style={styles.muted}>{invoice.freelancer_email}</Text>
          </View>
          <View>
            <Text style={styles.muted}>ALICI</Text>
            <Text>{invoice.client_name}</Text>
            <Text style={styles.muted}>{invoice.client_email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text>Hizmet</Text>
            <Text>Toplam</Text>
          </View>
          {invoice.line_items.map((item) => (
            <View key={item.id} style={[styles.row, styles.line]}>
              <Text>{item.description} x {item.quantity}</Text>
              <Text>{invoice.currency} {item.quantity * item.unit_price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.row}><Text style={styles.muted}>Ara toplam</Text><Text>{invoice.currency} {totals.subtotal}</Text></View>
          <View style={styles.row}><Text style={styles.muted}>KDV (%{invoice.tax_rate})</Text><Text>{invoice.currency} {totals.tax}</Text></View>
          <View style={[styles.row, styles.total]}><Text>Toplam</Text><Text>{invoice.currency} {totals.total}</Text></View>
        </View>

        <View style={[styles.row, styles.due]}>
          <Text>Son odeme tarihi</Text>
          <Text>{invoice.due_date}</Text>
        </View>
      </Page>
    </Document>
  );
}
