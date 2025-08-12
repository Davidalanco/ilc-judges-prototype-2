'use client';

import { useState } from 'react';
import FileUpload from '@/app/components/FileUpload';

export default function TestTranscriptionPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUploadComplete = (fileData: any) => {
    console.log('📋 FileUpload completed with data:', fileData);
    fetchLogs();
  };

  const handleFileUploadError = (error: string) => {
    console.error('❌ FileUpload error:', error);
    fetchLogs();
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/debug-logs');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/debug-logs', { method: 'DELETE' });
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Transcription Test & Debug</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Test Transcription</h2>
        <p className="text-blue-700">
          Upload an audio file to test the transcription process and see comprehensive debug logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">📁 File Upload</h3>
          <FileUpload
            onUploadComplete={handleFileUploadComplete}
            onUploadError={handleFileUploadError}
            acceptedTypes=".mp3,.wav,.m4a,.mp4,.mov,.webm"
            maxSizeMB={50}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📊 Debug Logs</h3>
            <div className="space-x-2">
              <button
                onClick={fetchLogs}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Refresh
              </button>
              <button
                onClick={clearLogs}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center">No logs yet. Upload a file to see debug information.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="bg-white rounded p-2 text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                        log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'INFO' ? 'bg-blue-100 text-blue-800' :
                        log.level === 'API_CALL' ? 'bg-green-100 text-green-800' :
                        log.level === 'DB_OP' ? 'bg-purple-100 text-purple-800' :
                        log.level === 'FILE_OP' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-gray-600">{log.timestamp}</span>
                      <span className="text-gray-800 font-semibold">[{log.component}]</span>
                    </div>
                    <div className="text-gray-900">{log.message}</div>
                    {log.data && (
                      <div className="text-gray-700 mt-1">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.data, null, 2)}</pre>
                      </div>
                    )}
                    {log.error && (
                      <div className="text-red-700 mt-1">
                        <strong>Error:</strong> {log.error}
                      </div>
                    )}
                    {log.duration && (
                      <div className="text-gray-600 mt-1">
                        Duration: {log.duration}ms
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
