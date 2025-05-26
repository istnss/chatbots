"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"
import { GROQ_MODELS } from "@/lib/groqModels"
import { createChatbot } from "@/lib/supabase-actions"

export function CreateChatbotButton() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateChatbot = async () => {
    setIsCreating(true)

    try {
      // Construir um FormData com os campos obrigatórios
      const formData = new FormData()
      formData.set("name", "Novo Bot")
      formData.set("prompt", "Você é um assistente útil e amigável.")
      formData.set("provider", "groq")
      formData.set("model", GROQ_MODELS[0].value)

      // Chamar a Server Action para persistir no banco de dados
      const newBot = await createChatbot(formData)

      if (newBot) {
        // Navegar para a rota de edição do novo bot
        router.push(`/editar?id=${newBot.id}`)
      } else {
        console.error("Erro ao criar chatbot")
        alert("Não foi possível criar o chatbot. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao criar chatbot:", error)
      alert("Ocorreu um erro ao criar o chatbot.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <button
      onClick={handleCreateChatbot}
      disabled={isCreating}
      className="w-full mt-4 bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2 disabled:bg-gray-400"
    >
      {isCreating ? (
        <>
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Criando...
        </>
      ) : (
        <>
          <PlusCircle className="h-4 w-4" /> Criar Novo Chatbot
        </>
      )}
    </button>
  )
}
