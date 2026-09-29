# Wayfare Design System

A design system for a **travel-log app on iOS, iPadOS and macOS — version 2**. The visual language is
derived from the Pinterest-inspired brief supplied with this project: a warm, inspiration-driven
canvas where photography is the content and the UI stays quiet around it.

## Sources

| Source | What was provided |
|---|---|
| Written brief (pasted into chat) | Company description ("ios, ipad, macos app for travel logs. version 2") and a full "Design System Inspiration of Pinterest" document: colour tokens with hex values and variable names, a type scale, component specs (buttons, cards, inputs, nav), spacing and radius scales, elevation philosophy, do's/don'ts, breakpoints. |
| Figma | None provided. |
| GitHub / codebase | None provided. |
| Screens, screenshots, decks | None provided. |
| Logo / brand assets | None provided. |

Everything in this system therefore comes from the brief's token values plus this system's own
inferences about a travel-log product. **No production code or Figma file was available**, so the UI
kits are original compositions built to the brief's rules rather than recreations of an existing
build — see Caveats.

## Products represented

- **iPhone app** (`ui_kits/ios_app/`) — masonry log feed, entry detail, map, compose sheet, profile.
- **iPad app** (`ui_kits/ipad_app/`) — three-pane split view: source list, library, entry inspector.
- **macOS app** (`ui_kits/macos_app/`) — single library window with unified toolbar, Grid/List/Map
  modes and an editing inspector.

There is no marketing website or docs surface in the brief, so none was invented.

---

## Content fundamentals

**Voice.** Plain, first-person-plural only when the product acts ("we'll pull the place and date from
them"). Otherwise the copy speaks to the user as *you* and about their material as *yours* — "Your
logs", "Search your logs", "Show on my profile" on a user-owned toggle. Never corporate *we*.

**Register.** Matter-of-fact and slightly warm. The product never enthuses about the user's trip; it
describes what it did. Entry body copy is the user's own writing and reads like a notebook: concrete
nouns, no adjectives of praise.

> We left before the café opened and ate the last of yesterday's bread on the pier. The crossing
> takes an hour and ten minutes; nobody on board seemed in a hurry.

**Casing.** Sentence case everywhere — headings, buttons, labels, menu items. "New log", not "New
Log". Only proper nouns capitalise mid-string ("Ferry to Ærø", "Nordic summer"). Never all-caps
except the 10–11px uppercase eyebrow labels in sidebars and inspectors, which carry `.08em` tracking.

**Length.** Button labels are one or two words ("Save log", "Open map", "Export entry"). Toasts are
one clause with an optional verb-only action: "Saved to Nordic summer" / *Undo*. Dialog titles are
questions when destructive ("Delete this log?"); the description states the consequence in the
reassuring direction ("Its 42 photos stay in your library.").

**Numbers and metadata.** Numerals always, abbreviated units, middle dots as separators:
"14 Jun · 6 photos", "9 days", "24 logs · 62 photos", "32 km". Dates are day-month ("14 June 2026"),
never US order.

**Empty and placeholder states.** Phrased as an instruction or a question, not an apology:
"Where did you go?", "Drop photos to start a log", "Add a location", "Select a log".

**Emoji.** Never. Iconography carries all non-text meaning.

**Things to avoid.** Exclamation marks; "Oops"; "Let's"; gerund headings ("Exploring your trips");
marketing verbs (*unlock*, *supercharge*); em-dash-heavy constructions; feature names in Title Case.

---

## Visual foundations

### Colour

Two brand colours over one warm neutral family. **Amber `#B4763A`** is the brand mark — the
wordmark, the active tab glyph, the route line on a map, the discover badge, the on-state of a
Switch. Amber does not clear 4.5:1 on the page, so it carries large type (18pt+), icons and lines
only, and an amber fill takes **plum-black label ink, never white**. **Navy `#1F3864`** carries the
single primary action on a view and title emphasis; white on navy reads at 11.6:1. Neither colour is
used for body text, links, borders or decoration.

**Plum black `#211922`** is primary text — pure black is never body text, because plum black settles
better on warm neutrals. Secondary text is **olive gray `#62625b`**, disabled and placeholder text
**silver `#91918c`**.

The neutral ramp is deliberately warm/olive: page `#fbfaf7`, fog `#f6f6f3`, surface `#ffffff`, sand
`#e5e5e0`, warm `#e0e0d9`, gray `#c8c8c1`, silver `#91918c`, dark `#33332e`. Cool steel grays are
wrong in this system. A deep **green `#103c25`** carries map and outdoors surfaces; the map canvas
is a `#EDF1EC → #E2E9E6` wash with navy endpoint pins.

State colours are functional only, never decorative: success `#3D7A5F`, danger `#A8534A`, focus
`#435EE5`, link `#2B48D4`. Caution keeps its own pair — wash `#FDF8F0` on line `#F0E2CE` — so a
warning never reads as brand amber: **brand amber is a fill or a line; caution is always a wash
card with a border and a caption.**

A dark palette ships alongside the light one (`:root[data-theme="dark"]`). It keeps the warm neutral
identity but holds saturation back so backgrounds don't tint photography: page `#1A1A18`, surface
`#232321`, elevated `#2C2C29`, border `#3A3A36`, text `#F2F0EB` (not pure white). Amber lifts to
`#D19861` and navy to `#5E86C9`, and hover inverts — lighter, not darker.

### Type

A single family. Pin Sans is proprietary; **Hanken Grotesk** (Google Fonts) is the substitute here —
a humanist grotesque with the same generous apertures and a 300–800 range. Scale: 70px display
(600, `-0.02em`), 40px title, **28px heading with `-1.2px` tracking** — the signature cosy negative
tracking — 20px subheading, 16px body at 1.40, 14px bold metadata, 12px captions and buttons.
Nothing below 400 weight, ever; headings sit at 600–700.

### Spacing and layout

8px base with odd in-between steps taken verbatim from the brief (4, 6, 7, 8, 10, 11, 12, 16, 18, 20,
22, 24, 32, 48, 80, 100). **Density below, air above**: the masonry grid packs tightly on a 16px
gutter because content density *is* the value; sections are separated by 80–100px. Max content width
1312px. Masonry columns collapse 5 → 4 → 3 → 2 → 1 across the brief's breakpoints (576 / 768 / 890 /
1312 / 1440 / 1680).

