import { ThinkingLevel } from "../types.js";

export const CURATED_GEMINI4_MODELS = [
  { name: "models/gemini-4-carbon", displayName: "Gemini 4 Carbon (Frontier Flagship Reasoning)" },
  { name: "models/gemini-4-argon", displayName: "Gemini 4 Argon (Frontier Deep Reasoning)" },
  { name: "models/gemini-4-neon", displayName: "Gemini 4 Neon (High-Precision Fast Frontier)" },
  { name: "models/gemini-4-hydrogen", displayName: "Gemini 4 Hydrogen (High-Throughput Frontier)" }
] as const;

export function supportsXHighThinking(modelName: string): boolean {
  const lower = (modelName || "").toLowerCase();
  // Per Google Gemini 4 API docs: Neon and Hydrogen natively support xhigh; Carbon and Argon cap at high.
  return lower.includes("neon") || lower.includes("hydrogen");
}

export function resolveEffectiveThinkingLevel(modelName: string, requested?: string): ThinkingLevel {
  const normalized = ((requested || "high").toLowerCase().trim()) as ThinkingLevel;
  if (normalized === "xhigh") {
    return supportsXHighThinking(modelName) ? "xhigh" : "high";
  }
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }
  return "high";
}

export function isFrontierModel(modelName: string): boolean {
  const lower = (modelName || "").toLowerCase();
  return (
    lower.includes("carbon") ||
    lower.includes("argon") ||
    lower.includes("neon") ||
    lower.includes("hydrogen")
  );
}
