'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Clock } from 'lucide-react';

interface ResultCardProps {
  icon: string;
  title: string;
  winner: string;
  runnerUp?: string;
  status: string;
  color: string;
  isPending?: boolean;
}

export default function ResultCard({ icon, title, winner, runnerUp, status, color, isPending }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      role="article"
      aria-label={`Results for ${title}: ${isPending ? 'Pending' : `Winner is ${winner}`}`}
      className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 mb-4"
    >
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-3xl shadow-md`} aria-hidden="true">
          <span className="emoji-font">{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-apple-dark dark:text-gray-200 font-bold text-xl tracking-tight">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">{status}</p>
        </div>
      </div>
      
      {isPending ? (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-700">
          <Clock className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300 font-bold text-base">Results Coming Soon</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 font-medium">Stay tuned for updates!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-700 dark:text-yellow-300 font-bold text-sm uppercase tracking-wide">Winner</span>
            </div>
            <p className="text-apple-dark dark:text-gray-100 font-extrabold text-lg ml-7 tracking-tight">{winner}</p>
          </div>
          
          {runnerUp && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-700 dark:text-gray-200 font-bold text-sm uppercase tracking-wide">Runner-up</span>
              </div>
              <p className="text-apple-dark dark:text-gray-100 font-extrabold text-lg ml-7 tracking-tight">{runnerUp}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
