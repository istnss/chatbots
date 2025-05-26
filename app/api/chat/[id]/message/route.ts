import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { supabase } from "@/db/supabase"
import { saveMessage, createConversation } from "@/lib/supabase-actions"

export const runtime = "edge" // habilita edge functions para streaming

// Configuração de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const chatbotId = params.id

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: "ID do chatbot não fornecido" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      })
    }

    // Obter o conteúdo da mensagem do corpo da requisição
    const { content } = await request.json()

    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "Conteúdo da mensagem inválido" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      })
    }

    // Buscar o chatbot do Supabase
    const { data: chatbot, error } = await supabase.from("chatbots").select("*").eq("id", chatbotId).single()

    if (error || !chatbot) {
      console.error("Erro ao buscar chatbot:", error)
      return new Response(JSON.stringify({ error: "Chatbot não encontrado" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      })
    }

    console.log(`Usando modelo ${chatbot.model} para o chatbot ${chatbot.name}`)

    // Verificar se temos um prompt do sistema
    const systemPrompt = chatbot.system_prompt || "Você é um assistente útil e amigável."

    // Criar uma mensagem simples para o modelo
    const messages = [{ role: "user", content }]

    // Usar o modelo Groq especificado no chatbot
    const result = await streamText({
      model: groq(chatbot.model),
      messages,
      system: systemPrompt,
    })

    // Salvar a mensagem do usuário e a resposta no Supabase (assíncrono)
    saveMessagesToSupabase(chatbotId, content, result.text)

    // Adicionar cabeçalhos CORS à resposta
    const response = result.toDataStreamResponse()
    const headers = new Headers(response.headers)

    // Adicionar cabeçalhos CORS
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("Erro na API de chat:", error)
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  }
}

// Handler para requisições OPTIONS (pré-flight CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

// Função auxiliar para salvar mensagens no Supabase
async function saveMessagesToSupabase(chatbotId: string, userContent: string, assistantTextPromise: Promise<string>) {
  try {
    // Criar uma nova conversa ou usar uma existente
    const conversationId = await createConversation(chatbotId)

    if (!conversationId) {
      console.error("Não foi possível criar uma conversa")
      return
    }

    // Salvar a mensagem do usuário
    await saveMessage(chatbotId, conversationId, {
      role: "user",
      content: userContent,
    })

    // Aguardar a resposta completa do assistente e salvá-la
    const assistantContent = await assistantTextPromise
    await saveMessage(chatbotId, conversationId, {
      role: "assistant",
      content: assistantContent,
    })

    console.log("Mensagens salvas com sucesso")
  } catch (error) {
    console.error("Erro ao salvar mensagens:", error)
  }
}
