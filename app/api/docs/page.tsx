"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import Link from "next/link"

export default function ApiDocs() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const examples = [
    {
      title: "Listar todos os chatbots",
      description: "Retorna uma lista de todos os chatbots disponíveis",
      curl: `curl -X GET "https://v0-teste-theta-liart.vercel.app/api/chatbots" \\
  -H "Content-Type: application/json"`,
      javascript: `fetch("https://v0-teste-theta-liart.vercel.app/api/chatbots")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));`,
    },
    {
      title: "Obter detalhes de um chatbot",
      description: "Retorna os detalhes de um chatbot específico pelo ID",
      curl: `curl -X GET "https://v0-teste-theta-liart.vercel.app/api/chatbots/123e4567-e89b-12d3-a456-426614174000" \\
  -H "Content-Type: application/json"`,
      javascript: `fetch("https://v0-teste-theta-liart.vercel.app/api/chatbots/123e4567-e89b-12d3-a456-426614174000")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));`,
    },
    {
      title: "Enviar mensagem para um chatbot",
      description: "Envia uma mensagem para o chatbot e recebe uma resposta em streaming",
      curl: `curl -X POST "https://v0-teste-theta-liart.vercel.app/api/chat/123e4567-e89b-12d3-a456-426614174000/message" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Olá, como posso ajudar você hoje?"}'`,
      javascript: `// Usando fetch com streaming
async function chatWithBot() {
  const response = await fetch(
    "https://v0-teste-theta-liart.vercel.app/api/chat/123e4567-e89b-12d3-a456-426614174000/message", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Olá, como posso ajudar você hoje?" })
    }
  );

  // Verificar se a resposta está ok
  if (!response.ok) {
    throw new Error(\`Erro: \${response.status}\`);
  }

  // Processar o stream de resposta
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Decodificar e acumular o texto
    const chunk = decoder.decode(value, { stream: true });
    result += chunk;
    
    // Atualizar a UI com o texto acumulado até agora
    console.log("Resposta parcial:", result);
  }

  console.log("Resposta completa:", result);
  return result;
}

chatWithBot().catch(error => console.error("Erro:", error));`,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API de Chatbots - Documentação</h1>
          <p className="text-gray-600">
            Esta documentação descreve como utilizar a API RESTful para interagir com os chatbots.
          </p>
          <div className="mt-4">
            <Link href="/openapi.json" target="_blank" className="text-blue-600 hover:underline">
              Especificação OpenAPI (Swagger)
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {examples.map((example, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{example.title}</h2>
              <p className="text-gray-600 mb-4">{example.description}</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">cURL</h3>
                    <button
                      onClick={() => handleCopy(example.curl, index * 2)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedIndex === index * 2 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{example.curl}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">JavaScript</h3>
                    <button
                      onClick={() => handleCopy(example.javascript, index * 2 + 1)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedIndex === index * 2 + 1 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{example.javascript}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Notas importantes</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Todos os endpoints suportam CORS e podem ser acessados de qualquer domínio.</li>
            <li>
              As respostas do endpoint <code>/api/chat/{"{id}"}/message</code> são retornadas como um stream de texto.
            </li>
            <li>Todas as mensagens enviadas e respostas recebidas são salvas no histórico de conversas.</li>
            <li>
              Os IDs dos chatbots são no formato UUID e podem ser obtidos através do endpoint <code>/api/chatbots</code>
              .
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
