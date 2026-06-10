# HireReadyAI — Design System & Localization Specification

> **Source of truth** for migrating the HireReadyAI design system into another project.
> Extracted from `src/index.css`, `src/components/ui/*`, `src/shared/ui/*`, `src/shared/i18n/*`, `src/shared/context/theme.jsx`, and feature-level component patterns.

---

## 1. Brand Overview

### Product Name

**HireReadyAI**

### Brand Description

An AI-powered recruitment platform that connects top talent with forward-thinking companies. It provides end-to-end hiring tools including AI job description generation, smart CV evaluation, async AI interviews (video/text/code), visual candidate pipelines, team shortlisting with voting, and comprehensive applicant feedback.

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Clarity** | Every interface element serves a clear purpose. Minimal noise, maximal signal. |
| **Trust** | Professional, credible visual language with consistent spacing, color, and typography. |
| **Accessibility** | WCAG 2.1 AA compliant by default. Inclusive design for all users. |
| **Efficiency** | Optimized for hiring workflows — reduce clicks, surface decisions, minimize fatigue. |
| **Consistency** | One design language across applicant, recruiter, and landing experiences. |

### Visual Identity Guidelines

- **Tone**: Professional, modern, trustworthy
- **Color palette**: Deep navy blues with teal/aqua accents — conveys trust, stability, and technology
- **Typography**: Plus Jakarta Sans — clean, geometric, highly readable Sans-Serif
- **Iconography**: Lucide — consistent 24px grid, 1.5px stroke weight
- **Border radius**: `rounded-lg` (8px) as default, `rounded-xl` (12px) for modals/cards, `rounded-full` for pills/badges
- **Shadows**: Subtle (`shadow-sm`, `shadow-xs`) for containers; colored shadows for interactive states (`shadow-lg shadow-primary/30`)

---

## 2. Color System

### Primary Colors

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| `--color-primary` | `#01497c` | `rgb(1, 73, 124)` | `hsl(205, 98%, 25%)` | Primary buttons, active links, key CTAs |
| `--color-primary-hover` | `#013a63` | `rgb(1, 58, 99)` | `hsl(205, 98%, 20%)` | Primary button hover state |

### Secondary Colors

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| `--color-secondary` | `#e7f3f7` | `rgb(231, 243, 247)` | `hsl(195, 50%, 94%)` | Secondary buttons, subtle backgrounds |
| `--color-muted` | `#eef7fa` | `rgb(238, 247, 250)` | `hsl(195, 55%, 96%)` | Muted backgrounds, table headers |
| `--color-muted-foreground` | `#468faf` | `rgb(70, 143, 175)` | `hsl(198, 43%, 48%)` | Secondary/muted text, placeholder text |

### Accent Colors

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| `--color-accent` | `#2a6f97` | `rgb(42, 111, 151)` | `hsl(202, 56%, 38%)` | Accent borders, hover borders, focus rings |
| `--color-ring` | `#2a6f97` | `rgb(42, 111, 151)` | `hsl(202, 56%, 38%)` | Focus ring outlines |

### Semantic Colors

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| `--color-success` | `#059669` | `rgb(5, 150, 105)` | `hsl(161, 94%, 30%)` | Success states, confirmations |
| `--color-warning` | `#d97706` | `rgb(217, 119, 6)` | `hsl(32, 95%, 44%)` | Warning states, caution alerts |
| `--color-destructive` | `#dc2626` | `rgb(220, 38, 38)` | `hsl(0, 72%, 51%)` | Error states, destructive actions, validation errors |
| `--color-destructive-foreground` | `#ffffff` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Text on destructive backgrounds |

### Neutral / Grayscale Palette

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| `--color-background` | `#ffffff` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Main page background |
| `--color-foreground` | `#012a4a` | `rgb(1, 42, 74)` | `hsl(206, 97%, 15%)` | Primary text color |
| `--color-border` | `#cfe7f2` | `rgb(207, 231, 242)` | `hsl(199, 57%, 88%)` | Borders and dividers |
| `--color-input` | `#cfe7f2` | `rgb(207, 231, 242)` | `hsl(199, 57%, 88%)` | Input field borders |

### Background Colors

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| `--color-background` | `#ffffff` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Page canvas |
| `--color-surface` | `#ffffff` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Card and container backgrounds |
| `--color-surface-muted` | `#eef7fa` | `rgb(238, 247, 250)` | `hsl(195, 55%, 96%)` | Subtle muted container backgrounds |
| `--color-surface-hover` | `#e7f3f7` | `rgb(231, 243, 247)` | `hsl(195, 50%, 94%)` | Hover state for surface elements |

### Surface Colors

| Token | HEX | RGB | HSL | Usage |
|-------|-----|-----|-----|-------|
| `--color-card` | `#ffffff` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Card component background |
| `--color-sidebar` | `#012a4a` | `rgb(1, 42, 74)` | `hsl(206, 97%, 15%)` | Sidebar navigation background |
| `--color-sidebar-foreground` | `#cfe7f2` | `rgb(207, 231, 242)` | `hsl(199, 57%, 88%)` | Text in sidebar |
| `--color-sidebar-active` | `#01497c` | `rgb(1, 73, 124)` | `hsl(205, 98%, 25%)` | Active sidebar item background |

### Pipeline Stage Colors

| Token | HEX | RGB | HSL | Stage |
|-------|-----|-----|-----|-------|
| `--stage-applied` | `#89c2d9` | `rgb(137, 194, 217)` | `hsl(197, 51%, 69%)` | Applied |
| `--stage-screening` | `#61a5c2` | `rgb(97, 165, 194)` | `hsl(198, 44%, 57%)` | Screening |
| `--stage-interview` | `#2c7da0` | `rgb(44, 125, 160)` | `hsl(198, 57%, 40%)` | Interview |
| `--stage-assessment` | `#2a6f97` | `rgb(42, 111, 151)` | `hsl(202, 56%, 38%)` | Assessment |
| `--stage-final` | `#01497c` | `rgb(1, 73, 124)` | `hsl(205, 98%, 25%)` | Final Stage |
| `--stage-hired` | `#468faf` | `rgb(70, 143, 175)` | `hsl(198, 43%, 48%)` | Hired |

Pipeline stages follow a gradient from light to dark blue as candidates progress, providing intuitive visual mapping of advancement.

### Dark Mode Equivalents

