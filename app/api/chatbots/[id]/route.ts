import { NextResponse } from "next/server"
import { supabase } from "@/db/supabase"

// Configuração de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "ID do chatbot não fornecido" }, { status: 400, headers: corsHeaders })
    }

    // Buscar o chatbot específico do Supabase
    const { data, error } = await supabase
      .from("chatbots")
      .select("id, name, model, system_prompt")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao buscar chatbot:", error)
      return NextResponse.json({ error: "Chatbot não encontrado" }, { status: 404, headers: corsHeaders })
    }

    // Transformar os dados para o formato esperado na API
    const formattedData = {
      id: data.id,
      name: data.name,
      model: data.model,
      systemPrompt: data.system_prompt || "",
    }

    return NextResponse.json(formattedData, { headers: corsHeaders })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500, headers: corsHeaders })
  }
}

// Handler para requisições OPTIONS (pré-flight CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,POST,PUT,DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
