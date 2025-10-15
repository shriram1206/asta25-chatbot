// Simple analytics for chatbot usage
export interface AnalyticsEvent {
  type: 'message_sent' | 'query_processed' | 'card_clicked' | 'error_occurred' | 'session_started';
  timestamp: number;
  data?: Record<string, any>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logEvent('session_started');
  }

  logEvent(type: AnalyticsEvent['type'], data?: Record<string, any>) {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data: {
        sessionId: this.sessionId,
        ...data,
      },
    };

    this.events.push(event);
    
    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    // In a real app, you'd send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }

  getStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentEvents = this.events.filter(e => now - e.timestamp < oneHour);

    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      messagesSent: this.events.filter(e => e.type === 'message_sent').length,
      errorsOccurred: this.events.filter(e => e.type === 'error_occurred').length,
      sessionDuration: now - (this.events.find(e => e.type === 'session_started')?.timestamp ?? now),
    };
  }

  exportData() {
    return {
      sessionId: this.sessionId,
      events: this.events,
      stats: this.getStats(),
    };
  }
}

export const analytics = new Analytics();