---
name: Premium PDF Templates Strategy
description: Guidelines for generating high-end, professional, and branded PDF documents (Order Forms and Invoices) using jsPDF.
---

# Premium PDF Templates Strategy

This skill defines the standards for generating "best-in-class" logistics documents. The goal is to provide documents that feel premium, modern, and aligned with the **One Connexion** brand identity.

## 1. Visual Identity & Design Tokens

*   **Primary Color**: `#ed5518` (One Connexion Orange) — Use for accents, headers, and call-to-action areas.
*   **Secondary Color**: `#0f172a` (Deep Slate) — Use for main headers and high-contrast text.
*   **Body Text**: `#1e293b` (Slate 800).
*   **Muted Text**: `#64748b` (Slate 500).
*   **Layout**: A4 (A4 is the standard). Use 40pt margins for a professional "airy" feel.

## 2. Universal Document Structure (Header & Footer)

### Header (Common to BC and Facture)
*   **Background Block**: A deep slate (`#0f172a`) rectangle at the top with a subtle 20px height orange accent line at the bottom.
*   **Logo/Title**: Large, bold company name in white.
*   **Issuer Info**: Address, SIRET, TVA, and Email in small, high-contrast white text.
*   **Document Type Badge**: A prominent rounded orange (`#ed5518`) rectangle on the right containing the document title (e.g., "BON DE COMMANDE") and the Reference Number.

### Footer (Universal)
*   **Clean Disclaimer**: A single-line centered text with light slate (`#94a3b8`) color containing Company name, Siret, and Legal address.

## 3. Bon de Commande (BC) Specifics

The BC is a **Mission Record**. It must focus on operational efficiency and tracking.

*   **Mission Status Grid**:
    *   **Donneur d'Ordre**: Clear block with client name, contact, and phone.
    *   **Détails Logistiques**: Formula type (Exclu/Normal), Vehicle type (Moto/Voiture), and Priority.
*   **Interactive Progress Bar**: (Optional but premium) A visual timeline of the mission.
*   **Address Cards**: Use rounded grayscale (`#f8fafc`) rectangles with headers "DÉPART" and "ARRIVÉE". Use bold text for cities and regular for full addresses. Include access codes prominently in orange.
*   **Signatures Area**: Dedicated space for "Signature Client" and "Signature Livreur" at the bottom.

## 4. Facture (Invoice) Specifics

The Invoice is a **Financial Document**. It must focus on tax compliance and payment clarity.

*   **Billing Summary**:
    *   **Facturé à**: Prominent client billing address.
    *   **Période**: Dates covered by the invoice.
*   **Financial Table**:
    *   Alternating row colors (white/slate-50) for readability.
    *   Columns: Date, Réf, Description, TVA (%), Total HT. [Note: VAT in France is 20%]
*   **Totals Block**:
    *   A dedicated right-aligned summary block.
    *   Clear breakdown: Total HT, TVA (20%), Total TTC.
    *   **Total à Payer**: Large, bold price in orange or deep slate.
*   **Payment Terms**: Bank details (IBAN/BIC) and Payment deadline (e.g., 30 days) in a clear section below the totals.

## 5. Technical Implementation with jsPDF

*   **Always use point (pt) units**: It's more predictable for A4.
*   **Variable Y position**: Always track `y` position to prevent character overlapping.
*   **Safe Defaults**: If a client's company name or phone is missing, use "Client" or "—" to prevent `.toFixed()` or `.split()` errors.
*   **Auto-page breaks**: For long invoices, implement a check on `y > pageHeight - margin` to add a new page.
