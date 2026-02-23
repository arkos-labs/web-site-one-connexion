export const fetchSiret = async (companyName, postalCodeOrCity = "") => {
    if (!companyName) return "";
    try {
        const query = encodeURIComponent(`${companyName} ${postalCodeOrCity}`.trim());
        const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${query}&per_page=1`);
        if (!res.ok) return "";
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
            // Returns a formatted SIRET or just the raw SIRET string
            // Formatting it slightly for readability: 14 chars
            const siret = data.results[0].siege?.siret || data.results[0].dirigeants?.[0]?.siren || "";
            if (siret && siret.length === 14) {
                return `${siret.slice(0, 3)} ${siret.slice(3, 6)} ${siret.slice(6, 9)} ${siret.slice(9)}`;
            }
            return siret;
        }
    } catch (error) {
        console.error("Siret fetching error:", error);
    }
    return "";
};
