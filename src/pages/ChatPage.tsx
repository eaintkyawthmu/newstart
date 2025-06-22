import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const ChatPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history from localStorage
    const savedMessages = localStorage.getItem('miniAngelMessages');
    const savedThreadId = localStorage.getItem('miniAngelThreadId');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    }
    
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }

    // Focus input on mount
    inputRef.current?.focus();
    
    // Set up event listeners for clear and export actions
    const handleClearChat = () => clearConversation();
    const handleExportChat = () => exportConversation();
    
    window.addEventListener('clear-chat', handleClearChat);
    window.addEventListener('export-chat', handleExportChat);
    
    return () => {
      window.removeEventListener('clear-chat', handleClearChat);
      window.removeEventListener('export-chat', handleExportChat);
    };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('miniAngelMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const timestamp = new Date();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            message: userMessage,
            language,
            threadId,
          }),
        }
      );

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message, 
        timestamp: new Date() 
      }]);
      
      if (data.threadId && data.threadId !== threadId) {
        setThreadId(data.threadId);
        localStorage.setItem('miniAngelThreadId', data.threadId);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to the server. Please try again in a few moments.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setThreadId(null);
    localStorage.removeItem('miniAngelMessages');
    localStorage.removeItem('miniAngelThreadId');
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Mini Angel'} (${msg.timestamp.toLocaleString()}): ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mini-angel-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const suggestedQuestions = [
    {
      en: "How do I build credit in the U.S.?",
      my: "အမေရိကန်တွင် ခရက်ဒစ်ကို ဘယ်လို တည်ဆောက်မလဲ?"
    },
    {
      en: "What's the difference between W-2 and 1099?",
      my: "W-2 နှင့် 1099 ကွာခြားချက်က ဘာလဲ?"
    },
    {
      en: "How do I open a bank account?",
      my: "ဘဏ်အကောင့် ဘယ်လို ဖွင့်မလဲ?"
    },
    {
      en: "What insurance do I need?",
      my: "ဘယ်အာမခံတွေ လိုအပ်လဲ?"
    }
  ];

  return (
    <div className="pb-16 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {language === 'en' ? 'Mini Angel' : 'Mini Angel'}
        </h1>
        <p className="text-gray-600">
          {language === 'en' ? 'Your AI Financial Guide' : 'သင့် AI ငွေကြေးလမ်းညွှန်'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pt-0">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {language === 'en' ? 'Welcome to Mini Angel!' : 'Mini Angel သို့ ကြိုဆိုပါသည်!'}
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                {language === 'en' 
                  ? 'I\'m here to help you navigate personal finance in the U.S. Ask me anything about banking, credit, taxes, insurance, or any other financial topic.'
                  : 'အမေရိကန်တွင် ကိုယ်ရေးကိုယ်တာ ငွေကြေးကိစ္စများကို လမ်းညွှန်ပေးရန် ကျွန်တော် ဤနေရာတွင် ရှိပါသည်။ ဘဏ်လုပ်ငန်း၊ ခရက်ဒစ်၊ အခွန်၊ အာမခံ သို့မဟုတ် အခြားငွေကြေးဆိုင်ရာ အကြောင်းအရာများအကြောင်း မေးခွန်းများ မေးနိုင်ပါသည်။'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(language === 'en' ? question.en : question.my)}
                    className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm text-gray-700">
                      {language === 'en' ? question.en : question.my}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Mini Angel</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <ReactMarkdown className="prose prose-sm max-w-none [&>*]:text-inherit [&>*]:mb-2 [&>*:last-child]:mb-0">
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Mini Angel</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-gray-600">
                          {language === 'en' ? 'Thinking...' : 'စဉ်းစားနေသည်...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 sticky bottom-0 md:static">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'en' 
                  ? "Ask me about personal finance, banking, credit, taxes..." 
                  : "ကိုယ်ရေးကိုယ်တာ ငွေကြေး၊ ဘဏ်လုပ်ငန်း၊ ခရက်ဒစ်၊ အခွန်အကြောင်း မေးပါ..."}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white rounded-xl px-6 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[52px]"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;