'use client';

import { motion } from 'framer-motion';
import { Calendar, Trophy, HelpCircle, MapPin, Info } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (query: string) => void;
}

const actions = [
  { icon: Calendar, label: 'Schedule', query: 'show schedule' },
  { icon: MapPin, label: 'Events', query: 'what events are happening' },
  { icon: Trophy, label: 'Results', query: 'show results' },
  { icon: Info, label: 'About', query: 'about asta25' },
  { icon: HelpCircle, label: 'Contact', query: 'contact' },
];

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex gap-2 sm:gap-3 flex-wrap justify-center mb-4"
      role="group"
      aria-label="Quick actions to get started"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          onClick={() => onActionClick(action.query)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onActionClick(action.query);
            }
          }}
          aria-label={`Ask about ${action.label.toLowerCase()}`}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 bg-white/80 dark:bg-gray-700/90 backdrop-blur-xl rounded-full text-apple-dark dark:text-gray-100 text-xs sm:text-sm font-medium hover:bg-white dark:hover:bg-gray-600 hover:shadow-md transition-all border border-white/60 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/40 focus:ring-offset-2 focus:ring-offset-transparent min-h-[44px] whitespace-nowrap"
        >
          <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
          <span>{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
