# COPILOT.md — Poof UI Build Guide

> This file is the single source of truth for building all UI on the **Poof** platform.
> Every screen, component, landing page, and app view must follow these rules exactly.
> When in doubt — reference this file first.

---

## 1. What is Poof?

**Poof** is a photo-sharing platform where users can upload images to a gallery and attach an expiry date/time to their share link. When the link expires — the content vanishes. Poof.

**Core features:**
- Upload photos / create galleries
- Generate shareable URLs
- Set expiry date & time on each share link
- Links self-destruct after expiry — no trace left

**Brand personality:** Carefree · Trustworthy · Minimal · Slightly playful · Clean

---

## 2. Brand Voice & Taglines

Use these across UI copy, empty states, error messages, CTAs, and marketing:

| Context | Copy |
|---|---|
| Hero tagline | "Share it. Poof. Gone." |
| Sub-tagline | "Your gallery, on a timer." |
| Security angle | "Share without a trace." |
| Emotional | "Here for a moment. Gone forever." |
| Feature angle | "Beautiful photos. Built to disappear." |

**Tone rules:**
- Short sentences. Always.
- No corporate fluff. No "leverage", "seamless", "robust".
- Speak like a calm, cool friend — not a SaaS product.
- Embrace the ephemeral: words like *vanish, fade, poof, gone, moment, trace* are on-brand.
- Error messages should feel light, never alarming. e.g. "Couldn't find that link. Maybe it already poofed 💨"

---

## 3. Color Palette

Always use these exact values. No improvisation on colors.

```css
:root {
  /* Core */
  --black:        #0d0d0d;   /* Primary background */
  --white:        #f5f2ee;   /* Primary text / light bg */
  --smoke:        #e8e3db;   /* Secondary text on light */
  --mist:         #c9c1b6;   /* Tertiary text, labels, captions */

  /* Brand */
  --poof-violet:  #c8b8ff;   /* Primary brand color */
  --poof-peach:   #ffcba4;   /* Warm accent */
  --poof-mint:    #b6f0d8;   /* Cool accent */
  --accent:       #7c5cfc;   /* CTAs, links, interactive elements */

  /* Surfaces */
  --surface-1:    rgba(255,255,255,0.03);   /* Card backgrounds */
  --surface-2:    rgba(255,255,255,0.06);   /* Hover states */
  --border:       rgba(255,255,255,0.07);   /* Borders */
  --border-hover: rgba(200,184,255,0.30);   /* Hover borders */
}
```

