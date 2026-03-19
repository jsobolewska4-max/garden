import { PlantData } from "@/data/plants";

export interface GardenConfig {
  type: "inground" | "container";
  // For in-ground: width and length in feet
  widthFeet: number;
  lengthFeet: number;
  // For containers: array of container dimensions
  containers?: { widthInches: number; lengthInches: number; depthInches: number }[];
}

export interface PlantInstance {
  plant: PlantData;
  row: number; // grid row where this plant is placed
  col: number; // grid col where this plant is placed
  containerIndex?: number;
}

export interface PlantAllocation {
  plant: PlantData;
  count: number;
  containerIndex?: number;
}

export interface LayoutResult {
  grid: (string | null)[][]; // plant id or null — each cell = cellSizeInches
  cellSizeInches: number;
  rows: number;
  cols: number;
  plantInstances: PlantInstance[];
  plantAllocations: PlantAllocation[];
  unplacedPlants: PlantData[];
  // For containers
  containerLayouts?: {
    grid: (string | null)[][];
    rows: number;
    cols: number;
    containerIndex: number;
    widthInches: number;
    lengthInches: number;
    plantInstances: PlantInstance[];
    plantAllocations: PlantAllocation[];
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

/**
 * Calculate how many plants fit in a given area dimension.
 * Plants are placed at spacingInches intervals starting from edge offset.
 * E.g., for a 24" wide container with 24" spacing: 1 plant (centered).
 * For 90" long with 24" spacing: floor(90 / 24) = 3 plants, with some edge padding.
 */
function plantsAlongDimension(dimensionInches: number, spacingInches: number): number {
  // For intensive planting: allow a single centered plant if the dimension
  // is at least 50% of the ideal spacing (common in raised beds / square-foot gardening)
  if (dimensionInches < spacingInches * 0.5) return 0;
  if (dimensionInches < spacingInches) return 1; // single plant, centered
  // First plant placed spacingInches/2 from edge, subsequent at spacingInches intervals
  const edgeOffset = spacingInches / 2;
  const usableLength = dimensionInches - edgeOffset; // from first plant to far edge
  return Math.max(1, Math.floor(usableLength / spacingInches) + 1);
}

/**
 * Calculate how many of a plant fits in a rectangular area
 */
function plantsInArea(
  widthInches: number,
  lengthInches: number,
  spacingInches: number
): { countX: number; countY: number; total: number } {
  const countX = plantsAlongDimension(widthInches, spacingInches);
  const countY = plantsAlongDimension(lengthInches, spacingInches);
  return { countX, countY, total: countX * countY };
}

// Use a 3-inch grid for finer placement resolution
const CELL_SIZE = 3;

export function generateLayout(
  config: GardenConfig,
  selectedPlants: PlantData[]
): LayoutResult {
  if (config.type === "container") {
    return generateContainerLayout(config, selectedPlants);
  }

  return generateInGroundLayout(config, selectedPlants);
}

function generateInGroundLayout(
  config: GardenConfig,
  selectedPlants: PlantData[]
): LayoutResult {
  const cellSizeInches = CELL_SIZE;
  const widthInches = config.widthFeet * 12;
  const lengthInches = config.lengthFeet * 12;
  const cols = Math.floor(widthInches / cellSizeInches);
  const rows = Math.floor(lengthInches / cellSizeInches);

  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );
  const plantInstances: PlantInstance[] = [];
  const plantAllocations: PlantAllocation[] = [];
  const unplacedPlants: PlantData[] = [];

  // Sort: tall in back (low row indices = north)
  const sorted = sortByHeight(selectedPlants);

  // Round-robin placement: give each plant type exactly 1 row-band first,
  // then do additional passes to fill remaining space. This maximizes variety.
  const plantCounts: Record<string, number> = {};
  let currentRow = 0;

  // Pass 1: place exactly 1 row of each plant type (ensures every plant gets space)
  const plantsForPass2: PlantData[] = [];
  for (const plant of sorted) {
    const spacingCells = Math.max(1, Math.round(plant.spacingInches / cellSizeInches));
    const countX = plantsAlongDimension(widthInches, plant.spacingInches);
    const availableRows = rows - currentRow;

    if (availableRows <= 0 || countX === 0) {
      unplacedPlants.push(plant);
      continue;
    }

    // Allocate just enough rows for 1 row of this plant
    const rowsForPlant = Math.min(spacingCells, availableRows);
    const countY = plantsAlongDimension(rowsForPlant * cellSizeInches, plant.spacingInches);

    if (countY === 0) {
      unplacedPlants.push(plant);
      continue;
    }

    const startOffset = Math.floor(spacingCells / 2);
    for (let iy = 0; iy < countY; iy++) {
      for (let ix = 0; ix < countX; ix++) {
        const r = currentRow + startOffset + iy * spacingCells;
        const c = startOffset + ix * spacingCells;
        if (r < rows && c < cols) {
          grid[r][c] = plant.id;
          plantInstances.push({ plant, row: r, col: c });
          plantCounts[plant.id] = (plantCounts[plant.id] || 0) + 1;
        }
      }
    }

    currentRow += rowsForPlant;
    plantsForPass2.push(plant);
  }

  // Pass 2: fill remaining rows round-robin with plants that already got placed
  // This gives additional space to plants proportionally rather than greedily
  let pass2Index = 0;
  while (currentRow < rows && plantsForPass2.length > 0) {
    const plant = plantsForPass2[pass2Index % plantsForPass2.length];
    const spacingCells = Math.max(1, Math.round(plant.spacingInches / cellSizeInches));
    const countX = plantsAlongDimension(widthInches, plant.spacingInches);
    const availableRows = rows - currentRow;

    if (availableRows < spacingCells || countX === 0) {
      // Not enough room for another row of this plant — try next
      plantsForPass2.splice(pass2Index % plantsForPass2.length, 1);
      if (plantsForPass2.length === 0) break;
      continue;
    }

    const rowsForPlant = Math.min(spacingCells, availableRows);
    const countY = plantsAlongDimension(rowsForPlant * cellSizeInches, plant.spacingInches);

    if (countY === 0) {
      plantsForPass2.splice(pass2Index % plantsForPass2.length, 1);
      if (plantsForPass2.length === 0) break;
      continue;
    }

    const startOffset = Math.floor(spacingCells / 2);
    for (let iy = 0; iy < countY; iy++) {
      for (let ix = 0; ix < countX; ix++) {
        const r = currentRow + startOffset + iy * spacingCells;
        const c = startOffset + ix * spacingCells;
        if (r < rows && c < cols) {
          grid[r][c] = plant.id;
          plantInstances.push({ plant, row: r, col: c });
          plantCounts[plant.id] = (plantCounts[plant.id] || 0) + 1;
        }
      }
    }

    currentRow += rowsForPlant;
    pass2Index++;
  }

  // Build allocations from counts
  for (const plant of sorted) {
    if (plantCounts[plant.id]) {
      plantAllocations.push({ plant, count: plantCounts[plant.id] });
    }
  }

  return { grid, cellSizeInches, rows, cols, plantInstances, plantAllocations, unplacedPlants };
}

function generateContainerLayout(
  config: GardenConfig,
  selectedPlants: PlantData[]
): LayoutResult {
  const containers = config.containers || [];
  const cellSizeInches = CELL_SIZE;
  const containerLayouts: LayoutResult["containerLayouts"] = [];
  const allPlantInstances: PlantInstance[] = [];
  const allPlantAllocations: PlantAllocation[] = [];
  const unplacedPlants: PlantData[] = [];

  // Filter for container-friendly plants with enough depth
  const containerPlants = selectedPlants.filter((p) => p.containerFriendly);
  const nonContainerPlants = selectedPlants.filter((p) => !p.containerFriendly);
  unplacedPlants.push(...nonContainerPlants);

  let remainingPlants = sortByHeight(containerPlants);

  for (let ci = 0; ci < containers.length && remainingPlants.length > 0; ci++) {
    const container = containers[ci];
    const cols = Math.max(1, Math.floor(container.widthInches / cellSizeInches));
    const rows = Math.max(1, Math.floor(container.lengthInches / cellSizeInches));
    const grid: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null)
    );

