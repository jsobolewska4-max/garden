# Garden Planning Tool - Project Tracker

## Project Overview
A web app that helps novice gardeners plan their vegetable gardens by providing personalized garden layouts and planting timelines based on their location, garden dimensions, and desired plants.

## Status: MVP Complete (ready for deployment)

## Tech Stack
- Next.js 16 with TypeScript
- Tailwind CSS
- No database (all client-side)
- Deployable to Vercel

## Session Log

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
  - Visual garden layout grid (6-inch cell resolution) with companion planting optimization
  - Container layout support (per-container grids)
  - Planting timeline with absolute dates grouped by month (start indoors, transplant, direct sow, harvest)
  - Growing tips per plant + companion/enemy planting advice
- Layout algorithm accounts for: plant height (tall in back), companion planting, enemy avoidance, spacing
- Build verified — compiles successfully with zero errors

**What's in progress:**
- Nothing — MVP is feature-complete

**What's next (future enhancements):**
- Deploy to Vercel (connect GitHub repo, push code, deploy)
- User accounts / saving gardens
- PDF export / print-friendly view
- Weather API integration for real-time frost dates
- Pest/disease guidance
- Shopping lists
- More cities in the zone database

**Decisions & Gotchas:**
- Removed Google Fonts (Geist) because they can't be fetched in offline/restricted environments — using system fonts instead
- Used 6-inch grid cells for layout — good balance of precision and visual clarity
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
│   │   └── ResultsPage.tsx      # Layout grid + timeline + tips
│   ├── data/
│   │   ├── zones.ts             # City → zone/frost date lookup
│   │   └── plants.ts            # Plant database (24 plants)
│   └── lib/
│       ├── layout.ts            # Layout generation algorithm
│       ├── timeline.ts          # Planting timeline calculator
│       └── types.ts             # Shared TypeScript types
```