**Usage rules:**
- Default theme is **dark** (`--black` background)
- `--accent` (#7c5cfc) is for all interactive elements: buttons, links, focus rings
- `--poof-violet` is for gradients, glows, logo, decorative elements
- `--poof-peach` and `--poof-mint` are accents only — use sparingly for tags, badges, highlights
- Never use pure `#ffffff` or `#000000` — use `--white` and `--black`
- Glassmorphism is welcome: `background: rgba(255,255,255,0.04); backdrop-filter: blur(12px);`

**Gradient presets:**

```css
/* Hero background glow */
background:
  radial-gradient(ellipse 60% 50% at 30% 40%, rgba(200,184,255,0.18) 0%, transparent 70%),
  radial-gradient(ellipse 50% 60% at 75% 60%, rgba(255,203,164,0.14) 0%, transparent 70%),
  radial-gradient(ellipse 40% 40% at 55% 20%, rgba(182,240,216,0.10) 0%, transparent 70%);

/* Brand text gradient */
background: linear-gradient(135deg, #f5f2ee 30%, #c8b8ff 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* CTA button */
background: linear-gradient(135deg, #7c5cfc, #a48cff);
```

---

## 4. Typography

**Font stack — always import from Google Fonts:**

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
```

| Role | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| Display / Logo | Syne | 800 | 48–80px | −2px to −3px |
| Heading H1 | Syne | 800 | 36–48px | −1.5px |
| Heading H2 | Syne | 700 | 24–32px | −1px |
| Body | DM Sans | 300–400 | 15–18px | 0 |
| Label / Caption | DM Sans | 500 | 11–12px | +3px to +5px, uppercase |
| Button | DM Sans | 500 | 14–15px | +1px |

**Rules:**
- Headings always in **Syne**
- Body always in **DM Sans**
- Never use system fonts (no Arial, Roboto, Inter)
- Letter-spacing on labels: always uppercase + wide tracking
- Brand wordmark "poof" is always lowercase, Syne 800

---

## 5. Logo

### Wordmark
```
"poof" — always lowercase — Syne 800 — letter-spacing: −3px
```

### Icon (SVG)
The logo icon is a soft cloud/poof shape made of overlapping circles with rising sparkle dots above it.

```svg
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="poofGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#e8d8ff"/>
      <stop offset="60%"  stop-color="#c8b8ff"/>
      <stop offset="100%" stop-color="#7c5cfc"/>
    </radialGradient>
  </defs>
  <!-- Cloud body -->
  <ellipse cx="50" cy="62" rx="28" ry="16" fill="url(#poofGrad)" opacity="0.7"/>
  <circle cx="36" cy="55" r="14" fill="url(#poofGrad)" opacity="0.85"/>
  <circle cx="52" cy="48" r="18" fill="url(#poofGrad)"/>
  <circle cx="67" cy="55" r="13" fill="url(#poofGrad)" opacity="0.85"/>
  <!-- Rising sparkle dots -->
  <circle cx="44" cy="28" r="3" fill="#c8b8ff" opacity="0.5"/>
  <circle cx="55" cy="22" r="2" fill="#e8d8ff" opacity="0.35"/>
  <circle cx="62" cy="30" r="2.5" fill="#c8b8ff" opacity="0.4"/>
</svg>
```

### Logo variants

| Variant | Usage |
|---|---|
| Icon + wordmark (dark bg) | Default — nav, hero |
| Icon + wordmark (light bg) | Light mode pages, email |
| Icon only | Favicon, app icon, avatar |
| Wordmark only | Horizontal banners, footers |

### Logo DON'Ts
- Never rotate or skew the logo
- Never change the wordmark to uppercase
- Never use the logo in any color other than the approved variants
- Never add a drop shadow to the wordmark
- Minimum size: icon 24px, wordmark 20px

---

## 6. Spacing & Layout

**8px base grid.** All spacing in multiples of 8.

```
4px  — micro gaps (icon to label)
8px  — tight spacing (list items)
16px — component padding (small)
24px — component padding (medium)
32px — section internal spacing
48px — between components
64px — section padding (mobile)
80px — section padding (desktop)
120px — hero breathing room
```

**Border radius:**
```
4px  — tags, badges, tiny chips
8px  — inputs, small buttons
12px — cards (small)
16px — cards (standard)
20px — cards (large), modals
100px — pill buttons, full-round elements
```

**Max content width:** `1100px` — center with `margin: 0 auto`

---

## 7. Components

### Buttons

```css
/* Primary CTA */
.btn-primary {
  background: linear-gradient(135deg, #7c5cfc, #a48cff);
  color: #f5f2ee;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 1px;
  padding: 14px 28px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

/* Ghost button */
.btn-ghost {
  background: transparent;
  color: #f5f2ee;
  border: 1px solid rgba(255,255,255,0.15);
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 1px;
  padding: 13px 27px;
  border-radius: 100px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.btn-ghost:hover {
  border-color: rgba(200,184,255,0.5);
  background: rgba(200,184,255,0.06);
}
```

### Cards

```css
.card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 24px;
  transition: border-color 0.2s, background 0.2s;
}
.card:hover {
  border-color: rgba(200,184,255,0.3);
  background: rgba(255,255,255,0.05);
}
```

### Inputs

```css
.input {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #f5f2ee;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  padding: 12px 16px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.input:focus {
  border-color: #7c5cfc;
  box-shadow: 0 0 0 3px rgba(124,92,252,0.15);
}
.input::placeholder { color: #c9c1b6; }
```

### Tags / Badges

```css
/* Violet tag */
.tag-violet { background: rgba(200,184,255,0.15); color: #c8b8ff; border-radius: 100px; padding: 4px 12px; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; }

/* Peach tag */
.tag-peach  { background: rgba(255,203,164,0.15); color: #ffcba4; border-radius: 100px; padding: 4px 12px; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; }

/* Mint tag */
.tag-mint   { background: rgba(182,240,216,0.15); color: #b6f0d8; border-radius: 100px; padding: 4px 12px; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; }
```

### Section Labels

```css
.section-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: #c9c1b6;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-label::after {
  content: ''; 
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.08);
}
```

---

## 8. Animation & Motion

**Philosophy:** Motion should feel like things gently fading in or softly floating — echoing the "poof" brand concept. Never abrupt or heavy.

**Standard entry animation:**
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeUp 0.7s ease both; }

/* Stagger children */
.child:nth-child(1) { animation-delay: 0s; }
.child:nth-child(2) { animation-delay: 0.1s; }
.child:nth-child(3) { animation-delay: 0.2s; }
```

**Breathe / glow pulse (for hero backgrounds):**
```css
@keyframes breathe {
  from { opacity: 0.6; transform: scale(1); }
  to   { opacity: 1;   transform: scale(1.05); }
}
```

**Floating particles (hero sections):**
```css
@keyframes floatUp {
  0%   { opacity: 0; transform: translateY(0) scale(1); }
  20%  { opacity: 0.6; }
  80%  { opacity: 0.2; }
  100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
}
```

**Transition defaults:**
```css
transition: all 0.2s ease;         /* hover states */
transition: opacity 0.3s ease;     /* show/hide */
transition: transform 0.15s ease;  /* button press */
```

**Rules:**
- No janky, fast snaps — everything eases
- Logo icon has a gentle pulse glow at all times
- Page load: hero content fades up in sequence (staggered)
- Hover on cards: subtle border color shift + slight bg lift
- Never use `transition: all` on performance-critical elements

---

## 9. Page Structure

### Standard page shell

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>poof — [Page Title]</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
</head>
<body> <!-- bg: #0d0d0d, color: #f5f2ee -->
  <nav>...</nav>
  <main>...</main>
  <footer>...</footer>
</body>
</html>
```

### Nav structure
- Left: Poof logo (icon + wordmark)
- Center (desktop): nav links — plain text, `DM Sans 400`, no underline, `--mist` color, hover → `--white`
- Right: Ghost button "Log in" + Primary button "Get started"
- Mobile: hamburger → slide-in drawer
- Sticky on scroll, with `backdrop-filter: blur(16px)` glass effect

### Footer structure
- Wordmark + tagline left
- Links in columns center
- Social icons right
- Bottom bar: copyright + legal links
- Background: slightly lighter than page — `rgba(255,255,255,0.02)`

---

## 10. Key App Screens & Their Intent

| Screen | Purpose | Key UI notes |
|---|---|---|
| Landing page | Convert visitors | Hero with animated logo, clear CTA, feature grid |
| Sign up / Log in | Auth | Centered card, minimal form, social login |
| Dashboard | User's galleries overview | Grid of gallery cards with expiry countdown badges |
| Gallery detail | View photos in a gallery | Masonry or grid, expiry timer visible, share CTA prominent |
| Upload flow | Add photos | Drag & drop zone, progress, expiry date picker |
| Share link page | Public-facing view for recipients | Stripped nav, just the gallery + expiry countdown |
| Expired link page | Dead link landing | Playful empty state — "This poofed 💨", minimal |
| Settings | Account management | Clean form layout, section groups |

---

## 11. Expiry UX Patterns

The expiry feature is Poof's core differentiator — treat it as a **first-class UI element**.

- Expiry badges use `--poof-peach` when expiring soon (< 24h), `--poof-mint` when healthy
- Countdown timers: `HH:MM:SS` format — monospace font preferred for digits
- Expired state: greyed out card, strikethrough or muted overlay, "Poofed" label
- Date picker for expiry: custom styled, no browser defaults — match dark theme
- Copy: "This link expires in 3 days" not "TTL: 259200s"

---

## 12. Iconography

- Use **Lucide Icons** (clean, minimal, consistent stroke width)
- Icon size: 16px (inline), 20px (UI actions), 24px (feature icons)
- Stroke color: inherit from text or `--mist` for secondary icons
- Never fill icons unless specifically a filled style (e.g. logo)
- Icons paired with text: always `display: flex; align-items: center; gap: 8px`

---

## 13. Imagery & Gallery Display

- Photos in gallery: rounded corners (`border-radius: 12px`), slight shadow
- Hover on photo: subtle scale up (`transform: scale(1.02)`) + overlay with actions
- Masonry layout preferred for varied photo sizes
- Aspect-ratio lockboxes: use `aspect-ratio: 1` for grid, free for masonry
- Loading state: soft shimmer skeleton in `rgba(255,255,255,0.05)` → `rgba(255,255,255,0.10)`
- Empty gallery: centered illustration / icon + on-brand empty state copy

---

## 14. Do's and Don'ts

### ✅ Do
- Dark background by default
- Soft glows and radial gradients in hero areas
- Floating particle effects on hero/landing sections
- Glass cards with `backdrop-filter`
- Lowercase "poof" wordmark always
- Short, punchy copy
- Pill-shaped primary buttons
- Staggered fade-up animations on page load

### ❌ Don't
- No pure white backgrounds (use `--white` #f5f2ee)
- No purple gradients on white — that's generic AI
- No Inter, Roboto, or system fonts
- No uppercase logo wordmark
- No heavy drop shadows on text
- No cluttered layouts — generous whitespace always
- No aggressive red for errors — use muted tones with clear icons
- No long paragraphs in UI — break into short chunks

---

## 15. File & Asset References

| Asset | Location / Notes |
|---|---|
| Brand identity HTML | `poof-brand.html` — full palette, logo SVG, type specimens |
| Logo SVG | Embedded in `poof-brand.html` — copy the `<svg>` block from Section 5 above |
| Google Fonts URL | `https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500` |
| Lucide Icons CDN | `https://unpkg.com/lucide@latest/dist/umd/lucide.js` |

---

*Last updated: v1.0 — generated from Poof brand identity kit*
*Always keep this file in sync when brand decisions change.*
