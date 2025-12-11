'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, RotateCcw, Trash2, Moon, Sun } from 'lucide-react';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';
import EventCard from './EventCard';
import ResultCard from './ResultCard';
import ContactCard from './ContactCard';
import InfoCard from './InfoCard';
import SkeletonCard from './SkeletonCard';
import { processQuery, getWelcomeMessage, EventCardData, ResultCardData, ContactCardData, InfoCardData } from '@/utils/intentEngine';
import { analytics } from '@/utils/analytics';
import { useTheme } from '@/utils/themeContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  actions?: { label: string; query: string }[];
  eventCards?: EventCardData[];
  resultCard?: ResultCardData;
  contactCard?: ContactCardData;
  infoCard?: InfoCardData;
  error?: boolean;
}

export default function ChatWindow() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load persisted messages from localStorage
    const savedMessages = localStorage.getItem('asta-chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        return;
      } catch (error) {
        console.warn('Failed to load saved messages:', error);
      }
    }

    // Send welcome message if no saved messages
    setTimeout(() => {
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        text: getWelcomeMessage(),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }, 300);
  }, []);

  // Persist messages to localStorage with limit
  useEffect(() => {
    if (messages.length > 0) {
      // Keep only last 100 messages to prevent localStorage overflow
      const messagesToSave = messages.length > 100 ? messages.slice(-100) : messages;
      localStorage.setItem('asta-chat-messages', JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setConnectionStatus(navigator.onLine ? 'online' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor scroll position for "scroll to bottom" button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 3);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear input
      if (e.key === 'Escape' && inputRef.current) {
        setInputValue('');
        inputRef.current.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    
    if (!textToSend || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Analytics tracking
    analytics.logEvent('message_sent', { 
      messageLength: textToSend.length,
      messageType: messageText ? 'quick_action' : 'user_input'
    });

    // Process query instantly for better UX
    try {
        const { response, actions, eventCards, resultCard, contactCard, infoCard } = processQuery(textToSend);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
          actions: actions,
          eventCards: eventCards,
          resultCard: resultCard,
          contactCard: contactCard,
          infoCard: infoCard,
        };

        setMessages((prev) => [...prev, botMessage]);
        
        analytics.logEvent('query_processed', {
          hasActions: !!actions?.length,
          hasCards: !!(eventCards?.length || resultCard || contactCard || infoCard),
          responseLength: response.length
        });
      } catch (error) {
        console.error('Error processing query:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: connectionStatus === 'offline' 
            ? "You're currently offline. Please check your internet connection and try again."
            : "I'm sorry, something went wrong processing your request. Please try again or contact support.",
          isUser: false,
          timestamp: new Date(),
          error: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
        
        analytics.logEvent('error_occurred', {
          errorType: connectionStatus === 'offline' ? 'offline' : 'processing_error',
          query: textToSend.substring(0, 50) // First 50 chars for debugging
        });
      } finally {
        setIsProcessing(false);
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = (originalQuery: string) => {
    handleSendMessage(originalQuery);
  };

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearConversation = () => {
    localStorage.removeItem('asta-chat-messages');
    setMessages([]);
    setTimeout(() => {
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        text: getWelcomeMessage(),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[100dvh] sm:h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm safe-top"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-apple-blue rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-apple-dark dark:text-white tracking-tight">ASTA'25</h1>
                  
                  {/* Personal Logo - Quantum Superposition */}
                  {mounted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      title="Crafted with precision"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" className="opacity-90 hover:opacity-100 transition-opacity">
                        {/* Top row: ● ● ● */}
                        <circle cx="5" cy="3" r="1.2" fill={theme === 'light' ? '#1D1D1F' : '#FFFFFF'}>
                          <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="0s"/>
                        </circle>
                        <circle cx="10" cy="3" r="1.2" fill={theme === 'light' ? '#1D1D1F' : '#FFFFFF'}>
                          <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="0.3s"/>
                        </circle>
                        <circle cx="15" cy="3" r="1.2" fill={theme === 'light' ? '#1D1D1F' : '#FFFFFF'}>
                          <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="0.6s"/>
                        </circle>
                        
                        {/* Connecting lines from top to center: \|/ */}
                        <line x1="5" y1="4.5" x2="10" y2="9" stroke={theme === 'light' ? '#1D1D1F' : '#FFFFFF'} strokeWidth="0.8" opacity="0.5"/>
                        <line x1="10" y1="4.5" x2="10" y2="9" stroke={theme === 'light' ? '#1D1D1F' : '#FFFFFF'} strokeWidth="0.8" opacity="0.5"/>
                        <line x1="15" y1="4.5" x2="10" y2="9" stroke={theme === 'light' ? '#1D1D1F' : '#FFFFFF'} strokeWidth="0.8" opacity="0.5"/>
                        
                        {/* Center particle: ● */}
                        <circle cx="10" cy="10" r="1.5" fill={theme === 'light' ? '#1D1D1F' : '#FFFFFF'}>
                          <animate attributeName="r" values="1.5;1.8;1.5" dur="3s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        
                        {/* Connecting lines from center to bottom: /|\ */}
                        <line x1="10" y1="11.5" x2="5" y2="15.5" stroke={theme === 'light' ? '#1D1D1F' : '#FFFFFF'} strokeWidth="0.8" opacity="0.5"/>
                        <line x1="10" y1="11.5" x2="10" y2="16" stroke={theme === 'light' ? '#1D1D1F' : '#FFFFFF'} strokeWidth="0.8" opacity="0.5"/>
                        <line x1="10" y1="11.5" x2="15" y2="15.5" stroke={theme === 'light' ? '#1D1D1F' : '#FFFFFF'} strokeWidth="0.8" opacity="0.5"/>
                        
                        {/* Bottom row: ● ● ● */}
                        <circle cx="5" cy="17" r="1.2" fill={theme === 'light' ? '#1D1D1F' : '#FFFFFF'}>
                          <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="1.5s"/>
                        </circle>
                        <circle cx="10" cy="17" r="1.2" fill={theme === 'light' ? '#1D1D1F' : '#FFFFFF'}>
                          <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="1.8s"/>
                        </circle>
                        <circle cx="15" cy="17" r="1.2" fill={theme === 'light' ? '#1D1D1F' : '#FFFFFF'}>
                          <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="2.1s"/>
                        </circle>
                      </svg>
                    </motion.div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Symposium Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/60 hover:bg-white/80 dark:bg-gray-800/60 dark:hover:bg-gray-800/80 rounded-full transition-all border border-white/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-apple-blue/40"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {mounted ? (
                theme === 'light' ? (
                  <Moon className="w-4 h-4 text-apple-dark dark:text-gray-300" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )
              ) : (
                <div className="w-4 h-4" aria-hidden="true" />
              )}
            </motion.button>
            
            {messages.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 hover:bg-white/80 dark:bg-gray-800/60 dark:hover:bg-gray-800/80 rounded-full text-apple-dark dark:text-gray-300 text-xs font-medium transition-all border border-white/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-apple-blue/40"
                aria-label="Start new conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        role="log" 
        aria-live="polite" 
        aria-label="Chat conversation messages"
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-1 scroll-smooth relative"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-apple-dark dark:text-gray-400/50"
            >
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Loading...</p>
            </motion.div>
          </div>
        )}
        
        {messages.map((msg, msgIndex) => (
          <div key={msg.id}>
            {msg.text && (
              <MessageBubble
                message={msg.text}
                isUser={msg.isUser}
              />
            )}
            
            {/* Retry Button for Errors */}
            {msg.error && msgIndex > 0 && (
              <motion.button
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRetry(messages[msgIndex - 1].text)}
                className="ml-0 mb-3 px-4 py-2 bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue rounded-full text-sm font-medium transition-all border border-apple-blue/20 flex items-center gap-2"
                aria-label="Retry last message"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try Again
              </motion.button>
            )}
            
            {/* Event Cards Grid */}
            {msg.eventCards && msg.eventCards.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 mb-4"
              >
                {msg.eventCards.map((card, idx) => (
                  <EventCard
                    key={idx}
                    icon={card.icon}
                    title={card.title}
                    venue={card.venue}
                    time={card.time}
                    color={card.color}
                    onClick={() => {
                      analytics.logEvent('card_clicked', { cardType: 'event', title: card.title });
                      handleSendMessage(card.query);
                    }}
                  />
                ))}
              </motion.div>
            )}
            
            {/* Result Card */}
            {msg.resultCard && (
              <ResultCard
                icon={msg.resultCard.icon}
                title={msg.resultCard.title}
                winner={msg.resultCard.winner}
                runnerUp={msg.resultCard.runnerUp}
                status={msg.resultCard.status}
                color={msg.resultCard.color}
                isPending={msg.resultCard.isPending}
              />
            )}
            
            {/* Contact Card */}
            {msg.contactCard && (
              <ContactCard
                email={msg.contactCard.email}
                website={msg.contactCard.website}
                mobile={msg.contactCard.mobile}
                facultyCoordinators={msg.contactCard.facultyCoordinators}
                studentCoordinators={msg.contactCard.studentCoordinators}
              />
            )}
            
            {/* Info Card */}
            {msg.infoCard && (
              <InfoCard
                title={msg.infoCard.title}
                content={msg.infoCard.content}
                icon={msg.infoCard.icon}
                color={msg.infoCard.color}
                onActionClick={(query) => {
                  analytics.logEvent('card_clicked', { cardType: 'info', query });
                  handleSendMessage(query);
                }}
              />
            )}
            
            {/* Action Buttons */}
            {msg.actions && msg.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-4 ml-0"
              >
                {msg.actions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendMessage(action.query)}
                    className="px-5 py-2.5 bg-white/70 dark:bg-gray-700/90 backdrop-blur-xl text-apple-dark dark:text-gray-100 rounded-full text-sm font-medium hover:bg-white dark:hover:bg-gray-600 hover:shadow-md transition-all border border-white/50 dark:border-gray-600 shadow-sm"
                  >
                    {action.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
            
            {/* Quick Navigation - Always show for bot messages */}
            {!msg.isUser && (
              <QuickActions onActionClick={handleSendMessage} />
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToBottomSmooth}
              className="fixed bottom-24 right-6 w-10 h-10 bg-apple-blue dark:bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-apple-blue/40 z-10"
              aria-label="Scroll to bottom"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-800 shadow-lg safe-bottom"
      >
        <div className="flex gap-2 sm:gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            maxLength={500}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onTouchStart={(e) => {
              // Ensure input is focusable on mobile
              e.currentTarget.focus();
            }}
            placeholder="Ask me anything about the symposium..."
            className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-white dark:bg-gray-800 rounded-full text-apple-dark dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-apple-blue/40 transition-all border border-gray-300 dark:border-gray-700 shadow-sm text-base"
            aria-label="Type your question about the symposium"
            aria-describedby="input-hint"
          />
          <span id="input-hint" className="sr-only">
            Press Enter to send your message, or Escape to clear the input field
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isProcessing}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-apple-blue rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-apple-blue/40 focus:ring-offset-2 focus:ring-offset-white/20"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Footer - Developed by */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4 sm:px-6 py-1.5 border-t border-gray-200 dark:border-gray-800 text-left"
      >
        <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
          Developed by Department of <span className="font-bold text-apple-dark dark:text-gray-300">SHRIRAM M</span> • Selvam College of Technology
        </p>
      </motion.div>
    </motion.div>
  );
}
