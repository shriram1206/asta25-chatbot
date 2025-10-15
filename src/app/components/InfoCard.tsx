'use client';

import { motion } from 'framer-motion';
import { Info, MapPin, Clock, Users, Phone } from 'lucide-react';

interface InfoCardProps {
  title?: string;
  content: string;
  icon?: string;
  color?: string;
  onActionClick?: (query: string) => void;
}

export default function InfoCard({ title, content, icon = '💡', color = 'from-blue-500 to-blue-600', onActionClick }: InfoCardProps) {
  
  // Generate relevant quick actions based on the content
  const getQuickActions = () => {
    const actions = [];
    
    if (title?.includes('Web Forge') || content.includes('Web Forge')) {
      actions.push(
        { icon: MapPin, label: 'View All Events', query: 'show all events' },
        { icon: Users, label: 'Registration Info', query: 'how to register' }
      );
    } else if (title?.includes('Decode') || content.includes('Decode')) {
      actions.push(
        { icon: MapPin, label: 'Other Tech Events', query: 'show technical events' },
        { icon: Clock, label: 'Event Schedule', query: 'show schedule' }
      );
    } else if (title?.includes('Vibecon') || content.includes('Vibecon')) {
      actions.push(
        { icon: MapPin, label: 'All Locations', query: 'show event locations' },
        { icon: Users, label: 'Contact Info', query: 'contact details' }
      );
    } else if (title?.includes('Paper') || content.includes('Paper')) {
      actions.push(
        { icon: Clock, label: 'Submission Guidelines', query: 'paper submission rules' },
        { icon: Phone, label: 'Contact Organizers', query: 'contact' }
      );
    } else if (title?.includes('Map') || content.includes('Map')) {
      actions.push(
        { icon: MapPin, label: 'Other Fun Events', query: 'show non-technical events' },
        { icon: Users, label: 'Team Registration', query: 'team registration' }
      );
    } else if (title?.includes('AI') || content.includes('AI')) {
      actions.push(
        { icon: MapPin, label: 'Creative Events', query: 'show creative events' },
        { icon: Clock, label: 'Workshop Details', query: 'workshop information' }
      );
    } else if (title?.includes('Meme') || content.includes('Meme')) {
      actions.push(
        { icon: MapPin, label: 'Fun Activities', query: 'fun activities' },
        { icon: Users, label: 'Registration', query: 'registration' }
      );
    } else {
      // Default actions
      actions.push(
        { icon: MapPin, label: 'All Events', query: 'show all events' },
        { icon: Phone, label: 'Contact Us', query: 'contact' }
      );
    }
    
    return actions;
  };
  // Enhanced content formatting with better venue highlighting
  const formatContent = (text: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, idx) => {
      // Check if paragraph has bullets
      if (paragraph.includes('•') || paragraph.includes('▪')) {
        const lines = paragraph.split('\n').filter(line => line.trim());
        return (
          <ul key={idx} className="space-y-2 mb-4">
            {lines.map((line, lineIdx) => {
              const cleanLine = line.replace(/^[•▪]\s*/, '').trim();
              if (!cleanLine) return null;
              
              // Parse markdown bold syntax
              const renderText = (text: string) => {
                const parts = text.split(/\*\*(.+?)\*\*/g);
                return parts.map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="font-bold text-apple-dark">{part}</strong> : part
                );
              };
              
              return (
                <li key={lineIdx} className="flex items-start gap-2">
                  <span className="text-apple-blue mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-[15px] leading-relaxed">
                    {renderText(cleanLine)}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Regular paragraph with bold support
      const renderText = (text: string) => {
        const parts = text.split(/\*\*(.+?)\*\*/g);
        return parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="font-bold text-apple-dark">{part}</strong> : part
        );
      };
      
      return (
        <p key={idx} className="text-gray-700 font-medium text-sm sm:text-[15px] leading-relaxed mb-3">
          {renderText(paragraph)}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200 mb-4"
    >
      {/* Header with icon */}
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
            {icon}
          </div>
          <h3 className="text-xl font-extrabold text-apple-dark tracking-tight flex-1">
            {title}
          </h3>
        </div>
      )}

      {/* Content */}
      <div className="space-y-2 mb-6">
        {formatContent(content)}
      </div>

      {/* Quick Navigation Actions */}
      {onActionClick && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {getQuickActions().map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onActionClick(action.query)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/70 hover:bg-white backdrop-blur-xl rounded-full text-apple-dark text-sm font-medium transition-all border border-white/60 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-apple-blue/40"
                aria-label={`Ask about ${action.label.toLowerCase()}`}
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
