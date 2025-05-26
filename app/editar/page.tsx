"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GROQ_MODELS } from "@/lib/groqModels"
import { OPENAI_MODELS } from "@/lib/openaiModels"
import { getChatbot, updateChatbot } from "@/lib/supabase-actions"

type ModelProvider = "groq" | "openai"

export default function EditChatbot() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [chatbot, setChatbot] = useState({
    id: id || "",
    name: "",
    system_prompt: "",
    provider: "groq" as ModelProvider,
    model: "",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Carrega os dados do chatbot
  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    async function loadChatbot() {
      setIsLoading(true)
      try {
        const bot = await getChatbot(id)
        if (bot) {
          setChatbot({
            id: bot.id,
            name: bot.name,
            system_prompt: bot.system_prompt || "",
            provider: bot.provider || "groq",
            model: bot.model,
          })
        } else {
          // Se não encontrar, redireciona de volta
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao carregar chatbot:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    loadChatbot()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setChatbot((prev) => ({ ...prev, [name]: value }))
  }

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as ModelProvider
    setChatbot((prev) => ({
      ...prev,
      provider,
      // Reset model when changing provider
      model: "",
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Constrói o FormData para a Server Action
      const formData = new FormData()
      formData.set("id", chatbot.id)
      formData.set("name", chatbot.name)
      formData.set("prompt", chatbot.system_prompt)
      formData.set("provider", chatbot.provider)
      formData.set("model", chatbot.model)

      // Chama updateChatbot (Server Action)
      const updated = await updateChatbot(formData)

      if (updated) {
        // Após salvar, redireciona para a home
        router.push("/")
      } else {
        alert("Não foi possível atualizar o chatbot. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao salvar chatbot:", error)
      alert("Ocorreu um erro ao salvar o chatbot.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-gray-800"></div>
      </div>
    )
  }

  // Determina quais modelos mostrar com base no provedor selecionado
  const availableModels = chatbot.provider === "openai" ? OPENAI_MODELS : GROQ_MODELS

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Editar Chatbot</h1>
        <p className="text-gray-500 text-sm mb-6">Altere as configurações do Chatbot</p>

        <form onSubmit={handleSave}>
          <div className="mb-8">
            <label htmlFor="name" className="block mb-1 text-blue-700">
              Nome do Chatbot
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={chatbot.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-8">
            <label htmlFor="system_prompt" className="block font-medium mb-1 text-blue-700">
              Prompt de Orientação
            </label>
            <textarea
              id="system_prompt"
              name="system_prompt"
              value={chatbot.system_prompt}
              onChange={handleChange}
              className="w-full p-2 border rounded-md h-32"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="provider" className="block font-medium mb-1 text-blue-700">
              Provedor do Modelo
            </label>
            <select
              id="provider"
              name="provider"
              value={chatbot.provider}
              onChange={handleProviderChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="model" className="block font-medium mb-1 text-blue-700">
              Modelo
            </label>
            <select
              id="model"
              name="model"
              value={chatbot.model}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Selecione um modelo</option>
              {availableModels.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 border rounded-md"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-800 text-white rounded-md disabled:bg-gray-400"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
