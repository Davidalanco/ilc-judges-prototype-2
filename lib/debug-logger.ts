// Comprehensive Debug Logger for Supreme Legal AI
// This will track ALL API communications, database operations, and file processing

export interface DebugLogEntry {
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' | 'API_CALL' | 'DB_OP' | 'FILE_OP';
  component: string;
  message: string;
  data?: any;
  error?: any;
  duration?: number;
}

class DebugLogger {
  private logs: DebugLogEntry[] = [];
  private isEnabled = process.env.NODE_ENV === 'development';

  log(level: DebugLogEntry['level'], component: string, message: string, data?: any, error?: any, duration?: number) {
    const entry: DebugLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      error,
      duration
    };

    this.logs.push(entry);

    // Console output with different colors for different levels
    if (this.isEnabled) {
      const timestamp = new Date().toLocaleTimeString();
      const color = this.getColorForLevel(level);
      const symbol = this.getSymbolForLevel(level);
      
      console.log(
        `%c${timestamp} ${symbol} [${component}] ${message}`,
        `color: ${color}; font-weight: bold;`,
        data || '',
        error || '',
        duration ? `(${duration}ms)` : ''
      );
    }
  }

  private getColorForLevel(level: DebugLogEntry['level']): string {
    switch (level) {
      case 'INFO': return '#0066cc';
      case 'DEBUG': return '#666666';
      case 'WARN': return '#ff9900';
      case 'ERROR': return '#cc0000';
      case 'API_CALL': return '#00cc66';
      case 'DB_OP': return '#9900cc';
      case 'FILE_OP': return '#cc6600';
      default: return '#000000';
    }
  }

  private getSymbolForLevel(level: DebugLogEntry['level']): string {
    switch (level) {
      case 'INFO': return 'ℹ️';
      case 'DEBUG': return '🔍';
      case 'WARN': return '⚠️';
      case 'ERROR': return '❌';
      case 'API_CALL': return '🌐';
      case 'DB_OP': return '💾';
      case 'FILE_OP': return '📁';
      default: return '•';
    }
  }

  // API Call tracking
  async trackApiCall<T>(
    component: string,
    operation: string,
    apiCall: () => Promise<T>,
    additionalData?: any
  ): Promise<T> {
    const startTime = Date.now();
    
    this.log('API_CALL', component, `Starting: ${operation}`, additionalData);
    
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      
      this.log('API_CALL', component, `Completed: ${operation}`, { result, duration }, undefined, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.log('ERROR', component, `Failed: ${operation}`, additionalData, error, duration);
      
      throw error;
    }
  }

  // Database operation tracking
  async trackDbOp<T>(
    component: string,
    operation: string,
    dbCall: () => Promise<T>,
    additionalData?: any
  ): Promise<T> {
    const startTime = Date.now();
    
    this.log('DB_OP', component, `Starting: ${operation}`, additionalData);
    
    try {
      const result = await dbCall();
      const duration = Date.now() - startTime;
      
      this.log('DB_OP', component, `Completed: ${operation}`, { result, duration }, undefined, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.log('ERROR', component, `Failed: ${operation}`, additionalData, error, duration);
      
      throw error;
    }
  }

  // File operation tracking
  logFileOp(component: string, operation: string, data?: any) {
    this.log('FILE_OP', component, operation, data);
  }

  // Get all logs for debugging
  getAllLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  // Get logs by component
  getLogsByComponent(component: string): DebugLogEntry[] {
    return this.logs.filter(log => log.component === component);
  }

  // Get logs by level
  getLogsByLevel(level: DebugLogEntry['level']): DebugLogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Log summary
  getSummary() {
    const total = this.logs.length;
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byLevel,
      lastLog: this.logs[this.logs.length - 1]
    };
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Convenience functions
export const logInfo = (component: string, message: string, data?: any) => 
  debugLogger.log('INFO', component, message, data);

export const logDebug = (component: string, message: string, data?: any) => 
  debugLogger.log('DEBUG', component, message, data);

export const logWarn = (component: string, message: string, data?: any) => 
  debugLogger.log('WARN', component, message, data);

export const logError = (component: string, message: string, data?: any, error?: any) => 
  debugLogger.log('ERROR', component, message, data, error);

export const logApiCall = (component: string, message: string, data?: any) => 
  debugLogger.log('API_CALL', component, message, data);

export const logDbOp = (component: string, message: string, data?: any) => 
  debugLogger.log('DB_OP', component, message, data);

export const logFileOp = (component: string, message: string, data?: any) => 
  debugLogger.log('FILE_OP', component, message, data);
