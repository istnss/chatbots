// src/lib/groqModels.ts

/** Lista de modelos Groq disponíveis na sua conta */
export const GROQ_MODELS = [
  { value: "meta-llama/llama-4-maverick-17b-128e-instruct", label: "Meta Llama 4 Maverick" },
  { value: "llama-3.3-70b-versatile",                 label: "Llama 3.3 70B Versatile" },
  { value: "meta-llama/llama-4-scout-17b-16e-instruct",  label: "Meta Llama 4 Scout" },
] as const

export type GroqModel = typeof GROQ_MODELS[number]["value"]
