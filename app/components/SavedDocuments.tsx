'use client';

import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, Plus, Edit3, Calendar, Scale, BookOpen, Download, Eye, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Database, Copy, Code, Search, RefreshCw, Trash2, Upload, Cloud } from 'lucide-react';
import DocumentUpload from './DocumentUpload';

interface SavedDocument {
  id: string;
  external_id: string;
  document_type: string;
  citation: string;
  case_title: string;
  court: string;
  docket_number: string;
  decision_date: string;
  page_count: number;
  has_plain_text: boolean;
  download_url: string;
  authors: string[];
  source_system: string;
  search_query: string;
  relevance_score: number;
  created_at: string;
  aiSummary?: {
    id: string;
    ai_summary: string;
    key_points: string[];
    legal_standard: string;
    disposition: string;
    notable_quotes: string[];
    cited_cases: string[];
    holding: string;
    reasoning: string;
    precedent_value: string;
    confidence_score: number;
  };
  userNotes: Array<{
    id: string;
    title: string;
    content: string;
    note_type: string;
    tags: string[];
    quote_text?: string;
    created_at: string;
  }>;
  hasAiAnalysis: boolean;
  noteCount: number;
  fullText?: string;
  textPreview?: string;
  hasFullText?: boolean;
  completeApiData?: {
    complete_cache?: boolean;
    search_result?: any;
    cluster_data?: any;
    opinion_data?: any;
    docket_data?: any;
    html_content?: string;
    html_with_citations?: string;
    xml_content?: string;
    court_info?: any;
    judges_info?: any;
    cited_cases?: any[];
    citation_count?: number;
    precedential_status?: string;
    page_count?: number;
    api_fetch_timestamp?: string;
  };
}

interface SavedDocumentsProps {
  caseId: string;
  userId: string;
  refreshTrigger?: number; // Prop to trigger refresh
}

interface CaseInsights {
  totalDocuments: number;
  documentsWithAI: number;
  totalNotes: number;
  sourcesUsed: string[];
  courtsRepresented: string[];
  dateRange: {
    earliest?: string;
    latest?: string;
  };
}