    const containerInstances: PlantInstance[] = [];
    const containerAllocations: PlantAllocation[] = [];
    const toPlace = [...remainingPlants];
    remainingPlants = [];

    // Group plants by companion relationships for smarter placement
    const companionGroups = buildCompanionGroups(toPlace);

    let currentRow = 0;

    // Flatten companion groups but filter by depth compatibility
    const compatiblePlants: PlantData[] = [];
    for (const group of companionGroups) {
      for (const plant of group) {
        if (plant.minContainerDepthInches > container.depthInches) {
          remainingPlants.push(plant);
        } else {
          compatiblePlants.push(plant);
        }
      }
    }

    // Pass 1: place exactly 1 row of each plant (maximize variety)
    const plantCounts: Record<string, number> = {};
    const placedPlants: PlantData[] = [];

    for (const plant of compatiblePlants) {
      const spacingCells = Math.max(1, Math.round(plant.spacingInches / cellSizeInches));
      const countX = plantsAlongDimension(container.widthInches, plant.spacingInches);
      const availableRows = rows - currentRow;

      if (availableRows <= 0 || countX === 0) {
        remainingPlants.push(plant);
        continue;
      }

      const rowsNeeded = Math.min(spacingCells, availableRows);
      const countY = plantsAlongDimension(rowsNeeded * cellSizeInches, plant.spacingInches);

      if (countY === 0) {
        remainingPlants.push(plant);
        continue;
      }

      const startOffsetX = Math.floor(spacingCells / 2);
      const startOffsetY = Math.floor(spacingCells / 2);

      for (let iy = 0; iy < countY; iy++) {
        for (let ix = 0; ix < countX; ix++) {
          const r = currentRow + startOffsetY + iy * spacingCells;
          const c = startOffsetX + ix * spacingCells;
          if (r < rows && c < cols) {
            grid[r][c] = plant.id;
            const instance: PlantInstance = { plant, row: r, col: c, containerIndex: ci };
            containerInstances.push(instance);
            allPlantInstances.push(instance);
            plantCounts[plant.id] = (plantCounts[plant.id] || 0) + 1;
          }
        }
      }

      currentRow += rowsNeeded;
      placedPlants.push(plant);
    }

