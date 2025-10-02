'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  FileImage,
  FileVideo,
  FileAudio,
  BookOpen,
  Search,
  Brain,
  ArrowRight,
  Info,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import FileUpload from '@/app/components/FileUpload';

interface RelevantDocument {
  id: string;
  name: string;
  type: 'case_brief' | 'legal_memo' | 'research_paper' | 'court_filing' | 'transcript' | 'other';
  fileUrl?: string;
  fileSize?: number;
  content?: string;
  relevance: string;
  keyInsights: string[];
  caseContext: string;
  uploadDate: Date;
  isUploaded?: boolean;
}

interface DocumentSelectionPhaseProps {
  onDocumentsComplete: (documents: RelevantDocument[]) => void;
  onProceedToOutline: (documents: RelevantDocument[]) => void;
  initialDocuments?: RelevantDocument[];
}

export function DocumentSelectionPhase({ 
  onDocumentsComplete, 
  onProceedToOutline, 
  initialDocuments = [] 
}: DocumentSelectionPhaseProps) {
  const [documents, setDocuments] = useState<RelevantDocument[]>(initialDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Document type options
  const documentTypes = [
    { value: 'case_brief', label: 'Case Brief', icon: '📋', description: 'Previous amicus briefs or case briefs' },
    { value: 'legal_memo', label: 'Legal Memorandum', icon: '📝', description: 'Legal research memos or analyses' },
    { value: 'research_paper', label: 'Research Paper', icon: '📚', description: 'Academic papers or legal research' },
    { value: 'court_filing', label: 'Court Filing', icon: '⚖️', description: 'Previous court filings or motions' },
    { value: 'transcript', label: 'Transcript', icon: '🎙️', description: 'Court transcripts or hearing records' },
    { value: 'other', label: 'Other', icon: '📄', description: 'Other relevant legal documents' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'case_brief': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'legal_memo': return <FileText className="w-5 h-5 text-green-600" />;
      case 'research_paper': return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'court_filing': return <FileText className="w-5 h-5 text-red-600" />;
      case 'transcript': return <FileAudio className="w-5 h-5 text-orange-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return documentTypes.find(dt => dt.value === type)?.label || 'Document';
  };

  const addDocument = () => {
    const newDoc: RelevantDocument = {
      id: `doc_${Date.now()}`,
      name: '',
      type: 'other',
      relevance: '',
      keyInsights: [''],
      caseContext: '',
      uploadDate: new Date(),
      isUploaded: false
    };
    setDocuments([...documents, newDoc]);
    setEditingDocument(newDoc.id);
  };

  const updateDocument = (id: string, updates: Partial<RelevantDocument>) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    );
  };

  const removeDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
    if (editingDocument === id) {
      setEditingDocument(null);
    }
  };

  const addKeyInsight = (docId: string) => {
    updateDocument(docId, {
      keyInsights: [...documents.find(d => d.id === docId)?.keyInsights || [], '']
    });
  };

  const updateKeyInsight = (docId: string, index: number, value: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      const newInsights = [...doc.keyInsights];
      newInsights[index] = value;
      updateDocument(docId, { keyInsights: newInsights });
    }
  };

  const removeKeyInsight = (docId: string, index: number) => {
    const doc = documents.find(d => d.id === docId);
    if (doc && doc.keyInsights.length > 1) {
      const newInsights = doc.keyInsights.filter((_, i) => i !== index);
      updateDocument(docId, { keyInsights: newInsights });
    }
  };

  const handleFileUpload = async (fileData: any) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Create document entry
      const newDoc: RelevantDocument = {
        id: `doc_${Date.now()}`,
        name: fileData.fileName || 'Uploaded Document',
        type: 'other',
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        content: fileData.transcription || '',
        relevance: '',
        keyInsights: [''],
        caseContext: '',
        uploadDate: new Date(),
        isUploaded: true
      };

      setDocuments([...documents, newDoc]);
      setEditingDocument(newDoc.id);
      setShowUpload(false);

      // Use AI to analyze the document and suggest relevance
      if (fileData.transcription || fileData.content) {
        const analysis = await analyzeDocumentRelevance(fileData.transcription || fileData.content);
        updateDocument(newDoc.id, {
          relevance: analysis.suggestedRelevance,
          keyInsights: analysis.suggestedInsights,
          caseContext: analysis.suggestedContext
        });
      }
    } catch (error) {
      console.error('Error processing uploaded document:', error);
      setAnalysisError('Failed to analyze document. Please add relevance manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDocumentRelevance = async (content: string) => {
    try {
      const response = await fetch('/api/ai/analyze-document-relevance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Document analysis error:', error);
      return {
        suggestedRelevance: 'Please explain why this document is relevant to your current case.',
        suggestedInsights: ['Add key insights from this document'],
        suggestedContext: 'Describe the context in which this document was created.'
      };
    }
  };

  const isDocumentComplete = (doc: RelevantDocument) => {
    return doc.name && doc.relevance && doc.keyInsights.some(insight => insight.trim()) && doc.caseContext;
  };

  const completedDocuments = documents.filter(isDocumentComplete);
  const canProceed = completedDocuments.length >= 1;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Document Selection & Analysis
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select and analyze relevant documents from past cases, research, or legal materials. 
          Explain why each document is relevant to help build a stronger case outline.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Document Analysis Progress</span>
          <span className="text-sm text-gray-500">{completedDocuments.length} of {documents.length} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${documents.length > 0 ? (completedDocuments.length / documents.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Relevant Documents</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
            <button
              onClick={addDocument}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {documentTypes.map(type => (
            <div key={type.value} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{type.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-gray-600">{type.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <FileUpload
                onUploadComplete={handleFileUpload}
                onUploadError={(error) => setAnalysisError(error)}
                acceptedTypes=".pdf,.doc,.docx,.txt,.rtf"
                maxSizeMB={10}
              />
              {isAnalyzing && (
                <div className="mt-4 flex items-center justify-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700">Analyzing document...</span>
                </div>
              )}
              {analysisError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Analysis Error</h4>
                      <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Document Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {doc.name || `Document ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getTypeLabel(doc.type)} • {doc.uploadDate.toLocaleDateString()}
                      {doc.fileSize && ` • ${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isDocumentComplete(doc) && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  )}
                  <button
                    onClick={() => setExpandedDocument(expandedDocument === doc.id ? null : doc.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {expandedDocument === doc.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setEditingDocument(editingDocument === doc.id ? null : doc.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Details */}
            {expandedDocument === doc.id && (
              <div className="p-4 space-y-4">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={doc.type}
                    onChange={(e) => updateDocument(doc.id, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => updateDocument(doc.id, { name: e.target.value })}
                    placeholder="Enter a descriptive name for this document"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Relevance Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why is this document relevant? *
                  </label>
                  <textarea
                    value={doc.relevance}
                    onChange={(e) => updateDocument(doc.id, { relevance: e.target.value })}
                    placeholder="Explain how this document relates to your current case, what legal principles it demonstrates, or what insights it provides..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Case Context */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Context
                  </label>
                  <textarea
                    value={doc.caseContext}
                    onChange={(e) => updateDocument(doc.id, { caseContext: e.target.value })}
                    placeholder="Describe the original case or context where this document was created..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Key Insights */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Insights *
                  </label>
                  <div className="space-y-2">
                    {doc.keyInsights.map((insight, insightIndex) => (
                      <div key={insightIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={insight}
                          onChange={(e) => updateKeyInsight(doc.id, insightIndex, e.target.value)}
                          placeholder="Enter a key insight, legal principle, or argument from this document"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {doc.keyInsights.length > 1 && (
                          <button
                            onClick={() => removeKeyInsight(doc.id, insightIndex)}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addKeyInsight(doc.id)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Insight</span>
                    </button>
                  </div>
                </div>

                {/* Document Preview */}
                {doc.content && (
                  <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">Document Preview</h4>
                    </div>
                    <div className="p-4 max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {doc.content.substring(0, 1000)}
                        {doc.content.length > 1000 && '...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Status */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className={`flex items-center justify-between p-4 rounded-lg ${
            canProceed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              {canProceed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <h4 className={`font-medium ${canProceed ? 'text-green-900' : 'text-yellow-900'}`}>
                  {canProceed ? 'Ready for Case Outline' : 'Complete Document Analysis'}
                </h4>
                <p className={`text-sm ${canProceed ? 'text-green-700' : 'text-yellow-700'}`}>
                  {canProceed 
                    ? `${completedDocuments.length} document${completedDocuments.length !== 1 ? 's' : ''} ready for strategic outline development.`
                    : 'Complete the analysis for at least one document to proceed to case outline brainstorming.'
                  }
                </p>
              </div>
            </div>
            
            {canProceed && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onDocumentsComplete(completedDocuments)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Save Progress</span>
                </button>
                <button
                  onClick={() => onProceedToOutline(completedDocuments)}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Create Case Outline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents selected yet</h3>
          <p className="text-gray-600 mb-6">
            Add relevant documents from past cases, research, or legal materials to build a stronger case outline.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload First Document</span>
            </button>
            <button
              onClick={addDocument}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