| Light Token | Light HEX | Dark Token | Dark HEX |
|-------------|-----------|------------|----------|
| `background` | `#ffffff` | `background` | `#061826` |
| `foreground` | `#012a4a` | `foreground` | `#eef7fa` |
| `surface` | `#ffffff` | `surface` | `#0b2336` |
| `surface-muted` | `#eef7fa` | `surface-muted` | `#0e2a40` |
| `surface-hover` | `#e7f3f7` | `surface-hover` | `#143b56` |
| `card` | `#ffffff` | `card` | `#0b2336` |
| `primary` | `#01497c` | `primary` | `#468faf` |
| `primary-hover` | `#013a63` | `primary-hover` | `#61a5c2` |
| `secondary` | `#e7f3f7` | `secondary` | `#143b56` |
| `muted` | `#eef7fa` | `muted` | `#0e2a40` |
| `muted-foreground` | `#468faf` | `muted-foreground` | `#89c2d9` |
| `accent` | `#2a6f97` | `accent` | `#89c2d9` |
| `ring` | `#2a6f97` | `ring` | `#468faf` |
| `sidebar` | `#012a4a` | `sidebar` | `#02192b` |
| `border` | `#cfe7f2` | `border` | `rgba(207, 231, 242, 0.1)` |
| `input` | `#cfe7f2` | `input` | `rgba(207, 231, 242, 0.16)` |
| `success` | `#059669` | `success` | `#059669` (unchanged) |
| `warning` | `#d97706` | `warning` | `#d97706` (unchanged) |
| `destructive` | `#dc2626` | `destructive` | `#dc2626` (unchanged) |

### Opacity Variations

| Token | 100% | 80% | 60% | 50% | 40% | 20% | 10% |
|-------|------|-----|-----|-----|-----|-----|-----|
| `primary` | `#01497c` | `#01497ccc` | `#01497c99` | `#01497c80` | `#01497c66` | `#01497c33` | `#01497c1a` |
| `foreground` | `#012a4a` | `#012a4acc` | `#012a4a99` | `#012a4a80` | `#012a4a66` | `#012a4a33` | `#012a4a1a` |
| `white` | `#ffffff` | `#ffffffcc` | `#ffffff99` | `#ffffff80` | `#ffffff66` | `#ffffff33` | `#ffffff1a` |

### Accessibility Contrast Notes

| Combination | Ratio | WCAG Level |
|-------------|-------|------------|
| Foreground (`#012a4a`) on Background (`#ffffff`) | **14.67:1** | ⭐ AAA |
| Primary (`#01497c`) on Background (`#ffffff`) | **9.35:1** | ⭐ AA+ |
| Accent (`#2a6f97`) on Background (`#ffffff`) | **5.50:1** | ⭐ AA |
| Muted Foreground (`#468faf`) on Background (`#ffffff`) | **3.62:1** | ⚠ AA (large text only) |
| Success (`#059669`) on Background (`#ffffff`) | **3.77:1** | ⚠ AA (large text only) |
| Destructive (`#dc2626`) on Background (`#ffffff`) | **4.83:1** | ⭐ AA |
| Foreground (Dark `#eef7fa`) on Background (`#061826`) | **16.56:1** | ⭐ AAA |
| Primary (Dark `#468faf`) on Background (`#061826`) | **4.98:1** | ⭐ AA |
| Sidebar Foreground (`#cfe7f2`) on Sidebar (`#012a4a`) | **11.43:1** | ⭐ AAA |

> **Note**: `--color-muted-foreground` and `--color-success` do not meet 4.5:1 AA for small text against white backgrounds. Use them only for decorative elements, large text (≥18px or ≥14px bold), or with darker backgrounds.

---

## 3. Typography

### Font Families

| Usage | Font Stack | Source |
|-------|-----------|--------|
| Body (`--font-sans`) | `"Plus Jakarta Sans", sans-serif` | Tailwind `@theme` declaration |
| Display (`--font-display`) | `"Plus Jakarta Sans", sans-serif` | Tailwind `@theme` declaration |
| Monospace (code) | `ui-monospace, SFMono-Regular, monospace` | System fallback via Tailwind `font-mono` |

### Font Weights

| Weight | CSS Variable | Usage |
|--------|-------------|-------|
| 400 (Normal) | `--font-weight-normal` | Body text, paragraphs |
| 500 (Medium) | `--font-weight-medium` | Labels, buttons, navigation |
| 600 (Semibold) | `--font-weight-semibold` | Subheadings, emphasized text |
| 700 (Bold) | `--font-weight-bold` | Headings H4–H6 |
| 800 (Extrabold) | `--font-weight-extrabold` | Headings H1–H3 |

### Font Sizes & Line Heights

| Tailwind Class | Size | Line Height | Usage |
|---------------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem (16px) | Captions, labels, badges, table cells |
| `text-sm` | 0.875rem (14px) | 1.25rem (20px) | **Default body text**, descriptions, secondary content |
| `text-base` | 1rem (16px) | 1.5rem (24px) | Larger body text, textarea input text |
| `text-lg` | 1.125rem (18px) | 1.75rem (28px) | Hero subtitles, featured content |
| `text-xl` | 1.25rem (20px) | 1.75rem (28px) | Section headings, modal titles |
| `text-2xl` | 1.5rem (24px) | 2rem (32px) | H3 section headings |
| `text-3xl` | 1.875rem (30px) | 2.25rem (36px) | H2 page headings |
| `text-4xl` | 2.25rem (36px) | 2.5rem (40px) | H1 hero headings |
| `text-5xl` | 3rem (48px) | 1 (tight) | Landing page hero (desktop) |

### Letter Spacing

| Tailwind Class | Value | Usage |
|---------------|-------|-------|
| `tracking-tight` | `-0.025em` | Headings, display text |
| `tracking-normal` | `0` | Body text |
| `tracking-wide` | `0.025em` | Small uppercase labels |
| `tracking-wider` | `0.05em` | Table header labels, eyebrow text |

### Responsive Typography Rules

| Level | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| H1 | `text-3xl` (30px) | `text-4xl` (36px) | `text-5xl` (48px) |
| H2 | `text-2xl` (24px) | `text-2xl` (24px) | `text-3xl` (30px) |
| H3 | `text-xl` (20px) | `text-xl` (20px) | `text-2xl` (24px) |
| Body | `text-sm` (14px) | `text-sm` (14px) | `text-sm` (14px) |
| Hero headline | `text-3xl` | `text-4xl` | `text-5xl` |

### Heading Hierarchy (H1–H6)

| Level | Tailwind Classes | Usage |
|-------|-----------------|-------|
| **H1** | `text-4xl md:text-5xl font-extrabold tracking-tight` | Landing hero, main page titles |
| **H2** | `text-2xl md:text-3xl font-bold tracking-tight` | Section headings (e.g., "Features") |
| **H3** | `text-xl md:text-2xl font-bold tracking-tight` | Card titles, subsection headings |
| **H4** | `text-lg font-semibold` | Panel headers, modal titles |
| **H5** | `text-base font-semibold` | Small section headers |
| **H6** | `text-sm font-bold` | Table headers, sidebar labels |

### Body Text Styles

| Element | Classes |
|---------|---------|
| Default body | `text-sm text-foreground` |
| Secondary body | `text-sm text-muted-foreground` |
| Large body | `text-base text-foreground` |
| Muted description | `text-xs text-muted-foreground` |

### Caption and Label Styles