    // Pass 2: fill remaining space round-robin
    let pass2Index = 0;
    const pass2Plants = [...placedPlants];
    while (currentRow < rows && pass2Plants.length > 0) {
      const plant = pass2Plants[pass2Index % pass2Plants.length];
      const spacingCells = Math.max(1, Math.round(plant.spacingInches / cellSizeInches));
      const countX = plantsAlongDimension(container.widthInches, plant.spacingInches);
      const availableRows = rows - currentRow;

      if (availableRows < spacingCells || countX === 0) {
        pass2Plants.splice(pass2Index % pass2Plants.length, 1);
        if (pass2Plants.length === 0) break;
        continue;
      }

      const rowsNeeded = Math.min(spacingCells, availableRows);
      const countY = plantsAlongDimension(rowsNeeded * cellSizeInches, plant.spacingInches);

      if (countY === 0) {
        pass2Plants.splice(pass2Index % pass2Plants.length, 1);
        if (pass2Plants.length === 0) break;
        continue;
      }

      const startOffsetX = Math.floor(spacingCells / 2);
      const startOffsetY = Math.floor(spacingCells / 2);

      for (let iy = 0; iy < countY; iy++) {
        for (let ix = 0; ix < countX; ix++) {
          const r = currentRow + startOffsetY + iy * spacingCells;
          const c = startOffsetX + ix * spacingCells;
          if (r < rows && c < cols) {
            grid[r][c] = plant.id;
            const instance: PlantInstance = { plant, row: r, col: c, containerIndex: ci };
            containerInstances.push(instance);
            allPlantInstances.push(instance);
            plantCounts[plant.id] = (plantCounts[plant.id] || 0) + 1;
          }
        }
      }

      currentRow += rowsNeeded;
      pass2Index++;
    }

    // Build allocations from counts
    for (const plant of compatiblePlants) {
      if (plantCounts[plant.id]) {
        containerAllocations.push({ plant, count: plantCounts[plant.id], containerIndex: ci });
        allPlantAllocations.push({ plant, count: plantCounts[plant.id], containerIndex: ci });
      }
    }

    containerLayouts.push({
      grid,
      rows,
      cols,
      containerIndex: ci,
      widthInches: container.widthInches,
      lengthInches: container.lengthInches,
      plantInstances: containerInstances,
      plantAllocations: containerAllocations,
    });
  }

  unplacedPlants.push(...remainingPlants);

  return {
    grid: [],
    cellSizeInches,
    rows: 0,
    cols: 0,
    plantInstances: allPlantInstances,
    plantAllocations: allPlantAllocations,
    unplacedPlants,
    containerLayouts,
  };
}

/**
 * Group plants so that companions are placed adjacent to each other
 * and enemies are separated. Returns ordered groups.
 */
function buildCompanionGroups(plants: PlantData[]): PlantData[][] {
  if (plants.length <= 1) return [plants];

  const placed = new Set<string>();
  const groups: PlantData[][] = [];

  // Start with the first plant, then greedily add companions
  const remaining = [...plants];

  while (remaining.length > 0) {
    const group: PlantData[] = [];
    const seed = remaining.shift()!;
    group.push(seed);
    placed.add(seed.id);

    // Find companions of this seed among remaining plants
    for (let i = remaining.length - 1; i >= 0; i--) {
      const candidate = remaining[i];
      // Add if companion of any plant in current group AND not enemy of any
      const isCompanion = group.some((g) => areCompanions(g, candidate));
      const isEnemy = group.some((g) => areEnemies(g, candidate));

      if (isCompanion && !isEnemy) {
        group.push(candidate);
        placed.add(candidate.id);
        remaining.splice(i, 1);
      }
    }

    groups.push(group);
  }

  // Reorder groups so enemies are far apart
  // Simple: sort by checking if adjacent groups have enemy relationships
  for (let i = 0; i < groups.length - 1; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const hasEnemy = groups[i].some((a) =>
        groups[i + 1]?.some((b) => areEnemies(a, b))
      );
      if (hasEnemy && j + 1 < groups.length) {
        // Swap to move enemy group further away
        [groups[i + 1], groups[j]] = [groups[j], groups[i + 1]];
      }
    }
  }

  return groups;
}
