'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AIBriefPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">AI Brief Builder</h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 30% */}
        <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Left panel content goes here */}
            <div className="space-y-4">
              {Array.from({ length: 50 }, (_, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">Left Panel Item {i + 1}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This is some content in the left panel that will help test scrolling.
                    The panel should scroll independently from the right panel.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - 70% */}
        <div className="w-[70%] bg-white flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Right panel content goes here */}
            <div className="space-y-4">
              {Array.from({ length: 50 }, (_, i) => (
                <div key={i} className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Right Panel Item {i + 1}</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This is content in the right panel. It should scroll independently
                    and not be affected by the left panel's scroll position.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
