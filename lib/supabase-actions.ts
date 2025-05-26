"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/db/supabase"

type ModelProvider = "groq" | "openai"

/**
 * Representação de um chatbot no Supabase
 */
export type Chatbot = {
  id: string
  name: string
  system_prompt: string
  provider: ModelProvider
  model: string
  created_at: string
  updated_at: string
}

/**
 * Retorna todos os chatbots do Supabase
 */
export async function getChatbots(): Promise<Chatbot[]> {
  const { data, error } = await supabase.from("chatbots").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar chatbots:", error)
    throw new Error("Falha ao buscar chatbots")
  }

  return data || []
}

/**
 * Retorna um chatbot específico pelo ID
 */
export async function getChatbot(id: string): Promise<Chatbot | null> {
  const { data, error } = await supabase.from("chatbots").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar chatbot:", error)
    return null
  }

  return data
}

/**
 * Cria um novo chatbot no Supabase
 */
export async function createChatbot(formData: FormData): Promise<Chatbot | null> {
  const name = formData.get("name") as string
  const prompt = formData.get("prompt") as string
  const provider = (formData.get("provider") as ModelProvider) || "groq"
  const model = formData.get("model") as string

  const newBot = {
    id: uuidv4(),
    name,
    system_prompt: prompt,
    provider,
    model,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("chatbots").insert(newBot).select().single()

  if (error) {
    console.error("Erro ao criar chatbot:", error)
    return null
  }

  revalidatePath("/")
  return data
}

/**
 * Atualiza um chatbot existente no Supabase
 */
export async function updateChatbot(formData: FormData): Promise<Chatbot | null> {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const prompt = formData.get("prompt") as string
  const provider = formData.get("provider") as ModelProvider
  const model = formData.get("model") as string

  const updates = {
    name,
    system_prompt: prompt,
    provider,
    model,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("chatbots").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar chatbot:", error)
    return null
  }

  revalidatePath("/")
  return data
}

/**
 * Exclui um chatbot do Supabase
 */
export async function deleteChatbot(id: string): Promise<boolean> {
  const { error } = await supabase.from("chatbots").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir chatbot:", error)
    return false
  }

  revalidatePath("/")
  return true
}

/**
 * Cria uma nova conversa no Supabase
 */
export async function createConversation(chatbotId: string): Promise<string | null> {
  // Verifica se já existe uma conversa para este chatbot
  const { data: existingConversation, error: fetchError } = await supabase
    .from("conversations")
    .select("id")
    .eq("chatbot_id", chatbotId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (existingConversation) {
    return existingConversation.id
  }

  // Se não existir, cria uma nova conversa
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      id: uuidv4(),
      chatbot_id: chatbotId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar conversa:", error)
    return null
  }

  return data.id
}

/**
 * Salva uma nova mensagem no Supabase
 */
export async function saveMessage(
  chatbotId: string,
  conversationId: string,
  message: { role: "user" | "assistant"; content: string },
): Promise<boolean> {
  const { error } = await supabase.from("messages").insert({
    id: uuidv4(),
    conversation_id: conversationId,
    role: message.role,
    content: message.content,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Erro ao salvar mensagem:", error)
    return false
  }

  return true
}

/**
 * Limpa todas as mensagens de uma conversa
 */
export async function clearConversation(chatbotId: string): Promise<boolean> {
  // Primeiro, encontra a conversa do chatbot
  const { data: conversation, error: fetchError } = await supabase
    .from("conversations")
    .select("id")
    .eq("chatbot_id", chatbotId)
    .single()

  if (fetchError || !conversation) {
    console.error("Erro ao buscar conversa:", fetchError)
    return false
  }

  // Depois, exclui todas as mensagens dessa conversa
  const { error } = await supabase.from("messages").delete().eq("conversation_id", conversation.id)

  if (error) {
    console.error("Erro ao limpar conversa:", error)
    return false
  }

  revalidatePath("/")
  return true
}

/**
 * Busca o histórico de mensagens de uma conversa
 */
export async function getConversationMessages(chatbotId: string): Promise<any[]> {
  // Primeiro, encontra a conversa do chatbot
  const { data: conversation, error: fetchError } = await supabase
    .from("conversations")
    .select("id")
    .eq("chatbot_id", chatbotId)
    .single()

  if (fetchError || !conversation) {
    return []
  }

  // Depois, busca todas as mensagens dessa conversa
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Erro ao buscar mensagens:", error)
    return []
  }

  return data || []
}