### Backgrounds and imagery

White page, fog and sand for grouped surfaces, `#33332e` for footers and dark sections. No
gradients as decoration, no patterns, no textures, no illustration layer. The only "imagery" is the
user's own photography, which is warm-leaning and untreated — no duotone, no grain, no filters. A
translucent warm wash `hsla(60,20%,98%,.5)` with an 8px blur is the one glass effect, used for place
chips and controls sitting on top of photos. Hero photos carry a top-and-bottom plum scrim
(`rgba(33,25,34,.45)` → transparent → `.35`) so white type and overlay buttons stay legible rather
than a solid capsule.

### Corners, borders, elevation

Radius is the loudest formal move: 12px standard, **16px on buttons and inputs** (rounded, never a
pill), 20px content cards and photos, 28px large containers, 32px sections and modals, 40px hero
blocks and bottom sheets, 50% for icon buttons. Nothing on a card goes below 12px.

Borders are hairlines: 1px `#91918c` on inputs, 1px `#e5e5e0` as a structural divider. The one thick
border is the **8px white photo frame** on featured tiles. Cards are flat — no shadow, no border by
default; separation comes from the warm surface tone and the rounding. Shadow appears only on things
that genuinely float: `--elevation-subtle` for a switch knob, `--elevation-overlay` for toasts and
popovers, `--elevation-modal` for dialogs. No inner shadows anywhere.

### States

- **Hover** — darker, never lighter, and never opacity: red → `#9a6532`, sand → `#e0e0d9`, ghost picks
  up a sand fill. Photo tiles take a `rgba(33,25,34,.28)` veil and reveal their save control.
- **Press** — the pressed token one step darker again (`#83562a`) plus a 0.96 scale.
- **Focus** — 2px white + 2px `#435ee5` ring (`--focus-ring`); inputs switch their border to focus
  blue with a soft `rgba(67,94,229,.25)` halo. Focus is blue, not red.
- **Selected** — plum black fill with inverse text (tags, nav pills), or a sand row with a red glyph
  (sidebars). A red 3px outline marks the selected tile in the desktop kits.
- **Disabled** — sand surface with silver `#91918c` ink at 0.5 opacity where the control is iconic.

### Motion

Short and unshowy: 120ms for state colour, 180ms for reveals and toggles, 300ms for sheets.
`cubic-bezier(.25,.1,.25,1)` for most things, `cubic-bezier(.16,1,.3,1)` where something travels
(switch knob, sheet). Fades and small translations only — no bounce, no spring, no parallax, no
skeleton shimmer. Nothing loops.

### Transparency and blur

Only where content must show through: the warm wash chip on photography, the `rgba(255,255,255,.92)`
+ 18px blur tab bar, and the `rgba(33,25,34,.45)` modal scrim. Never on text, never on panels that
could simply be sand.

### Fixed elements