export default function SavedDocuments({ caseId, userId, refreshTrigger }: SavedDocumentsProps) {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [groupedDocuments, setGroupedDocuments] = useState<any>({});
  const [insights, setInsights] = useState<CaseInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<SavedDocument | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['decisions']));
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', noteType: 'general', tags: [] });
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Load saved documents on component mount and when case ID changes
  useEffect(() => {
    if (caseId && caseId !== 'undefined' && caseId !== 'null') {
      loadSavedDocuments();
    }
  }, [caseId]);

  // Refresh when refreshTrigger changes (when documents are saved)
  useEffect(() => {
    if (refreshTrigger && caseId && caseId !== 'undefined' && caseId !== 'null') {
      console.log('🔄 Refreshing saved documents due to new save...');
      loadSavedDocuments();
    }
  }, [refreshTrigger, caseId]);

  const loadSavedDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Loading saved documents for case: ${caseId}`);
      const response = await fetch(`/api/legal/saved-documents?caseId=${caseId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to load documents: ${response.status} - ${errorText}`);
        throw new Error(`Failed to load documents: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 API Response:`, data);
      
      if (data.success) {
        setDocuments(data.documents);
        setGroupedDocuments(data.groupedDocuments);
        setInsights(data.insights);
        console.log(`✅ Loaded ${data.documents.length} saved documents for case ${caseId}`);
      } else {
        console.error(`❌ API returned error:`, data.error);
        throw new Error(data.error || 'Failed to load documents');
      }

    } catch (error) {
      console.error('Error loading saved documents:', error);
      setError(error instanceof Error ? error.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (documentToDelete: SavedDocument) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${documentToDelete.case_title}"?\n\nThis action cannot be undone and will permanently remove the document and all associated notes and analysis.`
    );
    
    if (!confirmed) {
      console.log('Document deletion cancelled by user');
      return;
    }

    try {
      console.log(`🗑️ Deleting document: ${documentToDelete.case_title} (${documentToDelete.id})`);
      
      const response = await fetch(`/api/legal/saved-documents/${documentToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Document "${documentToDelete.case_title}" deleted successfully`, result);
        
        // Remove document from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
        
        // Update grouped documents
        const updatedGrouped = { ...groupedDocuments };
        if (updatedGrouped[documentToDelete.document_type]) {
          updatedGrouped[documentToDelete.document_type] = updatedGrouped[documentToDelete.document_type].filter(
            (doc: SavedDocument) => doc.id !== documentToDelete.id
          );
          
          // Remove empty groups
          if (updatedGrouped[documentToDelete.document_type].length === 0) {
            delete updatedGrouped[documentToDelete.document_type];
          }
        }
        setGroupedDocuments(updatedGrouped);
        
        // Update insights
        if (insights) {
          setInsights({
            ...insights,
            totalDocuments: insights.totalDocuments - 1,
            documentsWithAI: insights.documentsWithAI - (documentToDelete.hasAiAnalysis ? 1 : 0),
            documentsWithNotes: insights.documentsWithNotes - (documentToDelete.noteCount > 0 ? 1 : 0)
          });
        }
        
        // Close preview if this document was selected
        if (selectedDocument?.id === documentToDelete.id) {
          setSelectedDocument(null);
        }
        
        // Show success message
        const toast = document.createElement('div');
        toast.textContent = `✅ "${documentToDelete.case_title}" deleted successfully`;
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
        
      } else {
        const errorData = await response.json();
        console.error(`❌ Failed to delete document: ${errorData.error || 'Unknown error'}`, errorData);
        
        // Show error message
        const toast = document.createElement('div');
        toast.textContent = `❌ Failed to delete "${documentToDelete.case_title}": ${errorData.error || 'Unknown error'}`;
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.textContent = `❌ Error deleting "${documentToDelete.case_title}": ${error instanceof Error ? error.message : 'Unknown error'}`;
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      document.body.appendChild(toast);
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 5000);
    }
  };

  const addNoteToDocument = async (documentId: string) => {
    if (!newNote.content.trim()) {
      alert('Please enter note content');
      return;
    }

    try {
      const response = await fetch('/api/legal/document-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          caseId,
          userId,
          title: newNote.title || 'Document Note',
          content: newNote.content,
          noteType: newNote.noteType,
          tags: newNote.tags
        })
      });

      if (response.ok) {
        setNewNote({ title: '', content: '', noteType: 'general', tags: [] });
        setIsAddingNote(false);
        await loadSavedDocuments(); // Refresh to show new note
      } else {
        const errorData = await response.json();
        alert(`Failed to add note: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      // Court Decisions & Opinions
      'decision': 'Court Decisions',
      'dissent': 'Dissenting Opinions', 
      'concurrence': 'Concurring Opinions',
      'opinion_court_below': 'Opinions from Court Below',
      
      // Briefs
      'brief_petitioner': 'Petitioner Briefs',
      'brief_respondent': 'Respondent Briefs',
      'brief_amicus': 'Amicus Briefs',
      
      // Case Materials
      'case_analysis': 'Case Analysis & Memoranda',
      'other_citations': 'Other Documents',
      'record_appendix': 'Record & Appendix',
      
      // General
      'other': 'Other Documents',
      'user_upload': 'Uploaded Documents'
    };
    return (labels as any)[type] || 'Other Documents';
  };

  const DocumentCard = ({ doc }: { doc: SavedDocument }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Document Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{doc.case_title}</h4>
          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
            <span>{doc.court}</span>
            {doc.decision_date && (
              <>
                <span>•</span>
                <span>{new Date(doc.decision_date).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {doc.hasAiAnalysis && (
            <div className="flex items-center text-green-600 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              AI Analysis
            </div>
          )}
          {doc.noteCount > 0 && (
            <div className="flex items-center text-blue-600 text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              {doc.noteCount} notes
            </div>
          )}
        </div>
      </div>

      {/* Document Metadata */}
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
        <div>
          <span className="font-medium">Source:</span> {doc.source_system}
        </div>
        <div>
          <span className="font-medium">Docket:</span> {doc.docket_number || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Pages:</span> {doc.page_count || 'Unknown'}
        </div>
        <div>
          <span className="font-medium">Relevance:</span> {((doc.relevance_score || 0) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedDocument(doc)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center space-x-1 hover:bg-blue-700"
          >
            <Eye className="w-3 h-3" />
            <span>View Analysis</span>
          </button>
          <button
            onClick={() => {
              setSelectedDocument(doc);
              setIsAddingNote(true);
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm flex items-center space-x-1 hover:bg-gray-700"
          >
            <Plus className="w-3 h-3" />
            <span>Add Note</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteDocument(doc);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm flex items-center space-x-1 hover:bg-red-700 transition-colors"
            title="Delete this document permanently"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
        {doc.has_plain_text && (
          <span className="text-xs text-green-600 flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            Full Text Available
          </span>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading saved documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Documents</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadSavedDocuments}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Case Insights Header */}
      {insights && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Scale className="w-5 h-5 mr-2 text-blue-600" />
              Research Overview
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Cloud className="w-3 h-3" />
                <span>Upload Document</span>
              </button>
              <button
                onClick={loadSavedDocuments}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{insights.totalDocuments}</div>
              <div className="text-gray-600">Documents Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{insights.documentsWithAI}</div>
              <div className="text-gray-600">AI Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{insights.totalNotes}</div>
              <div className="text-gray-600">Research Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{insights.courtsRepresented.length}</div>
              <div className="text-gray-600">Courts</div>
            </div>
          </div>
          
          {insights.dateRange.earliest && insights.dateRange.latest && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>Case Timeline:</strong> {new Date(insights.dateRange.earliest).getFullYear()} - {new Date(insights.dateRange.latest).getFullYear()}
            </div>
          )}
        </div>
      )}

      {/* Document Sections */}
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Saved Yet</h3>
          <p className="text-gray-600 mb-4">Use the legal research tool to find and save documents, or upload your own documents for this case.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Cloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        Object.entries(groupedDocuments).map(([type, docs]) => {
          const typedDocs = docs as SavedDocument[];
          if (!typedDocs || typedDocs.length === 0) return null;
          
          const isExpanded = expandedSections.has(type);
          
          return (
            <div key={type} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(type)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between rounded-t-lg"
              >
                <div className="flex items-center space-x-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <h3 className="font-semibold text-gray-900">{getDocumentTypeLabel(type)}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {typedDocs.length}
                  </span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {typedDocs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">{selectedDocument.case_title}</h3>
              <button
                onClick={() => {
                  setSelectedDocument(null);
                  setIsAddingNote(false);
                  setNewNote({ title: '', content: '', noteType: 'general', tags: [] });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {isAddingNote ? (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Add Research Note</h4>
                  <input
                    type="text"
                    placeholder="Note title (optional)"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newNote.noteType}
                    onChange={(e) => setNewNote({ ...newNote, noteType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Note</option>
                    <option value="strategy">Strategy</option>
                    <option value="argument">Argument Point</option>
                    <option value="precedent_analysis">Precedent Analysis</option>
                  </select>
                  <textarea
                    placeholder="Enter your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => addNoteToDocument(selectedDocument.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setIsAddingNote(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* AI Summary */}
                  {selectedDocument.aiSummary && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        AI Analysis
                      </h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                        {selectedDocument.aiSummary.key_points && selectedDocument.aiSummary.key_points.length > 0 && (
                          <div>
                            <strong className="text-green-800">Key Points:</strong>
                            <ul className="list-disc list-inside text-green-700 mt-1 space-y-1">
                              {selectedDocument.aiSummary.key_points.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedDocument.aiSummary.holding && (
                          <div>
                            <strong className="text-green-800">Holding:</strong>
                            <p className="text-green-700 mt-1">{selectedDocument.aiSummary.holding}</p>
                          </div>
                        )}
                        {selectedDocument.aiSummary.ai_summary && (
                          <div>
                            <strong className="text-green-800">Full Analysis:</strong>
                            <p className="text-green-700 mt-1">{selectedDocument.aiSummary.ai_summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Full Document Text */}
                  {selectedDocument.fullText && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Full Document Text ({selectedDocument.fullText.length.toLocaleString()} characters)
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900 font-mono">
                            {selectedDocument.fullText}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Preview Fallback */}
                  {!selectedDocument.fullText && selectedDocument.textPreview && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-yellow-600" />
                        Document Preview
                      </h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm mb-2">
                          <strong>Note:</strong> Only preview text available. Full text was not captured during save.
                        </p>
                        <div className="text-yellow-900 text-sm">
                          {selectedDocument.textPreview}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Complete API Data Viewer */}
                  {selectedDocument.completeApiData?.complete_cache && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Database className="w-4 h-4 mr-2 text-purple-600" />
                        Complete CourtListener Data 
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          100% Cached - No API Calls Needed
                        </span>
                      </h4>
                      <CompleteDataViewer data={selectedDocument.completeApiData} />
                    </div>
                  )}

                  {/* User Notes */}
                  {selectedDocument.userNotes && selectedDocument.userNotes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                        Research Notes ({selectedDocument.userNotes.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedDocument.userNotes.map((note) => (
                          <div key={note.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-blue-900">{note.title}</h5>
                              <span className="text-xs text-blue-600 capitalize">{note.note_type.replace('_', ' ')}</span>
                            </div>
                            <p className="text-blue-800">{note.content}</p>
                            {note.quote_text && (
                              <blockquote className="mt-2 p-2 bg-blue-100 border-l-4 border-blue-400 italic text-blue-700">
                                "{note.quote_text}"
                              </blockquote>
                            )}
                            <div className="text-xs text-blue-600 mt-2">
                              Added {new Date(note.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Research Note</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <DocumentUpload
          caseId={caseId}
          userId={userId}
          onUploadComplete={(document) => {
            console.log('📁 Document uploaded successfully:', document);
            setShowUploadModal(false);
            loadSavedDocuments(); // Refresh the document list
          }}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}

// Complete API Data Viewer Component
function CompleteDataViewer({ data }: { data: any }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
  
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const JsonViewer = ({ title, data, icon }: { title: string; data: any; icon: React.ReactNode }) => {
    const isExpanded = expandedSections.has(title.toLowerCase());
    const jsonString = JSON.stringify(data, null, 2);
    
    return (
      <div className="border border-gray-200 rounded-lg mb-3">
        <button
          onClick={() => toggleSection(title.toLowerCase())}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-gray-900">{title}</span>
            {data && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {typeof data === 'object' ? Object.keys(data).length + ' fields' : 'Available'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {data && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(jsonString);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </span>
            )}
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>
        
        {isExpanded && data && (
          <div className="p-3 border-t">
            <pre className="text-xs overflow-x-auto bg-gray-50 p-3 rounded border text-gray-800 max-h-64 overflow-y-auto">
              {jsonString}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Summary Stats */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {data.page_count || 'N/A'}
            </div>
            <div className="text-purple-800">Pages</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {data.citation_count || 0}
            </div>
            <div className="text-purple-800">Citations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {data.cited_cases?.length || 0}
            </div>
            <div className="text-purple-800">Cases Cited</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {data.precedential_status || 'Unknown'}
            </div>
            <div className="text-purple-800">Status</div>
          </div>
        </div>
        
        {data.api_fetch_timestamp && (
          <div className="mt-3 text-xs text-purple-700">
            API Data Cached: {new Date(data.api_fetch_timestamp).toLocaleString()}
          </div>
        )}
      </div>

      {/* Data Sections */}
      <JsonViewer 
        title="Search Result" 
        data={data.search_result} 
        icon={<Search className="w-4 h-4 text-blue-600" />} 
      />
      
      <JsonViewer 
        title="Cluster Data" 
        data={data.cluster_data} 
        icon={<BookOpen className="w-4 h-4 text-green-600" />} 
      />
      
      <JsonViewer 
        title="Opinion Data" 
        data={data.opinion_data} 
        icon={<FileText className="w-4 h-4 text-orange-600" />} 
      />
      
      <JsonViewer 
        title="Docket Data" 
        data={data.docket_data} 
        icon={<Scale className="w-4 h-4 text-red-600" />} 
      />

      {/* Special Content Viewers */}
      {data.html_content && (
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('html')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-gray-900">HTML Content</span>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {data.html_content.length.toLocaleString()} chars
              </span>
            </div>
            {expandedSections.has('html') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {expandedSections.has('html') && (
            <div className="p-3 border-t">
              <div className="bg-gray-50 p-3 rounded border max-h-64 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: data.html_content }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Court & Judge Information */}
      {(data.court_info || data.judges_info) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Court & Judge Information</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {data.court_info && (
              <div>
                <strong>Court:</strong>
                <div className="mt-1">
                  <div>{data.court_info.court_name}</div>
                  <div className="text-gray-600">{data.court_info.court_citation_string}</div>
                  <div className="text-xs text-gray-500">ID: {data.court_info.court_id}</div>
                </div>
              </div>
            )}
            {data.judges_info && (
              <div>
                <strong>Judges:</strong>
                <div className="mt-1">
                  {data.judges_info.author && <div>Author: {data.judges_info.author}</div>}
                  {data.judges_info.joined_by && <div>Joined by: {data.judges_info.joined_by}</div>}
                  {data.judges_info.panel_judges?.length > 0 && (
                    <div>Panel: {data.judges_info.panel_judges.join(', ')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
