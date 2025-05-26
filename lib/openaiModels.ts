// src/lib/openaiModels.ts

/** Lista de modelos OpenAI disponíveis */
export const OPENAI_MODELS = [
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
] as const

export type OpenAIModel = (typeof OPENAI_MODELS)[number]["value"]
