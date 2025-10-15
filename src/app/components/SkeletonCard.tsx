'use client';

import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-md border border-white/60 mb-4"
    >
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-300 rounded-2xl"></div>
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded"></div>
        </div>
        
        <div className="h-4 sm:h-5 bg-gray-300 rounded mb-2 sm:mb-3 w-3/4"></div>
        
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
            <div className="h-3 sm:h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
            <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}