"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Copy, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EmbedChatbot() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [chatbotName, setChatbotName] = useState("")
  const [copied, setCopied] = useState(false)

  // In a real app, you would fetch the chatbot data from an API
  useEffect(() => {
    if (id === "1") {
      setChatbotName("Bot")
    } else if (id === "2") {
      setChatbotName("Bia")
    } else {
      setChatbotName("Chatbot")
    }
  }, [id])

  const embedCode = `<div
  data-chatbot-id="${id}"
  data-position="bottom-right">
</div>
<script src="https://v0-teste-theta-liart.vercel.app/embed.js"></script>`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4 text-blue-700">Incorporar Chatbot</h1>
          <p className="mb-6">
            Para adicionar este chatbot ao seu site, copie e cole o seguinte código HTML antes do fechamento da tag{" "}
            <code>&lt;/body&gt;</code>.
          </p>

          <div className="relative mb-6">
            <pre className="bg-gray-50 p-4 rounded-md border overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={handleCopyCode}
              className="absolute top-2 right-2 p-2 bg-white rounded-md border hover:bg-gray-100"
              aria-label="Copy code"
            >
              <Copy className="h-4 w-4" />
            </button>
            {copied && (
              <div className="absolute top-2 right-12 bg-black text-white px-2 py-1 rounded text-sm">Copied!</div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Opções de Personalização</h2>
            <p className="text-gray-600 mb-4">
              Você pode personalizar a aparência e o comportamento do seu chatbot modificando os atributos no código
              HTML.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-blue-700">Posição</h3>
                <p className="text-sm text-gray-500">
                  Adicione <code>data-position="bottom-left"</code> para posicionar o chatbot no canto inferior
                  esquerdo.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-blue-700">Estilo</h3>
                <p className="text-sm text-gray-500">
                  Modifique o atributo <code>style</code> para ajustar o posicionamento e a aparência do container.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
