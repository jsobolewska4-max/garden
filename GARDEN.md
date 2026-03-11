# Garden Planning Tool - Project Tracker

## Project Overview
A web app that helps novice gardeners plan their vegetable gardens by providing personalized garden layouts and planting timelines based on their location, garden dimensions, and desired plants.

## Status: V2 Updates Complete (realistic spacing, fall planting, seed quantities)

## Tech Stack
- Next.js 16 with TypeScript
- Tailwind CSS
- No database (all client-side)
- Deployable to Vercel

## Session Log

### Session 2 — 2026-03-11
**Status:** V2 feature updates built and compiling

**What was completed:**
- **Realistic plant spacing in layout** — Redesigned layout algorithm from scratch:
  - Old: 6" grid, each plant filled NxN cells (tomato = 4x4 = looked like 16 plants)
  - New: 3" grid, each plant is a single point/dot, spaced at actual `spacingInches` intervals
  - Example: 24"×90" container now shows ~3 tomatoes (realistic) instead of 16 emoji cells
  - `plantsAlongDimension()` calculates how many plants fit with edge offsets
- **Companion-based placement** — Plants grouped by companion relationships:
  - `buildCompanionGroups()` clusters companions together, places them adjacently
  - Enemy groups are separated (sorted to maximize distance)
  - Layout now says "placed near each other" / "placed away from each other"
- **Fall planting in timeline** — Added to plant data and timeline:
  - New fields: `canFallPlant`, `fallSowWeeksBeforeFirstFrost`, `fallStartIndoorsWeeksBeforeFirstFrost`
  - Cool-season crops marked: lettuce, spinach, kale, carrot, radish, beet, peas, beans, broccoli, cauliflower, cilantro, dill, parsley
  - Timeline now has Spring/Summer and Fall sections with `[Fall]` prefixed events
- **Seed quantities in timeline** — Based on actual layout plant counts:
  - New fields: `seedsPerSpot`, `needsThinning` per plant
  - Timeline descriptions now include: "Start Tomatoes indoors — 6 seeds (3 spots × 2 seeds each, thin to strongest)"
  - Added **Seed Shopping List** table showing plants in layout, seeds/spot, total seeds, and fall crop availability
- **Layout returns `plantAllocations`** — plant type + count, passed to timeline for accurate seed math
- **Per-container summaries** — Each container shows its plant counts and spacing
- **Dimension labels** on grid containers (width × length)
- Build verified — zero errors

**What's in progress:**
- Nothing — V2 changes are feature-complete

**What's next (future enhancements):**
- Deploy to Vercel
- Visual polish: better plant dot styling, grid lines, maybe SVG-based layout
- Succession planting (sow every N weeks) for radish, cilantro, lettuce
- PDF export / print-friendly view
- Weather API integration for real-time frost dates
- User accounts / saving gardens

**Decisions & Gotchas:**
- Changed grid cell size from 6" to 3" for finer placement resolution
- Plant instances are now single points (dots with emoji) rather than filled rectangular regions
- `plantsAlongDimension()` places first plant at `spacing/2` from edge, then every `spacing` thereafter
- Companion grouping uses greedy algorithm: start with a plant, pull in companions, avoid enemies
- Fall planting timing: `fallSowWeeksBeforeFirstFrost` is weeks before FIRST frost (fall), vs spring which uses LAST frost
- Broccoli/cauliflower fall crop uses indoor start only (14 weeks before first frost) since they can't be direct sown
- `PlacedPlant` interface replaced with `PlantInstance` (single point) and `PlantAllocation` (type + count)

### Session 1 — 2026-03-11
**Status:** MVP fully built and compiling

**What was completed:**
- Plan approved by PM
- Project scaffolded with Next.js 16, TypeScript, Tailwind CSS
- Data layer built:
  - `src/data/zones.ts` — 80+ US/Canadian cities with USDA hardiness zones, last/first frost dates
  - `src/data/plants.ts` — 24 vegetables/herbs/fruits with spacing, companion planting, sun needs, schedule data
- 3-step wizard UI built:
  - Step 1 (Location): City search with autocomplete, shows zone info and frost dates
  - Step 2 (Garden Setup): In-ground bed dimensions OR multiple containers with dimensions
  - Step 3 (Plant Selection): Filterable plant grid with category tabs, container compatibility checks
- Results page built with 4 sections:
  - Visual garden layout grid with companion planting optimization
  - Container layout support (per-container grids)
  - Planting timeline with absolute dates grouped by month
  - Growing tips per plant + companion/enemy planting advice
- Layout algorithm accounts for: plant height (tall in back), companion planting, enemy avoidance, spacing
- Build verified — compiles successfully with zero errors

**Decisions & Gotchas:**
- Removed Google Fonts (Geist) because they can't be fetched in offline/restricted environments — using system fonts instead
- Plant data uses weeks relative to last frost date for scheduling (negative = before frost, positive = after)
- Git commit signing not available in this environment — code needs to be committed when pushed to GitHub
- Container layouts filter out plants that aren't container-friendly (e.g., corn)

## File Structure
```
garden-planner/
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind + base styles
│   │   ├── layout.tsx           # Root layout with metadata
│   │   └── page.tsx             # Main app with wizard state management
│   ├── components/
│   │   ├── StepIndicator.tsx    # Progress bar (steps 1-4)
│   │   ├── Step1Location.tsx    # City search + zone display
│   │   ├── Step2Garden.tsx      # Garden type + dimensions
│   │   ├── Step3Plants.tsx      # Plant selection grid
│   │   └── ResultsPage.tsx      # Layout grid + timeline + tips + seed list
│   ├── data/
│   │   ├── zones.ts             # City → zone/frost date lookup
│   │   └── plants.ts            # Plant database (24 plants, now with fall/seed data)
│   └── lib/
│       ├── layout.ts            # Layout generation (realistic spacing + companion groups)
│       ├── timeline.ts          # Planting timeline (spring + fall, with seed quantities)
│       └── types.ts             # Shared TypeScript types
```
