'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, RotateCcw, Trash2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import EventCard from './EventCard';
import ResultCard from './ResultCard';
import ContactCard from './ContactCard';
import InfoCard from './InfoCard';
import SkeletonCard from './SkeletonCard';
import { processQuery, getWelcomeMessage, EventCardData, ResultCardData, ContactCardData, InfoCardData } from '@/utils/intentEngine';
import { analytics } from '@/utils/analytics';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('asta-chat-messages', JSON.stringify(messages));
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
    setIsTyping(true);

    // Analytics tracking
    analytics.logEvent('message_sent', { 
      messageLength: textToSend.length,
      messageType: messageText ? 'quick_action' : 'user_input'
    });

    // Process query with realistic delay based on query complexity
    const processingDelay = textToSend.length > 50 ? 600 : textToSend.length > 20 ? 400 : 200;
    
    setTimeout(() => {
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
        setIsTyping(false);
        setIsProcessing(false);
      }
    }, processingDelay);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
      className="w-full h-[100dvh] sm:h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shadow-sm safe-top"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-apple-blue rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-apple-dark tracking-tight">ASTA'25</h1>
              <p className="text-xs sm:text-sm text-apple-dark/70 font-medium">Symposium Assistant</p>
            </div>
          </div>
          
          {messages.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded-full text-apple-dark text-xs font-medium transition-all border border-white/50 focus:outline-none focus:ring-2 focus:ring-apple-blue/40"
              aria-label="Start new conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-1 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-apple-dark/50"
            >
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Loading...</p>
            </motion.div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.text && (
              <MessageBubble
                message={msg.text}
                isUser={msg.isUser}
              />
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
                    className="px-5 py-2.5 bg-white/70 backdrop-blur-xl text-apple-dark rounded-full text-sm font-medium hover:bg-white hover:shadow-md transition-all border border-white/50 shadow-sm"
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
        
        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 shadow-lg safe-bottom"
      >
        <div className="flex gap-2 sm:gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
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
            className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-white rounded-full text-apple-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue/40 focus:bg-white transition-all border border-gray-300 shadow-sm text-base"
            aria-label="Type your question about the symposium"
          />
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
        className="bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-1.5 border-t border-gray-200 text-left"
      >
        <p className="text-[10px] sm:text-xs text-gray-600 font-medium">
          Developed by Department of <span className="font-bold text-apple-black">CSE</span> • Selvam College of Technology
        </p>
      </motion.div>
    </motion.div>
  );
}
