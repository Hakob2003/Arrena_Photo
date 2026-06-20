"use client";
import React, { useState, useRef, useEffect } from 'react';

export function ChatTest() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setError(null);
    
    // Add a placeholder for assistant's response
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      // In a real app, you would pass the JWT token in Authorization header
      // For SSE with headers, fetch is used to read the stream manually
      const token = localStorage.getItem('token') || '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
      const response = await fetch(`${apiUrl}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: newMessages,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let assistantMessage = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const dataStr = line.substring(6);
                const data = JSON.parse(dataStr);
                
                if (data.done) {
                  done = true;
                  break;
                }
                
                if (data.chunk) {
                  assistantMessage += data.chunk;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = assistantMessage;
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore parse errors for incomplete JSON
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-[#0A0A0A]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-black/[0.05] dark:bg-white/10 text-gray-200'}`}>
              <pre className="whitespace-pre-wrap font-sans text-sm">{m.content}</pre>
            </div>
          </div>
        ))}
        {error && (
          <div className="text-red-400 text-sm text-center my-2 p-2 bg-red-400/10 rounded">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-black/10 dark:border-white/10 bg-[#fafafa] dark:bg-black/50">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isStreaming}
            placeholder="Type a message to test the AI..."
            className="flex-1 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-3 py-2 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
          />
          <button 
            onClick={handleSend} 
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {isStreaming ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
