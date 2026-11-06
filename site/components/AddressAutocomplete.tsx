"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import { joinNumberSuffix } from "@/lib/address-idf";

const IDF_DEPARTMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"];

// Établissements (hôtels, magasins, sièges…) via Photon (OpenStreetMap). Échec silencieux : on retombe sur la BAN seule.
interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  countrycode?: string;
  osm_key?: string;
  osm_type?: string;
  osm_id?: number;
}

async function fetchPlaces(q: string): Promise<{ properties: { id: string; name?: string; postcode?: string; city?: string; label: string; type: string } }[]> {
  if (q.length < 3) return [];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=48.8566&lon=2.3522&limit=8&lang=fr&bbox=1.4,48.1,3.6,49.3`,
      { signal: ctrl.signal }
    );
    const data: { features?: { properties: PhotonProperties }[] } = await res.json();
    return (data.features || [])
      .map((f) => f.properties)
      .filter((p): p is PhotonProperties =>
        p?.countrycode === "FR" &&
        IDF_DEPARTMENTS.includes(String(p.postcode ?? "").substring(0, 2)) &&
        // On ne garde que les lieux nommés, pas les simples rues ou numéros
        !!p.osm_key && p.osm_key !== "place" && !!p.name && p.name !== p.street && p.name !== p.housenumber
      )
      .map((p) => {
        const street = [p.housenumber, p.street].filter(Boolean).join(" ");
        const cityPart = p.postcode && p.city ? `${p.postcode} ${p.city}` : (p.city ?? "");
        const label = [p.name, street, cityPart].filter(Boolean).join(", ");
        return {
          properties: { id: `poi-${p.osm_type}${p.osm_id}`, name: p.name, postcode: p.postcode, city: p.city, label, type: "poi" },
        };
      });
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Numéro et nom de rue",
  required = false,
  className = "w-full rounded-xl border border-line bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Liste affichée par-dessus la page (portail) : elle ne fait jamais défiler la fenêtre qui contient le champ.
  const [pos, setPos] = useState<React.CSSProperties | null>(null);
  // Dans une fenêtre (dialog), la liste y reste : hors de la fenêtre, le verrou de défilement bloque la molette.
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  // Téléphone : liste attachée sous le champ (elle suit le champ quand le clavier fait défiler la page).
  const [inline, setInline] = useState(false);
  const isSelectingRef = useRef(false);
  const isTypingRef = useRef(false);

  // Synchronise la prop value externe avec l'état local
  useEffect(() => {
    if (!isSelectingRef.current && value !== query) {
      isTypingRef.current = false; // L'update vient de l'extérieur (ex: clique sur favori)
      setQuery(value);
    }
  }, [value, query]);

  useEffect(() => {
    // Clic en dehors pour fermer le dropdown
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sous le champ, la liste défile dans la place restante ; au-dessus seulement s'il reste moins de 120 px.
  useLayoutEffect(() => {
    if (!isOpen) return;
    if (window.matchMedia("(max-width: 767px), (pointer: coarse)").matches) {
      setInline(true);
      // Le champ en haut de l'écran : la liste a la place de s'afficher dessous, au-dessus du clavier.
      inputRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    setInline(false);
    setPortalTarget(inputRef.current?.closest('[role="dialog"]') ?? document.body);
    // Hauteur réellement visible : sur iPhone, le clavier réduit la zone visible sans changer innerHeight.
    const visibleBottom = () => window.visualViewport ? window.visualViewport.offsetTop + window.visualViewport.height : window.innerHeight;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const place = () => {
      const input = inputRef.current;
      if (!input) return;
      const r = input.getBoundingClientRect();
      const bottom = visibleBottom();
      const below = bottom - r.bottom - 8;
      if (below < 160) {
        // Pas la place dessous (clavier) : on remonte le champ puis on recalcule.
        input.scrollIntoView({ block: "center" });
        clearTimeout(retry);
        retry = setTimeout(place, 350);
        return;
      }
      setPos({
        position: "fixed",
        left: r.left,
        width: r.width,
        maxHeight: Math.min(320, below),
        top: r.bottom + 4,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    return () => {
      clearTimeout(retry);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
    };
  }, [isOpen, suggestions.length]);

  useEffect(() => {
    const fetchAddresses = async () => {
      // On ne cherche pas si le champ est vide, si on vient de sélectionner, ou si on a cliqué sur un favori (pas de frappe)
      if (query.trim().length < 1 || isSelectingRef.current || !isTypingRef.current) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // L'API refuse moins de 3 caractères : on complète avec "Paris" pour suggérer dès le 1er caractère
        const typed = joinNumberSuffix(query.trim());
        const apiQuery = typed.length < 3 ? `${typed} paris` : typed;
        // On augmente la limite à 50 pour avoir plus de chances d'avoir des résultats en Île-de-France
        const banRequest = fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(apiQuery)}&lat=48.8566&lon=2.3522&limit=50`).then((r) => r.json());
        const [data, places] = await Promise.all([banRequest, fetchPlaces(typed)]);

        if (!isSelectingRef.current && isTypingRef.current) {
          // Filtrer pour ne garder que l'Île-de-France
          const filteredFeatures = (data.features || []).filter((feature: any) => {
            const postcode = feature.properties.postcode;
            if (!postcode) return false;
            const dept = postcode.substring(0, 2);
            return IDF_DEPARTMENTS.includes(dept);
          });
          
          // Indices de répétition : « 12 rue X » propose aussi 12bis, 12ter si ces numéros existent
          const first = filteredFeatures[0];
          const typedNumber = typed.match(/^(\d+)\s+\D/)?.[1];
          if (first?.properties?.type === "housenumber" && typedNumber && first.properties.housenumber === typedNumber) {
            const variants = await Promise.all(["bis", "ter"].map(async (suffix) => {
              try {
                const vq = `${typedNumber}${suffix} ${first.properties.street} ${first.properties.postcode} ${first.properties.city}`;
                const vr = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(vq)}&limit=1`);
                const vf = (await vr.json()).features?.[0];
                const ok = vf?.properties?.type === "housenumber"
                  && String(vf.properties.housenumber).toLowerCase() === `${typedNumber}${suffix}`
                  && vf.properties.postcode === first.properties.postcode;
                return ok ? vf : null;
              } catch { return null; }
            }));
            filteredFeatures.splice(1, 0, ...variants.filter(Boolean));
          }

          // Établissements d'abord (3 au plus), puis adresses ; 6 suggestions au total
          setSuggestions([...places.slice(0, 3), ...filteredFeatures].slice(0, 6));
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresse", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce de 300ms
    const timeoutId = setTimeout(() => {
      fetchAddresses();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (feature: any) => {
    isSelectingRef.current = true;
    const addressName = feature.properties.label;
    setQuery(addressName);
    onChange(addressName);
    setIsOpen(false);
    setSuggestions([]);
    
    // Reset the selecting flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 400);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          isTypingRef.current = true; // Le changement vient de l'utilisateur
          setQuery(e.target.value);
          onChange(e.target.value); // Met à jour le parent en temps réel
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        className={className}
        required={required}
      />
      
      {isOpen && suggestions.length > 0 && (inline || (pos && portalTarget)) && (() => {
        const list = (
        <ul
          ref={listRef}
          style={inline ? undefined : pos ?? undefined}
          className={`z-[9999] overflow-auto rounded-xl border border-line bg-white py-1 text-left shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${inline ? "absolute left-0 right-0 top-full mt-1 max-h-[40vh]" : ""}`}
        >
          {suggestions.map((feature) => (
            <li
              key={feature.properties.id}
              onClick={() => handleSelect(feature)}
              className="flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-[#FAFAFA]"
            >
              <MapPin size={16} className="mt-0.5 shrink-0 text-muted" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-ink">
                  {feature.properties.name}
                </span>
                <span className="text-xs text-muted">
                  {feature.properties.postcode} {feature.properties.city}
                </span>
              </div>
            </li>
          ))}
        </ul>
        );
        return inline ? list : createPortal(list, portalTarget!);
      })()}
    </div>
  );
}
