import { PlantData } from "@/data/plants";
import { ZoneData } from "@/data/zones";
import { GardenConfig } from "@/lib/layout";

export interface AppState {
  step: 1 | 2 | 3 | 4;
  // Step 1
  selectedCity: string | null;
  zoneData: ZoneData | null;
  // Step 2
  gardenConfig: GardenConfig | null;
  // Step 3
  selectedPlants: PlantData[];
}
