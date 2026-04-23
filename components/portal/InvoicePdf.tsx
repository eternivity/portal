import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { invoiceTotal } from "@/lib/helpers";
import type { Invoice } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    color: "#1A1A1A"
  },
  title: {
    fontSize: 22,
    marginBottom: 16
  },
  row: {
    borderBottomColor: "rgba(0,0,0,0.10)",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  total: {
    flexDirection: "row",
    fontSize: 14,
    justifyContent: "space-between",
    marginTop: 16
  }
});

interface InvoicePdfProps {
  invoice: Invoice;
}

export function InvoicePdf({ invoice }: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Invoice {invoice.number}</Text>
        {invoice.lineItems.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text>{item.description}</Text>
            <Text>{item.quantity * item.unitPrice}</Text>
          </View>
        ))}
        <View style={styles.total}>
          <Text>Total</Text>
          <Text>{invoice.currency} {invoiceTotal(invoice)}</Text>
        </View>
      </Page>
    </Document>
  );
}
