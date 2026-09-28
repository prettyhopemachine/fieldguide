export type PlantNativeStatus = "native" | "non-native" | "unknown";
export type PlantLifeCycle = "annual" | "perennial" | "biennial" | "unknown";
export type PlantLightRequirement = "full sun" | "part sun" | "part shade" | "shade" | "unknown";

export type PlantRecord = {
  id: string;
  name: string;
  scientific_name?: string;
  type: string;
  notes: string;
  image_url?: string;
  native: PlantNativeStatus;
  lifeCycle: PlantLifeCycle;
  lightRequirement: PlantLightRequirement;
  tags: string[];
};

function normalizeNativeStatus(value?: string): PlantNativeStatus {
  const raw = (value ?? "").toLowerCase();
  if (raw.includes("native")) return "native";
  if (raw.includes("introduced") || raw.includes("non-native") || raw.includes("invasive")) return "non-native";
  return "unknown";
}

function normalizeLifeCycle(value?: string): PlantLifeCycle {
  const raw = (value ?? "").toLowerCase();
  if (raw.includes("annual")) return "annual";
  if (raw.includes("perennial")) return "perennial";
  if (raw.includes("biennial")) return "biennial";
  return "unknown";
}

function normalizeLightRequirement(value?: string): PlantLightRequirement {
  const raw = (value ?? "").toLowerCase();
  if (raw.includes("full sun") || raw.includes("full-sun") || raw.includes("sunny")) return "full sun";
  if (raw.includes("part sun") || raw.includes("part-sun") || raw.includes("partial sun")) return "part sun";
  if (raw.includes("part shade") || raw.includes("partial shade") || raw.includes("part-shade")) return "part shade";
  if (raw.includes("shade")) return "shade";
  return "unknown";
}

export function normalizePlant(item: any): PlantRecord {
  const commonName = item?.common_name ?? item?.name ?? "Unknown plant";
  const scientificName = item?.scientific_name ?? "";
  const familyName = item?.family_common_name ?? item?.family ?? "Plant";

  const nativeStatus = normalizeNativeStatus(
    item?.native_status ?? item?.nativeStatus ?? item?.growth?.native_status,
  );
  const lifeCycle = normalizeLifeCycle(
    item?.duration ?? item?.life_cycle ?? item?.growth?.life_cycle ?? item?.growth?.duration,
  );
  const lightRequirement = normalizeLightRequirement(
    item?.growth?.light_requirement ?? item?.light_requirement ?? item?.growth?.light ?? item?.light,
  );

  const tags = [
    nativeStatus === "unknown" ? "garden plant" : nativeStatus,
    lifeCycle === "unknown" ? "varied" : lifeCycle,
    lightRequirement === "unknown" ? "light adaptable" : lightRequirement,
  ];

  return {
    id: String(item?.id ?? commonName),
    name: commonName,
    scientific_name: scientificName,
    type: familyName,
    notes: scientificName ? `${scientificName}` : "Plant record",
    image_url: item?.image_url ?? undefined,
    native: nativeStatus,
    lifeCycle,
    lightRequirement,
    tags,
  };
}