Phone: tab bar pinned to the bottom, entry hero scrolls under the status bar. iPad and macOS:
sidebar and inspector are fixed-width and independently scroll; only the library canvas scrolls the
page. Toasts are bottom-centred, 24–28px from the edge.

---

## Iconography

**Set.** No icon assets were supplied with the brief, so **lucide** (v0.469, MIT) is the substitute —
2px stroke on a 24px grid, round caps, which matches the brief's clean single-weight UI. 50 SVGs live
in `assets/icons/`. **This is a substitution; flag it if the real app uses SF Symbols** (likely, for
an Apple-platform product) and send the exported set to replace it.

**Usage.** Icons are applied as CSS masks, not `<img>`, so they inherit a tint:

```jsx
<span style={{ width: 20, height: 20, background: 'var(--base-color-amber-500)',
  WebkitMask: 'center/20px no-repeat url(assets/icons/map-pin.svg)',
  mask: 'center/20px no-repeat url(assets/icons/map-pin.svg)' }} />
```

Each UI kit exposes this as a `<Glyph name size color />` helper. Sizes: 14px inline with caption
text, 16px inside buttons and inputs, 18px in sidebars and small icon buttons, 20–24px in tab bars,
24–34px for map pins. Default tint is plum black; olive gray for secondary metadata; brand red only
for the active tab glyph, the selected sidebar row, and the focused map pin.

**Travel vocabulary.** `map-pin`, `compass`, `route`, `plane`, `luggage`, `mountain-snow`, `bed`,
`car`, `ticket`, `utensils`, `globe`. Product vocabulary: `camera`, `image`, `bookmark`, `heart`,
`calendar`, `clock`, `book-open`, `sliders-horizontal`, `grid-2x2`, `list`.

**Not used.** Emoji, unicode glyphs as icons (except the `×` on a removable Tag), PNG icons, filled
icon variants, or two-tone icons. There is no icon font.

**Logo.** **No logo or brand mark was provided, and none was drawn.** Wherever a mark would go, the
product name is set in type — 700 weight, `-1.2px` tracking, brand red on light surfaces or white on
dark. The name **"Wayfare" is a placeholder** chosen so the kits could be built; replace it
throughout (`NavBar brand`, `Sidebar title`, `guidelines/wordmark.card.html`, `thumbnail.html`).

---

## Index

### Root
| File | Purpose |
|---|---|
| `styles.css` | Global entry point — `@import` list only. Consumers link this one file. |
| `readme.md` | This document (also the skill README). |
| `SKILL.md` | Agent-Skills front matter for use in Claude Code. |
| `thumbnail.html` | Homepage tile for this design system. |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `radius`, `elevation`, `motion`, `base`. |
| `assets/icons/` | 50 lucide SVGs. |

### Components (`components/`)
| Group | Components |
|---|---|
| `core/` | `Button`, `IconButton`, `Card`, `PhotoCard`, `Badge`, `Tag` |
| `forms/` | `Input`, `Select`, `Checkbox`, `Radio`, `Switch` |
| `navigation/` | `NavBar`, `TabBar`, `Tabs`, `Sidebar` |
| `feedback/` | `Dialog`, `Toast`, `Tooltip` |

Each directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md` and one `@dsCard` HTML showing
its states.

**Intentional additions.** No source defined a component inventory, so the set above is the standard
primitive set sized to this product. Two entries are product-specific rather than generic:
`PhotoCard` (the masonry log tile — the atom of every feed in the brief) and `TabBar` (required by
the iOS/iPadOS surfaces). `Tooltip` exists for desktop icon-only toolbar controls.

### Foundations (`guidelines/`)
16 specimen cards: brand colour, warm neutrals, text and dark surfaces, interactive/semantic colour,
surfaces in use; display / heading / body / caption / font-stack type; spacing scale and section
rhythm; radius, elevation, focus and states, photo treatment, wordmark, iconography.

### UI kits (`ui_kits/`)
`ios_app/`, `ipad_app/`, `macos_app/` — each with its own `README.md`, `index.html` and screen JSX.

---

## Caveats

1. **No Figma, codebase, screenshots or real copy were provided.** The UI kits are compositions
   built to the brief's rules, not recreations of the shipping version 2 app. Values from the brief
   (hexes, radii, paddings, type sizes) are copied exactly; everything about layout, information
   architecture and copy is inferred.
2. **The brand name "Wayfare" is a placeholder** and no logo exists — see Iconography.
3. **Pin Sans → Hanken Grotesk** and **unknown icon set → lucide** are both substitutions.
4. **Photography is stood in with warm gradients** (`ui_kits/*/photos.js`). Real imagery will change
   how the grid reads more than any other single swap.
