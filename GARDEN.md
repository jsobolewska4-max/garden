# Garden Planning Tool - Project Tracker

## Project Overview
A web app that helps novice gardeners plan their vegetable gardens by providing personalized garden layouts and planting timelines based on their location, garden dimensions, and desired plants.

## Status: V5 Updates Complete (spatial layout restored, input fix, UX refinements)

## Tech Stack
- Next.js 16 with TypeScript
- Tailwind CSS
- No database (all client-side)
- Deployable to Vercel

## Session Log

### Session 5 — 2026-03-19
**Status:** V5 spatial layout restored + input fix

**What was completed:**
- **Restored spatial layout with cluster rendering** — Zone map was too abstract (lost spatial positioning). New approach:
  - Plant clusters rendered as absolutely-positioned colored blocks within a scaled container outline
  - Greedy rectangle clustering merges adjacent same-plant cells into clean blocks
  - Each cluster shows emoji + name (when large enough) — no individual 3" cell noise
  - Plant legend below grid shows emoji, count, name, spacing per plant type
- **Fixed delete key in container dimension inputs** — Inputs used `parseInt(value) || 0` which snapped to `0` on clear, preventing editing. Now stores raw string state and parses only on submit.
- **Increased container max dimension** — Raised from 60" to 120" to support larger raised beds
- Build verified — zero errors

**Decisions & Gotchas:**
- Cluster rendering uses absolute positioning (not CSS grid) for cleaner layout without empty cell backgrounds
- Display cell size auto-scales: `max(4, min(18, 560/cols))` pixels to fit containers up to ~560px display width
- Emoji shown only when cluster min dimension ≥ 14px; name label only when ≥ 30px tall and 50px wide
- Container dimension inputs store strings to allow natural editing (backspace/delete); parsed to integers only on form submit

### Session 4 — 2026-03-19
**Status:** V4 UX polish and data fixes

**What was completed:**
- **Simplified layout visualization** — Replaced chaotic 3"-cell grid (hundreds of tiny cells) with proportional zone map:
  - Each plant type shown as a clean colored block with emoji, name, count, and spacing
  - Block width proportional to area usage (count × spacing²)
  - Much easier to scan at a glance than the cell-based grid
  - Removed redundant "Plant counts based on your space" section (zone map already shows this info)
- **Fixed timeline for direct-sow plants** — Plants that should only be direct sown were incorrectly also shown as "Start Indoors":
  - Spinach: removed indoor start (always direct sow, 6 wks before frost)
  - Zucchini: removed indoor start (direct sow after frost; doesn't transplant well)
  - Cucumber: removed indoor start (direct sow after frost)
  - Kale: removed indoor start (direct sow, 4 wks before frost)
  - Plants with `canDirectSow: true` now only show direct sow in timeline unless they truly need indoor start (e.g., tomato, pepper, eggplant have `canDirectSow: false`)
- **Added Marigolds** — New flower plant type (25th plant):
  - 8" spacing, full sun, companion to tomato/pepper/eggplant/bean/cucumber/zucchini, no enemies
  - Repels aphids, whiteflies, nematodes — great border plant
  - New "Flowers" category tab in plant selection (alongside Vegetables, Herbs, Fruits)
- Build verified — zero errors

**Decisions & Gotchas:**
- Zone map uses area-proportional sizing: `count × spacing²` determines block width. This means a few large-spaced plants (tomatoes) get a proportionally bigger block than many small-spaced plants (peas), reflecting actual garden real estate usage
- For the direct-sow fix, the rule is simple: if `startIndoorsWeeksBefore > 0`, show indoor start + transplant; if `canDirectSow`, show direct sow. Plants should only have one method set to non-zero (not both) unless both are truly valid options
- Marigold `daysToHarvest: 50` represents days to first bloom, not edible harvest

### Session 3 — 2026-03-19
**Status:** V3 intensive gardening overhaul complete

**What was completed:**
- **Intensive/block-style plant spacing** — Updated all plant spacing values to match intensive raised bed gardening per [CSU Extension GardenNotes #713](https://cmg.extension.colostate.edu/Gardennotes/713.pdf) and square foot gardening principles:
  - Tomato 24"→18", Pepper 18"→12", Cucumber 18"→12", Zucchini 36"→24"
  - Eggplant 24"→18", Basil 12"→6", Dill 12"→6", Kale 18"→12"
  - Broccoli 18"→15", Cauliflower 18"→15", Potato 12"→9", Strawberry 12"→8"
  - Smaller plants (carrot 3", radish 3", spinach 6", etc.) already at intensive spacing
- **SFG-style 2D layout algorithm** — Replaced band-based layout with true square-foot gardening placement:
  - Each plant type generates its own spacing grid across the entire area (e.g., tomato every 18", basil every 6")
  - Round-robin interleaving: cycle through plants placing one position per plant per round
  - Plants with tighter spacing naturally get more spots (more basil than tomatoes), matching real SFG density
  - Occupied cells are skipped — different plant types can share the same area without spacing conflicts
  - Fixes issue where narrow containers (e.g., 90"×24") only showed tomatoes because the short axis ran out of row-bands
  - Applied to both in-ground and container layouts via shared `fillGridSFG()` function
- **USDA zone data corrections** — Updated per 2023 USDA Hardiness Zone Map:
  - NYC 6b→7b, Philadelphia 6b→7a, Boston 5b→6b, Washington DC 7a→7b
  - Portland OR 6b→8b, Seattle 6b→8b, Baltimore 7a→7a (frost dates adjusted)
- **Distance annotations on layout grid** — Shows inches between adjacent plants directly on the grid visualization (both horizontal and vertical), so users don't have to count 3" cells manually
- **Layout algorithm threshold fix** — Lowered `plantsAlongDimension` rejection threshold from 75% to 50% of spacing, allowing single plants to fit in narrower beds (e.g., zucchini in 24"-wide bed)
- Build verified — zero errors

**Decisions & Gotchas:**
- Intensive spacing assumes staking/caging for tomatoes and trellising for cucumbers — tips already mention this
- SFG placement means different plant types can interleave — a basil at 6" spacing fills gaps between tomatoes at 18" spacing
- Plants with identical spacing grids (e.g., tomato & eggplant both at 18") alternate positions naturally
- Distance annotations use absolute positioning overlays on the CSS grid; hidden when gap < 16px to avoid clutter
- Zone data is hardcoded (no API) — sourced from 2023 USDA map; may drift over time

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
│   │   └── plants.ts            # Plant database (25 plants, now with fall/seed data + marigolds)
│   └── lib/
│       ├── layout.ts            # Layout generation (realistic spacing + companion groups)
│       ├── timeline.ts          # Planting timeline (spring + fall, with seed quantities)
│       └── types.ts             # Shared TypeScript types
```
