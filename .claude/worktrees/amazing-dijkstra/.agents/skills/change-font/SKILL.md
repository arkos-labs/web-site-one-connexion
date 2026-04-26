# Skill: Change Global Font

## Description
This skill changes the global typography (font) across the **entire One Connexion website** by updating two files:
1. `index.html` — the Google Fonts `<link>` tag in `<head>`
2. `src/index.css` — the CSS variables `--font-title` and `--font-body`

---

## How to Use

When the user says: "change the font to [FontName]" or "teste la police [FontName]", follow these exact steps:

---

## Step 1 — Identify the Font

Look up the exact Google Fonts URL for the requested font. Use this reference list of popular fonts (all from fonts.google.com):

| Font Name        | Google Fonts URL fragment                                                                 | CSS Name            |
|------------------|------------------------------------------------------------------------------------------|---------------------|
| Archivo          | `family=Archivo:ital,wdth,wght@0,62.5..125,100..900;1,62.5..125,100..900`              | `"Archivo"`         |
| Inter            | `family=Inter:wght@100..900`                                                              | `"Inter"`           |
| Poppins          | `family=Poppins:wght@300;400;600;700;800;900`                                            | `"Poppins"`         |
| Montserrat       | `family=Montserrat:wght@300;400;600;700;800;900`                                         | `"Montserrat"`      |
| Raleway          | `family=Raleway:wght@300;400;600;700;800;900`                                            | `"Raleway"`         |
| Outfit           | `family=Outfit:wght@100..900`                                                             | `"Outfit"`          |
| DM Sans          | `family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,100..900`                       | `"DM Sans"`         |
| Geist            | `family=Geist:wght@100..900`                                                              | `"Geist"`           |
| Space Grotesk    | `family=Space+Grotesk:wght@300..700`                                                     | `"Space Grotesk"`   |
| Plus Jakarta Sans| `family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800`                               | `"Plus Jakarta Sans"`|
| Syne             | `family=Syne:wght@400..800`                                                               | `"Syne"`            |
| Barlow           | `family=Barlow:wght@300;400;600;700;800;900`                                             | `"Barlow"`          |
| Lexend           | `family=Lexend:wght@100..900`                                                             | `"Lexend"`          |
| Manrope          | `family=Manrope:wght@200..800`                                                            | `"Manrope"`         |
| Urbanist         | `family=Urbanist:wght@100..900`                                                           | `"Urbanist"`        |
| Nunito           | `family=Nunito:wght@200..1000`                                                            | `"Nunito"`          |
| Figtree          | `family=Figtree:wght@300..900`                                                            | `"Figtree"`         |

If the font is not in this list, construct the Google Fonts URL manually using the pattern:
`https://fonts.googleapis.com/css2?family=FONT_NAME:wght@100..900&display=swap`

---

## Step 2 — Update `index.html`

File: `c:\Users\CHERK\OneDrive\Desktop\ONE CONNEXION\livraison-react\index.html`

**Find and replace** the existing Google Fonts `<link>` tag (lines 64–66 approximately):

```html
<link
  href="https://fonts.googleapis.com/css2?family=CURRENT_FONT...&display=swap"
  rel="stylesheet">
```

**Replace with** the new font's full Google Fonts URL. Always keep `display=swap`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=NEW_FONT_URL&display=swap"
  rel="stylesheet">
```

Keep the two `<link rel="preconnect">` tags above it — do NOT remove them.

---

## Step 3 — Update `src/index.css`

File: `c:\Users\CHERK\OneDrive\Desktop\ONE CONNEXION\livraison-react\src\index.css`

Update the two CSS variables inside `:root` to use the new font name:

```css
:root {
  --brand-orange: #ed5518;
  --font-title: "NEW_FONT_NAME", sans-serif;
  --font-body: "NEW_FONT_NAME", sans-serif;
}
```

Replace `NEW_FONT_NAME` with the exact CSS name from the table above (e.g., `"Inter"`, `"Poppins"`, etc.).

---

## Step 4 — Optionally Update the Extra @import in index.css

At line 3 of `src/index.css`, there is sometimes an extra `@import url(...)` for Montserrat and Poppins. If the new font differs from what's in `index.html`, **remove or replace** that `@import` line to avoid loading unnecessary fonts.

Keep only one font source per font family. If the new font is already set via `index.html`, **remove the `@import` line in `index.css`** entirely.

---

## Step 5 — Confirm to the User

After making both edits, tell the user:
- ✅ The font has been changed to **[FontName]** on the entire site
- 📄 Files modified: `index.html` and `src/index.css`
- 🔄 Ask them to refresh the browser (`npm run dev` should already be running)
- 💡 Optionally suggest 2–3 other fonts they might want to try next

---

## Important Rules

- NEVER change the `--brand-orange` color variable
- NEVER remove the `preconnect` links in index.html
- NEVER modify component-level font-families (inline styles or class overrides) — only change the two CSS variables
- ALWAYS test that the Google Fonts URL is valid by constructing it from the table above
- The font applies globally because `body` in `index.css` uses `font-family: var(--font-body)` and all headings use `var(--font-title)`
