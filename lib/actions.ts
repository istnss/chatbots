// src/lib/actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { GroqModel } from "./groqModels"

/**
 * Representação de um chatbot
 */
export type Chatbot = {
  id: string
  name: string
  prompt: string
  model: GroqModel
  createdAt: string
  updatedAt: string
}

/**
 * Representa uma mensagem trocada entre usuário e assistente
 */
export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

/**
 * Histórico completo de uma conversa
 */
export type Conversation = {
  messages: Message[]
}

// --- In-memory storage ---
let chatbots: Chatbot[] = []
let conversations: Record<string, Message[]> = {}

/**
 * Retorna todos os chatbots
 */
export async function getChatbots(): Promise<Chatbot[]> {
  return [...chatbots]
}


/**
 * Cria um novo chatbot
 */
export async function createChatbot(formData: FormData): Promise<Chatbot> {
  const name = formData.get("name") as string
  const prompt = formData.get("prompt") as string
  const model = formData.get("model") as GroqModel

  const newBot: Chatbot = {
    id: uuidv4(),
    name,
    prompt,
    model,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  chatbots.push(newBot)
  revalidatePath("/")
  return newBot
}

/**
 * Atualiza um chatbot existente
 */
export async function updateChatbot(formData: FormData): Promise<Chatbot | undefined> {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const prompt = formData.get("prompt") as string
  const model = formData.get("model") as GroqModel

  const idx = chatbots.findIndex((b) => b.id === id)
  if (idx === -1) return undefined

  const updated: Chatbot = {
    ...chatbots[idx],
    name,
    prompt,
    model,
    updatedAt: new Date().toISOString(),
  }
  chatbots[idx] = updated
  revalidatePath("/")
  return updated
}

/**
 * Exclui um chatbot e todo o seu histórico
 */
export async function deleteChatbot(id: string): Promise<boolean> {
  const lenBefore = chatbots.length
  chatbots = chatbots.filter((b) => b.id !== id)
  if (chatbots.length < lenBefore) {
    delete conversations[id]
    revalidatePath("/")
    return true
  }
  return false
}

/**
 * Retorna o histórico de conversas de um chatbot
 */
export async function getChatbotConversation(
  chatbotId: string
): Promise<Conversation> {
  const msgs = conversations[chatbotId] || []
  return { messages: msgs }
}

/**
 * Salva uma nova mensagem do usuário ou assistente
 */
export async function saveMessage(
  chatbotId: string,
  message: Omit<Message, "id" | "createdAt">
): Promise<Message> {
  const newMsg: Message = {
    id: uuidv4(),
    role: message.role,
    content: message.content,
    createdAt: new Date().toISOString(),
  }
  conversations[chatbotId] = [...(conversations[chatbotId] || []), newMsg]
  revalidatePath(`/chat/${chatbotId}`)
  return newMsg
}

/**
 * Limpa todo o histórico de conversas de um chatbot
 */
export async function clearConversation(
  chatbotId: string
): Promise<void> {
  conversations[chatbotId] = []
  revalidatePath(`/chat/${chatbotId}`)
}
