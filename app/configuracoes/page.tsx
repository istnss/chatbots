"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Settings() {
  const [groqApiKey, setGroqApiKey] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  const handleUpdateGroqKey = () => {
    // In a real app, you would save the API key to a secure storage
    console.log("Updating Groq API Key:", groqApiKey)
    alert("Groq API Key updated successfully!")
  }

  const handleUpdateGeminiKey = () => {
    // In a real app, you would save the API key to a secure storage
    console.log("Updating Gemini API Key:", geminiApiKey)
    alert("Gemini API Key updated successfully!")
  }

  const handleSaveSettings = () => {
    // In a real app, you would save the settings to a database or local storage
    console.log("Saving settings, Dark Mode:", darkMode)
    alert("Settings saved successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-semibold mx-auto">Gerenciador de Chatbots</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 flex gap-6">
        <div className="w-1/4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <nav>
              <ul>
                <li className="mb-2">
                  <Link href="/configuracoes" className="block py-2 px-3 bg-gray-100 rounded-md">
                    Meus Chatbots
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="w-3/4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">API Settings</h2>
            <p className="text-sm text-gray-500 mb-4">Manage your API keys and integrations</p>

            <div className="mb-4">
              <label className="block mb-1">Groq API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Enter your Groq API key"
                />
                <button onClick={handleUpdateGroqKey} className="px-4 py-2 border rounded-md hover:bg-gray-50">
                  Update
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1">Gemini API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Enter your Gemini API key"
                />
                <button onClick={handleUpdateGeminiKey} className="px-4 py-2 border rounded-md hover:bg-gray-50">
                  Update
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Application Settings</h2>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="mr-2"
                />
                Modo Noturno
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