| Element | Classes |
|---------|---------|
| Field label | `text-sm font-medium` |
| Field description | `text-xs text-muted-foreground` |
| Field error | `text-xs text-destructive` |
| Table header | `text-[11px] font-bold text-muted-foreground uppercase tracking-wider` |
| Badge text | `text-[11px] font-semibold` |
| Eyebrow | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` |

---

## 4. Spacing & Layout System

### Spacing Scale

Based on Tailwind CSS v4 default scale. Each unit = `0.25rem` (4px).

| Token | rem | px | Typical Usage |
|-------|-----|----|---------------|
| `gap-1` / `p-1` | 0.25rem | 4px | Dense layouts, icon spacing |
| `gap-1.5` | 0.375rem | 6px | Field label-to-input gap |
| `gap-2` / `p-2` | 0.5rem | 8px | Button icon-to-text gap |
| `gap-2.5` | 0.625rem | 10px | Button pairs, small card paddings |
| `gap-3` / `p-3` | 0.75rem | 12px | List items, compact groups |
| `gap-4` / `p-4` | 1rem | 16px | **Default spacing unit** — card padding, section gaps |
| `gap-5` / `p-5` | 1.25rem | 20px | Panel padding, form sections |
| `gap-6` / `p-6` | 1.5rem | 24px | Large card padding, modal padding |
| `gap-8` / `p-8` | 2rem | 32px | Section spacing, page margins |
| `gap-10` | 2.5rem | 40px | Feature section spacing |
| `gap-16` | 4rem | 64px | Major page sections |

### Grid System

The project does not use a rigid grid framework. Layouts rely on:

- **Tailwind Flexbox** (`flex`, `flex-col`, `items-center`, `justify-between`) for most component layouts
- **CSS Grid** (`grid`, `grid-cols-1`, `grid-cols-2`, `grid-cols-3`) for card grids and dashboards
- **Responsive breakpoints** for column adjustments

### Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops |
| `xl` | 1280px | Standard desktops |
| `2xl` | 1536px | Large desktops |

### Container Widths

| Usage | Max Width |
|-------|-----------|
| Modals | `max-w-sm` (384px) or `max-w-[calc(100%-2rem)]` |
| Cards | `max-w-[260px]` (centered spinners) |
| Layout content | Full-width with `px-4 sm:px-8` padding |
| Landing sections | Full-width with padding |
| Job search inputs | `w-full md:w-96` |

### Margin Rules

| Pattern | Usage |
|---------|-------|
| `mx-auto` | Centering content blocks |
| `mt-auto` | Pushing footer content to bottom |
| `space-y-1` through `space-y-6` | Vertical spacing between sibling elements |
| `space-x-2` | Horizontal spacing between inline elements |

### Padding Rules

| Pattern | Usage |
|---------|-------|
| `px-4`, `px-5`, `px-8` | Horizontal page padding (responsive) |
| `py-2`, `py-2.5`, `py-3`, `py-4` | Vertical container padding |
| `p-4`, `p-5` | Card and container inner padding |

### Responsive Behavior

- **Sidebar**: Fixed `w-64` on desktop, overlay drawer on mobile (`translate-x-full`/`-translate-x-full`)
- **Cards**: `grid-cols-1` on mobile → `grid-cols-2` on tablet → `grid-cols-3` on desktop
- **Tables**: `overflow-x-auto` with `min-w-[800px]` for horizontal scroll on small screens
- **Navbars**: `flex-col` on mobile → `flex-row` on `md:` and above
- **Buttons**: `w-full` on mobile → auto width on desktop
- **Dialog footer**: `flex-col-reverse` on mobile → `flex-row` on `sm:`
- **Modals**: `max-w-[calc(100%-2rem)]` on mobile → `max-w-sm` on desktop

---

## 5. Design Tokens

### CSS Custom Properties (Source of Truth)

All tokens are defined in `src/index.css` via Tailwind's `@theme` directive and become available as both CSS custom properties and Tailwind utility classes.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";

@custom-variant dark (&:is(.dark *));

@theme {
  /* Backgrounds & Surfaces */
  --color-background: #ffffff;
  --color-foreground: #012a4a;
  --color-surface: #ffffff;
  --color-surface-muted: #eef7fa;
  --color-surface-hover: #e7f3f7;
  --color-card: #ffffff;

  /* Brand */
  --color-primary: #01497c;
  --color-primary-hover: #013a63;
  --color-secondary: #e7f3f7;
  --color-muted: #eef7fa;
  --color-muted-foreground: #468faf;
  --color-accent: #2a6f97;

  /* Sidebar */
  --color-sidebar: #012a4a;
  --color-sidebar-foreground: #cfe7f2;
  --color-sidebar-active: #01497c;

  /* Borders & Inputs */
  --color-border: #cfe7f2;
  --color-input: #cfe7f2;
  --color-ring: #2a6f97;

  /* Semantic */
  --color-success: #059669;
  --color-warning: #d97706;
  --color-destructive: #dc2626;
  --color-destructive-foreground: #ffffff;

  /* Pipeline Stages */
  --stage-applied: #89c2d9;
  --stage-screening: #61a5c2;
  --stage-interview: #2c7da0;
  --stage-assessment: #2a6f97;
  --stage-final: #01497c;
  --stage-hired: #468faf;

  /* Typography */
  --font-sans: "Plus Jakarta Sans", sans-serif;
  --font-display: "Plus Jakarta Sans", sans-serif;
}

/* Dark mode overrides */
.dark {
  --color-background: #061826;
  --color-foreground: #eef7fa;
  --color-surface: #0b2336;
  --color-surface-muted: #0e2a40;
  --color-surface-hover: #143b56;
  --color-card: #0b2336;
  --color-primary: #468faf;
  --color-primary-hover: #61a5c2;
  --color-secondary: #143b56;
  --color-muted: #0e2a40;
  --color-muted-foreground: #89c2d9;
  --color-accent: #89c2d9;
  --color-sidebar: #02192b;
  --color-sidebar-foreground: #cfe7f2;
  --color-sidebar-active: #01497c;
  --color-border: rgba(207, 231, 242, 0.1);
  --color-input: rgba(207, 231, 242, 0.16);
  --color-ring: #468faf;
}
```

### JSON Design Tokens (Export-Ready)

```json
{
  "global": {
    "font-family": {
      "sans": ["Plus Jakarta Sans", "sans-serif"],
      "display": ["Plus Jakarta Sans", "sans-serif"]
    }
  },
  "color": {
    "light": {
      "background": "#ffffff",
      "foreground": "#012a4a",
      "surface": "#ffffff",
      "surface-muted": "#eef7fa",
      "surface-hover": "#e7f3f7",
      "card": "#ffffff",
      "primary": "#01497c",
      "primary-hover": "#013a63",
      "secondary": "#e7f3f7",
      "muted": "#eef7fa",
      "muted-foreground": "#468faf",
      "accent": "#2a6f97",
      "sidebar": "#012a4a",
      "sidebar-foreground": "#cfe7f2",
      "sidebar-active": "#01497c",
      "border": "#cfe7f2",
      "input": "#cfe7f2",
      "ring": "#2a6f97",
      "success": "#059669",
      "warning": "#d97706",
      "destructive": "#dc2626",
      "destructive-foreground": "#ffffff",
      "stage-applied": "#89c2d9",
      "stage-screening": "#61a5c2",
      "stage-interview": "#2c7da0",
      "stage-assessment": "#2a6f97",
      "stage-final": "#01497c",
      "stage-hired": "#468faf"
    },
    "dark": {
      "background": "#061826",
      "foreground": "#eef7fa",
      "surface": "#0b2336",
      "surface-muted": "#0e2a40",
      "surface-hover": "#143b56",
      "card": "#0b2336",
      "primary": "#468faf",
      "primary-hover": "#61a5c2",
      "secondary": "#143b56",
      "muted": "#0e2a40",
      "muted-foreground": "#89c2d9",
      "accent": "#89c2d9",
      "sidebar": "#02192b",
      "sidebar-foreground": "#cfe7f2",
      "sidebar-active": "#01497c",
      "border": "rgba(207, 231, 242, 0.1)",
      "input": "rgba(207, 231, 242, 0.16)",
      "ring": "#468faf",
      "success": "#059669",
      "warning": "#d97706",
      "destructive": "#dc2626",
      "destructive-foreground": "#ffffff"
    }
  }
}
```

