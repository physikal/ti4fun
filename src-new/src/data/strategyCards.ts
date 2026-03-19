import type { Locale } from "src/store/types";

export interface StrategyCard {
  index: number;
  names: Record<Locale, string>;
  color: string;
}

export const STRATEGY_CARDS: StrategyCard[] = [
  { index: 1, names: { en: "Leadership", fr: "Gouvern.", de: "Führungsstärke", ru: "Лидерство", es: "Liderazgo", zh: "领导力", pl: "Przywództwo" }, color: "#dc2626" },
  { index: 2, names: { en: "Diplomacy", fr: "Diplomacie", de: "Diplomatie", ru: "Дипломатия", es: "Diplomacia", zh: "外交", pl: "Dyplomacja" }, color: "#ea580c" },
  { index: 3, names: { en: "Politics", fr: "Politique", de: "Politik", ru: "Политика", es: "Política", zh: "政治", pl: "Polityka" }, color: "#eab308" },
  { index: 4, names: { en: "Construction", fr: "Construct.", de: "Infrastruktur", ru: "Строительство", es: "Construcción", zh: "建设", pl: "Budowa" }, color: "#16a34a" },
  { index: 5, names: { en: "Trade", fr: "Commerce", de: "Handel", ru: "Торговля", es: "Comercio", zh: "贸易", pl: "Handel" }, color: "#06b6d4" },
  { index: 6, names: { en: "Warfare", fr: "Guerre", de: "Kriegsführung", ru: "Война", es: "Guerra", zh: "战争", pl: "Wojna" }, color: "#3b82f6" },
  { index: 7, names: { en: "Technology", fr: "Techno.", de: "Technologie", ru: "Исследования", es: "Tecnología", zh: "科技", pl: "Technologia" }, color: "#2563eb" },
  { index: 8, names: { en: "Imperial", fr: "Intrigue", de: "Imperium", ru: "Экспансия", es: "Imperialismo", zh: "皇权", pl: "Imperium" }, color: "#9333ea" },
];

export const POLITICS_INDEX = 3;

export function getStrategyName(
  cardIndex: number,
  locale: Locale,
): string {
  const card = STRATEGY_CARDS.find((c) => c.index === cardIndex);
  return card ? card.names[locale] : "";
}

export function getStrategyColor(cardIndex: number): string {
  const card = STRATEGY_CARDS.find((c) => c.index === cardIndex);
  return card ? card.color : "#666";
}
