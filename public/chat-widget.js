;((window) => {
  // Estilos CSS para o widget
  const styles = `
    .chat-widget-container {
      position: fixed;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
      .speech-bubble {
      position: relative;
      background: #ffffff;
      border: 2px solid #ccc;
      border-radius: 10px;
      padding: 15px;
      max-width: 220px;
      margin-right: 10px;
      font-size: 14px;
    }

    .speech-bubble::after {
      content: '';
      position: absolute;
      bottom: 10px;
      right: -20px;
      width: 0;
      height: 0;
      border-left: 20px solid #ffffff;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
    }

    .speech-bubble::before {
      content: '';
      position: absolute;
      bottom: 10px;
      right: -22px;
      width: 0;
      height: 0;
      border-left: 22px solid #ccc;
      border-top: 12px solid transparent;
      border-bottom: 12px solid transparent;
    }

    .chat-widget {
      width: 350px;
      height: 600px;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .chat-widget.minimized {
      height: 60px;
      overflow: hidden;
    }
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #fff;
      border-bottom: 1px solid #f0f0f0;
    }
    .chat-header-title {
      font-weight: 600;
      font-size: 16px;
      color: #212529;
    }
    .chat-header-actions {
      display: flex;
      gap: 16px;
    }
    .chat-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
      transition: color 0.2s;
    }
    .chat-btn:hover {
      color: #212529;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #fff;
    }
    .chat-message {
      max-width: 80%;
      padding: 14px 16px;
      border-radius: 18px;
      position: relative;
      word-wrap: break-word;
      line-height: 1.4;
      font-size: 15px;
    }
    .chat-message.user {
      align-self: flex-end;
      background: #4e6af3;
      color: white;
    }
    .chat-message.assistant {
      align-self: flex-start;
      background: #f0f2f5;
      color: #212529;
    }
    .chat-input-container {
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
    }
    .chat-input-form {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e1e4e8;
      border-radius: 24px;
      outline: none;
      font-size: 14px;
      background: #fff;
    }
    .chat-input:focus {
      border-color: #4e6af3;
      box-shadow: 0 0 0 2px rgba(78,106,243,0.2);
    }
    .chat-send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #4e6af3;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    .chat-send-btn:hover {
      background: #3a56e0;
    }
    .chat-send-btn:disabled {
      background: #a8b8f8;
      cursor: not-allowed;
    }
    .chat-bubble-btn {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background-image: url('http://localhost:3000/atlas1.png');
      background-size: cover; 
      background-repeat: no-repeat; 
      background-position: center; 
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s, box-shadow 0.3s;
      z-index: 9999;
    }
    .chat-bubble-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .chat-typing {
      align-self: flex-start;
      background: #f0f2f5;
      color: #212529;
      padding: 14px 16px;
      border-radius: 18px;
      max-width: 80%;
      word-wrap: break-word;
      line-height: 1.4;
      font-size: 15px;
    }
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .typing-dot {
      width: 6px;
      height: 6px;
      background: #6c757d;
      border-radius: 50%;
      animation: typing-dot 1.4s infinite ease-in-out;
    }
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing-dot {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    .mic-btn {
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
      transition: color 0.2s;
    }
    .mic-btn:hover {
      color: #4e6af3;
    }
    .mic-btn.recording {
      color: #dc3545;
    }
    .mic-btn.processing {
      color: #fd7e14;
    }
    .mic-btn.disabled {
      color: #adb5bd;
      cursor: not-allowed;
    }
    .audio-controls {
      display: inline-flex;
      align-items: center;
      margin-left: 8px;
    }
    .audio-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
    }
    .audio-btn:hover {
      color: #4e6af3;
    }
    .playing-message {
      border-left: 3px solid #4e6af3 !important;
    }
    .chat-widget.minimized{
      display: none;
    }
    @media (max-width: 480px) {
      .chat-widget {
        width: 320px;
        height: 550px;
      }
    }
  `

  // Adiciona os estilos ao documento
  function addStyles() {
    const styleEl = document.createElement("style")
    styleEl.textContent = styles
    document.head.appendChild(styleEl)
  }

  // Ícones SVG
  const icons = {
    send: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>`,
    minimize: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    maximize: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`,
    close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    mic: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
    micOff: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
    micBlocked: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
    volume: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    volumeOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`,
    pause: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
    play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    loader: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`,
  }

  window.ChatWidget = {
  
    init: (config) => {
      // Extrair e armazenar a URL base em uma variável fechada
      const BASE = config.apiBaseUrl || window.location.origin
      const { chatbotId, container, floating, position } = config

      console.log(`ChatWidget inicializado com apiBaseUrl: ${BASE}`)

      // Adiciona os estilos CSS
      addStyles()

      // Configura o container
      container.className = "chat-widget-container"
      if (position.includes("bottom")) container.style.bottom = "20px"
      if (position.includes("right")) container.style.right = "20px"
      if (position.includes("left")) container.style.left = "20px"


      // Estado do widget
      let isMinimized = false
      let isLoading = false
      let isRecording = false
      let isProcessing = false
      let isPlaying = false
      let isPaused = false
      let currentPlayingMessageEl = null
      let mediaRecorder = null
      let audioChunks = []
      let audioStream = null
      const messages = []

      // Estado de permissão do microfone
      let micPermissionState = "unknown" // "unknown", "granted", "denied", "prompt"
      let cachedAudioStream = null // Armazena o stream de áudio para reutilização

      // Cria o botão flutuante (inicialmente visível)
      const bubbleBtn = document.createElement("div")
      bubbleBtn.className = "chat-bubble-btn"
      bubbleBtn.title = "Abrir chat"

      // Posicionamento correto do botão flutuante
      bubbleBtn.style.position = "fixed"
      bubbleBtn.style.bottom = "20px"
      bubbleBtn.style.right = "20px"

      container.appendChild(bubbleBtn)

      // Cria o widget de chat (inicialmente oculto)
      const chatEl = document.createElement("div")
      chatEl.className = "chat-widget"
      chatEl.style.display = "none"

      // Estrutura do widget com character image
      chatEl.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-title">Chat com IA</div>
        <div class="chat-header-actions">
          <button class="chat-btn minimize-btn" title="Minimizar">${icons.minimize}</button>
          <button class="chat-btn close-btn" title="Fechar">${icons.close}</button>
        </div>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input-container">
        <form class="chat-input-form">
          <input type="text" class="chat-input" placeholder="Digite sua mensagem..." />
          <button type="button" class="mic-btn" title="Gravar mensagem">${icons.mic}</button>
          <button type="submit" class="chat-send-btn" disabled>${icons.send}</button>
        </form>
      </div>
    `
      container.appendChild(chatEl)

      // Referências aos elementos
      const messagesEl = chatEl.querySelector(".chat-messages")
      const inputForm = chatEl.querySelector(".chat-input-form")
      const inputEl = chatEl.querySelector(".chat-input")
      const sendBtn = chatEl.querySelector(".chat-send-btn")
      const micBtn = chatEl.querySelector(".mic-btn")
      const minimizeBtn = chatEl.querySelector(".minimize-btn")
      const closeBtn = chatEl.querySelector(".close-btn")

      // Função para verificar o status da permissão do microfone
      async function checkMicrophonePermission() {
        // Verifica se a API de permissões está disponível
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: "microphone" })

            // Atualiza o estado com base no resultado
            micPermissionState = permissionStatus.state

            // Configura um listener para mudanças de permissão
            permissionStatus.onchange = () => {
              micPermissionState = permissionStatus.state
              updateMicButtonState()
            }

            console.log(`Microphone permission status: ${micPermissionState}`)
            return micPermissionState
          } catch (err) {
            console.error("Error checking microphone permission:", err)
            // Fallback para o método tradicional se a API de permissões falhar
            return await checkMicrophonePermissionFallback()
          }
        } else {
          // Fallback para navegadores que não suportam a API de permissões
          return await checkMicrophonePermissionFallback()
        }
      }

      // Método alternativo para verificar permissão do microfone
      async function checkMicrophonePermissionFallback() {
        // Se já temos um stream de áudio em cache, a permissão foi concedida
        if (cachedAudioStream) {
          micPermissionState = "granted"
          return "granted"
        }

        try {
          // Tenta obter acesso ao microfone
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

          // Armazena o stream para uso futuro
          cachedAudioStream = stream
          micPermissionState = "granted"

          return "granted"
        } catch (err) {
          // Se o erro for de permissão negada
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            micPermissionState = "denied"
            return "denied"
          } else {
            // Outros erros (dispositivo não disponível, etc.)
            console.error("Error accessing microphone:", err)
            micPermissionState = "prompt" // Assume que precisamos solicitar novamente
            return "prompt"
          }
        }
      }

      // Atualiza o estado visual do botão do microfone
      function updateMicButtonState() {
        if (isRecording) {
          micBtn.innerHTML = icons.micOff
          micBtn.title = "Parar gravação"
          micBtn.classList.add("recording")
          return
        }

        if (isProcessing) {
          micBtn.innerHTML = icons.loader
          micBtn.title = "Processando áudio..."
          micBtn.classList.add("processing")
          return
        }

        // Remove todas as classes de estado
        micBtn.classList.remove("recording", "processing", "disabled")

        // Configura com base no estado de permissão
        if (micPermissionState === "denied") {
          micBtn.innerHTML = icons.micBlocked
          micBtn.title = "Acesso ao microfone bloqueado. Verifique as permissões do navegador."
          micBtn.classList.add("disabled")
          micBtn.disabled = true
        } else {
          micBtn.innerHTML = icons.mic
          micBtn.title = "Gravar mensagem"
          micBtn.disabled = false
        }
      }

      // Função para alternar entre widget e botão flutuante
      function toggleWidget() {
        if (chatEl.style.display === "none") {
          chatEl.style.display = "flex"
          bubbleBtn.style.display = "none"
          inputEl.focus()

          // Verifica o status da permissão do microfone quando o widget é aberto
          checkMicrophonePermission().then(updateMicButtonState)
        } else {
          chatEl.style.display = "none"
          bubbleBtn.style.display = "flex"
        }
      }

      // Função para minimizar/maximizar o widget
      function toggleMinimize() {
        isMinimized = !isMinimized
        chatEl.classList.toggle("minimized", isMinimized)
        minimizeBtn.innerHTML = isMinimized ? icons.maximize : icons.minimize
        minimizeBtn.title = isMinimized ? "Maximizar" : "Minimizar"
      }

      // Função para adicionar uma mensagem
      function addMessage(role, content) {
        const messageEl = document.createElement("div")
        messageEl.className = `chat-message ${role}`
        messageEl.textContent = content

        // Add audio controls for assistant messages
        if (role === "assistant") {
          const audioControls = document.createElement("div")
          audioControls.className = "audio-controls"
          audioControls.innerHTML = `
          <button class="audio-btn play-btn" title="Ouvir resposta">${icons.volume}</button>
        `
          messageEl.appendChild(audioControls)

          // Add event listener for play button
          const playBtn = audioControls.querySelector(".play-btn")
          playBtn.addEventListener("click", () => {
            playMessageAudio(messageEl, content)
          })
        }

        messagesEl.appendChild(messageEl)

        // Salva a mensagem no estado
        messages.push({ role, content })

        // Scroll para o final
        messagesEl.scrollTop = messagesEl.scrollHeight
      }

      // Função para mostrar indicador de digitação
      function showTypingIndicator() {
        const typingEl = document.createElement("div")
        typingEl.className = "chat-typing"
        typingEl.innerHTML = `
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `
        messagesEl.appendChild(typingEl)
        messagesEl.scrollTop = messagesEl.scrollHeight
        return typingEl
      }

      // Função para iniciar gravação de áudio
      async function startRecording() {
        // Se já estiver gravando ou processando, não faz nada
        if (isRecording || isProcessing) return

        try {
          // Verifica o status da permissão do microfone
          const permissionStatus = await checkMicrophonePermission()

          // Se a permissão foi negada, não podemos gravar
          if (permissionStatus === "denied") {
            console.log("Microphone permission denied")
            updateMicButtonState()
            return
          }

          // Se já temos um stream em cache, usamos ele
          if (cachedAudioStream) {
            audioStream = cachedAudioStream.clone()
          } else {
            // Caso contrário, solicitamos permissão
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Armazenamos o stream para uso futuro
            cachedAudioStream = audioStream.clone()

            // Atualizamos o estado de permissão
            micPermissionState = "granted"
          }

          // Create media recorder
          mediaRecorder = new MediaRecorder(audioStream)

          // Clear previous audio chunks
          audioChunks = []

          // Set up event handlers
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data)
            }
          }

          // Start recording
          mediaRecorder.start()
          isRecording = true

          // Update UI
          updateMicButtonState()
          inputEl.disabled = true
          sendBtn.disabled = true

          console.log("Recording started")
        } catch (err) {
          console.error("Error starting recording:", err)

          // Atualiza o estado de permissão se o erro for de permissão
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            micPermissionState = "denied"
          }

          updateMicButtonState()
          alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.")
        }
      }

      // Função para parar gravação e processar áudio
      async function stopRecording() {
        if (!mediaRecorder || !isRecording) {
          return
        }

        try {
          // Create a promise that resolves when recording stops
          const recordingStoppedPromise = new Promise((resolve) => {
            mediaRecorder.onstop = () => resolve()
          })

          // Stop the media recorder
          mediaRecorder.stop()
          isRecording = false
          isProcessing = true

          // Update UI
          updateMicButtonState()

          // Wait for the recording to stop
          await recordingStoppedPromise

          // Stop all tracks in the stream
          // Não fechamos o cachedAudioStream, apenas o stream atual
          if (audioStream && audioStream !== cachedAudioStream) {
            audioStream.getTracks().forEach((track) => track.stop())
            audioStream = null
          }

          // Process the recorded audio
          if (audioChunks.length > 0) {
            // Create a blob from the audio chunks
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" })

            // Create form data to send to the API
            const formData = new FormData()
            formData.append("audio", audioBlob, "recording.webm")

            // Send the audio to the transcription API
            const response = await fetch(`${BASE}/api/transcribe`, {
              method: "POST",
              body: formData,
              // Explicitly set mode to cors
              mode: "cors",
              // Don't send credentials for cross-origin requests unless needed
              credentials: "omit",
            })

            if (!response.ok) {
              throw new Error(`Transcription failed with status: ${response.status}`)
            }

            const data = await response.json()

            if (data.text) {
              console.log("Transcription received:", data.text)
              // Set the transcribed text to the input field
              inputEl.value = data.text

              // Automatically submit the form if we have text
              if (data.text.trim()) {
                sendMessage(data.text)
              }
            } else {
              throw new Error("No transcription text received")
            }
          }
        } catch (err) {
          console.error("Error processing recording:", err)
          alert("Erro ao processar o áudio. Por favor, tente novamente.")
        } finally {
          // Reset UI
          isProcessing = false
          updateMicButtonState()
          inputEl.disabled = false
          sendBtn.disabled = !inputEl.value.trim()
        }
      }

      // Função para reproduzir áudio de uma mensagem
      async function playMessageAudio(messageEl, text) {
        try {
          // If already playing this message, stop it
          if (isPlaying && currentPlayingMessageEl === messageEl) {
            stopAudio()
            return
          }

          // If playing another message, stop it first
          if (isPlaying && currentPlayingMessageEl) {
            stopAudio()
          }

          // Update UI
          messageEl.classList.add("playing-message")
          const playBtn = messageEl.querySelector(".play-btn")
          playBtn.innerHTML = icons.loader
          playBtn.title = "Carregando áudio..."

          // Request text-to-speech
          const response = await fetch(`${BASE}/api/text-to-speech`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: text,
              voice: "nova", // Default voice
            }),
            // Explicitly set mode to cors
            mode: "cors",
            // Don't send credentials for cross-origin requests unless needed
            credentials: "omit",
          })

          if (!response.ok) {
            throw new Error(`Text-to-speech failed with status: ${response.status}`)
          }

          // Get audio blob
          const audioBlob = await response.blob()

          // Create audio element
          const audio = new Audio(URL.createObjectURL(audioBlob))

          // Set up event handlers
          audio.onplay = () => {
            isPlaying = true
            isPaused = false
            playBtn.innerHTML = icons.pause
            playBtn.title = "Pausar áudio"
          }

          audio.onpause = () => {
            isPaused = true
            playBtn.innerHTML = icons.play
            playBtn.title = "Continuar áudio"
          }

          audio.onended = () => {
            stopAudio()
          }

          audio.onerror = () => {
            console.error("Audio playback error")
            stopAudio()
            alert("Erro ao reproduzir áudio. Por favor, tente novamente.")
          }

          // Store references
          currentPlayingMessageEl = messageEl
          currentAudio = audio

          // Start playback
          await audio.play()

          // Set up play/pause toggle
          playBtn.addEventListener("click", () => {
            if (isPaused) {
              audio.play()
            } else {
              audio.pause()
            }
          })
        } catch (err) {
          console.error("Error playing audio:", err)
          stopAudio()
          alert("Erro ao gerar ou reproduzir áudio. Por favor, tente novamente.")
        }
      }

      // Função para parar reprodução de áudio
      function stopAudio() {
        if (currentPlayingMessageEl) {
          // Reset UI
          currentPlayingMessageEl.classList.remove("playing-message")
          const playBtn = currentPlayingMessageEl.querySelector(".play-btn")
          playBtn.innerHTML = icons.volume
          playBtn.title = "Ouvir resposta"

          // Stop audio
          if (currentAudio) {
            currentAudio.pause()
            currentAudio.currentTime = 0
            URL.revokeObjectURL(currentAudio.src)
            currentAudio = null
          }

          // Reset state
          isPlaying = false
          isPaused = false
          currentPlayingMessageEl = null
        }
      }

      // Função para enviar mensagem
      async function sendMessage(text) {
        if (!text.trim() || isLoading) return

        // Adiciona a mensagem do usuário
        addMessage("user", text)

        // Prepara o estado de carregamento
        isLoading = true
        sendBtn.disabled = true
        inputEl.disabled = true
        micBtn.disabled = true

        // Mostra o indicador de digitação
        const typingEl = showTypingIndicator()

        try {
          // Prepara as mensagens para enviar à API
          const apiMessages = messages.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          }))

          console.log(`Enviando mensagem para ${BASE}/api/chat-supabase`)
          console.log("Mensagens:", apiMessages)

          // Chama a API de chat em streaming
          const res = await fetch(`${BASE}/api/chat-supabase`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Adicionar cabeçalhos para CORS se necessário
              Accept: "text/event-stream",
            },
            body: JSON.stringify({
              chatbotId,
              messages: apiMessages,
            }),
            // Habilitar credenciais para CORS se necessário
            credentials: "omit",
          })

          console.log("Status da resposta:", res.status)

          if (!res.ok) {
            throw new Error(`Erro na requisição: ${res.status}`)
          }

          // Processa a resposta em streaming
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let assistantResponse = ""

          // Remove o indicador de digitação
          messagesEl.removeChild(typingEl)

          // Cria um elemento para mostrar a resposta em streaming
          const responseEl = document.createElement("div")
          responseEl.className = "chat-typing"
          messagesEl.appendChild(responseEl)

          // Loop para ler o stream
          while (true) {
            try {
              const { done, value } = await reader.read()

              if (done) {
                console.log("Stream concluído")
                break
              }

              // Decodifica o chunk
              const chunk = decoder.decode(value, { stream: true })
              console.log("Chunk recebido:", chunk)

              // Extrair o texto do formato 0:"texto"
              const textMatches = chunk.match(/\d+:"([^"]*)"/g)

              if (textMatches) {
                textMatches.forEach((match) => {
                  // Extrair apenas o texto entre aspas após o número e os dois pontos
                  const extractedText = match.replace(/\d+:"(.*?)"/, "$1")
                  assistantResponse += extractedText
                })
              }

              // Atualiza o elemento com a resposta parcial
              responseEl.textContent = assistantResponse
              messagesEl.scrollTop = messagesEl.scrollHeight
            } catch (streamError) {
              console.error("Erro ao ler stream:", streamError)
              break
            }
          }

          // Remove o elemento de resposta em streaming
          messagesEl.removeChild(responseEl)

          // Adiciona a resposta completa como uma mensagem
          if (assistantResponse) {
            addMessage("assistant", assistantResponse)

            // Auto-play the response audio if it's not too long
            if (assistantResponse.length < 500) {
              const lastMessageEl = messagesEl.querySelector(".chat-message.assistant:last-child")
              if (lastMessageEl) {
                setTimeout(() => {
                  playMessageAudio(lastMessageEl, assistantResponse)
                }, 500)
              }
            }
          } else {
            addMessage("assistant", "Não foi possível obter uma resposta. Por favor, tente novamente.")
          }
        } catch (error) {
          console.error("Erro ao enviar mensagem:", error)

          // Remove o indicador de digitação se ainda existir
          if (typingEl.parentNode) {
            messagesEl.removeChild(typingEl)
          }

          // Adiciona mensagem de erro
          addMessage("assistant", "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.")
        } finally {
          // Restaura o estado
          isLoading = false
          sendBtn.disabled = false
          inputEl.disabled = false
          micBtn.disabled = false
          updateMicButtonState()
          inputEl.value = ""
          inputEl.focus()
        }
      }

      // Função para limpar recursos ao fechar o widget
      function cleanup() {
        // Libera o stream de áudio em cache se existir
        if (cachedAudioStream) {
          cachedAudioStream.getTracks().forEach((track) => track.stop())
          cachedAudioStream = null
        }

        // Libera o stream de áudio atual se existir
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop())
          audioStream = null
        }

        // Para a reprodução de áudio se estiver tocando
        stopAudio()
      }

      // Event listeners
      bubbleBtn.addEventListener("click", toggleWidget)
      closeBtn.addEventListener("click", () => {
        toggleWidget()
        // Não limpa os recursos ao fechar, apenas ao desmontar
      })
      minimizeBtn.addEventListener("click", toggleMinimize)

      inputForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const text = inputEl.value.trim()
        if (text) {
          sendMessage(text)
        }
      })

      inputEl.addEventListener("input", () => {
        sendBtn.disabled = !inputEl.value.trim() || isLoading
      })

      // Add microphone button event listener
      micBtn.addEventListener("click", () => {
        if (micPermissionState === "denied") {
          alert(
            "O acesso ao microfone foi bloqueado. Por favor, verifique as permissões do navegador e recarregue a página.",
          )
          return
        }

        if (isRecording || isProcessing) {
          stopRecording()
        } else {
          startRecording()
        }
      })

      // Check if browser supports audio recording
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        micBtn.disabled = true
        micBtn.classList.add("disabled")
        micBtn.title = "Gravação de áudio não suportada neste navegador"
      } else {
        // Verifica o status da permissão do microfone quando o widget é inicializado
        checkMicrophonePermission().then(updateMicButtonState)
      }

      // Variables for audio playback
      let currentAudio = null

      // Adiciona mensagem de boas-vindas
      setTimeout(() => {
        addMessage("assistant", "Olá! Como posso ajudar você hoje?")
      }, 500)

      // Adiciona um método para limpar recursos quando o widget for desmontado
      return {
        cleanup,
      }
    },
  }
})(window)
