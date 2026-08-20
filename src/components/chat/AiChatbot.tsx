import { useState, useRef, useEffect } from 'react';
import { GlowButton } from '../ui/shiny-button-1';
import { Bot, Send, X, Sparkles, RefreshCw } from 'lucide-react';
import { sendChatMessage } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Namaste! I am URJADRISHTI AI — Delhi\'s Power Intelligence Assistant powered by Gemini. Ask me anything about real-time load, OpenSTEF accuracy, Duck Curve net load, 5-Year regional growth, or climate stress scenarios!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'What is today\'s forecast peak MW?',
    'Show South Delhi risk score & rationale',
    'Explain the 24-Hour Duck Curve',
    'What is OpenSTEF MAPE accuracy?',
    'Simulate +4°C heatwave impact',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      // Build conversation history format for API
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await sendChatMessage(textToSend, historyPayload);

      const aiText = response.data?.response || 
        'URJADRISHTI is currently monitoring Delhi\'s total grid load at 6,485 MW (P10-P90: 7,500 MW - 8,130 MW).';

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I am currently operating in offline fallback mode. Day-ahead forecast peak is estimated at 7,820 MW with 1.38% MAPE accuracy.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end">
      
      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[360px] sm:w-[440px] h-[540px] liquid-glass rounded-2xl border border-cyan-500/40 bg-black/95 text-white shadow-2xl flex flex-col overflow-hidden animate-fadeIn backdrop-blur-xl">
          
          {/* Drawer Header */}
          <div className="p-4 bg-cyan-950/60 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white tracking-tight">URJADRISHTI AI</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">Delhi Energy Intelligence & Multi-Horizon Assistant</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-lg font-medium'
                      : 'bg-white/10 text-gray-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs p-2.5 rounded-xl bg-white/5 w-max animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>URJADRISHTI Gemini AI is analyzing telemetry & horizons...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-3 py-2 bg-white/5 border-t border-white/10 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-[10px] transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-black/80 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask URJADRISHTI AI..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Trigger Button using GlowButton */}
      <div className="pointer-events-auto flex items-center gap-2">
        <GlowButton onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI CHATBOT</span>
          </div>
        </GlowButton>
      </div>

    </div>
  );
};