### Tailwind v4 Configuration

Tokens are already configured via `@theme` in `src/index.css`. No `tailwind.config.js` is needed in Tailwind v4. Usage example inside `@theme`:

```css
@theme {
  --color-background: #ffffff;
  --color-foreground: #012a4a;
  /* ... */
}
```

These tokens become available as:
- **CSS custom properties**: `var(--color-background)`, `var(--color-foreground)`
- **Tailwind utilities**: `bg-background`, `text-foreground`, `border-border`

> **Migration Note**: If migrating to Tailwind v3, the `@theme` block must be converted to `tailwind.config.js` `theme.extend.colors`.

---

## 6. Components

### Buttons

| Property | Specification |
|----------|--------------|
| **Component** | `Button` from `@/components/ui/button.jsx` via `class-variance-authority` |
| **Base classes** | `inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none` |
| **Sizes** | `xs`, `sm`, `default` (md), `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` |

#### Size Specifications

| Size | Height | Padding | Font | Icon |
|------|--------|---------|------|------|
| `xs` | 1.5rem (24px) | `px-2` | text-xs | 12px |
| `sm` | 1.75rem (28px) | `px-2.5` | text-[0.8rem] | 14px |
| `default` | 2.5rem (40px) | `px-4 py-2.5` | text-sm | 16px |
| `lg` | 2.25rem (36px) | `px-2.5` | text-sm | — |
| `icon` | 2rem (32px) | — | — | 16px |
| `icon-sm` | 1.75rem (28px) | — | — | 14px |
| `icon-lg` | 2.25rem (36px) | — | — | 16px |

#### Variants

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| `default` | `bg-primary` | `text-white` | transparent | `hover:bg-primary-hover` |
| `outline` | `bg-background` | `text-foreground` | `border-border` | `hover:bg-secondary` |
| `secondary` | `bg-secondary` | `text-muted-foreground` | transparent | `hover:bg-muted` |
| `ghost` | transparent | `text-foreground` | transparent | `hover:bg-secondary` |
| `destructive` | `bg-destructive` | `text-destructive-foreground` | transparent | `hover:opacity-90` |
| `link` | transparent | `text-primary` | none (underline) | `hover:underline` |

#### States

| State | Behavior |
|-------|----------|
| Default | As defined by variant |
| Hover | Background shift (per variant) |
| Focus-visible | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` |
| Active | `active:not-aria-[haspopup]:translate-y-px` (press effect) |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` |
| Invalid | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20` |

#### Accessibility

- Uses Radix `Slot.Root` for `asChild` polymorphic behavior
- Keyboard focusable by default
- `aria-invalid` state support
- `aria-[haspopup]` detection to prevent press animation on popup triggers
- Disabled state communicated via both `pointer-events-none` and `opacity-50`

### Inputs

| Property | Specification |
|----------|--------------|
| **Component** | `Input` from `@/components/ui/input.jsx` |
| **Base classes** | `h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-foreground transition-shadow outline-none` |
| **Height** | `h-8` (32px) |

#### States

| State | Visual |
|-------|--------|
| Default | `border-border bg-background` |
| Placeholder | `placeholder:text-muted-foreground/70` |
| Focus | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20` |
| Read-only | `read-only:bg-muted read-only:text-muted-foreground` |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` |
| Invalid (unfocused) | `aria-[focused=false]:aria-invalid:border-destructive aria-[focused=false]:aria-invalid:ring-3 aria-[focused=false]:aria-invalid:ring-destructive/20` |

#### Typography

| Element | Size | Weight |
|---------|------|--------|
| Input value | `text-sm` (14px) | Normal |
| Placeholder | `text-sm` (14px) | Normal, 70% opacity |
| Label (via Field) | `text-sm font-medium` | Medium |
| Description (via Field) | `text-xs` | Normal |
| Error (via Field) | `text-xs` | Normal, `text-destructive` |

#### Spacing

| Rule | Value |
|------|-------|
| Field gap | `gap-1.5` (6px) |
| Input height | `h-8` (32px) |
| Horizontal padding | `px-2.5` (10px) |
| Border radius | `rounded-lg` (8px) |

### Selects

| Property | Specification |
|----------|--------------|
| **Implementation** | Native `<select>` elements or custom Radix-based selects in feature components |
| **Styling pattern** | Same as input: `w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm` |

> **Note**: The project currently uses native `<select>` elements in the JD Generator and Pipeline Builder. No shadcn Select component is present.

### Checkboxes

| Property | Specification |
|----------|--------------|
| **Implementation** | Native `<input type="checkbox">` in feature components (filters, shortlist comparison) |
| **Styling pattern** | Inline with label using `flex items-center gap-2`, checkbox styled via Tailwind `accent-*` |

#### States

| State | Visual |
|-------|--------|
| Default | Standard browser checkbox with `<label>` text using `text-sm text-foreground` |
| Checked | Browser default or custom accent via `accent-primary` |
| Disabled | Standard browser disabled styling |

### Radio Buttons

| Property | Specification |
|----------|--------------|
| **Implementation** | Native `<input type="radio">` in feature components (QuestionCard, MultipleChoiceQuestion) |
| **Styling pattern** | Used within question/quiz contexts, grouped by `name` attribute |

### Cards

| Property | Specification |
|----------|--------------|
| **Component** | `Card` from `@/src/shared/ui/Card.jsx` |
| **Base classes** | `rounded-lg border shadow` |
| **Content** | `CardContent` as a plain `<div>` |

#### Dashboard-Level Card Patterns

| Usage | Classes |
|-------|---------|
| Stat card | `bg-surface rounded-xl border border-border p-5 shadow-xs` |
| Table card | `bg-surface border border-border rounded-xl shadow-xs overflow-hidden` |
| Empty state card | `bg-surface rounded-xl border border-border p-8 text-center` |
| Spinner card | `bg-card border border-border rounded-xl shadow-sm px-10 py-8 max-w-[260px]` |

#### States

| State | Visual |
|-------|--------|
| Default | `border-border` with `shadow-xs` or `shadow-sm` |
| Hoverable | `hover:bg-muted/20 transition-colors` (table rows) |
| Active/selected | Not explicitly styled — use accent border patterns |

### Modals / Dialogs

| Property | Specification |
|----------|--------------|
| **Component** | `Dialog` from `@/components/ui/dialog.jsx` (Radix-based) |
| **Primitives** | `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` |

#### Structure

```
<Dialog>
  <DialogTrigger />
  <DialogPortal>
    <DialogOverlay />
    <DialogContent>
      <DialogHeader>
        <DialogTitle />
        <DialogDescription />
      </DialogHeader>
      {children}
      <DialogFooter />
    </DialogContent>
  </DialogPortal>
