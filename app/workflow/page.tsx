'use client';

import { useState } from 'react';
import { Play, CheckCircle, Clock, FileText, Upload, BookOpen, Search, Gavel, Brain, ChevronRight, Database } from 'lucide-react';
import FileUpload from '@/app/components/FileUpload';
import CitationResearch from '@/app/components/CitationResearch';
import TranscriptionManager from '@/app/components/TranscriptionManager';

export default function WorkflowPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('workflow'); // New state for tab management
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [documentSummaries, setDocumentSummaries] = useState<any[]>([]);

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
    if (stepNumber < steps.length) {
      setCurrentStep(stepNumber + 1);
    }
  };

  const handleFileUploadComplete = (fileData: any) => {
    setUploadedFileData(fileData);
    handleStepComplete(1);
  };

  const steps = [
    {
      id: 1,
      title: "Strategic Discussion Audio Upload",
      description: "Upload audio recordings of attorney strategy sessions",
      icon: Upload,
      status: completedSteps.includes(1) ? 'completed' : currentStep === 1 ? 'current' : 'pending'
    },
    {
      id: 2,
      title: "Case Information Input",
      description: "Provide case details and constitutional questions",
      icon: FileText,
      status: completedSteps.includes(2) ? 'completed' : currentStep === 2 ? 'current' : 'pending'
    },
    {
      id: 3,
      title: "Legal Research & Precedent Analysis",
      description: "AI-powered analysis of relevant case law and precedents",
      icon: Search,
      status: completedSteps.includes(3) ? 'completed' : currentStep === 3 ? 'current' : 'pending'
    },
    {
      id: 4,
      title: "Constitutional Framework Development",
      description: "Develop constitutional arguments and framework",
      icon: BookOpen,
      status: completedSteps.includes(4) ? 'completed' : currentStep === 4 ? 'current' : 'pending'
    },
    {
      id: 5,
      title: "Brief Generation & Review",
      description: "AI-assisted brief writing with attorney review",
      icon: Gavel,
      status: completedSteps.includes(5) ? 'completed' : currentStep === 5 ? 'current' : 'pending'
    },
    {
      id: 6,
      title: "Final Review & Submission Prep",
      description: "Final review and preparation for court submission",
      icon: CheckCircle,
      status: completedSteps.includes(6) ? 'completed' : currentStep === 6 ? 'current' : 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Supreme Court Brief Writing Tool</h1>
            <p className="mt-2 text-gray-600">AI-powered legal brief generation for constitutional cases</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Workflow</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('transcriptions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transcriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Saved Transcriptions</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'workflow' ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step.status === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step.status === 'current'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 ml-2 ${
                        completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {steps.map((step) => (
                <div key={step.id} className={step.status === 'current' ? 'block' : 'hidden'}>
                  <div className="flex items-center mb-6">
                    <step.icon className={`w-8 h-8 mr-4 ${
                      step.status === 'completed' ? 'text-green-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>

                  {/* Step 1: Audio Upload */}
                  {step.id === 1 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Upload Attorney Strategy Session</h3>
                        <p className="text-blue-700 text-sm">
                          Upload audio recordings of your legal team's strategy discussions. Our AI will transcribe 
                          and identify key constitutional arguments, precedents, and strategic approaches.
                        </p>
                      </div>

                      <FileUpload 
                        onUploadComplete={handleFileUploadComplete}
                        accept="audio/*"
                        maxSize={1024 * 1024 * 1024} // 1GB
                      />

                      {uploadedFileData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-2">✓ Transcription Complete</h4>
                          <div className="text-sm text-green-700 space-y-1">
                            <p><strong>File:</strong> {uploadedFileData.fileName}</p>
                            <p><strong>Duration:</strong> {uploadedFileData.duration}</p>
                            <p><strong>Language:</strong> {uploadedFileData.language}</p>
                            <p><strong>Speakers Identified:</strong> {uploadedFileData.speakerCount}</p>
                            {uploadedFileData.saved && (
                              <p><strong>Saved to Database:</strong> ✓ Yes</p>
                            )}
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => handleStepComplete(1)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Continue to Step 2 <ChevronRight className="w-4 h-4 ml-1 inline" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Case Information */}
                  {step.id === 2 && (
                    <div className="space-y-6">
                      {/* Basic Case Information (existing) */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Basic Case Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Case Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Miller v. McDonald"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Court Level</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                              <option>Supreme Court</option>
                              <option>Circuit Court</option>
                              <option>District Court</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Constitutional Question</label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                              placeholder="State the constitutional question at issue..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Citation Research Component (NEW!) */}
                      <CitationResearch
                        onDocumentsSelected={setSelectedDocuments}
                        onSummariesGenerated={setDocumentSummaries}
                      />

                      {/* Document Summaries Display (NEW!) */}
                      {documentSummaries.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-2">✓ Document Analysis Complete</h4>
                          <p className="text-sm text-green-700">
                            {documentSummaries.length} documents analyzed and summarized for case context.
                          </p>
                        </div>
                      )}

                      {/* Selected Documents Count (NEW!) */}
                      {selectedDocuments.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Selected Documents</h4>
                          <p className="text-sm text-blue-700">
                            {selectedDocuments.length} documents selected for brief generation.
                          </p>
                          <div className="mt-4">
                            <button
                              onClick={() => handleStepComplete(2)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Continue to Legal Research <ChevronRight className="w-4 h-4 ml-1 inline" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Placeholder for remaining steps */}
                  {step.id > 2 && (
                    <div className="text-center py-8">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h3>
                      <p className="text-gray-500">
                        This step will be available once the previous steps are completed.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Transcriptions Tab */
          <TranscriptionManager />
        )}
      </div>
    </div>
  );
}