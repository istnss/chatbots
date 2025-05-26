export type ModelProvider = "groq" | "openai"

export type Chatbot = {
  id: string
  name: string
  system_prompt: string
  provider: ModelProvider
  model: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}