</Dialog>
```

#### Styling

| Element | Classes |
|---------|---------|
| Overlay | `fixed inset-0 isolate z-50 bg-black/10 backdrop-blur-xs` |
| Content | `fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm` |
| Title | `text-base leading-none font-medium` |
| Description | `text-sm text-muted-foreground` |
| Header | `flex flex-col gap-2` |
| Footer | `-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end` |

#### Animation

| Event | Classes |
|-------|---------|
| Opening (overlay) | `data-open:animate-in data-open:fade-in-0` |
| Closing (overlay) | `data-closed:animate-out data-closed:fade-out-0` |
| Opening (content) | `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95` |
| Closing (content) | `data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95` |

#### Accessibility

- Radix `Dialog` provides full ARIA support (role="dialog", aria-modal, focus trap)
- Close button has `<span className="sr-only">Close</span>` for screen readers
- `Escape` key closes by default (Radix behavior)
- `DialogDescription` maps to `aria-describedby`

### Tooltips

| Property | Specification |
|----------|--------------|
| **Implementation** | Recharts `Tooltip` component for chart tooltips; no shadcn Tooltip primitive in the project |
| **Chart tooltips** | Custom `PieTooltip` and `BarTooltip` components |

#### Chart Tooltip Pattern

```jsx
function PieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-sm text-sm">
        <p className="text-muted-foreground">{payload[0].name}</p>
        <p className="font-bold text-foreground">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}
```

### Navigation

| Property | Specification |
|----------|--------------|
| **Component** | `MainLayout` from `@/src/shared/ui/MainLayout.jsx` |
| **Type** | Vertical sidebar with icon + label links |

#### Sidebar Specification

| Property | Value |
|----------|-------|
| Width | `w-64` (256px) |
| Background | `bg-sidebar` (`#012a4a` / `#02192b` dark) |
| Link default | `text-white/80 hover:bg-white/10 hover:text-white` |
| Link active | `bg-white/15 text-white font-semibold` |
| Icon default | `text-accent` |
| Icon active | `text-white` |
| Mobile behavior | Overlay drawer with backdrop |

#### Top Navigation (Landing)

| Property | Value |
|----------|-------|
| Component | `Navbar` in `src/features/landing/Components/Navbar.jsx` |
| Type | Horizontal nav with links + CTA button |
| Styling | Transparent/background with fixed positioning |

#### Responsive Sidebar

| Device | Behavior |
|--------|----------|
| Desktop (md+) | Fixed sidebar, always visible |
| Mobile | Off-screen drawer with hamburger toggle, overlay backdrop |
| Transition | `transform transition-transform duration-200 ease-in-out` |

### Tables

| Property | Specification |
|----------|--------------|
| **Implementation** | Feature-level `<table>` elements (no shadcn Table primitive) |
| **Container** | `overflow-x-auto overflow-y-hidden` with `min-w-[800px]` |

#### Style Pattern

| Element | Classes |
|---------|---------|
| Wrapper | `bg-surface border border-border rounded-xl shadow-xs overflow-hidden` |
| Header row | `bg-muted/30 border-b border-border` |
| Header cell | `px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider` |
| Body rows | `hover:bg-muted/20 transition-colors` |
| Body cell | `px-5 py-3 text-xs` |

#### Row Animations

```jsx
<motion.tr
  initial={{ opacity: 0, y: 12 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.05 + idx * 0.04, ease: "easeOut" }}
/>
```

### Alerts

| Property | Specification |
|----------|--------------|
| **Implementation** | Feature-level inline patterns — no dedicated Alert component |
| **Common patterns** | `text-destructive` for error text, colored inline banners in forms |

Typical error pattern:
```jsx
<p className="text-xs text-destructive">{t("errors.something_wrong")}</p>
```

### Badges

| Property | Specification |
|----------|--------------|
| **Implementation** | Feature-level inline patterns — no shadcn Badge component |

#### Patterns Found

| Type | Classes | Context |
|------|---------|---------|
| Status badge | `px-2 py-0.5 text-[11px] font-semibold rounded-full` | Candidate status |
| Weight badge | Inline badge showing stage weight | Pipeline builder |
| Applied stage | Uses `--stage-applied` | Application progress |
| AI badge | "AI Generated" label | JD Generator |

### Tabs

| Property | Specification |
|----------|--------------|
| **Implementation** | Feature-level underline tabs — no shadcn Tabs component |
| **Example** | InterviewList tabs, CandidateAssessments stage tabs |

#### Pattern Found

```jsx
const tabs = ["all", "active", "completed", "rejected"];
// Rendered as inline button group with underline indicator
{tabs.map((tab) => (
  <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {t(`interview_list.tabs.${tab}`)}
  </button>
))}
```

#### States

| State | Visual |
|-------|--------|
| Active | `border-primary text-foreground` |
| Inactive | `border-transparent text-muted-foreground` |
| Hover | `hover:text-foreground` |

### Dropdowns

| Property | Specification |
|----------|--------------|
| **Implementation** | Feature-level `<select>` or custom dropdown — no shadcn DropdownMenu component found |
| **Pattern** | Language switcher uses custom toggle panel; job posting sidebar uses button groups |

#### Language Switcher Pattern

```jsx
// Toggle button with absolute positioned dropdown panel
// Classes: rounded-lg bg-sidebar-active/10 px-2 py-1 text-xs font-medium
```

---

## 7. Icons & Imagery

### Icon Library

