export const LLM_CONFIG = {
  endpoint: "http://localhost:11434/api/generate",

  defaultModel: "mistral",

  timeouts: {
    full: 90_000,
    compressed: 60_000,
    minimal: 45_000,
  },
} as const;