'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-64 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-elegant p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-apple-dark mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            The chatbot encountered an unexpected error. Don't worry, this doesn't affect your data.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-apple-blue text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-apple-blue/40 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}