import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/db/supabase"

export const runtime = "edge" // habilita edge functions para streaming

// Configurações otimizadas para cada provedor
const PROVIDER_CONFIG = {
  groq: {
    temperature: 0.7,
    max_tokens: 1000,
    timeout: 30000, // 30 segundos
  },
  openai: {
    temperature: 0.7,
    max_tokens: 1000,
    timeout: 30000, // 30 segundos
  },
}

export async function POST(req: Request) {
  try {
    const { messages, chatbotId } = await req.json()

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: "ID do chatbot não fornecido" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    // Buscar o chatbot do Supabase com timeout
    const fetchChatbotPromise = supabase.from("chatbots").select("*").eq("id", chatbotId).single()

    // Adicionar timeout para a consulta ao Supabase
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout ao buscar chatbot")), 5000),
    )

    // Usar Promise.race para implementar timeout
    const { data: chatbot, error } = (await Promise.race([
      fetchChatbotPromise,
      timeoutPromise.then(() => {
        throw new Error("Timeout ao buscar chatbot")
      }),
    ])) as any

    if (error || !chatbot) {
      console.error("Erro ao buscar chatbot:", error)
      return new Response(JSON.stringify({ error: "Chatbot não encontrado" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    // Verificar se temos um prompt do sistema
    const systemPrompt = chatbot.system_prompt || "Você é um assistente útil e amigável."

    // Usar o modelo do provedor especificado no chatbot
    let result

    try {
      // Preparar mensagens otimizadas - limitar histórico para melhorar performance
      const optimizedMessages = messages.slice(-10) // Manter apenas as 10 mensagens mais recentes

      // Configurações específicas para cada provedor
      const providerConfig = chatbot.provider === "openai" ? PROVIDER_CONFIG.openai : PROVIDER_CONFIG.groq

      // Criar um AbortController para timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), providerConfig.timeout)

      if (chatbot.provider === "openai") {
        result = await streamText({
          model: openai(chatbot.model),
          messages: optimizedMessages,
          system: systemPrompt,
          temperature: providerConfig.temperature,
          max_tokens: providerConfig.max_tokens,
          abortSignal: controller.signal,
        })
      } else {
        // Default para Groq
        result = await streamText({
          model: groq(chatbot.model),
          messages: optimizedMessages,
          system: systemPrompt,
          temperature: providerConfig.temperature,
          max_tokens: providerConfig.max_tokens,
          abortSignal: controller.signal,
        })
      }

      // Limpar o timeout se a resposta for bem-sucedida
      clearTimeout(timeoutId)
    } catch (modelError) {
      console.error("Erro ao gerar resposta:", modelError)

      // Verificar se foi um erro de timeout
      if (modelError.name === "AbortError") {
        return new Response(JSON.stringify({ error: "Tempo limite excedido ao gerar resposta" }), {
          status: 504, // Gateway Timeout
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        })
      }

      return new Response(JSON.stringify({ error: "Erro ao gerar resposta do modelo" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    // Otimizar cabeçalhos para streaming mais eficiente
    const response = result.toDataStreamResponse()
    const headers = new Headers(response.headers)

    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type")
    headers.set("Cache-Control", "no-cache, no-transform")
    headers.set("X-Content-Type-Options", "nosniff")

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (error) {
    console.error("Erro na API de chat:", error)
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
