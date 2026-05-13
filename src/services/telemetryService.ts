type TelemetryType = 'click' | 'navigation' | 'error' | 'performance' | 'security';

interface TelemetryEvent {
  type: TelemetryType;
  action: string;
  metadata?: any;
  timestamp: string;
  url: string;
  userId?: string;
  sessionId: string;
}

const SESSION_ID = Math.random().toString(36).substring(7);

export const TelemetryService = {
  log: (type: TelemetryType, action: string, metadata?: any) => {
    const event: TelemetryEvent = {
       type,
       action,
       metadata,
       timestamp: new Date().toISOString(),
       url: window.location.href,
       sessionId: SESSION_ID,
       userId: localStorage.getItem('gula_user_id') || undefined
    };

    console.log(`[GULA TELEMETRY] ${type.toUpperCase()}: ${action}`, metadata);
    
    // Store locally for audit replay system later
    try {
      const logs = JSON.parse(localStorage.getItem('gula_telemetry_logs') || '[]');
      logs.push(event);
      // Keep last 1000 events
      localStorage.setItem('gula_telemetry_logs', JSON.stringify(logs.slice(-1000)));
    } catch (e) {
      console.error('Failed to store telemetry', e);
    }
  },

  trackClick: (label: string, component: string) => {
    TelemetryService.log('click', label, { component });
  },

  trackPerformance: (metric: string, value: number) => {
    TelemetryService.log('performance', metric, { value });
  }
};
