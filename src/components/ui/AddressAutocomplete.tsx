/**
 * Composant d'autocomplétion d'adresse avec LocationIQ
 * Utilisable dans tous les formulaires du projet
 */

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { autocompleteAddress, type AddressSuggestion } from "@/lib/autocomplete";
import { rechercherVilles } from "@/data/tarifs_idf";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onAddressSelect?: (suggestion: AddressSuggestion) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    className?: string;
    inputClassName?: string;
    name?: string;
}

export const AddressAutocomplete = ({
    value,
    onChange,
    onAddressSelect,
    placeholder = "Entrez une adresse...",
    label,
    required = false,
    className = "",
    inputClassName = "",
    name
}: AddressAutocompleteProps) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const skipSearchRef = useRef(false);

    // Fermer les suggestions si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Rechercher les suggestions avec debounce optimisé
    useEffect(() => {
        const runSearch = async () => {
            if (skipSearchRef.current) {
                skipSearchRef.current = false;
                return;
            }

            if (value.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            // 1. RESULTATS IMMÉDIATS (LOCAUX)
            // On affiche tout de suite les villes de la base pour une sensation de "zéro latence"
            const localHits = rechercherVilles(value, 5);
            if (localHits.length > 0) {
                const instantSuggestions: AddressSuggestion[] = localHits.map(ville => ({
                    full: `${ville.ville} (${ville.cp})`,
                    street: "",
                    postcode: ville.cp,
                    city: ville.ville,
                    lat: "",
                    lon: "",
                    raw: null,
                    isLocal: true
                }));
                // On affiche les locaux tout de suite
                setSuggestions(instantSuggestions);
                setShowSuggestions(true);
            }

            setIsLoading(true);
            const results = await autocompleteAddress(value);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setIsLoading(false);
        };

        const timeoutId = setTimeout(runSearch, 150); // 150ms pour plus de réactivité
        return () => clearTimeout(timeoutId);
    }, [value]);

    const handleSuggestionClick = (suggestion: AddressSuggestion) => {
        // Empêcher la réouverture des suggestions au prochain changement de value
        skipSearchRef.current = true;

        // Remplir avec l'adresse complète : rue + numéro, code postal et ville
        const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
        onChange(fullAddress);
        setSuggestions([]);
        setShowSuggestions(false);

        if (onAddressSelect) {
            onAddressSelect(suggestion);
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    name={name}
                    className={cn("pl-10 pr-10", inputClassName)}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Liste des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-[9999] w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-80 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-3 hover:bg-accent cursor-pointer transition-colors border-b border-border last:border-b-0 flex items-start gap-2"
                        >
                            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {suggestion.full}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
