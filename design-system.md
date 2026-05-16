# DESIGN SYSTEM
## Dog Photography Studio — Brand & Web Guidelines

---

## 01 — BRAND PHILOSOPHY

The visual language is rooted in **editorial minimalism** — the aesthetic of a high-end photography monograph. Black, white, and warm off-white dominate. Typography is bold, confident, and condensed in display contexts; quiet and refined in body copy. Every element earns its place. Nothing is decorative without function.

**Keywords:** Editorial · Refined · Quiet confidence · Black & white · Tactile · Timeless

---

## 02 — COLOR PALETTE

### Primary Colors

| Role | Name | HEX | RGB | Sample |
|------|------|-----|-----|--------|
| Background | Warm Parchment | `#F5F2EC` | 245, 242, 236 | ████████ |
| Ink Black | Deep Black | `#0A0A0A` | 10, 10, 10 | ████████ |
| Text Secondary | Warm Grey | `#6B6560` | 107, 101, 96 | ████████ |
| Rule / Divider | Stone | `#C8C2BA` | 200, 194, 186 | ████████ |

### Secondary / Accent Colors

| Role | Name | HEX | RGB | Sample |
|------|------|-----|-----|--------|
| Warm Highlight | Linen | `#EDE8DF` | 237, 232, 223 | ████████ |
| Dark Surface | Charcoal | `#1C1A18` | 28, 26, 24 | ████████ |
| Hover State | Graphite | `#3A3835` | 58, 56, 53 | ████████ |

### Usage Rules

- **Never** place text below 4.5:1 contrast ratio
- Body text is always `#0A0A0A` on `#F5F2EC` — not pure `#000000`
- Sections alternate between `#F5F2EC` (warm) and `#FFFFFF` (neutral) — never cold grey
- Accent colour (if needed): a single warm terracotta `#B8601A` — used sparingly, max 1× per page

---

## 03 — TYPOGRAPHY

### Font Stack

#### Display / Headlines — **Barlow Condensed**
```
font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
```
> Google Fonts — Free. Replaces the grotesque condensed seen in references (similar to Neue Haas Grotesk Condensed, Berthold Akzidenz Grotesk Condensed).
> Use at weight **700** for all display headings.

#### Body / UI — **Barlow**
```
font-family: 'Barlow', 'Helvetica Neue', sans-serif;
```
> Paired with display font from the same family.
> Use at weights **300** (body), **400** (UI labels), **500** (buttons, nav).

#### Monospace / Labels — **JetBrains Mono** *(optional)*
```
font-family: 'JetBrains Mono', 'Courier New', monospace;
```
> For small metadata: dates, codes, coordinates, technical labels.
> Weight **400** only. All-caps with letter-spacing `0.15em`.

---

## 04 — TYPE SCALE

The scale follows a **Major Third (1.25×)** ratio, rooted at 16px base.

```
Base unit: 1rem = 16px
Scale ratio: 1.25 (Major Third)
```

| Token | Name | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| `--text-display` | Display | `clamp(64px, 10vw, 120px)` | 700 | 0.9 | −0.02em | Hero, section titles |
| `--text-h1` | Heading 1 | `clamp(40px, 6vw, 72px)` | 700 | 0.95 | −0.015em | Page titles |
| `--text-h2` | Heading 2 | `clamp(28px, 4vw, 48px)` | 700 | 1.0 | −0.01em | Section headings |
| `--text-h3` | Heading 3 | `24px` | 700 | 1.1 | 0 | Subsections |
| `--text-h4` | Heading 4 | `18px` | 400 | 1.2 | 0.05em | Labels (uppercase) |
| `--text-body-lg` | Body Large | `18px` | 300 | 1.65 | 0 | Intro paragraphs |
| `--text-body` | Body | `16px` | 300 | 1.7 | 0 | Default body copy |
| `--text-small` | Small | `13px` | 400 | 1.5 | 0.08em | Captions, metadata |
| `--text-micro` | Micro | `11px` | 400 | 1.4 | 0.15em | Tags, labels (always uppercase) |

### Type Specimens

```
DISPLAY (700, condensed, tight):
Váš pes. Navždy.
Your Dog. Forever.

H1 (700, condensed):
Photography Studio Praha

H2 (700, condensed):
Latest Sessions

BODY (300, regular):
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore.

MICRO LABEL (400, uppercase, tracked):
BOOK A SESSION  ·  PRAGUE, CZ  ·  2024
```

---

## 05 — SPACING SYSTEM

Based on an **8px grid**.

```
--space-1:   4px    (0.25rem)   — micro gap
--space-2:   8px    (0.5rem)    — tight
--space-3:   16px   (1rem)      — base unit
--space-4:   24px   (1.5rem)    — comfortable
--space-5:   32px   (2rem)      — relaxed
--space-6:   48px   (3rem)      — section padding mobile
--space-7:   64px   (4rem)      — section padding tablet
--space-8:   96px   (6rem)      — section padding desktop
--space-9:   128px  (8rem)      — hero padding
--space-10:  192px  (12rem)     — large editorial gaps
```

**Layout widths:**
```
--max-width-text:    680px   — body copy columns
--max-width-wide:    1200px  — general content
--max-width-full:    1440px  — full bleed max
--gutter:            clamp(24px, 5vw, 80px)
```

---

## 06 — GRAPHIC ELEMENTS

Inspired by the references: editorial photography books, Swiss typographic design, and hand-drawn organic accents.

