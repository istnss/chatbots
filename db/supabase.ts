import { createClient } from "@supabase/supabase-js"

// Usando as variáveis de ambiente já disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criando e exportando o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Definição de tipos para as tabelas do Supabase
export type ChatbotRow = {
  id: string
  name: string
  system_prompt: string
  model: string
  created_at: string
  updated_at: string
}

export type ConversationRow = {
  id: string
  chatbot_id: string
  created_at: string
  updated_at: string
}

export type MessageRow = {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}
