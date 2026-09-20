"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      // On ne cherche pas si moins de 3 caractères, si on vient de sélectionner, ou si on a cliqué sur un favori (pas de frappe)
      if (query.length < 3 || isSelectingRef.current || !isTypingRef.current) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // On augmente la limite à 50 pour avoir plus de chances d'avoir des résultats en Île-de-France
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&lat=48.8566&lon=2.3522&limit=50`);
        const data = await res.json();
        
        if (!isSelectingRef.current && isTypingRef.current) {
          // Départements de la région Île-de-France
          const idfDepartments = ["75", "77", "78", "91", "92", "93", "94", "95"];
          
          // Filtrer pour ne garder que l'Île-de-France
          const filteredFeatures = (data.features || []).filter((feature: any) => {
            const postcode = feature.properties.postcode;
            if (!postcode) return false;
            const dept = postcode.substring(0, 2);
            return idfDepartments.includes(dept);
          });
          
          // Ne garder que les 12 meilleurs résultats
          setSuggestions(filteredFeatures.slice(0, 12));
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
      
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 z-[9999] mt-1 max-h-[500px] overflow-auto rounded-xl border border-line bg-white py-1 shadow-2xl">
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
      )}
    </div>
  );
}
