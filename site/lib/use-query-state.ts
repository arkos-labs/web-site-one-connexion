"use client";
/**
 * lib/use-query-state.ts
 * Persiste un filtre (onglet, recherche, période...) dans l'URL via les
 * search params, pour qu'il survive à un rafraîchissement ou un
 * copier-coller du lien — sans ajouter d'entrée à l'historique de
 * navigation (router.replace, pas push).
 */
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryParam(key: string, defaultValue: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!next || next === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, next);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, key, defaultValue]
  );

  return [value, setValue] as const;
}
