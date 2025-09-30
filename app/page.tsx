'use client';

import { useState } from 'react';
import { Upload, FileText, Brain, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import Navigation from './components/Navigation';

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
    <>
      <Navigation />
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
          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">1. Audio Upload</h3>
              <p className="text-sm text-gray-600 mt-2">
                Upload strategy discussion with speaker identification
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">2. Case Details</h3>
              <p className="text-sm text-gray-600 mt-2">
                Constitutional questions and court information
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">3. Judge Analysis</h3>
              <p className="text-sm text-gray-600 mt-2">
                Psychological profiles and persuasion strategies
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">4. Research</h3>
              <p className="text-sm text-gray-600 mt-2">
                Historical context and precedent analysis
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">5. Brief Creation</h3>
              <p className="text-sm text-gray-600 mt-2">
                AI-generated brief with final review
              </p>
            </div>
          </div>

          {/* Two Application Options */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Path</h3>
              <p className="text-gray-600">Two powerful tools for different needs</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Working Tool */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
                <div className="text-center mb-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">📝 Brief Creation Workflow</h4>
                  <p className="text-gray-600">The actual working tool for attorneys</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    11-step guided workflow process
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Real case data (Miller v. McDonald)
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Interactive brief editing & section management
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Voice input & AI content generation
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Constitutional analysis & shepardizing
                  </div>
                </div>
                
                <a
                  href="/workflow"
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center block"
                >
                  Start Working Tool →
                </a>
              </div>

              {/* Demo/Showcase Platform */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
                <div className="text-center mb-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">🎯 Platform Showcase</h4>
                  <p className="text-gray-600">Explore features & capabilities</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    Justice psychological profiles
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    Sample case analyses & examples
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    Strategy workshop tools preview
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    Risk assessment demonstrations
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    Real case analysis results
                  </div>
                </div>
                
                <a
                  href="/analysis/amish-vaccination-case"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center block"
                >
                  Explore Platform →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Form - Demo Platform */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🎯 Platform Showcase Demo</h3>
            <p className="text-gray-600">Try the file upload experience (demo version)</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <h4 className="text-xl font-bold text-gray-900 mb-6">
              Upload Case for Demo Analysis
            </h4>

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
    </>
  );
} 