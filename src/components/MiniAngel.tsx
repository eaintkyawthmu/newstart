import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader } from '../components/navigation';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAccessibility } from './ui/AccessibilityProvider';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const MiniAngel = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { announceMessage } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  // Load threadId from localStorage on component mount
  useEffect(() => {
    const storedThreadId = localStorage.getItem('miniAngelThreadId');
    if (storedThreadId) {
      setThreadId(storedThreadId);
    }
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || 
          `Server responded with status ${response.status}`
        );
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await sleep(delay);
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetchWithRetry(
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
            threadId, // Pass the current threadId
          }),
        }
      );

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      
      // Announce new message to screen readers
      announceMessage(language === 'en' ? 'New message from Mini Angel' : 'Mini Angel မှ စာအသစ်');
      
      // Store the new or existing threadId
      if (data.threadId && data.threadId !== threadId) {
        setThreadId(data.threadId);
        localStorage.setItem('miniAngelThreadId', data.threadId);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to the server. This might be due to network issues. Please try again in a few moments. If the problem persists, you can refresh the page or contact support."
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

  const openFullChat = () => {
    // Save current conversation to localStorage before navigating
    if (messages.length > 0) {
      const messagesWithTimestamp = messages.map(msg => ({
        ...msg,
        timestamp: new Date().toISOString()
      }));
      localStorage.setItem('miniAngelMessages', JSON.stringify(messagesWithTimestamp));
    }
    navigate('/chat');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className={`bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 animate-scale-in ${
          isMinimized 
            ? 'w-80 h-16' 
            : 'w-[90vw] max-w-[400px] h-[70vh] max-h-[600px]'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-angel-title"
        >
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" aria-hidden="true" />
              <span id="mini-angel-title" className="font-medium">Mini Angel</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={openFullChat}
                className="text-white hover:text-gray-200 transition-all duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label="Open full chat"
                title={language === 'en' ? 'Open full chat' : 'စကားပြောမှုအပြည့်အစုံ ဖွင့်ရန်'}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-gray-200 transition-all duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Minimize2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-all duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8 animate-fade-in">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                    <p className="text-sm">
                      {language === 'en' 
                        ? 'Hi! I\'m Mini Angel. Ask me anything about personal finance in the U.S.'
                        : 'မင်္ဂလာပါ! ကျွန်တော် Mini Angel ပါ။ အမေရိကန်တွင် ကိုယ်ရေးကိုယ်တာ ငွေကြေးအကြောင်း မေးခွန်းများ မေးနိုင်ပါသည်။'}
                    </p>
                    <button
                      onClick={openFullChat}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      {language === 'en' ? 'Open full chat' : 'စကားပြောမှုအပြည့်အစုံ ဖွင့်ရန်'}
                    </button>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 transition-all duration-200 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <ReactMarkdown className="prose prose-sm max-w-none [&>*]:text-inherit [&>*]:m-0 [&>*:last-child]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-slide-up">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" aria-hidden="true" />
                      <span className="sr-only">Mini Angel is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200" role="search">
                <div className="flex space-x-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'en' 
                      ? "Ask me about personal finance..." 
                      : "ကိုယ်ရေးကိုယ်တာ ငွေကြေးအကြောင်း မေးပါ..."}
                    className="flex-1 resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                    rows={1}
                    style={{ minHeight: '44px' }}
                    aria-label="Type your question for Mini Angel"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 press-effect"
                    style={{ minHeight: '44px', minWidth: '44px' }}
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center p-3 md:px-6 md:space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[56px] min-w-[56px] hover-lift press-effect animate-bounce-gentle"
          aria-label="Open Mini Angel chat assistant"
        >
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
          <span className="hidden md:block font-medium">Ask Mini Angel 💬</span>
        </button>
      )}
    </div>
  );
};

export default MiniAngel;