| Property | Value |
|----------|-------|
| **Library** | [Lucide React](https://lucide.dev) v1.16.0 |
| **License** | ISC (free, open-source) |
| **Import pattern** | `import { IconName } from "lucide-react"` |

### Commonly Used Icons

| Icon | Usage |
|------|-------|
| `Search` | Search bars |
| `Plus` | Add job, create actions |
| `Menu` | Mobile sidebar toggle |
| `X` | Close buttons, clearing filters |
| `Moon` / `Sun` | Theme toggle |
| `LogOut` | Sign out |
| `Briefcase` | Jobs, job postings |
| `Building2` | Company profile |
| `FileText`, `FileCheck` | Feedback, documents |
| `CheckCircle` | Shortlists, success states |
| `Wand2` | AI generation tools |
| `KanbanSquare` | Pipeline |
| `ChevronRight` | Table row actions, navigation |
| `Camera`, `Video`, `StopCircle`, `Redo2` | Video interview controls |
| `Eye`, `EyeOff` | Password visibility toggle |
| `LayoutDashboard` | Recruiter dashboard |

### Icon Sizes

| Context | Size Class | px |
|---------|-----------|----|
| Inline with text | `w-4 h-4` | 16px |
| Inside buttons | `w-4 h-4` (or `size-4`) | 16px |
| Sidebar navigation | `w-4 h-4` | 16px |
| Feature icons (hero) | `size-7`, `size-8` | 28px–32px |
| Button icons (`icon` size) | `size-8` | 32px |
| Loading spinner | `size-9` | 36px |
| Large feature icons | `size-16` | 64px |

### Stroke Weights

Lucide uses a default stroke width of **1.5px** (`strokeWidth={1.5}`) on a 24×24 grid.

### Image Guidelines

| Property | Specification |
|----------|--------------|
| **Format** | SVG for logos, PNG for previews/photos |
| **Avatar** | JPG/PNG uploaded by user |
| **Max file size (uploads)** | 5MB for resumes, 25MB for framework files |
| **Company logos** | SVG preferred, stored in `/public/` |

### Illustration Style

The project uses **no custom illustrations**. Decorative elements use:
- CSS gradients (`radial-gradient` for background textures)
- Data visualizations via Recharts (PieChart, BarChart)
- Animated section backgrounds via Framer Motion

### Avatar Specifications

| Property | Value |
|----------|-------|
| **Source** | Supabase storage (user-uploaded) |
| **Display** | Circular (`rounded-full`) |
| **Dimensions** | `size-8` to `size-16` depending on context |
| **Placeholder** | Initials or default SVG icon |
| **Supported formats** | JPG, PNG |

---

## 8. Motion & Animation

### Animation Library

| Library | Version | Usage |
|---------|---------|-------|
| **Framer Motion** | v12.40.0 | Component enter/exit animations, staggered lists, drag-and-drop |
| **tw-animate-css** | v1.4.0 | CSS transition utilities (fade, zoom) for dialog/overlay animations |
| **Tailwind CSS** | v4.3.0 | `transition-all`, `transition-colors`, `animate-spin`, `animate-pulse` |

### Animation Durations

| Token | Value | Usage |
|-------|-------|-------|
| Fast | `75ms` | Micro-interactions, press effects |
| Normal | `100ms` | Dialog open/close |
| Medium | `200ms` | Theme toggle, mobile sidebar slide |
| Slow | `400ms` | Table row entrance |
| Staggered | `idx * 0.04s` | List item staggered entrance |

### Easing Functions

| Name | Cubic Bezier | Usage |
|------|-------------|-------|
| Default | `ease-in-out` | Sidebar slide transition |
| Ease out | `easeOut` | Framer Motion row entrance |
| Ease in-out | `ease-in-out` | Theme toggle |
| Custom | `transition-all duration-200` | Form field focus transitions |

### Transition Standards

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| Background color | 200ms | ease-in-out | Button hover, sidebar link hover |
| Border color | 200ms | ease-in-out | Input focus |
| Box shadow | 200ms | ease-in-out | Input focus ring |
| Opacity | 200ms | ease-in-out | Disabled states |
| Transform | 200ms | ease-in-out | Sidebar slide, active button press |
| All (table rows) | 400ms | easeOut | Row entrance |
| Opacity (staggered) | 75ms + delay | — | Row hover |

### Loading States

| Pattern | Implementation |
|---------|---------------|
| **Full-page spinner** | `LoadingSpinner` component: centered card with rotating border spinner |
| **Spinner CSS** | `size-9 rounded-full border-3 border-muted border-t-primary animate-spin` |
| **Uploading overlay** | Absolute positioned overlay with spinner + status text |
| **Skeleton** | Not implemented — uses text-only loading states |
| **Button loading** | Text changes (e.g., "Saving..." → "Save") |
| **Page loading** | Loading text shown in containers (e.g., "Loading jobs...") |

#### Loading Spinner Component

```jsx
<div className="min-h-screen flex items-center justify-center bg-surface-muted">
  <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col items-center gap-4 px-10 py-8 w-full max-w-[260px]">
    <div className="size-9 rounded-full border-3 border-muted border-t-primary animate-spin" />
    <p className="text-muted-foreground font-medium text-xs text-center">
      {message}
    </p>
  </div>
</div>
```

### Micro-interactions

| Interaction | Effect |
|-------------|--------|
| Button press | `translate-y-px` (1px downward) |
| Button hover | Background color transition |
| Sidebar link hover | Background becomes `bg-white/10` |
| Table row hover | Background `hover:bg-muted/20` |
| Table row view link | Chevron icon `group-hover:translate-x-0.5` |
| Theme toggle | Icon swap + class toggle on `<html>` |
| Sidebar mobile open | Slide from left + backdrop blur overlay |
| Dialog open | Backdrop fade-in + content zoom-in |
| Page section scroll | Framer Motion `whileInView` animations |

---

## 9. Localization & Internationalization (i18n)

### Supported Languages

| Language | Locale | Direction | File |
|----------|--------|-----------|------|
| English | `en` | LTR | `src/shared/i18n/locales/en.json` |
| Arabic | `ar` | RTL | `src/shared/i18n/locales/ar.json` |

### Locale Codes

| Field | Value (en) | Value (ar) |
|-------|-----------|------------|
| `language` | `en` | `ar` |
| `dir` | `ltr` | `rtl` |
| `documentElement.lang` | `en` | `ar` |
| `documentElement.dir` | `ltr` | `rtl` |

### RTL / LTR Requirements

- Direction is set dynamically on `<html>` via `useEffect` in `MainLayout.jsx`:

```jsx
useEffect(() => {
  const isArabic = i18n.language === "ar";
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  document.documentElement.lang = i18n.language;
}, [i18n.language]);
```

- No explicit RTL CSS overrides are currently present — relies on browser intrinsic RTL support
- `components.json` has `"rtl": false` — RTL support is handled at runtime, not build-time
- **Caution**: RTL styles may need audit — the project uses Tailwind RTL variants (`rtl:`, `ltr:`) only if explicitly added

### Date Formats

| Context | Format |
|---------|--------|
| Application date | "Applied {{date}}" — passed as server value |
| Time ago | "Just now", "{{count}}h ago", "{{count}}d ago" (i18n key interpolation) |
| Timestamps | Server-provided (no client-side date formatting library) |

> **Note**: Consider adding `Intl.DateTimeFormat` or `date-fns` for locale-aware date formatting in a migration.

### Time Formats

| Context | Format |
|---------|--------|
| Video timer | `M:SS` format (e.g., `2:30`) |
| Duration | "max 3 min" |
| Countdown | `Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` |

### Number Formats

| Context | Current | Recommendation for Migration |
|---------|---------|------------------------------|
| Salary ranges | String (e.g., "$90K–$110K", "EGP") | Use `Intl.NumberFormat` |
| Employee counts | `"{{count}} employees"` (i18n interpolation) | Use `Intl.NumberFormat` with pluralization |
| Scores | "94%", "92% Match" | Hardcoded format strings |
| Scores (decimal) | "85.3" | Hardcoded |

### Currency Formats

| Currency | Format | Context |
|----------|--------|---------|
| USD | "$90K–$110K" | Featured jobs (hardcoded landing data) |
| EGP | "Salary Range (EGP)" | Job filters |

### Translation Key Structure

```
<namespace>: {
  <key>: "<value>",
  <nested_key>: {
    <sub_key>: "<value>"
  }
}
```

#### Namespaces

| Namespace | Keys | Purpose |
|-----------|------|---------|
| (root) | 3 | `logout`, `dark_mode`, `light_mode` |
| `nav` | 11 | Sidebar navigation labels |
| `applicant_dashboard` | 18 | Applicant home page |
| `applications` | 11 | Active applications list |
| `stages` | 17 | Application stage labels |
| `avatar_modal` | 6 | Profile picture upload |
| `interview_list` | 15 | Interview progress tracking |
| `apply_job` | 22 | Job application form |
| `auth_layout` | 7 | Authentication page features |
| `sign_up` | 13 | Registration form |
| `roles` | 2 | User role labels |
| `sign_in` | 13 | Login form |
| `forgot_password` | 9 | Password reset |
| `reset_password` | 18 | Password reset flow |
| `job_details` | 10 | Individual job view |
| `jobs_page` | 9 | Job board |
| `job_filters` | 12 | Filter UI |
| `job_search` | 2 | Search bar |
| `company_layout` | 2 | Company section wrapper |
| `company_profile` | 12 | Company settings |
| `jd_generator` | 23 | Job description generator |
| `job_postings` | 9 | Job management |
| `no_company_view` | 15 | Company creation/join |
| `job_content_cards` | 8 | Job detail cards |
| `job_detail_header` | 10 | Job header actions |
| `job_info_grid` | 12 | Job metadata display |
| `job_pipeline_preview` | 9 | Pipeline preview |
| `job_sidebar` | 8 | Job list sidebar |
| `interview_page` | 17 | Interview session |
| `code_question` | 1 | Code question submit |
| `pipeline_builder` | 14 | Pipeline editor |
| `stage_details` | 10 | Stage configuration |
| `candidate_pipeline` | 19 | Candidate management |
| `recruiter_dashboard` | 6 | Recruiter overview |
| `dashboard_charts` | 10 | Analytics charts |
| `dashboard_jobs_table` | 10 | Jobs table |
| `dashboard_stats` | 4 | Stat cards |
| `add_interview` | 7 | Interview invitation |
| `shortlists` | 9 | Shortlist overview |
| `shortlist` | 46 | Shortlist detail & voting |
| `shortlistInsights` | 17 | Insights panel |
| `landing` | 35 | Public landing page |
| `builtForJobs` | 22 | Features section |
| `topFeaturedJobs` | 23 | Featured job listings |
| `faq` | 24 | Frequently asked questions |

### Pluralization Rules

| Language | Rule | Example |
|----------|------|---------|
| English | `count === 1` → singular, else plural | `"{{count}} employee"` / `"{{count}} employees"` |
| Arabic | Complex plural (singular, dual, plural) | Implemented via i18next `plural` key suffix |

Uses i18next `{{count}}` interpolation with key suffixes `_one` / `_other` for English.

### Fallback Language Strategy

```javascript
// src/shared/i18n/i18n.js
fallbackLng: "en",
```

- **Detection order**: `localStorage` → `navigator` (browser language)
- **Cache**: Language preference saved to `localStorage`
- If a key is missing in the active locale, English value is used as fallback

### Text Expansion Considerations

| Language | Expected Expansion | Impact |
|----------|-------------------|--------|
| Arabic | 25–35% text expansion | Buttons, labels, and fixed-width containers may overflow |

**Recommendations for RTL/Arabic**:
- Avoid fixed-width buttons; use `min-width` + padding
- Use `flex-wrap` for button groups
- Test all dialogs with Arabic content for overflow

### Localization QA Checklist

| Check | Description |
|-------|-------------|
| [ ] All user-facing strings use `t()` function | No hardcoded text in JSX |
| [ ] RTL direction set on `<html>` | `documentElement.dir = "rtl"` |
| [ ] Layout reverses in RTL | Sidebar on right, text alignment adjusted |
| [ ] Dates format per locale | Use `Intl.DateTimeFormat` |
| [ ] Numbers format per locale | Use `Intl.NumberFormat` |
| [ ] Currency format per locale | Symbol position, decimal, group separators |
| [ ] Pluralization works for all locales | i18next `_one`/`_other` keys defined |
| [ ] No text truncation in Arabic | Check for overflow in buttons, labels, tooltips |
| [ ] Icons mirror in RTL | Lucide `aria-label` context, no hardcoded direction |
| [ ] Form validation messages translated | All `errors.*` keys populated |
| [ ] Loading/empty/error states translated | All status messages use `t()` |

---

## 10. Accessibility Standards

### WCAG Compliance Targets

| Level | Target | Status |
|-------|--------|--------|
| **WCAG 2.1 AA** | Primary target | ⚠ Partial |
| Color contrast (AA) | 4.5:1 for text, 3:1 for large text | ✅ Most combinations pass |
| Keyboard navigation | All interactive elements operable | ✅ Radix primitives ensure this |
| Screen reader support | ARIA labels, roles, live regions | ✅ Partial (Radix covers modals/dialogs) |

### Color Contrast Requirements

| Requirement | Ratio | Applies To |
|-------------|-------|------------|
| Normal text (AA) | ≥ 4.5:1 | Body copy, labels, button text |
| Large text (AA) | ≥ 3:1 | Headings ≥ 18px or ≥ 14px bold |
| Enhanced text (AAA) | ≥ 7:1 | Optional but preferred |
| UI components (AA) | ≥ 3:1 | Input borders, focus indicators |

#### Verified Pass/Fail Matrix

| Foreground | Background | Ratio | Pass (AA) |
|-----------|-----------|-------|-----------|
| `--color-foreground` (`#012a4a`) | `--color-background` (`#ffffff`) | 14.67:1 | ✅ |
| `--color-primary` (`#01497c`) | `--color-background` (`#ffffff`) | 9.35:1 | ✅ |
| `--color-accent` (`#2a6f97`) | `--color-background` (`#ffffff`) | 5.50:1 | ✅ |
| `--color-muted-foreground` (`#468faf`) | `--color-background` (`#ffffff`) | 3.62:1 | ❌ (large text only) |
| `--color-destructive` (`#dc2626`) | `--color-background` (`#ffffff`) | 4.83:1 | ✅ |
| `--color-foreground` (dark `#eef7fa`) | `--color-background` (dark `#061826`) | 16.56:1 | ✅ |
| `--color-primary` (dark `#468faf`) | `--color-background` (dark `#061826`) | 4.98:1 | ✅ |

### Keyboard Navigation Rules

| Rule | Implementation |
|------|---------------|
| All interactive elements focusable | Radix primitives ensure native tab order |
| Visible focus indicator | `focus-visible:ring-3 focus-visible:ring-ring/50` on all inputs/buttons |
| Tab order follows visual order | Default DOM order |
| Escape closes modals | Radix Dialog built-in behavior |
| Enter/Space activates buttons | Native `<button>` elements |
| Arrow keys for lists | Radix-based if implemented |

### Screen Reader Support

| Pattern | Implementation |
|---------|---------------|
| `aria-label` | Close buttons, icon-only controls |
| `aria-describedby` | Dialog description mapping |
| `aria-invalid` | Form validation on inputs and buttons |
| `aria-expanded` | Expandable sections |
| `sr-only` class | Screen reader only text (e.g., "Close" for X button) |
| `role="dialog"` | Radix Dialog primitive |
| `role="alert"` | Not currently used — should be added for error messages |

### Focus State Requirements

| Element | Focus Style |
|---------|-------------|
| Buttons | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` |
| Inputs | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20` |
| Textareas | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` |
| Links | Browser default or `outline-none focus-visible:ring-2` |
| Custom elements | Require explicit `tabindex` and `focus-visible` styles |

### ARIA Recommendations

| Component | Recommended ARIA |
|-----------|-----------------|
| Modal/Dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (handled by Radix) |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Navigation | `role="navigation"`, `<nav>` element |
| Alerts | `role="alert"` or `aria-live="polite"` |
| Form errors | `aria-describedby` linking to error message element |
| Progress | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Icons | `aria-hidden="true"` (Lucide defaults) |
| Icon buttons | `aria-label` or visually hidden text |

---

## 11. Theme Support

### Light Theme

Default theme. Applied when no `dark` class is present on `<html>`.

```css
:root {
  --color-background: #ffffff;
  --color-foreground: #012a4a;
  /* ... (see full list in Section 2) */
}
```

### Dark Theme

Activated by adding `.dark` class to `<html>` element.

```css
.dark {
  --color-background: #061826;
  --color-foreground: #eef7fa;
  /* ... (see full list in Section 2) */
}
```

### Theme Switching Behavior

```jsx
// src/shared/context/theme.jsx
function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function toggle() {
    setDarkMode((prev) => !prev);
  }
  // ...
}
```

| Behavior | Detail |
|----------|--------|
| **Default** | Respects `prefers-color-scheme` OS/browser setting |
| **Persistence** | Saves to `localStorage` key `"theme"` |
| **Toggle** | Manual toggle via UI (Sun/Moon icon in sidebar) |
| **Scope** | Global — class applied to `<html>` element |
| **Priority** | `localStorage` > `prefers-color-scheme` (manual preference wins) |

### High Contrast Theme

Not currently implemented. The dark theme provides reduced luminance but does not qualify as a high-contrast mode. **Recommendation**: Add a high-contrast theme for WCAG AAA compliance.

---

## 12. Implementation Notes

### Frontend Integration Guidelines

#### Required Dependencies

When migrating to a new project, install:

```bash
# Core framework
npm install react react-dom react-router-dom

