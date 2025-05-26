;(() => {
  // Função para carregar o script do widget dinamicamente
  function loadScript(url, callback) {
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = url
    script.async = true

    // Evento de carregamento
    if (script.readyState) {
      // IE
      script.onreadystatechange = () => {
        if (script.readyState === "loaded" || script.readyState === "complete") {
          script.onreadystatechange = null
          callback()
        }
      }
    } else {
      // Outros navegadores
      script.onload = callback
    }

    // Adiciona o script ao documento
    document.head.appendChild(script)
  }

  // Função para inicializar os widgets
  function initWidgets(apiBaseUrl) {
    // Encontra todos os containers de chatbot na página
    const containers = document.querySelectorAll("[data-chatbot-id]")

    if (containers.length === 0) {
      console.warn("Nenhum container de chatbot encontrado na página.")
      return
    }

    // Para cada container, inicializa um widget
    containers.forEach((container) => {
      const chatbotId = container.getAttribute("data-chatbot-id")
      if (!chatbotId) {
        console.error("Container de chatbot sem ID válido:", container)
        return
      }

      // Verifica se o objeto ChatWidget está disponível
      if (typeof window.ChatWidget !== "undefined") {
        console.log("Inicializando ChatWidget para chatbot ID:", chatbotId)

        // Inicializa o widget com as configurações
        window.ChatWidget.init({
          chatbotId: chatbotId,
          container: container,
          floating: true,
          position: container.getAttribute("data-position") || "bottom-right",
          apiBaseUrl: apiBaseUrl,
        })
      } else {
        console.error("ChatWidget não está disponível. Verifique se o script foi carregado corretamente.")
      }
    })
  }

  // Determina a URL base a partir do script atual
  function getBaseUrl() {
    // Obtém o script atual (embed.js)
    const scripts = document.getElementsByTagName("script")
    const currentScript = scripts[scripts.length - 1]

    // Extrai a URL base do script atual
    const scriptSrc = currentScript.src
    const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"))

    // Remove '/public' ou qualquer outro caminho final para obter a URL base do site
    return baseUrl.replace(/\/public$/, "")
  }

  // Obtém a URL base
  const apiBaseUrl = getBaseUrl()
  console.log("URL base detectada:", apiBaseUrl)

  // Carrega o script do widget e inicializa quando estiver pronto
  const widgetUrl = `${apiBaseUrl}/chat-widget.js`
  console.log("Carregando script do widget:", widgetUrl)

  loadScript(widgetUrl, () => {
    console.log("Script do widget carregado com sucesso")

    // Verifica se o DOM já está pronto
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(() => initWidgets(apiBaseUrl), 1)
    } else {
      // Caso contrário, aguarda o DOM estar pronto
      document.addEventListener("DOMContentLoaded", () => initWidgets(apiBaseUrl))
    }
  })
})()
