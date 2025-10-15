'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, ChevronRight } from 'lucide-react';

interface EventCardProps {
  icon: string;
  title: string;
  venue: string;
  time: string;
  color: string;
  onClick: () => void;
}

export default function EventCard({ icon, title, venue, time, color, onClick }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Learn more about ${title} event at ${venue}`}
      className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-md hover:shadow-xl cursor-pointer transition-all border border-gray-200 group focus:outline-none focus:ring-2 focus:ring-apple-blue/40 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-md`} aria-hidden="true">
          {icon}
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-apple-blue group-hover:translate-x-1 group-focus:text-apple-blue group-focus:translate-x-1 transition-all" aria-hidden="true" />
      </div>
      
      <h3 className="text-apple-dark font-bold text-base sm:text-lg mb-2 sm:mb-3 tracking-tight">{title}</h3>
      
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
          <span className="line-clamp-1 font-medium">{venue}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium">{time}</span>
        </div>
      </div>
    </motion.div>
  );
}
