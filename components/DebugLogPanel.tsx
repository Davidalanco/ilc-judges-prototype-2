'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Copy, Trash2, Download } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'api' | 'warning';
  category: string;
  message: string;
  data?: any;
}

interface DebugLogPanelProps {
  className?: string;
}

// Global log store
let globalLogs: LogEntry[] = [];
let logListeners: ((logs: LogEntry[]) => void)[] = [];

// Global logging functions
export const debugLog = {
  info: (category: string, message: string, data?: any) => {
    addLog('info', category, message, data);
  },
  success: (category: string, message: string, data?: any) => {
    addLog('success', category, message, data);
  },
  error: (category: string, message: string, data?: any) => {
    addLog('error', category, message, data);
  },
  api: (category: string, message: string, data?: any) => {
    addLog('api', category, message, data);
  },
  warning: (category: string, message: string, data?: any) => {
    addLog('warning', category, message, data);
  },
  clear: () => {
    globalLogs = [];
    logListeners.forEach(listener => listener([]));
  }
};

function addLog(type: LogEntry['type'], category: string, message: string, data?: any) {
  const logEntry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    category,
    message,
    data
  };
  
  globalLogs.push(logEntry);
  
  // Keep only last 500 logs to prevent memory issues
  if (globalLogs.length > 500) {
    globalLogs = globalLogs.slice(-500);
  }
  
  // Notify all listeners
  logListeners.forEach(listener => listener([...globalLogs]));
}

export default function DebugLogPanel({ className = '' }: DebugLogPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Add this component as a listener
    const updateLogs = (newLogs: LogEntry[]) => {
      setLogs(newLogs);
      if (autoScroll && logContainerRef.current) {
        setTimeout(() => {
          logContainerRef.current?.scrollTo({
            top: logContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    };
    
    logListeners.push(updateLogs);
    setLogs([...globalLogs]);
    
    return () => {
      logListeners = logListeners.filter(listener => listener !== updateLogs);
    };
  }, [autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'api': return '🌐';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'api': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const copyLogs = async () => {
    const logText = filteredLogs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleTimeString();
      let text = `[${timestamp}] ${getLogIcon(log.type)} ${log.category}: ${log.message}`;
      if (log.data) {
        text += `\nData: ${JSON.stringify(log.data, null, 2)}`;
      }
      return text;
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(logText);
      debugLog.success('Debug Panel', 'Logs copied to clipboard!');
    } catch (err) {
      debugLog.error('Debug Panel', 'Failed to copy logs', err);
    }
  };

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      let text = `[${timestamp}] ${log.type.toUpperCase()} ${log.category}: ${log.message}`;
      if (log.data) {
        text += `\nData: ${JSON.stringify(log.data, null, 2)}`;
      }
      return text;
    }).join('\n\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    debugLog.success('Debug Panel', 'Logs downloaded!');
  };

  return (
    <>
      {/* Toggle Button */}
      <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-200 flex items-center gap-2"
          title={isOpen ? 'Close Debug Panel' : 'Open Debug Panel'}
        >
          {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="text-sm font-medium">Debug</span>
          {logs.length > 0 && (
            <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {logs.length}
            </span>
          )}
        </button>
      </div>

      {/* Debug Panel */}
      <div className={`fixed right-0 top-0 h-full bg-white shadow-xl border-l border-gray-200 transition-transform duration-300 z-40 ${
        isOpen ? 'transform translate-x-0' : 'transform translate-x-full'
      }`} style={{ width: '600px' }}>
        
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Debug Logs</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={copyLogs}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                title="Copy all logs"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={downloadLogs}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                title="Download logs"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={debugLog.clear}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                title="Clear logs"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Filter:</span>
            {['all', 'info', 'success', 'error', 'api', 'warning'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2 py-1 rounded capitalize ${
                  filter === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type} {type !== 'all' && `(${logs.filter(l => l.type === type).length})`}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
            <span className="text-xs text-gray-500">
              Total: {logs.length} | Showing: {filteredLogs.length}
            </span>
          </div>
        </div>

        {/* Logs Container */}
        <div 
          ref={logContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2" 
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No logs yet...</p>
              <p className="text-sm">Start using the application to see debug information here.</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border-l-4 ${getLogColor(log.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLogIcon(log.type)}</span>
                    <span className="font-medium text-sm">{log.category}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm">{log.message}</p>
                {log.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      View Data
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
