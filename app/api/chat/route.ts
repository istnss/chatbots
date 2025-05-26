import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"

// Mock database de chatbots
const chatbots = {
  "1": {
    id: "1",
    name: "Bot",
    model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    systemPrompt: "Você é um assistente útil e amigável.",
  },
  "2": {
    id: "2",
    name: "Bia",
    systemPrompt: "Você é uma assistente especializada em marketing digital.",
    model: "llama-3.3-70b-versatile",
  },
}

export const runtime = "edge" // habilita edge functions para streaming

export async function POST(req: Request) {
  try {
    const { messages, chatbotId } = await req.json()

    // Obtém o chatbot pelo ID
    const chatbot = chatbots[chatbotId as keyof typeof chatbots]

    if (!chatbot) {
      return new Response(JSON.stringify({ error: "Chatbot não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log(`Usando modelo ${chatbot.model} para o chatbot ${chatbot.name}`)

    // Usa o modelo específico definido para o chatbot
    const result = await streamText({
      model: groq(chatbot.model),
      messages,
      system: chatbot.systemPrompt,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Erro na API de chat:", error)
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
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
