import { PlantData } from "@/data/plants";

export interface GardenConfig {
  type: "inground" | "container";
  // For in-ground: width and length in feet
  widthFeet: number;
  lengthFeet: number;
  // For containers: array of container dimensions
  containers?: { widthInches: number; lengthInches: number; depthInches: number }[];
}

export interface PlacedPlant {
  plant: PlantData;
  row: number;
  col: number;
  // For containers: which container index
  containerIndex?: number;
}

export interface LayoutResult {
  grid: (string | null)[][]; // plant id or null
  cellSizeInches: number;
  rows: number;
  cols: number;
  placedPlants: PlacedPlant[];
  unplacedPlants: PlantData[];
  // For containers
  containerLayouts?: {
    grid: (string | null)[][];
    rows: number;
    cols: number;
    containerIndex: number;
  }[];
}

// Sort plants: tall in back (north), then medium, then low in front (south)
function sortByHeight(plants: PlantData[]): PlantData[] {
  const order = { tall: 0, vine: 1, medium: 2, low: 3 };
  return [...plants].sort((a, b) => order[a.heightCategory] - order[b.heightCategory]);
}

// Check if two plants are companions
function areCompanions(a: PlantData, b: PlantData): boolean {
  return a.companions.includes(b.id) || b.companions.includes(a.id);
}

// Check if two plants are enemies
function areEnemies(a: PlantData, b: PlantData): boolean {
  return a.enemies.includes(b.id) || b.enemies.includes(a.id);
}

export function generateLayout(
  config: GardenConfig,
  selectedPlants: PlantData[]
): LayoutResult {
  if (config.type === "container") {
    return generateContainerLayout(config, selectedPlants);
  }

  // Cell size: use 6-inch grid for in-ground gardens
  const cellSizeInches = 6;
  const widthInches = config.widthFeet * 12;
  const lengthInches = config.lengthFeet * 12;
  const cols = Math.floor(widthInches / cellSizeInches);
  const rows = Math.floor(lengthInches / cellSizeInches);

  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );
  const placedPlants: PlacedPlant[] = [];
  const unplacedPlants: PlantData[] = [];

  // Sort plants by height (tall in back = low row indices)
  const sorted = sortByHeight(selectedPlants);

  for (const plant of sorted) {
    const cellsNeeded = Math.ceil(plant.spacingInches / cellSizeInches);
    let placed = false;

    // Try to place the plant, preferring positions near companions and away from enemies
    let bestRow = -1;
    let bestCol = -1;
    let bestScore = -Infinity;

    for (let r = 0; r <= rows - cellsNeeded; r++) {
      for (let c = 0; c <= cols - cellsNeeded; c++) {
        // Check if space is available
        if (!isAreaFree(grid, r, c, cellsNeeded)) continue;

        // Score this position based on companion/enemy proximity
        let score = 0;
        // Prefer height-appropriate rows
        if (plant.heightCategory === "tall" || plant.heightCategory === "vine") {
          score += (rows - r) * 0.5; // prefer top rows
        } else if (plant.heightCategory === "low") {
          score += r * 0.5; // prefer bottom rows
        }

        // Check neighbors
        for (const placed of placedPlants) {
          const dist = Math.abs(placed.row - r) + Math.abs(placed.col - c);
          if (dist <= cellsNeeded * 2) {
            if (areCompanions(plant, placed.plant)) score += 5;
            if (areEnemies(plant, placed.plant)) score -= 10;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestRow = r;
          bestCol = c;
        }
      }
    }

    if (bestRow >= 0) {
      // Place plant in the center of its allocated area
      fillArea(grid, bestRow, bestCol, cellsNeeded, plant.id);
      placedPlants.push({ plant, row: bestRow, col: bestCol });
      placed = true;
    }

    if (!placed) {
      unplacedPlants.push(plant);
    }
  }

  return { grid, cellSizeInches, rows, cols, placedPlants, unplacedPlants };
}

function generateContainerLayout(
  config: GardenConfig,
  selectedPlants: PlantData[]
): LayoutResult {
  const containers = config.containers || [];
  const cellSizeInches = 6;
  const containerLayouts: LayoutResult["containerLayouts"] = [];
  const placedPlants: PlacedPlant[] = [];
  const unplacedPlants: PlantData[] = [];

  // Filter for container-friendly plants
  const containerPlants = selectedPlants.filter((p) => p.containerFriendly);
  const nonContainerPlants = selectedPlants.filter((p) => !p.containerFriendly);
  unplacedPlants.push(...nonContainerPlants);

  let remainingPlants = [...containerPlants];

  for (let ci = 0; ci < containers.length && remainingPlants.length > 0; ci++) {
    const container = containers[ci];
    const cols = Math.max(1, Math.floor(container.widthInches / cellSizeInches));
    const rows = Math.max(1, Math.floor(container.lengthInches / cellSizeInches));
    const grid: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null)
    );

    const toPlace = [...remainingPlants];
    remainingPlants = [];

    for (const plant of toPlace) {
      if (plant.minContainerDepthInches > container.depthInches) {
        remainingPlants.push(plant);
        continue;
      }

      const cellsNeeded = Math.ceil(plant.spacingInches / cellSizeInches);
      let placed = false;

      for (let r = 0; r <= rows - cellsNeeded && !placed; r++) {
        for (let c = 0; c <= cols - cellsNeeded && !placed; c++) {
          if (isAreaFree(grid, r, c, cellsNeeded)) {
            fillArea(grid, r, c, cellsNeeded, plant.id);
            placedPlants.push({ plant, row: r, col: c, containerIndex: ci });
            placed = true;
          }
        }
      }

      if (!placed) {
        remainingPlants.push(plant);
      }
    }

    containerLayouts.push({ grid, rows, cols, containerIndex: ci });
  }

  unplacedPlants.push(...remainingPlants);

  // Return a combined result
  return {
    grid: [],
    cellSizeInches,
    rows: 0,
    cols: 0,
    placedPlants,
    unplacedPlants,
    containerLayouts,
  };
}

function isAreaFree(
  grid: (string | null)[][],
  startRow: number,
  startCol: number,
  size: number
): boolean {
  for (let r = startRow; r < startRow + size && r < grid.length; r++) {
    for (let c = startCol; c < startCol + size && c < grid[0].length; c++) {
      if (grid[r][c] !== null) return false;
    }
  }
  return true;
}

function fillArea(
  grid: (string | null)[][],
  startRow: number,
  startCol: number,
  size: number,
  plantId: string
): void {
  for (let r = startRow; r < startRow + size && r < grid.length; r++) {
    for (let c = startCol; c < startCol + size && c < grid[0].length; c++) {
      grid[r][c] = plantId;
    }
  }
}
