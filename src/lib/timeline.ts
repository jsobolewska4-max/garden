import { PlantData } from "@/data/plants";
import { ZoneData } from "@/data/zones";
import { PlantAllocation } from "@/lib/layout";

export interface TimelineEvent {
  plantId: string;
  plantName: string;
  plantEmoji: string;
  action: "start-indoors" | "transplant" | "direct-sow" | "harvest";
  date: Date;
  description: string;
  season: "spring" | "fall";
}

function parseMonthDay(mmdd: string, year: number): Date {
  const [month, day] = mmdd.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Build seed quantity text for a timeline event.
 * E.g., "Start 6 Tomato seeds indoors (3 plants × 2 seeds each for thinning)"
 */
function seedQuantityText(plant: PlantData, plantCount: number): string {
  const totalSeeds = plantCount * plant.seedsPerSpot;
  if (plant.seedsPerSpot <= 1) {
    return `${plantCount} seed${plantCount !== 1 ? "s" : ""}`;
  }
  const thinNote = plant.needsThinning ? ", thin to strongest" : "";
  return `${totalSeeds} seeds (${plantCount} spot${plantCount !== 1 ? "s" : ""} × ${plant.seedsPerSpot} seeds each${thinNote})`;
}

export function generateTimeline(
  zoneData: ZoneData,
  selectedPlants: PlantData[],
  plantAllocations?: PlantAllocation[],
  year?: number
): TimelineEvent[] {
  const currentYear = year || new Date().getFullYear();
  const lastFrostDate = parseMonthDay(zoneData.lastFrost, currentYear);
  const firstFrostDate = parseMonthDay(zoneData.firstFrost, currentYear);
  const events: TimelineEvent[] = [];

  // Build a map of plant ID -> count from layout allocations
  const countMap = new Map<string, number>();
  if (plantAllocations) {
    for (const alloc of plantAllocations) {
      countMap.set(alloc.plant.id, (countMap.get(alloc.plant.id) || 0) + alloc.count);
    }
  }

  for (const plant of selectedPlants) {
    const plantCount = countMap.get(plant.id) || 1;

    // === SPRING PLANTING ===

    // Start indoors event
    if (plant.startIndoorsWeeksBefore > 0) {
      const startDate = addWeeks(lastFrostDate, -plant.startIndoorsWeeksBefore);
      const seedText = seedQuantityText(plant, plantCount);
      events.push({
        plantId: plant.id,
        plantName: plant.name,
        plantEmoji: plant.emoji,
        action: "start-indoors",
        date: startDate,
        season: "spring",
        description: `Start ${plant.name} indoors — ${seedText} (${plant.startIndoorsWeeksBefore} wks before last frost)`,
      });

      // Transplant event
      const transplantDate = addWeeks(lastFrostDate, plant.transplantWeeksFromFrost);
      events.push({
        plantId: plant.id,
        plantName: plant.name,
        plantEmoji: plant.emoji,
        action: "transplant",
        date: transplantDate,
        season: "spring",
        description: `Transplant ${plantCount} ${plant.name} seedling${plantCount !== 1 ? "s" : ""} outdoors`,
      });

      // Harvest event (from transplant date)
      const harvestDate = addDays(transplantDate, plant.daysToHarvest);
      if (harvestDate <= firstFrostDate) {
        events.push({
          plantId: plant.id,
          plantName: plant.name,
          plantEmoji: plant.emoji,
          action: "harvest",
          date: harvestDate,
          season: "spring",
          description: `Begin harvesting ${plant.name} (~${plant.daysToHarvest} days after transplant)`,
        });
      }
    }

    // Direct sow event (spring)
    if (plant.canDirectSow) {
      const sowDate = addWeeks(lastFrostDate, plant.directSowWeeksFromFrost);
      const seedText = seedQuantityText(plant, plantCount);
      events.push({
        plantId: plant.id,
        plantName: plant.name,
        plantEmoji: plant.emoji,
        action: "direct-sow",
        date: sowDate,
        season: "spring",
        description: `Direct sow ${plant.name} outdoors — ${seedText}`,
      });

      // Harvest event (from direct sow date) — only if not already added via transplant
      if (plant.startIndoorsWeeksBefore === 0) {
        const harvestDate = addDays(sowDate, plant.daysToHarvest);
        if (harvestDate <= firstFrostDate) {
          events.push({
            plantId: plant.id,
            plantName: plant.name,
            plantEmoji: plant.emoji,
            action: "harvest",
            date: harvestDate,
            season: "spring",
            description: `Begin harvesting ${plant.name} (~${plant.daysToHarvest} days after sowing)`,
          });
        }
      }
    }

    // === FALL PLANTING ===
    if (plant.canFallPlant) {
      // Fall start indoors
      if (plant.fallStartIndoorsWeeksBeforeFirstFrost > 0) {
        const fallStartDate = addWeeks(firstFrostDate, -plant.fallStartIndoorsWeeksBeforeFirstFrost);
        // Only include if this date is after last frost (makes sense timing-wise)
        if (fallStartDate > lastFrostDate) {
          const seedText = seedQuantityText(plant, plantCount);
          events.push({
            plantId: plant.id,
            plantName: plant.name,
            plantEmoji: plant.emoji,
            action: "start-indoors",
            date: fallStartDate,
            season: "fall",
            description: `[Fall] Start ${plant.name} indoors for fall crop — ${seedText}`,
          });

          // Fall transplant ~2-3 weeks after indoor start, or estimate from timing
          const fallTransplantDate = addWeeks(fallStartDate, Math.min(6, plant.fallStartIndoorsWeeksBeforeFirstFrost - plant.daysToHarvest / 7));
          const actualTransplant = addWeeks(firstFrostDate, -(plant.daysToHarvest / 7 + 2));
          const transplantDate = fallTransplantDate > actualTransplant ? actualTransplant : fallTransplantDate;

          if (transplantDate > fallStartDate) {
            events.push({
              plantId: plant.id,
              plantName: plant.name,
              plantEmoji: plant.emoji,
              action: "transplant",
              date: transplantDate,
              season: "fall",
              description: `[Fall] Transplant ${plantCount} ${plant.name} seedling${plantCount !== 1 ? "s" : ""} for fall harvest`,
            });
          }

          // Fall harvest
          const fallHarvestDate = addDays(transplantDate > fallStartDate ? transplantDate : fallStartDate, plant.daysToHarvest);
          events.push({
            plantId: plant.id,
            plantName: plant.name,
            plantEmoji: plant.emoji,
            action: "harvest",
            date: fallHarvestDate,
            season: "fall",
            description: `[Fall] Begin harvesting fall ${plant.name}`,
          });
        }
      }

      // Fall direct sow
      if (plant.fallSowWeeksBeforeFirstFrost > 0) {
        const fallSowDate = addWeeks(firstFrostDate, -plant.fallSowWeeksBeforeFirstFrost);
        if (fallSowDate > lastFrostDate) {
          const seedText = seedQuantityText(plant, plantCount);
          events.push({
            plantId: plant.id,
            plantName: plant.name,
            plantEmoji: plant.emoji,
            action: "direct-sow",
            date: fallSowDate,
            season: "fall",
            description: `[Fall] Direct sow ${plant.name} for fall crop — ${seedText}`,
          });

          // Fall harvest from direct sow (only if no indoor start)
          if (plant.fallStartIndoorsWeeksBeforeFirstFrost === 0) {
            const fallHarvestDate = addDays(fallSowDate, plant.daysToHarvest);
            events.push({
              plantId: plant.id,
              plantName: plant.name,
              plantEmoji: plant.emoji,
              action: "harvest",
              date: fallHarvestDate,
              season: "fall",
              description: `[Fall] Begin harvesting fall ${plant.name}`,
            });
          }
        }
      }
    }
  }

  // Sort by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return events;
}

export { formatDate };