# Styling
npm install tailwindcss @tailwindcss/vite clsx tailwind-merge class-variance-authority

# Component primitives
npm install radix-ui shadcn

# Icons
npm install lucide-react

# Animations
npm install framer-motion tw-animate-css

# Typography
npm install @fontsource-variable/geist

# i18n
npm install i18next react-i18next i18next-browser-languagedetector

# Utilities
npm install @hello-pangea/dnd react-fast-marquee recharts
```

#### Required Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite config with `@tailwindcss/vite` plugin and `@` path alias |
| `src/index.css` | Tailwind imports + `@theme` design tokens + `.dark` overrides |
| `src/shared/lib/utils.js` | `cn()` utility function (clsx + tailwind-merge) |
| `components.json` | shadcn/ui configuration |

#### cn() Utility

```js
// src/shared/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Design Token Usage Examples

#### In CSS

```css
.my-component {
  background: var(--color-surface);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}
```

#### In JSX with Tailwind

```jsx
<div className="bg-surface text-foreground border border-border rounded-lg p-4">
  <h2 className="text-lg font-bold text-foreground tracking-tight">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
  <button className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium">
    Action
  </button>
</div>
```

#### In JSX with `style` prop (fallback)

```jsx
<div
  style={{
    backgroundColor: "var(--color-surface)",
    color: "var(--color-foreground)",
    borderColor: "var(--color-border)",
  }}
/>
```

