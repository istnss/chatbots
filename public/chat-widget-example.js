// Este é um exemplo de como seria o chat-widget.js
// Na implementação real, este arquivo conteria o código React compilado do widget

;((window) => {
  // Namespace para o widget
  window.ChatWidget = {
    // Função de inicialização
    init: (config) => {
      const { chatbotId, container, floating, position } = config

      console.log(`Inicializando ChatWidget para chatbot ID: ${chatbotId}`)
      console.log(`Configuração: floating=${floating}, position=${position}`)

      // Aqui você criaria e renderizaria o componente React do chat
      // Exemplo simplificado:
      const chatElement = document.createElement("div")
      chatElement.className = "chat-widget"
      chatElement.innerHTML = `
        <div class="chat-header">
          <span>Chat com IA</span>
          <button class="close-btn">×</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
          <input type="text" placeholder="Digite sua mensagem...">
          <button>Enviar</button>
        </div>
      `

      // Adiciona estilos básicos
      chatElement.style.position = floating ? "absolute" : "relative"
      chatElement.style.bottom = "0"
      chatElement.style.right = position === "bottom-right" ? "0" : "auto"
      chatElement.style.left = position === "bottom-left" ? "0" : "auto"
      chatElement.style.width = "300px"
      chatElement.style.height = "400px"
      chatElement.style.backgroundColor = "#fff"
      chatElement.style.border = "1px solid #ddd"
      chatElement.style.borderRadius = "8px"
      chatElement.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)"
      chatElement.style.display = "flex"
      chatElement.style.flexDirection = "column"

      // Adiciona o elemento ao container
      container.appendChild(chatElement)

      // Na implementação real, você conectaria à API de chat
      console.log(`Widget inicializado para chatbot ID: ${chatbotId}`)
    },
  }
})(window)
