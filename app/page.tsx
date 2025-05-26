"use client"

import type React from "react"


import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Bot,
  Brain,
  MessageSquare,
  Settings,
  Code,
  Pencil,
  Trash2,
  Send,
  RefreshCw,
  Mic,
  MicOff,
  AlertCircle,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Loader2,
  LayoutDashboard
} from "lucide-react"
import Link from "next/link"
import { useChat } from "ai/react"
import { GROQ_MODELS } from "@/lib/groqModels"
import { OPENAI_MODELS } from "@/lib/openaiModels"
import { getChatbots, deleteChatbot } from "@/lib/supabase-actions"
import { CreateChatbotButton } from "@/components/CreateChatbotButton"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { useOpenAISpeech } from "@/hooks/useOpenAISpeech"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// Tipo para armazenar as conversas de cada chatbot
type ChatbotConversations = {
  [chatbotId: string]: Message[]
}

export default function Home() {
  const router = useRouter()

  // Lista de chatbots
  const [chatbotList, setChatbotList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Inicializa o chatbot selecionado com o primeiro da lista
  const [selectedChatbot, setSelectedChatbot] = useState<string>("")

  // Armazena as conversas de cada chatbot (apenas em memória, não persistidas no banco de dados)
  const [chatbotConversations, setChatbotConversations] = useState<ChatbotConversations>({})

  // Estado para controlar timeouts de resposta
  const [responseTimeout, setResponseTimeout] = useState(false)

  // Referência para o timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Referência para o input de texto
  const inputRef = useRef<HTMLInputElement>(null)

  // Referência para controlar se já carregamos os chatbots
  const chatbotsLoadedRef = useRef(false)

  // Referência para evitar atualizações circulares
  const updatingMessagesRef = useRef(false)
  const updatingConversationsRef = useRef(false)

  // Estado para mostrar erros de microfone
  const [micError, setMicError] = useState<string | null>(null)

  const [autoPlayAudio, setAutoPlayAudio] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<"alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer">("nova")

  // Hook de chat com configurações otimizadas - IMPORTANTE: Deve vir antes de qualquer useEffect que usa setInput
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading: isChatLoading,
    setMessages,
    setInput,
    error: chatError,
    reload,
  } = useChat({
    api: "/api/chat-supabase",
    body: { chatbotId: selectedChatbot },
    id: selectedChatbot,
    enabled: !!selectedChatbot,
    // Configurações otimizadas
    onResponse: () => {
      // Limpar o timeout quando começar a receber resposta
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setResponseTimeout(false)
    },
    onError: () => {
      // Limpar o timeout em caso de erro
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    },
  })

  // Hook para gravação e transcrição de áudio via OpenAI
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    hasSupport: hasRecordingSupport,
    error: recordingError,
  } = useAudioRecorder({
    onTranscriptionComplete: (text) => {
      // Set the transcribed text to the input field
      if (text && setInput) {
        setInput(text)

        // Automatically submit the form if we have text
        if (text.trim()) {
          // Create a synthetic form submission event
          const event = new Event("submit", { bubbles: true, cancelable: true }) as unknown as React.FormEvent
          handleSubmit(event)
        }
      }
    },
    onError: (error) => {
      setMicError(error)
    },
  })

  // Hook para síntese de voz via OpenAI
  const {
    speak,
    stop: stopSpeech,
    pause: pauseSpeech,
    resume: resumeSpeech,
    isLoading: isLoadingSpeech,
    isPlaying,
    isPaused,
    currentText,
    error: speechError,
  } = useOpenAISpeech({
    voice: selectedVoice,
    onError: (error) => {
      console.error("Speech error:", error)
    },
  })

  // Verificar se o microfone está disponível de forma segura
  useEffect(() => {
    // Verificar apenas no cliente
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone permission granted")
          setMicError(null)
        })
        .catch((err) => {
          console.error("Error getting microphone permission:", err)
          setMicError("Microphone permission denied")
        })
    }
  }, [])

  // Monitorar erros de gravação
  useEffect(() => {
    if (recordingError) {
      console.error("Recording error:", recordingError)
      setMicError(recordingError)
    }
  }, [recordingError])

  // Monitorar erros de síntese de voz
  useEffect(() => {
    if (speechError) {
      console.error("Speech error:", speechError)
    }
  }, [speechError])

  // Carrega os chatbots do Supabase - apenas uma vez
  useEffect(() => {
    // Evita carregar múltiplas vezes
    if (chatbotsLoadedRef.current) return

    async function loadChatbots() {
      try {
        const bots = await getChatbots()
        setChatbotList(bots)

        // Seleciona o primeiro chatbot por padrão, se existir
        if (bots.length > 0) {
          setSelectedChatbot(bots[0].id)
        }

        // Marca como carregado
        chatbotsLoadedRef.current = true
      } catch (error) {
        console.error("Erro ao carregar chatbots:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChatbots()
  }, []) // Sem dependências para executar apenas uma vez

  // Wrapper para handleSubmit com timeout
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!input?.trim() || isChatLoading) return

      // Configurar um timeout para detectar respostas lentas
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Definir um timeout de 15 segundos
      timeoutRef.current = setTimeout(() => {
        setResponseTimeout(true)
      }, 15000)

      // Chamar o handler original
      originalHandleSubmit(e)
    },
    [input, isChatLoading, originalHandleSubmit],
  )

  // Função para tentar novamente em caso de timeout
  const handleRetry = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setResponseTimeout(false)
    reload()
  }, [reload])

  // Exibe erros de chat, se houver
  useEffect(() => {
    if (chatError) {
      console.error("Erro no chat:", chatError)
      // Limpar o timeout em caso de erro
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [chatError])

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Quando o chatbot selecionado muda, carrega suas mensagens
  useEffect(() => {
    if (!selectedChatbot || !setMessages) return

    // Evitar atualizações circulares
    if (updatingMessagesRef.current) return

    updatingMessagesRef.current = true

    // Se já temos mensagens para este chatbot, carregamos elas
    if (chatbotConversations[selectedChatbot]) {
      setMessages(chatbotConversations[selectedChatbot])
    } else {
      // Caso contrário, iniciamos uma conversa vazia
      setMessages([])
    }

    // Resetar a flag após um pequeno delay
    setTimeout(() => {
      updatingMessagesRef.current = false
    }, 0)
  }, [selectedChatbot, setMessages, chatbotConversations])

  // Quando as mensagens mudam, atualizamos a conversa do chatbot atual
  useEffect(() => {
    if (!selectedChatbot || messages === undefined) return

    // Evitar atualizações circulares
    if (updatingConversationsRef.current) return

    // Verificar se as mensagens são diferentes antes de atualizar
    const currentMessages = chatbotConversations[selectedChatbot] || []
    const messagesChanged = JSON.stringify(currentMessages) !== JSON.stringify(messages)

    if (!messagesChanged) return

    updatingConversationsRef.current = true

    setChatbotConversations((prev) => ({
      ...prev,
      [selectedChatbot]: [...messages],
    }))

    // Resetar a flag após um pequeno delay
    setTimeout(() => {
      updatingConversationsRef.current = false
    }, 0)
  }, [messages, selectedChatbot, chatbotConversations])

  // Auto-play audio for new assistant messages - with debounce and safety checks
  const playedMessagesRef = useRef(new Set<string>()) // Initialize ref outside useEffect
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if we have messages and auto-play is enabled
    if (!messages || messages.length === 0 || !autoPlayAudio) return

    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // If it's from the assistant and not currently loading, play it
    if (lastMessage.role === "assistant" && !isChatLoading && !isPlaying && !isLoadingSpeech) {
      // Use a ref to track if we've already tried to play this message
      const messageId = lastMessage.id || `${lastMessage.role}-${lastMessage.content.substring(0, 20)}`

      // Only play if we haven't already tried to play this message
      if (!playedMessagesRef.current.has(messageId)) {
        // Mark this message as played
        playedMessagesRef.current.add(messageId)

        // Clear any existing timeout
        if (autoPlayTimeoutRef.current) {
          clearTimeout(autoPlayTimeoutRef.current)
        }

        // Use a longer delay to ensure UI is updated and previous operations are complete
        autoPlayTimeoutRef.current = setTimeout(() => {
          try {
            console.log("Auto-playing message:", lastMessage.content.substring(0, 50) + "...")
            speak(lastMessage.content).catch((err) => {
              console.error("Error in auto-play:", err)
            })
          } catch (err) {
            console.error("Error setting up auto-play:", err)
          }
        }, 2500) // Longer delay to ensure stability
      }
    }

    // Cleanup function
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current)
      }
    }
  }, [messages, isChatLoading, autoPlayAudio, speak, isPlaying, isLoadingSpeech])

  // Update the handlePlayAudio function to be more robust
  const handlePlayAudio = useCallback(
    (text: string) => {
      try {
        console.log("Manual play requested for message:", text.substring(0, 50) + "...")

        // Stop any current speech first
        stopSpeech()

        // Use a delay to ensure previous operations are complete
        setTimeout(() => {
          speak(text).catch((err) => {
            console.error("Error in manual play:", err)
          })
        }, 1000)
      } catch (err) {
        console.error("Error in handlePlayAudio:", err)
      }
    },
    [speak, stopSpeech],
  )

  // Função para lidar com o botão de microfone
  const handleMicrophoneClick = useCallback(() => {
    console.log("Microphone button clicked, current state:", isRecording)

    if (isRecording || isProcessing) {
      console.log("Stopping recording...")
      stopRecording()
    } else {
      console.log("Starting recording...")
      // Clear any previous error
      setMicError(null)
      startRecording()
    }
  }, [isRecording, isProcessing, startRecording, stopRecording])

  // Função para excluir um chatbot
  const handleDeleteChatbot = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!confirm("Tem certeza que deseja excluir este chatbot?")) {
        return
      }

      deleteChatbot(id)
        .then((success) => {
          if (success) {
            // Atualiza a lista de chatbots
            setChatbotList((prev) => {
              const newList = prev.filter((bot) => bot.id !== id)

              // Se o chatbot excluído era o selecionado, selecionar outro
              if (selectedChatbot === id && newList.length > 0) {
                setSelectedChatbot(newList[0].id)
              } else if (newList.length === 0) {
                setSelectedChatbot("")
              }

              return newList
            })

            // Remove as conversas deste chatbot
            setChatbotConversations((prev) => {
              const newConversations = { ...prev }
              delete newConversations[id]
              return newConversations
            })
          }
        })
        .catch((error) => {
          console.error("Erro ao excluir chatbot:", error)
        })
    },
    [selectedChatbot],
  )

  // Função para limpar a conversa do chatbot atual
  const handleClearChat = useCallback(() => {
    if (!selectedChatbot || !setMessages) return

    // Evitar atualizações circulares
    updatingMessagesRef.current = true
    updatingConversationsRef.current = true

    setMessages([])

    setChatbotConversations((prev) => ({
      ...prev,
      [selectedChatbot]: [],
    }))

    // Resetar as flags após um pequeno delay
    setTimeout(() => {
      updatingMessagesRef.current = false
      updatingConversationsRef.current = false
    }, 0)
  }, [selectedChatbot, setMessages])

  // Scroll automático quando novas mensagens chegam
  useEffect(() => {
    if (!messages || messages.length === 0) return

    const chatContainer = document.getElementById("chat-messages")
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [messages]) // Dependência apenas no comprimento das mensagens com verificação de segurança

  // Busca o bot selecionado
  const selectedBot = selectedChatbot ? chatbotList.find((bot) => bot.id === selectedChatbot) : null

  // Função para obter o nome do modelo formatado
  const getModelName = useCallback((modelId: string) => {
    // Verificar primeiro nos modelos Groq
    const groqModel = GROQ_MODELS.find((m) => m.value === modelId)
    if (groqModel) return groqModel.label

    // Verificar nos modelos OpenAI
    const openaiModel = OPENAI_MODELS.find((m) => m.value === modelId)
    if (openaiModel) return openaiModel.label

    // Se não encontrar, retorna o ID do modelo
    return modelId
  }, [])

  // Função para formatar a data de criação
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (e) {
      return 0
    }
  }, [])

  // Handle voice selection change
  const handleVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer")
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex justify-between items-center p-4 border-b">


        
        <div className="flex items-center gap-2 p-6">
          <Bot className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-semibold">Gerenciador de Chatbots </h1>
          <div className="h-6 w-6 text-gray-700" />
        </div>


        <div className="flex gap-4">
          <Link href="/dash" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/configuracoes" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Settings className="h-5 w-5" />
            Configurações
          </Link>
        </div>
        
      </header>

      <div className="flex flex-1">
        {/* Left column - Chatbot list */}
        <div className="w-1/3 border-r p-4">
          <div className="mb-4 flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold">Meus Chatbots</h2>
            <p className="text-sm text-gray-500">Selecione um chatbot para conversar ou crie um novo</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-gray-800"></div>
            </div>
          ) : chatbotList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Você ainda não tem chatbots.</p>
              <p>Crie seu primeiro chatbot clicando no botão abaixo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatbotList.map((bot) => (
                <div key={bot.id} className="border rounded-md p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="selectedBot"
                      checked={selectedChatbot === bot.id}
                      onChange={() => setSelectedChatbot(bot.id)}
                      className="h-4 w-4"
                    />
                    <div>
                      <div>{bot.name}</div>
                      <div className="text-xs text-gray-500">
                        {bot.provider === "openai" ? "OpenAI" : "Groq"}: {getModelName(bot.model)}
                      </div>
                      <div className="text-xs text-gray-500">Criado há {formatDate(bot.created_at)} dia(s)</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/editar?id=${bot.id}`}>
                      <Pencil className="h-4 w-4 cursor-pointer text-blue-500" />
                    </Link>
                    <Link href={`/incorporar?id=${bot.id}`}>
                      <Code className="h-4 w-4 cursor-pointer" />
                    </Link>
                    <button
                      onClick={(e) => handleDeleteChatbot(bot.id, e)}
                      className="border-none bg-transparent p-0 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <CreateChatbotButton />
        </div>

        {/* Right column - Chat window */}
        <div className="w-2/3 flex flex-col">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-4 rounded-xl shadow-sm">
              <h2 className="text-sm font-semibold">Total Chatbots</h2>
              <p className="text-sm text-gray-500">{chatbotList.length}</p>
            </div>

            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded-xl shadow-sm">
              <h2 className="text-sm font-semibold">Conversas hoje</h2>
              <p className="text-sm text-gray-500">15</p>
            </div>

            <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-xl shadow-sm">
              <h2 className="text-sm font-semibold">Modelo mais utilizado</h2>
              <p className="text-sm text-gray-500">Groq</p>
            </div>

            <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div>
                <h2 className="text-sm font-semibold">Tempo de resposta</h2>
                <p className="text-sm text-gray-500">2.81 s</p>
              </div>
            </div>

          </section>
          {selectedBot ? (
            <>
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="font-medium">{selectedBot.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedBot.provider === "openai" ? "OpenAI" : "Groq"}: {getModelName(selectedBot.model)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                      className={`flex items-center gap-1 text-sm ${
                        autoPlayAudio ? "text-blue-600" : "text-gray-500"
                      } hover:text-blue-700`}
                      title={autoPlayAudio ? "Desativar áudio automático" : "Ativar áudio automático"}
                    >
                      {autoPlayAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      {autoPlayAudio ? "Áudio automático" : "Áudio manual"}
                    </button>

                    <select
                      value={selectedVoice}
                      onChange={handleVoiceChange}
                      className="text-sm border rounded-md p-1"
                      title="Selecionar voz"
                    >
                      <option value="alloy">Alloy</option>
                      <option value="echo">Echo</option>
                      <option value="fable">Fable</option>
                      <option value="onyx">Onyx</option>
                      <option value="nova">Nova</option>
                      <option value="shimmer">Shimmer</option>
                    </select>
                  </div>

                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCw className="h-4 w-4" /> Limpar conversa
                  </button>
                </div>
              </div>

              <div id="chat-messages" className="flex-1 p-4 overflow-y-auto">
                {!messages || messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>Envie uma mensagem para iniciar a conversa.</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                      {/* Add this CSS class to the chat message container to show when audio is playing */}
                      <div
                        className={`inline-block p-3 rounded-lg max-w-[80%] ${
                          message.role === "user" ? "bg-gray-200" : "bg-gray-100"
                        } ${isPlaying && currentText === message.content ? "border-l-4 border-blue-500" : ""}`}
                      >
                        {message.content}

                        {/* Audio controls for assistant messages */}
                        {message.role === "assistant" && (
                          <div className="mt-2 flex items-center justify-end gap-2 text-gray-500">
                            {isPlaying && currentText === message.content ? (
                              <>
                                {isPaused ? (
                                  <button
                                    onClick={resumeSpeech}
                                    className="p-1 hover:bg-gray-200 rounded-full"
                                    title="Continuar áudio"
                                  >
                                    <Play className="h-3 w-3" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={pauseSpeech}
                                    className="p-1 hover:bg-gray-200 rounded-full"
                                    title="Pausar áudio"
                                  >
                                    <Pause className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  onClick={stopSpeech}
                                  className="p-1 hover:bg-gray-200 rounded-full"
                                  title="Parar áudio"
                                >
                                  <VolumeX className="h-3 w-3" />
                                </button>
                              </>
                            ) : isLoadingSpeech && currentText === message.content ? (
                              <div className="p-1" title="Carregando áudio">
                                <Loader2 className="h-3 w-3 animate-spin" />
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePlayAudio(message.content)}
                                className="p-1 hover:bg-gray-200 rounded-full"
                                title="Reproduzir áudio"
                              >
                                <Volume2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Indicador de carregamento otimizado */}
                {isChatLoading && !responseTimeout && (
                  <div className="mb-4 text-left">
                    <div className="inline-block p-3 rounded-lg bg-gray-100 max-w-[80%]">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aviso de resposta lenta */}
                {responseTimeout && (
                  <div className="mb-4 text-left">
                    <div className="inline-block p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 max-w-[80%]">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Resposta lenta</span>
                      </div>
                      <p className="text-sm mb-2">O modelo está demorando mais que o esperado para responder.</p>
                      <button
                        onClick={handleRetry}
                        className="text-sm bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-md"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                )}

                {/* Exibir erro de microfone, se houver */}
                {micError && (
                  <div className="mb-4 text-center">
                    <div className="inline-block p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{micError}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 p-2 border rounded-md"
                  disabled={isChatLoading || isRecording || isProcessing}
                />
                {hasRecordingSupport && (
                  <button
                    type="button"
                    onClick={handleMicrophoneClick}
                    className={`p-2 rounded-md ${
                      isRecording
                        ? "bg-red-500 text-white"
                        : isProcessing
                          ? "bg-yellow-500 text-white"
                          : "bg-blue-200 text-gray-700"
                    }`}
                    disabled={isChatLoading}
                    title={isRecording ? "Parar gravação" : isProcessing ? "Processando áudio..." : "Iniciar gravação"}
                  >
                    {isRecording ? (
                      <MicOff className="h-5 w-5" />
                    ) : isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-800 text-white p-2 rounded-md disabled:bg-blue-400"
                  disabled={isChatLoading || !input?.trim() || isRecording || isProcessing}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Selecione um chatbot para iniciar uma conversa.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