### Recommended Folder Structure for Migration

```
project-root/
├── public/
│   └── *.svg                      # Static assets, logos, favicon
├── src/
│   ├── index.css                  # Tailwind imports + @theme tokens + dark mode
│   ├── main.jsx                   # Entry point with providers
│   ├── App.jsx                    # Root routes
│   ├── lib/
│   │   └── utils.js               # cn() utility
│   ├── components/
│   │   └── ui/                    # shadcn/ui primitives
│   │       ├── button.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       ├── field.jsx
│   │       ├── label.jsx
│   │       └── textarea.jsx
│   ├── shared/
│   │   ├── context/
│   │   │   └── theme.jsx          # Theme provider + toggle
│   │   ├── i18n/
│   │   │   ├── i18n.js            # i18next init
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── ar.json
│   │   └── ui/                    # Shared app-shell components
│   │       ├── Card.jsx
│   │       ├── MainLayout.jsx
│   │       ├── Navbar.jsx
│   │       ├── LoadingSpinner.jsx
│   │       └── LanguageSwitcher.jsx
│   └── features/                  # Feature-based modules
│       ├── auth/
│       ├── jobs/
│       ├── landing/
│       └── ...
├── components.json                # shadcn config
├── vite.config.js                 # Vite config
└── package.json
```

### Migration Considerations

| Priority | Item | Notes |
|----------|------|-------|
| **P0** | Transfer `index.css` @theme block | Contains all design tokens — the most critical artifact |
| **P0** | Install matching dependency versions | See package.json for exact versions |
| **P0** | Copy `cn()` utility | Required by all shadcn components |
| **P0** | Set up i18n with en.json + ar.json | Also copy `i18n.js` init config |
| **P0** | Copy theme context | `theme.jsx` handles dark mode toggling |
| **P1** | Copy shadcn/ui primitives | `button.jsx`, `input.jsx`, `dialog.jsx`, etc. |
| **P1** | Copy shared UI components | `MainLayout.jsx`, `Card.jsx`, etc. |
| **P1** | Verify WCAG contrast for all color combos | Pay special attention to `muted-foreground` vs white |
| **P1** | Audit RTL layout | Current RTL support works at the DOM level but CSS may need `rtl:` variants |
| **P2** | Add high-contrast theme variant | Not currently implemented |
| **P2** | Standardize date/number formatting | Add `Intl` formatters or a library like `date-fns` |
| **P2** | Add dedicated Alert, Badge, Tabs, Tooltip components | Currently implemented inline in feature code |
| **P3** | Generate icon sprite or subset Lucide | Reduces bundle size if only specific icons are used |
| **P3** | Add Storybook or similar component explorer | Currently no design system preview tooling |

---

*Generated from `src/index.css`, `src/shared/context/theme.jsx`, `src/shared/i18n/*`, `src/components/ui/*`, `src/shared/ui/*`, and feature-level component analysis.*

*Last updated: 2026-06-10*
