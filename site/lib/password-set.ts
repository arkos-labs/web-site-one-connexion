/**
 * lib/password-set.ts (navigateur)
 * À appeler après un changement de mot de passe réussi : le compte n'est plus « sans mot de passe »
 * (voir app/api/account/password-set). Sans échec bloquant.
 */
export async function markPasswordSet(): Promise<void> {
  await fetch("/api/account/password-set", { method: "POST" }).catch(() => {});
}
