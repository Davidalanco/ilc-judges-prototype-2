'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Brief {
  id: string;
  case_id: string;
  content: string;
  status: string;
  version: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export default function BriefViewPage() {
  const params = useParams();
  const briefId = params.briefId as string;
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!briefId) return;

    const fetchBrief = async () => {
      try {
        const response = await fetch(`/api/briefs/${briefId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch brief: ${response.statusText}`);
        }
        const data = await response.json();
        setBrief(data.brief);
      } catch (error) {
        console.error('Error fetching brief:', error);
        setError(error instanceof Error ? error.message : 'Failed to load brief');
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [briefId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brief...</p>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Brief Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested brief could not be found.'}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supreme Court Brief</h1>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>📄 {brief.word_count?.toLocaleString()} words</span>
              <span>🔄 Version {brief.version}</span>
              <span>⏰ {new Date(brief.created_at).toLocaleDateString()}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                {brief.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Supreme Court Brief</title>
                        <style>
                          body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 1in; }
                          h1, h2, h3 { color: #1a1a1a; }
                          .brief-content { white-space: pre-wrap; }
                        </style>
                      </head>
                      <body>
                        <h1>Supreme Court Brief</h1>
                        <div class="brief-content">${brief.content}</div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => {
                const blob = new Blob([brief.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `supreme-court-brief-${briefId}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              💾 Download
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div 
            className="prose max-w-none"
            style={{
              fontFamily: 'Times New Roman, serif',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}
          >
            {brief.content}
          </div>
        </div>
      </div>
    </div>
  );
}
