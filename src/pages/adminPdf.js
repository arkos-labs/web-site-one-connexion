import { generateOrderPdf, generateInvoicePdf } from "../lib/pdfGenerator";

export async function downloadOrderPdf(order, client) {
  await generateOrderPdf(order, client);
}

export async function downloadInvoicePdf(invoice, orders) {
  // Map invoice fields if necessary
  const processedInvoice = {
    ...invoice,
    period: invoice.period || "—",
    total_ht: invoice.total_ht || invoice.amount || 0,
    total_ttc: invoice.total_ttc || invoice.amount * 1.2 || 0,
  };

  // Get client details from first order if not provided
  const clientData = orders[0]?.client_details || {};

  await generateInvoicePdf(processedInvoice, orders, clientData);
}


