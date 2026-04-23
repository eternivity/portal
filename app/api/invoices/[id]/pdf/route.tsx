import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "@/components/pdf/InvoicePdfDocument";
import { sampleInvoice } from "@/lib/invoice-data";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const stream = await renderToStream(<InvoicePdfDocument invoice={{ ...sampleInvoice, id: params.id }} />);

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${params.id}.pdf"`
    }
  });
}
