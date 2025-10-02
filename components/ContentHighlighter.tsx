'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Edit3, 
  Search, 
  CheckCircle, 
  X, 
  AlertCircle,
  Wand2,
  Eye,
  RefreshCw
} from 'lucide-react';

interface HighlightedText {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  changeRequest: string;
  context: string;
  timestamp: Date;
}

interface SimilarContent {
  sectionId: string;
  sectionTitle: string;
  text: string;
  startIndex: number;
  endIndex: number;
  similarity: number;
  context: string;
}

interface ProposedChange {
  id: string;
  originalText: string;
  newText: string;
  sectionId: string;
  sectionTitle: string;
  startIndex: number;
  endIndex: number;
  reason: string;
  confidence: number;
}

interface ContentHighlighterProps {
  content: string;
  sectionId: string;
  sectionTitle: string;
  onContentChange: (newContent: string) => void;
  onSimilarContentFound: (similarContent: SimilarContent[]) => void;
  onProposedChanges: (changes: ProposedChange[]) => void;
  className?: string;
}

export function ContentHighlighter({
  content,
  sectionId,
  sectionTitle,
  onContentChange,
  onSimilarContentFound,
  onProposedChanges,
  className = ''
}: ContentHighlighterProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [changeRequest, setChangeRequest] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlightedTexts, setHighlightedTexts] = useState<HighlightedText[]>([]);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [similarContent, setSimilarContent] = useState<SimilarContent[]>([]);
  const [proposedChanges, setProposedChanges] = useState<ProposedChange[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const changeRequestRef = useRef<HTMLTextAreaElement>(null);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      setSelectedText(selectedText);
      
      // Calculate start and end indices relative to the content
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(contentRef.current!);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const startIndex = preCaretRange.toString().length;
      const endIndex = startIndex + selectedText.length;
      
      setSelectionRange({ start: startIndex, end: endIndex });
      
      // Auto-focus the change request input
      setTimeout(() => {
        changeRequestRef.current?.focus();
      }, 100);
    }
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedText('');
    setSelectionRange(null);
    setChangeRequest('');
    window.getSelection()?.removeAllRanges();
  }, []);

  // Analyze selected text and find similar content
  const analyzeSelectedText = async () => {
    if (!selectedText || !selectionRange || !changeRequest.trim()) {
      alert('Please select text and provide a change request');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('🔍 Analyzing selected text:', selectedText);
      console.log('📝 Change request:', changeRequest);
      console.log('📍 Selection range:', selectionRange);

      const response = await fetch('/api/ai/analyze-content-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText,
          changeRequest,
          sectionId,
          sectionTitle,
          startIndex: selectionRange.start,
          endIndex: selectionRange.end,
          currentContent: content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content changes');
      }

      const data = await response.json();
      console.log('✅ Analysis complete:', data);

      setSimilarContent(data.similarContent || []);
      setProposedChanges(data.proposedChanges || []);
      
      onSimilarContentFound(data.similarContent || []);
      onProposedChanges(data.proposedChanges || []);
      
      setShowChangeModal(true);
      
    } catch (error) {
      console.error('❌ Error analyzing content:', error);
      alert('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply changes
  const applyChanges = async (changes: ProposedChange[]) => {
    setIsProcessing(true);
    try {
      console.log('🔄 Applying changes:', changes);

      // Apply changes to current section first
      const currentSectionChanges = changes.filter(c => c.sectionId === sectionId);
      let updatedContent = content;

      // Sort changes by start index in reverse order to avoid index shifting
      const sortedChanges = currentSectionChanges.sort((a, b) => b.startIndex - a.startIndex);
      
      for (const change of sortedChanges) {
        const before = updatedContent.substring(0, change.startIndex);
        const after = updatedContent.substring(change.endIndex);
        updatedContent = before + change.newText + after;
      }

      onContentChange(updatedContent);

      // Store the highlighted text for reference
      const highlightedText: HighlightedText = {
        id: Date.now().toString(),
        text: selectedText,
        startIndex: selectionRange!.start,
        endIndex: selectionRange!.end,
        changeRequest,
        context: `Changed in ${sectionTitle}`,
        timestamp: new Date()
      };

      setHighlightedTexts(prev => [...prev, highlightedText]);
      
      // Clear selection and close modal
      clearSelection();
      setShowChangeModal(false);
      
      console.log('✅ Changes applied successfully');
      
    } catch (error) {
      console.error('❌ Error applying changes:', error);
      alert('Failed to apply changes. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject changes
  const rejectChanges = () => {
    setShowChangeModal(false);
    clearSelection();
  };

  // Render highlighted text in content
  const renderContentWithHighlights = () => {
    if (highlightedTexts.length === 0) {
      return content;
    }

    let result = content;
    let offset = 0;

    // Sort highlights by start index
    const sortedHighlights = [...highlightedTexts].sort((a, b) => a.startIndex - b.startIndex);

    for (const highlight of sortedHighlights) {
      const adjustedStart = highlight.startIndex + offset;
      const adjustedEnd = highlight.endIndex + offset;
      
      const before = result.substring(0, adjustedStart);
      const highlighted = result.substring(adjustedStart, adjustedEnd);
      const after = result.substring(adjustedEnd);
      
      result = before + 
        `<mark class="bg-yellow-200 px-1 rounded" title="Changed: ${highlight.changeRequest}">${highlighted}</mark>` + 
        after;
      
      // Update offset for next iteration
      offset += 25; // Approximate length of the mark tag
    }

    return result;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Content Display */}
      <div
        ref={contentRef}
        className="min-h-[400px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-text select-text"
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
        dangerouslySetInnerHTML={{ __html: renderContentWithHighlights() }}
        style={{ 
          fontFamily: 'Times, "Times New Roman", serif',
          lineHeight: '1.8',
          fontSize: '16px'
        }}
      />

      {/* Selection Toolbar */}
      {selectedText && (
        <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 min-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Request Change</h4>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">Selected text:</p>
            <div className="bg-gray-50 p-2 rounded text-sm border">
              "{selectedText}"
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              What should be changed?
            </label>
            <textarea
              ref={changeRequestRef}
              value={changeRequest}
              onChange={(e) => setChangeRequest(e.target.value)}
              placeholder="e.g., 'Make this more persuasive', 'Add more legal citations', 'Simplify this language'"
              className="w-full h-20 p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={analyzeSelectedText}
              disabled={isAnalyzing || !changeRequest.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Find & Update Similar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Change Confirmation Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Review Proposed Changes</h2>
                <button
                  onClick={rejectChanges}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                The AI found similar content and proposed changes. Review and confirm before applying.
              </p>
            </div>

            <div className="p-6">
              {/* Original Selection */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Selection</h3>
                <div className="bg-white p-3 border rounded">
                  <p className="text-sm text-gray-700 mb-2">"{selectedText}"</p>
                  <p className="text-xs text-gray-500">Change request: {changeRequest}</p>
                </div>
              </div>

              {/* Similar Content Found */}
              {similarContent.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Similar Content Found ({similarContent.length} matches)
                  </h3>
                  <div className="space-y-3">
                    {similarContent.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{item.sectionTitle}</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {Math.round(item.similarity * 100)}% similar
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          "{item.text}"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Context: {item.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposed Changes */}
              {proposedChanges.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Proposed Changes ({proposedChanges.length} changes)
                  </h3>
                  <div className="space-y-4">
                    {proposedChanges.map((change, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">{change.sectionTitle}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {Math.round(change.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Original:</p>
                            <div className="bg-red-50 p-3 rounded border-l-4 border-red-300">
                              <p className="text-sm text-gray-700">{change.originalText}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Proposed:</p>
                            <div className="bg-green-50 p-3 rounded border-l-4 border-green-300">
                              <p className="text-sm text-gray-700">{change.newText}</p>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">Reason: {change.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={rejectChanges}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => applyChanges(proposedChanges)}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Apply All Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Edit3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">How to Use Content Highlighting</h4>
            <ul className="text-blue-800 text-sm mt-2 space-y-1">
              <li>• <strong>Select text</strong> you want to change by highlighting it</li>
              <li>• <strong>Describe the change</strong> you want in the popup</li>
              <li>• <strong>AI will find similar content</strong> across all sections</li>
              <li>• <strong>Review proposed changes</strong> before applying</li>
              <li>• <strong>Apply changes</strong> to update all similar content at once</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
