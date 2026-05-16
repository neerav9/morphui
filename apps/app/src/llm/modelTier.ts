import type {
  ModelTier,
} from "../types/index";

// ============================================================
// MODEL TIERS
// ============================================================

export const MODEL_TIERS: Record<
  string,
  ModelTier
> = {

  "mistral": "standard",
  "mistral:7b": "standard",

  "llama3": "standard",
  "llama3:8b": "standard",

  "phi3": "standard",

  "gemma": "standard",
  "gemma:7b": "standard",

  "qwen2": "advanced",

  "deepseek-coder": "advanced",

  "mixtral": "advanced",

  "llama3:70b": "advanced",

  "llama3.1": "advanced",
};

// ============================================================
// MODEL TIER RESOLUTION
// ============================================================

export function getModelTier(
  model: string
): ModelTier {

  const normalized =
    model.toLowerCase();

  for (const [key, tier]
    of Object.entries(
      MODEL_TIERS
    )
  ) {

    if (
      normalized.includes(key)
    ) {
      return tier;
    }
  }

  return "standard";
}

// ============================================================
// AVAILABLE MODELS
// ============================================================

export const AVAILABLE_MODELS = [

  {
    value: "mistral",
    label: "mistral",
    tier: "standard" as ModelTier,
  },

  {
    value: "phi3",
    label: "phi3 (fast)",
    tier: "standard" as ModelTier,
  },

  {
    value: "llama3",
    label: "llama3",
    tier: "standard" as ModelTier,
  },

  {
    value: "gemma",
    label: "gemma",
    tier: "standard" as ModelTier,
  },

  {
    value: "mixtral",
    label: "mixtral (advanced)",
    tier: "advanced" as ModelTier,
  },

  {
    value: "qwen2",
    label: "qwen2 (advanced)",
    tier: "advanced" as ModelTier,
  },

  {
    value: "llama3.1",
    label: "llama3.1 (advanced)",
    tier: "advanced" as ModelTier,
  },
];