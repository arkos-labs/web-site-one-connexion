import { generateOrderPdf, generateInvoicePdf } from "../lib/pdfGenerator";

export function downloadOrderPdf(order, client) {
  generateOrderPdf(order, client);
}

export function downloadInvoicePdf(invoice, orders) {
  // Map invoice fields if necessary
  const processedInvoice = {
    ...invoice,
    period: invoice.period || "—",
    total_ht: invoice.total_ht || invoice.amount || 0,
    total_ttc: invoice.total_ttc || invoice.amount * 1.2 || 0,
  };

  // Get client details from first order if not provided
  const clientData = orders[0]?.client_details || {};

  generateInvoicePdf(processedInvoice, orders, clientData);
}
