/**
 * tailwind.config.ts
 * Design system tokens pour ONE CONNEXION — registre sobre (noir mat,
 * blanc cassé, orange en accent). Les tokens de couleur/police vivent
 * en réalité dans app/globals.css (@theme, Tailwind v4 CSS-first) ; ce
 * fichier les reflète pour les outils qui lisent encore la config JS.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E0F10",
        paper: "#F4F2EE",
        "paper-card": "#FBFAF8",
        line: "#DFDCD6",
        muted: "#4A4845",
        label: "#8C8882",
        accent: "#ed5518",
        "accent-dark": "#c94410",
      },
      borderRadius: {
        brand: "2px", // radius quasi nul = registre sérieux, pas "app mignonne"
      },
      fontFamily: {
        sans: ["var(--font-body)", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
