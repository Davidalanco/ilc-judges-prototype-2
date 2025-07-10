'use client';

import { useState } from 'react';
import { Upload, FileText, Brain, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caseName, setCaseName] = useState('');
  const [caseType, setCaseType] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle file upload and processing
    console.log('Submitting:', { file, caseName, caseType, deadline });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transform Your Legal Strategy into Winning Briefs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload your attorney discussion, and our AI will analyze your strategy, 
              profile the justices, and help you craft a persuasive Supreme Court brief 
              in hours, not weeks.
            </p>
          </div>

          {/* Process Steps */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Upload Discussion</h3>
              <p className="text-sm text-gray-600 mt-2">
                Audio, video, or transcript of your strategy session
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Analysis</h3>
              <p className="text-sm text-gray-600 mt-2">
                Extract key issues and justice-specific strategies
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Draft Brief</h3>
              <p className="text-sm text-gray-600 mt-2">
                AI-powered writing with real-time persuasion scoring
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Opposition Intel</h3>
              <p className="text-sm text-gray-600 mt-2">
                Predict and prepare for counter-arguments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Start Your Brief
            </h3>

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Upload Attorney Strategy Session
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".mp3,.wav,.m4a,.mp4,.mov,.txt,.pdf"
                  className="hidden"
                  id="file-upload"
                />
                
                {file ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-gray-900 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your file here, or{' '}
                      <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                        browse
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: Audio (.mp3, .wav, .m4a), Video (.mp4, .mov), Text (.txt, .pdf)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Case Details */}
            <div className="space-y-6">
              <div>
                <label htmlFor="caseName" className="block text-sm font-medium text-gray-700 mb-2">
                  Case Name
                </label>
                <input
                  type="text"
                  id="caseName"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Religious Liberty Coalition v. State"
                  required
                />
              </div>

              <div>
                <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-2">
                  Case Type
                </label>
                <select
                  id="caseType"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select case type</option>
                  <option value="religious-liberty">Religious Liberty</option>
                  <option value="free-speech">Free Speech</option>
                  <option value="due-process">Due Process</option>
                  <option value="equal-protection">Equal Protection</option>
                  <option value="administrative">Administrative Law</option>
                  <option value="other">Other Constitutional Issue</option>
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Filing Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={!file || !caseName || !caseType || !deadline}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                Start AI Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">Trusted by constitutional lawyers nationwide</p>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">3.2 hrs</p>
                <p className="text-sm text-gray-600">Avg. Brief Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">127+</p>
                <p className="text-sm text-gray-600">Briefs Filed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 