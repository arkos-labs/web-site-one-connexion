/**
 * app/api/validate-siret/route.ts
 * Valider un SIRET et les infos B2B
 */
import { NextRequest, NextResponse } from "next/server";
import { validateB2BInfo } from "@/lib/sirene-validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siret, raison_sociale, email, nom_contact, adresse_facturation } =
      body;

    // Validation
    const result = await validateB2BInfo({
      siret,
      raison_sociale,
      email,
      nom_contact,
      adresse_facturation,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("SIRET validation error:", err);
    return NextResponse.json(
      { valid: false, errors: ["Erreur serveur lors de la validation."] },
      { status: 500 }
    );
  }
}
