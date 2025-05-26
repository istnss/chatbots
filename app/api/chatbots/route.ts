import { NextResponse } from "next/server"
import { supabase } from "@/db/supabase"
import { createChatbot } from "@/lib/actions"

// Configuração de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function GET() {
  try {
    // Buscar todos os chatbots do Supabase
    const { data, error } = await supabase
      .from("chatbots")
      .select("id, name, model, system_prompt")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar chatbots:", error)
      return NextResponse.json(
        { error: "Falha ao buscar chatbots" },
        { status: 500, headers: corsHeaders }
      )
    }

    // Transformar os dados para o formato esperado na API
    const formattedData = data.map(bot => ({
      id: bot.id,
      name: bot.name,
      model: bot.model,
      systemPrompt: bot.system_prompt || ""
    }))

    return NextResponse.json(formattedData, { headers: corsHeaders })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const chatbot = await createChatbot(formData)

    if (!chatbot) {
      return NextResponse.json(
        { error: "Falha ao criar chatbot" },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(chatbot, { headers: corsHeaders })
  } catch (error) {
    console.error("Erro ao criar chatbot:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Handler para requisições OPTIONS (pré-flight CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  })
}
