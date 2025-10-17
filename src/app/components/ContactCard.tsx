'use client';

import { motion } from 'framer-motion';
import { Mail, Globe, Phone, User } from 'lucide-react';

interface Coordinator {
  name: string;
  phone: string;
}

interface ContactCardProps {
  email: string;
  website: string;
  mobile: string;
  facultyCoordinators: Coordinator[];
  studentCoordinators: Coordinator[];
}

export default function ContactCard({
  email,
  website,
  mobile,
  facultyCoordinators,
  studentCoordinators,
}: ContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      role="article"
      aria-label="Contact information for ASTA'25 symposium organizers and coordinators"
      className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 mb-4"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold text-apple-dark dark:text-gray-200 tracking-tight mb-2">
          📞 Contact ASTA'25
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Get in touch with our team</p>
      </div>

      {/* Primary Contact */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
            <p className="text-sm font-bold text-apple-dark dark:text-gray-200">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/30">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Website</p>
            <p className="text-sm font-bold text-apple-dark dark:text-gray-200">{website}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Mobile</p>
            <p className="text-sm font-bold text-apple-dark dark:text-gray-200">{mobile}</p>
          </div>
        </div>
      </div>

      {/* Faculty Coordinators */}
      <div className="mb-6">
        <h4 className="text-lg font-extrabold text-apple-dark dark:text-gray-200 mb-3 tracking-tight">
          👨‍🏫 Faculty Coordinators
        </h4>
        <div className="space-y-2">
          {facultyCoordinators.map((coordinator, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-bold text-apple-dark dark:text-gray-200 text-sm">{coordinator.name}</span>
              </div>
              <span className="font-extrabold text-apple-blue dark:text-blue-400 text-sm">{coordinator.phone}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Student Coordinators */}
      <div>
        <h4 className="text-lg font-extrabold text-apple-dark dark:text-gray-200 mb-3 tracking-tight">
          👨‍🎓 Student Coordinators
        </h4>
        <div className="space-y-2">
          {studentCoordinators.map((coordinator, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-bold text-apple-dark dark:text-gray-200 text-sm">{coordinator.name}</span>
              </div>
              <span className="font-extrabold text-apple-blue dark:text-blue-400 text-sm">{coordinator.phone}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
