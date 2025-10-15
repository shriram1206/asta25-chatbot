'use client';

import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  delay?: number;
}

export default function MessageBubble({ message, isUser, delay = 0 }: MessageBubbleProps) {
  // Parse markdown bold syntax
  const renderMessage = (text: string) => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      role="article"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 sm:px-5 py-3 sm:py-3.5 rounded-3xl shadow-elegant hover-lift focus-within:ring-2 focus-within:ring-apple-blue/30 ${
          isUser
            ? 'bg-apple-blue text-white rounded-br-lg text-right'
            : 'bg-white/90 backdrop-blur-xl text-apple-dark rounded-bl-lg border border-white/70 text-left'
        }`}
      >
        <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-line font-['Inter',system-ui,sans-serif]">
          {renderMessage(message)}
        </p>
      </div>
    </motion.div>
  );
}
