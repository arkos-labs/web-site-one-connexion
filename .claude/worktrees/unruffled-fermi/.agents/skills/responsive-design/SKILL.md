---
name: Responsive Design Strategy
description: Guidelines for ensuring the website is fully responsive for iPhone, Android, and tablets.
---

# Responsive Design Strategy for One Connexion

To ensure a premium and seamless experience across all devices (iPhone, Android, Tablets, Desktop), follow these core principles:

## 1. Mobile-First Layouts
- **Navigation**: Always use a hamburger menu (3 lines) on mobile for dashboard and public pages.
- **Touch Targets**: Ensure all buttons and links are at least 44x44px for easy tapping.
- **Padding**: Use responsive spacing (e.g., `px-4` on mobile, `px-8` or more on desktop).
- **Typography**: Use Fluid Typography via Tailwind `clamp()` or scale font sizes using responsive prefixes (`text-base md:text-lg lg:text-xl`).

## 2. Component Guidelines

### Headers & Footers
- **Sticky Headers**: Mobile headers should be sticky with a backdrop-blur for a premium feel.
- **Footer Columns**: Direct 4-column layouts to stack into 1 or 2 columns on mobile.

### Mission & Data Lists
- **Cards over Tables**: On mobile, prefer Card-based layouts instead of dense tables. If tables are used, ensure they are horizontally scrollable with `overflow-x-auto`.
- **Status Badges**: Keep status badges concise.

## 3. Visual Performance
- **Media**: Background videos should be `playsInline`, `muted`, and `autoPlay`. On very small screens, consider a high-quality static placeholder if the video impacts performance.
- **Animations**: Use subtle transitions. Avoid heavy 3D elements on mobile that might cause lag.

## 4. Breakpoint Standards (Tailwind)
- **Mobile**: `< 640px` (default)
- **Tablet**: `640px - 1024px` (`sm:` to `lg:`)
- **Desktop**: `> 1024px` (`lg:`)
- **Large Screens**: `> 1280px` (`xl:`)

---
**When updating a component, always verify the mobile view first.**
