---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, UI components, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look like generic AI templates. Prevents purple gradients, centered cliches, and repetitive layout patterns.
---

# tasteskill: Anti-Slop Frontend Skill

> Follow these principles whenever generating or refining UI components, pages, or styling.
> Contextual rule: Read the brief, infer user intent, then apply what fits.

---

## 0. BRIEF INFERENCE (Read the Room First)

Before generating UI or tweaking dials, infer what the user actually wants. Most LLM design output is bad because the model defaults to a cliché aesthetic.

### Signals to Read:
1. **Page/Component Kind:** landing page, admin panel, student dashboard, portfolio, form, or checkout.
2. **Vibe Words:** "minimalist", "calm", "Linear-style", "brutalist", "academic/formal", "Apple-y", "modern SaaS".
3. **Audience:** Lecturer/aslab (needs clean, professional, readable code & UI) vs. consumer vs. developer.
4. **Anti-Default Discipline:**
   - **DO NOT DEFAULT TO:** AI-purple neon gradients, centered hero over dark mesh, generic glassmorphism on everything, infinite-loop micro-animations everywhere, Inter + slate-900.
   - Choose clean, distinct aesthetics tailored to the project.

---

## 1. THE THREE DIALS

* **`DESIGN_VARIANCE: 6`** (1 = Strict Symmetry, 10 = Artsy Chaos)
* **`MOTION_INTENSITY: 4`** (1 = Static, 10 = Cinematic/Spring Physics)
* **`VISUAL_DENSITY: 4`** (1 = Airy/Gallery, 10 = Cockpit/Data Density)

*For academic / student projects: keep variance 5-6, motion 3-4, density 4-5 for a clean, credible, professional feel.*

---

## 2. TYPOGRAPHY & COLOR DISCIPLINE

### Typography:
- **Display / Headlines:** `text-3xl md:text-5xl font-semibold tracking-tight`.
- **Body / Paragraphs:** `text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-[65ch]`.
- **Sans font choice:** Favor clean, modern fonts (`Geist`, `Plus Jakarta Sans`, `Outfit`, `Satoshi`) or system sans (`system-ui, -apple-system, sans-serif`).
- **No Random Serif:** Do NOT inject arbitrary serif fonts into a sans-serif interface unless explicitly requested.

### Color Calibration:
- **Maximum 1 primary accent color.**
- **The Anti-Neon Rule:** Avoid random neon purple button glows and muddy multi-color gradients.
- **Palette consistency:** Pick a neutral base (Zinc, Slate, or Neutral) and stick with it throughout all components.

---

## 3. LAYOUT & INTERACTIVE STATES

### Layout Discipline:
- **Viewport Stability:** NEVER use `h-screen` for full-height sections on mobile. ALWAYS use `min-h-[100dvh]`.
- **CSS Grid over Hacky Math:** Use clean CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`) instead of complex flex percentage math.
- **Hero & Headers:** Don't bloat headers with 5 different badges and tags. Keep it focused and clear.

### Full Interaction Lifecycle:
1. **Loading State:** Clean skeleton loader matching the final layout shape (avoid generic spinning wheels everywhere).
2. **Empty State:** Thoughtfully composed with an action button (e.g. *"Belum ada data nilai. Tambah data sekarang"*).
3. **Error State:** Clear inline helper text for forms, contextual alert banners for failures.
4. **Tactile Feedback:** Use `:active` states (`active:scale-[0.98]` or `active:translate-y-[1px]`) for tangible tactile feel.
5. **Button Contrast (a11y):** Ensure button label meets WCAG AA contrast against its background. Never ship low-contrast unreadable buttons.