### 6.1 Rules & Lines
- **Hairline rule:** 1px, `#C8C2BA` — used as section dividers
- **Heavy rule:** 2–3px, `#0A0A0A` — used sparingly as accent separator
- Horizontal rules span **full column width**, never the full viewport

### 6.2 Grid Numbers / Metadata Labels
Small counters and metadata displayed in **JetBrains Mono**, uppercase, `#6B6560`:
```
01 — About
02 — Gallery
03 — Book
```

### 6.3 Bracket Typography (from reference)
Descriptive labels wrapped in square brackets:
```
[ ABOUT ]     [ GALLERY ]     [ CONTACT ]
```
Used as section tags, always `font-size: 11px`, letter-spacing `0.15em`, uppercase.

### 6.4 Botanical / Sketch Elements *(from Liam Bennett reference)*
Optional hand-drawn botanical SVG overlays — positioned at section transitions or beside display headings. Style: thin stroke, `#0A0A0A`, stroke-width 1px. Never filled.

### 6.5 Photography Treatment
- All photos displayed in **black & white** (CSS: `filter: grayscale(100%)`)
- Hover state: subtle brightness lift (`filter: grayscale(100%) brightness(1.08)`)
- No rounded corners on photos — always hard edges
- Aspect ratios: `3:2` (landscape), `2:3` (portrait), `1:1` (square gallery grid)

### 6.6 Overlapping / Offset Layouts
- Pull images slightly outside their grid column (negative margin)
- Overlap text and image at section boundaries
- Date/number counters bleed off the edge of the viewport

---

## 07 — UI COMPONENTS

### Navigation
```
Position: fixed top, full width
Background: transparent → rgba(245,242,236,0.95) on scroll
Font: Barlow 400, 13px, letter-spacing 0.1em, uppercase
Padding: 24px gutter
Logo: left | Nav links: right
Mobile: hamburger → full-screen overlay
```

### Buttons
```
Primary:
  Background: #0A0A0A
  Text: #F5F2EC, Barlow 500, 12px, uppercase, letter-spacing 0.15em
  Padding: 14px 32px
  Border-radius: 0 (sharp)
  Hover: background → #3A3835

Secondary (ghost):
  Background: transparent
  Border: 1px solid #0A0A0A
  Text: #0A0A0A
  Hover: background #0A0A0A, text #F5F2EC
```

### Form Fields
```
Border: none
Border-bottom: 1px solid #C8C2BA (underline style only)
Background: transparent
Font: Barlow 300, 16px
Placeholder: #6B6560
Focus: border-bottom → 1px solid #0A0A0A
Padding: 12px 0
```

---

## 08 — ANIMATION PRINCIPLES

- **Duration:** 300ms (micro), 600ms (reveal), 900ms (page transition)
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — fast out, natural settle
- **Image reveal:** clip-path or opacity fade, triggered on scroll
- **Text:** stagger reveals by 80ms per line
- **Never:** bounce, spin, or anything playful — the aesthetic is still and considered

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);
--duration-fast: 300ms;
--duration-base: 600ms;
--duration-slow: 900ms;
```

---

## 09 — CSS VARIABLES REFERENCE

```css
:root {
  /* Colors */
  --color-bg:          #F5F2EC;
  --color-ink:         #0A0A0A;
  --color-ink-soft:    #6B6560;
  --color-rule:        #C8C2BA;
  --color-surface:     #EDE8DF;
  --color-charcoal:    #1C1A18;

  /* Typography */
  --font-display:      'Barlow Condensed', 'Arial Narrow', sans-serif;
  --font-body:         'Barlow', 'Helvetica Neue', sans-serif;
  --font-mono:         'JetBrains Mono', 'Courier New', monospace;

  /* Type Scale */
  --text-display:      clamp(4rem, 10vw, 7.5rem);
  --text-h1:           clamp(2.5rem, 6vw, 4.5rem);
  --text-h2:           clamp(1.75rem, 4vw, 3rem);
  --text-h3:           1.5rem;
  --text-h4:           1.125rem;
  --text-body-lg:      1.125rem;
  --text-body:         1rem;
  --text-small:        0.8125rem;
  --text-micro:        0.6875rem;

  /* Spacing */
  --space-1:   0.25rem;
  --space-2:   0.5rem;
  --space-3:   1rem;
  --space-4:   1.5rem;
  --space-5:   2rem;
  --space-6:   3rem;
  --space-7:   4rem;
  --space-8:   6rem;
  --space-9:   8rem;
  --space-10:  12rem;

  /* Layout */
  --max-width-text:  680px;
  --max-width-wide:  1200px;
  --gutter:          clamp(1.5rem, 5vw, 5rem);

  /* Animation */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast:   300ms;
  --duration-base:   600ms;
  --duration-slow:   900ms;
}
```

---

## 10 — DO & DON'T

| ✅ DO | ❌ DON'T |
|-------|----------|
| Use Barlow Condensed Bold for all headlines | Use system fonts (Arial, Roboto) |
| Keep photos black & white | Mix color and B&W photos |
| Use sharp (0px) border-radius | Round corners on photos or buttons |
| Generous whitespace between sections | Crowd elements together |
| Alternate warm white / white backgrounds | Use cold grey backgrounds |
| Underline-style form fields | Boxed input fields |
| Numbered sections `01 —` | Bullet point lists in the UI |
| Tightly tracked uppercase labels | Mixed-case UI labels |
| Thin 1px hairline rules | Heavy decorative borders |

---

*Design System v1.0 — May 2025*
*For questions: update this document before starting development.*
