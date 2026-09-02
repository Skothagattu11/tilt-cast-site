# tiltcast-site

Marketing site for [TiltCast](https://github.com/Skothagattu11/tiltcast). Static, no
build step, no dependencies. Open `index.html` or serve the folder.

```bash
python3 -m http.server 4000
```

Deploys to Vercel as-is: import the repo, framework preset "Other", no build
command, output directory `.`.

## Why no framework

The site is one page of hand-written HTML with a small amount of CSS and about
100 lines of JS. A framework would add a build step, a lockfile and a dependency
surface, and would buy nothing. When `/docs`, `/pricing` and `/changelog` become
real pages (see section 12 of the app repo's `CLAUDE.md`), either add sibling
HTML files or migrate to Astro. Do not reach for Next.js until there is server
work to justify it.

## Layout

```
index.html            the page
assets/css/site.css   tokens, components, both themes
assets/js/rig.js      the 3D device drift and pointer spring
assets/brand/         mark.svg, mark-mono.svg
favicon.svg
vercel.json
```

## Design system: "Anodized"

The two themes are the app's own two studio presets rather than an inversion of
each other. Light is White Studio; dark is Dark Studio.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--ground` | `#D9DCDE` | `#0D0F11` | page ground, anodized aluminium |
| `--surface` | `#E8EAEC` | `#16191C` | cards |
| `--paper` | `#F7F8F9` | `#1C2024` | raised cards |
| `--well` | `#0B0D0F` | `#08090A` | demo panels, the only true black |
| `--ink` | `#0E1114` | `#E9ECED` | body text |
| `--accent` | `#0B23C4` | `#4A5EF7` | ultramarine, the one accent |

Neutrals are biased cool, toward the accent. The accent is the complement of a
tungsten key light, which is what lights the product's own Dark Studio scene.

**Type.** Archivo at expanded width (`wdth` 104 to 118) for display, because wide
machined grotesques are the badging language of studio equipment. IBM Plex Sans
for body. IBM Plex Mono for every number, spec and label, set like engraved
numerals on a lens barrel.

**The mark.** A screen in perspective: a true trapezoid whose far edge
foreshortens and whose corner radii shrink with it, plus one accent stroke down
the near edge for the specular highlight the key light leaves. It reduces to a
legible tilted slab at 16px. `mark-mono.svg` drops the accent for single-colour
reproduction.

## Content rules

Copy follows section 10 of the app repo's `CLAUDE.md`, plus two hard rules that
are easy to regress on:

- **No em-dashes anywhere.** Restructure the sentence instead: a period, a
  comma, a colon, or parentheses. This is the single loudest tell that a page
  was machine-written.
- **At most one small-caps eyebrow label per three sections.** Currently three,
  across nine sections: the hero, Scenes, and Pricing. Adding a fourth means
  removing one.

Claims are constrained by section 14 of `CLAUDE.md`. In particular: never imply
wireless capture, never imply you can film an app you did not build, and do not
promise device models beyond iPhone 17 Pro.

## Known placeholders

- Download buttons point at `#download`. They need a notarized DMG URL, which
  needs a Developer ID Application certificate that does not exist yet.
- Docs, Changelog and Support in the footer are anchors, not pages.
- The device screen is a CSS stand-in for a real app. Replace it with real
  capture footage once there is any, and delete the `.ui` block.
