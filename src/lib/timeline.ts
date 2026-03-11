import { PlantData } from "@/data/plants";
import { ZoneData } from "@/data/zones";

export interface TimelineEvent {
  plantId: string;
  plantName: string;
  plantEmoji: string;
  action: "start-indoors" | "transplant" | "direct-sow" | "harvest";
  date: Date;
  description: string;
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

export function generateTimeline(
  zoneData: ZoneData,
  selectedPlants: PlantData[],
  year?: number
): TimelineEvent[] {
  const currentYear = year || new Date().getFullYear();
  const lastFrostDate = parseMonthDay(zoneData.lastFrost, currentYear);
  const firstFrostDate = parseMonthDay(zoneData.firstFrost, currentYear);
  const events: TimelineEvent[] = [];

  for (const plant of selectedPlants) {
    // Start indoors event
    if (plant.startIndoorsWeeksBefore > 0) {
      const startDate = addWeeks(lastFrostDate, -plant.startIndoorsWeeksBefore);
      events.push({
        plantId: plant.id,
        plantName: plant.name,
        plantEmoji: plant.emoji,
        action: "start-indoors",
        date: startDate,
        description: `Start ${plant.name} seeds indoors (${plant.startIndoorsWeeksBefore} weeks before last frost)`,
      });

      // Transplant event
      const transplantDate = addWeeks(lastFrostDate, plant.transplantWeeksFromFrost);
      events.push({
        plantId: plant.id,
        plantName: plant.name,
        plantEmoji: plant.emoji,
        action: "transplant",
        date: transplantDate,
        description: `Transplant ${plant.name} seedlings outdoors`,
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
          description: `Begin harvesting ${plant.name} (~${plant.daysToHarvest} days after transplant)`,
        });
      }
    }

    // Direct sow event
    if (plant.canDirectSow) {
      const sowDate = addWeeks(lastFrostDate, plant.directSowWeeksFromFrost);
      events.push({
        plantId: plant.id,
        plantName: plant.name,
        plantEmoji: plant.emoji,
        action: "direct-sow",
        date: sowDate,
        description: `Direct sow ${plant.name} seeds outdoors`,
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
            description: `Begin harvesting ${plant.name} (~${plant.daysToHarvest} days after sowing)`,
          });
        }
      }
    }
  }

  // Sort by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return events;
}

export { formatDate };
