// hooks/useChat.ts
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatProps {
  api: string;
  id: string;
  body: { chatbotId: string };
}

export function useChat({ api, id, body }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
  },
      body: JSON.stringify({ messages: newMessages, model:id }),
    });

    if (!response.ok || !response.body) {
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      assistantMessage += decoder.decode(value);
      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    }
    setLoading(false);
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    loading,
    setMessages
  };
}
