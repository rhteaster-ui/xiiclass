# DESIGN_SYSTEM.md — E-Rekap

## 1. Design Concept
**Institutional Precision** — an official academic attendance recapitulation system built with a modern mobile-first shell: crisp tabular numerals (`JetBrains Mono`), clean geometric sans-serif (`Plus Jakarta Sans`), tinted warm-paper neutrals (`#F6F7F5`), elevated white ledger surfaces (`#FFFFFF`), and institutional emerald (`#0F5132`) as the primary restrained accent.

## 2. Semantic Color Tokens (`src/app/globals.css`)
- `--bg`: `#F6F7F5` (60% page base)
- `--surface`: `#FFFFFF` (30% raised cards/tables)
- `--surface-raised`: `#FBFCFB`
- `--surface-muted`: `#EEF2EF`
- `--ink`: `#0F172A` (WCAG AAA contrast >= 16.5:1 on `--bg` & `--surface`)
- `--ink-muted`: `#475569` (WCAG AAA contrast >= 7.5:1 on `--surface`)
- `--border`: `#DFE5E0`
- `--border-strong`: `#C6D1C8`
- `--accent`: `#0F5132` (10% primary actions/active states; white text contrast ~9.4:1)
- `--accent-hover`: `#0A3C24`
- `--accent-soft`: `#E6F2EC`
- Status tokens:
  - Hadir: `--status-hadir-bg: #E8F5EE` / `--status-hadir-fg: #0F5132`
  - Sakit: `--status-sakit-bg: #FEF3C7` / `--status-sakit-fg: #92400E`
  - Izin: `--status-izin-bg: #E0F2FE` / `--status-izin-fg: #075985`
  - Alpha: `--status-alpha-bg: #FEE2E2` / `--status-alpha-fg: #991B1B`

## 3. Typography & Iconography
- **UI & Headings:** `Plus Jakarta Sans` (`--font-sans-base`)
- **Numerals, NIS/NISN, Dates, Percentages:** `JetBrains Mono` (`.font-num` with `tabular-nums`)
- **Icons:** `@phosphor-icons/react` exclusively (`weight="fill"` when active, `weight="regular"` when inactive). Zero emojis used in UI.

## 4. Navigation & Layout Architecture
- **Desktop (`>= 1024px`):** Fixed Left Sidebar (`256px`) with 4 primary routes (`/`, `/rekap`, `/admin`, `/info`) + access badge (`Mode Review` vs `Mode Admin`).
- **Mobile (`< 1024px`):** Compact sticky top bar + floating bottom navigation dock (`min-height: 46px` per touch target).
- **Splash Screen:** Session-gated (`sessionStorage`), 650ms duration, GPU-only `transform` + `opacity` exit, respects `prefers-reduced-motion`.
- **Print Standard:** `@media print` A4 Landscape with official school header and clean bordered table (no signature block).
