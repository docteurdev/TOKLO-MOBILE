import { CategorieMesure, IDress, TDressPart } from "@/interfaces/type";

export type DressMeasurementCategory = {
  category: IDress;
  measurements: CategorieMesure[];
};

export type DressMeasurementGroup = {
  part: TDressPart;
  label: string;
  categories: DressMeasurementCategory[];
};

export const dressPartLabels: Record<TDressPart, string> = {
  HAUT: "Haut",
  BAS: "Bas",
  COMPLET: "Complet",
};

const partKeyByPart: Record<TDressPart, keyof NonNullable<IDress["parties"]>> =
  {
    HAUT: "haut",
    BAS: "bas",
    COMPLET: "complet",
  };

export const getDressPartLabel = (part?: TDressPart) => {
  if (!part) {
    return "Partie non définie";
  }

  return dressPartLabels[part];
};

export const getDressStructureLabel = (dress: IDress) => {
  if (dress.type === "COMPOSE") {
    return "Composé - Haut + Bas";
  }

  return `Simple - ${getDressPartLabel(dress.partie)}`;
};

export const getCategoryMeasurements = (category?: IDress | null) => {
  if (!category) {
    return [];
  }

  if (
    Array.isArray(category.categoriemesure) &&
    category.categoriemesure.length > 0
  ) {
    return category.categoriemesure;
  }

  if (Array.isArray(category.mesures)) {
    return category.mesures;
  }

  return [];
};

export const getMeasurementName = (measurement?: CategorieMesure | null) => {
  return measurement?.typemesure?.nom ?? measurement?.nom ?? "";
};

export const getMeasurementUrl = (measurement?: CategorieMesure | null) => {
  return measurement?.typemesure?.url ?? measurement?.url ?? "";
};

export const getMeasurementId = (
  measurement: CategorieMesure,
  fallback: number,
) => {
  return (
    measurement.typemesureid ??
    measurement.typemesure?.id ??
    measurement.nom ??
    fallback
  );
};

const createGroup = (
  part: TDressPart,
  categories: IDress[],
): DressMeasurementGroup => ({
  part,
  label: dressPartLabels[part],
  categories: categories.map((category) => ({
    category,
    measurements: getCategoryMeasurements(category),
  })),
});

export const getDressMeasurementGroups = (
  dress?: IDress | null,
): DressMeasurementGroup[] => {
  if (!dress) {
    return [];
  }

  if (dress.type === "COMPOSE") {
    const haut = dress.parties?.haut ?? [];
    const bas = dress.parties?.bas ?? [];
    const complet = dress.parties?.complet ?? [];
    const groups = [createGroup("HAUT", haut), createGroup("BAS", bas)];

    if (complet.length > 0) {
      groups.push(createGroup("COMPLET", complet));
    }

    return groups;
  }

  return [createGroup(dress.partie ?? "COMPLET", [dress])];
};

export const hasConfiguredMeasurements = (groups: DressMeasurementGroup[]) => {
  return groups.some((group) =>
    group.categories.some((category) => category.measurements.length > 0),
  );
};

export const createMeasurementInputKey = (
  part: TDressPart,
  category: IDress,
  measurement: CategorieMesure,
  index: number,
) => {
  return `${partKeyByPart[part]}:${category.id}:${getMeasurementId(measurement, index)}`;
};

export const createMeasurementSubmitLabel = (
  part: TDressPart,
  category: IDress,
  measurement: CategorieMesure,
  includeCategoryName: boolean,
) => {
  const measurementName = getMeasurementName(measurement);
  const partLabel = dressPartLabels[part];

  if (includeCategoryName) {
    return `${partLabel} - ${category.nom} - ${measurementName}`;
  }

  return `${partLabel} - ${measurementName}`;
};
