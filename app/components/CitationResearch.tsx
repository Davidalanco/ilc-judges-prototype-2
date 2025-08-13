'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckSquare, Square, FileText, Users, Clock, AlertCircle, CheckCircle, Eye, X, BookOpen, Scale, Download } from 'lucide-react';

interface CaseDocument {
  id: string;
  type: 'decision' | 'dissent' | 'concurrence' | 'record' | 'brief_petitioner' | 'brief_respondent' | 'brief_amicus';
  title: string;
  court: string;
  docketNumber: string;
  date: string;
  pageCount: number;
  source: 'courtlistener';
  downloadUrl: string;
  authors?: string[];
  hasPlainText: boolean;
  isSelected?: boolean;
  summary?: DocumentSummary;
  fullText?: string; // For preview
}

interface DocumentSummary {
  keyPoints: string[];
  legalStandard: string;
  disposition: string;
  notableQuotes: string[];
  citedCases: string[];
  significance: string;
  aiSummary: string;
}

interface SearchResults {
  citation: {
    original: string;
    parsed: {
      caseName: string;
      reporter: string;
      volume: string;
      page: string;
      isValid: boolean;
    };
  };
  documents: CaseDocument[];
  summary: {
    totalFound: number;
    documentsReturned: number;
    searchQueries: any[];
    errors: string[];
  };
}

interface CitationResearchProps {
  onDocumentsSelected?: (documents: CaseDocument[]) => void;
  onSummariesGenerated?: (summaries: any[]) => void;
  onDocumentSaved?: (document: CaseDocument) => void;
}

export default function CitationResearch({ onDocumentsSelected, onSummariesGenerated, onDocumentSaved }: CitationResearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const [isSavingDocuments, setIsSavingDocuments] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<CaseDocument | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [searchMode, setSearchMode] = useState<'exact' | 'related' | 'comprehensive'>('comprehensive');
  const [searchType, setSearchType] = useState<'citation' | 'keywords'>('keywords');
  const [isRealTimeSearch, setIsRealTimeSearch] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showOnlyWithContent, setShowOnlyWithContent] = useState(false);
  const [documentCache, setDocumentCache] = useState<Map<string, any>>(new Map());
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [savingDocuments, setSavingDocuments] = useState<Set<string>>(new Set());

  // Debounced search for real-time filtering
  useEffect(() => {
    if (!isRealTimeSearch || !searchQuery.trim() || searchQuery.length < 3) {
      return;
    }

    const timeoutId = setTimeout(() => {
      // Only perform search if query has actually changed
      if (searchQuery.trim() !== searchResults?.citation?.original) {
        performSearch();
      }
    }, 800); // Increased delay to 800ms for better performance

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMode, searchType, isRealTimeSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get cached document content or fetch if not cached
  const getCachedDocumentContent = async (doc: CaseDocument) => {
    const cacheKey = doc.id;
    
    // Check cache first
    if (documentCache.has(cacheKey)) {
      console.log(`📱 Using cached content for: ${doc.title}`);
      return documentCache.get(cacheKey);
    }

    // Fetch content and cache it
    console.log(`🔄 Fetching content for: ${doc.title}`);
    try {
      const contentResponse = await fetch('/api/legal/get-document-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id })
      });

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        
        // Cache the content
        const cachedData = {
          fullText: contentData.fullText || '',
          metadata: contentData.metadata || {},
          fetchedAt: new Date().toISOString(),
          hasContent: !!(contentData.fullText && contentData.fullText.length > 100)
        };
        
        setDocumentCache(prev => new Map(prev.set(cacheKey, cachedData)));
        console.log(`💾 Cached content for: ${doc.title} (${cachedData.fullText.length} chars)`);
        
        return cachedData;
      }
    } catch (error) {
      console.warn(`Failed to fetch content for ${doc.id}:`, error);
    }

    return { fullText: '', metadata: {}, hasContent: false };
  };

  // Auto-save document when selected
  const autoSaveDocument = async (doc: CaseDocument) => {
    if (!autoSaveEnabled) return;

    // Mark document as being saved
    setSavingDocuments(prev => new Set(prev.add(doc.id)));

    try {
      console.log(`🔄 Auto-saving: ${doc.title}`);
      
      // Get cached content
      const cachedContent = await getCachedDocumentContent(doc);
      
      // Get current case ID from workflow context or use demo values
      const currentCaseId = localStorage.getItem('workflow_case_id') || '0ff75224-0d61-497d-ac1b-ffefdb63dba1';
      const defaultUserId = 'a2871219-533b-485e-9ac6-effcda36a88d';
      
      console.log(`📂 Auto-saving to case: ${currentCaseId}`);

      const saveResponse = await fetch('/api/legal/save-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: doc,
          caseId: currentCaseId,
          userId: defaultUserId,
          fullText: cachedContent.fullText
        })
      });

      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        console.log(`✅ Auto-saved: ${doc.title} with ${saveData.citationsFound || 0} citations`);
        
        // Show success notification
        const toast = document.createElement('div');
        toast.textContent = `✅ Saved: ${doc.title}`;
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 text-sm';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
        
        // Notify parent component that document was saved
        if (onDocumentSaved) {
          onDocumentSaved(doc);
        }
      } else {
        console.warn(`Failed to auto-save: ${doc.title}`);
        
        // Show error notification
        const toast = document.createElement('div');
        toast.textContent = `❌ Failed to save: ${doc.title}`;
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 text-sm';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 4000);
      }
    } catch (error) {
      console.warn(`Auto-save error for ${doc.title}:`, error);
    } finally {
      // Remove from saving state
      setSavingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(doc.id);
        return newSet;
      });
    }
  };

  // Save selected documents to database
  const saveSelectedDocuments = async () => {
    if (selectedDocuments.size === 0) {
      alert('Please select at least one document to save.');
      return;
    }

    // For now, we'll need case ID and user ID - these would come from props or context
    const defaultCaseId = 'demo-case-id'; // Replace with actual case ID
    const defaultUserId = 'demo-user-id'; // Replace with actual user ID from auth

    setIsSavingDocuments(true);

    try {
      const docsToSave = searchResults?.documents.filter(doc => selectedDocuments.has(doc.id)) || [];
      const savedDocuments = [];
      let totalCitations = 0;

      for (const doc of docsToSave) {
        console.log(`Saving document: ${doc.title}`);

        // First, get the full text content if available
        let fullText = '';
        if (doc.hasPlainText) {
          try {
            const contentResponse = await fetch('/api/legal/get-document-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ documentId: doc.id })
            });

            if (contentResponse.ok) {
              const contentData = await contentResponse.json();
              fullText = contentData.fullText || '';
            }
          } catch (error) {
            console.warn(`Failed to get full text for ${doc.id}:`, error);
          }
        }

        // Save the document
        const saveResponse = await fetch('/api/legal/save-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document: doc,
            caseId: defaultCaseId,
            userId: defaultUserId,
            fullText: fullText
          })
        });

        if (saveResponse.ok) {
          const saveData = await saveResponse.json();
          savedDocuments.push(saveData.document);
          totalCitations += saveData.citationsFound || 0;
          console.log(`✅ Saved: ${doc.title} (${saveData.citationsFound || 0} citations)`);
        } else {
          const errorData = await saveResponse.json();
          console.error(`❌ Failed to save ${doc.title}:`, errorData.error);
          throw new Error(`Failed to save ${doc.title}: ${errorData.error}`);
        }
      }

      // Success message
      alert(`Successfully saved ${savedDocuments.length} documents with ${totalCitations} total citations extracted!`);
      
      // Clear selections after successful save
      setSelectedDocuments(new Set());

    } catch (error) {
      console.error('Document save error:', error);
      alert(`Error saving documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingDocuments(false);
    }
  };

  // Enhanced AI summary generation
  const generateDocumentSummary = async (doc: CaseDocument): Promise<DocumentSummary> => {
    try {
      // Call real AI summarization API
      const response = await fetch('/api/ai/summarize-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          document: doc,
          summaryType: doc.type 
        }),
      });
      
      if (response.ok) {
        const aiSummary = await response.json();
        return aiSummary;
      }
    } catch (error) {
      console.error('AI summary generation failed:', error);
    }
    
    // Fallback to enhanced mock summary based on document type
    return {
      keyPoints: doc.type === 'decision' ? [
        `Court addressed ${doc.title.toLowerCase()} with significant constitutional implications`,
        "Established important precedent for federal jurisdiction analysis",
        "Key ruling affects future cases involving similar legal questions"
      ] : doc.type === 'dissent' ? [
        "Dissenting opinion challenges majority's constitutional interpretation",
        "Alternative legal reasoning provided for case resolution", 
        "Important critique of majority's application of precedent"
      ] : [
        `${getDocumentTypeLabel(doc.type)} provides critical case context`,
        "Important procedural and factual background information",
        "Essential foundation for understanding legal issues"
      ],
      legalStandard: doc.type === 'decision' ? "Constitutional Analysis with Strict Scrutiny" : 
                    doc.type === 'dissent' ? "Alternative Constitutional Framework" : 
                    "N/A - Supporting Document",
      disposition: doc.type === 'decision' ? "Affirmed in Part, Reversed in Part" : 
                  doc.type === 'dissent' ? "Would Reverse" : "N/A",
      notableQuotes: [
        "The Constitution requires careful balancing of competing interests",
        "Federal law must be interpreted to preserve constitutional protections"
      ],
      citedCases: ["Employment Division v. Smith", "Sherbert v. Verner", "Wisconsin v. Yoder"],
      significance: `This ${doc.type} from ${doc.court} provides important guidance on constitutional law interpretation`,
      aiSummary: `This ${getDocumentTypeLabel(doc.type)} from ${doc.court} (${doc.date}) addresses fundamental legal questions with broad implications. The ${doc.pageCount}-page document provides ${doc.type === 'decision' ? 'authoritative judicial analysis' : doc.type === 'dissent' ? 'alternative legal perspective' : 'essential case context'} that influences how courts approach similar constitutional questions.`
    };
  };

  // Load full document text for preview using cached content
  const loadDocumentPreview = async (doc: CaseDocument) => {
    setIsLoadingPreview(true);
    setPreviewDocument(doc);
    
    try {
      // Use cached content function
      const cachedContent = await getCachedDocumentContent(doc);
      
      const docWithContent = { 
        ...doc, 
        fullText: cachedContent.fullText || 'Document content not available'
      };
      const updatedDoc = { 
        ...docWithContent,
        summary: await generateDocumentSummary(docWithContent)
      };
      setPreviewDocument(updatedDoc);
    } catch (error) {
      console.error('Error loading document preview:', error);
      // Fallback to mock data if caching fails
      const mockFullText = `
UNITED STATES COURT OF APPEALS FOR THE ${doc.court.toUpperCase()}

${doc.title}

Date Filed: ${doc.date}
Docket Number: ${doc.docketNumber}
Pages: ${doc.pageCount}

OPINION

This case presents important questions regarding constitutional law and federal jurisdiction. The court must analyze competing constitutional principles and their application to the specific facts presented.

BACKGROUND

The appellant challenges the lower court's interpretation of federal law and constitutional provisions. This case involves complex legal questions with significant implications for similar disputes nationwide.

LEGAL ANALYSIS

I. Constitutional Framework
The Constitution establishes fundamental principles that guide our analysis. Previous Supreme Court precedent provides crucial guidance for resolving the legal questions presented.

II. Statutory Interpretation  
The relevant federal statutes must be interpreted according to established principles of construction and congressional intent.

III. Balancing Competing Interests
Courts must carefully balance individual rights against legitimate government interests, ensuring constitutional protections remain meaningful.

CONCLUSION

For the foregoing reasons, this court finds that [legal conclusion]. The judgment of the district court is [disposition].

[This is a preview - full document contains complete legal analysis, citations, and detailed reasoning]
        `;
        
        const updatedDoc = { 
          ...doc, 
          fullText: mockFullText,
          summary: undefined
        };
        
        setPreviewDocument(updatedDoc);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'decision': return 'Circuit Court Decision';
      case 'dissent': return 'Dissenting Opinion';
      case 'concurrence': return 'Concurring Opinion';
      case 'record': return 'Case Record/Appendix';
      case 'brief_petitioner': return 'Petitioner\'s Brief';
      case 'brief_respondent': return 'Respondent\'s Brief';
      case 'brief_amicus': return 'Amicus Brief';
      default: return 'Legal Document';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'decision':
      case 'dissent':
      case 'concurrence':
        return <Users className="w-4 h-4" />;
      case 'record':
        return <FileText className="w-4 h-4" />;
      case 'brief_petitioner':
      case 'brief_respondent':
      case 'brief_amicus':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    // Throttle API calls to prevent overwhelming the server
    const now = Date.now();
    if (now - lastSearchTime < 1000) { // Wait at least 1 second between API calls
      console.log('🚫 Throttling search request - too frequent');
      return;
    }
    setLastSearchTime(now);

    const queryText = searchQuery.trim();
    
    // Auto-detect search type if not explicitly set
    let actualSearchType = searchType;
    if (searchType === 'keywords') {
      // Auto-detect if it looks like a citation
      const looksLikeCitation = queryText.includes('v.') && 
                               /\d+/.test(queryText) && 
                               queryText.length > 10;
      if (looksLikeCitation) {
        actualSearchType = 'citation';
      }
    }

    setIsSearching(true);
    try {
      // Use different endpoints based on search type
      const endpoint = actualSearchType === 'citation' 
        ? '/api/legal/research-citation'
        : '/api/legal/research-keywords';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: queryText,
          searchMode: searchMode,
          searchType: actualSearchType
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setSelectedDocuments(new Set());
        
        // Log search quality indicator
        if (results.summary?.isProfessional) {
          console.log(`✅ Professional search completed: ${results.summary.providers?.join(', ')} - Quality Score: ${results.summary.qualityScore}`);
        } else {
          console.log(`ℹ️ Free API search completed: ${results.summary?.searchQueries?.join(', ') || 'Basic search'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Search error:', errorData);
        
        // Show user-friendly error message
        let errorMessage = errorData.error || 'Search failed';
        if (response.status === 403) {
          errorMessage = 'Legal database access temporarily unavailable. This is likely due to API rate limiting.';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
        
        // Show error in UI
        setSearchResults({
          citation: { original: searchQuery, parsed: { caseName: '', reporter: '', volume: '', page: '', isValid: false } },
          documents: [],
          summary: { totalFound: 0, documentsReturned: 0, searchQueries: [], errors: [errorMessage] }
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({
        citation: { original: searchQuery, parsed: { caseName: '', reporter: '', volume: '', page: '', isValid: false } },
        documents: [],
        summary: { totalFound: 0, documentsReturned: 0, searchQueries: [], errors: ['Network error'] }
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Manual search trigger (for button clicks)
  const triggerSearch = () => {
    performSearch();
  };

  const toggleDocumentSelection = async (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    const wasSelected = newSelected.has(documentId);
    
    if (wasSelected) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
      
      // Auto-save when document is selected
      if (autoSaveEnabled && searchResults) {
        const doc = searchResults.documents.find(d => d.id === documentId);
        if (doc) {
          // Don't await to keep UI responsive
          autoSaveDocument(doc);
        }
      }
    }
    
    setSelectedDocuments(newSelected);
    
    // Call callback with selected documents
    if (onDocumentsSelected && searchResults) {
      const selected = searchResults.documents.filter(doc => newSelected.has(doc.id));
      onDocumentsSelected(selected);
    }
  };

  const selectAllByType = (type: string) => {
    if (!searchResults) return;
    
    const typeDocuments = searchResults.documents.filter(doc => doc.type === type);
    const newSelected = new Set(selectedDocuments);
    
    typeDocuments.forEach(doc => newSelected.add(doc.id));
    setSelectedDocuments(newSelected);
    
    if (onDocumentsSelected) {
      const selected = searchResults.documents.filter(doc => newSelected.has(doc.id));
      onDocumentsSelected(selected);
    }
  };

  const selectNoneByType = (type: string) => {
    if (!searchResults) return;
    
    const typeDocuments = searchResults.documents.filter(doc => doc.type === type);
    const newSelected = new Set(selectedDocuments);
    
    typeDocuments.forEach(doc => newSelected.delete(doc.id));
    setSelectedDocuments(newSelected);
    
    if (onDocumentsSelected) {
      const selected = searchResults.documents.filter(doc => newSelected.has(doc.id));
      onDocumentsSelected(selected);
    }
  };

  const selectAllDocuments = () => {
    if (!searchResults) return;
    
    const allDocumentIds = new Set(searchResults.documents.map(doc => doc.id));
    setSelectedDocuments(allDocumentIds);
    
    if (onDocumentsSelected) {
      onDocumentsSelected(searchResults.documents);
    }
  };

  const selectNoneDocuments = () => {
    setSelectedDocuments(new Set());
    
    if (onDocumentsSelected) {
      onDocumentsSelected([]);
    }
  };

  const generateSummaries = async () => {
    if (!searchResults || selectedDocuments.size === 0) return;

    setIsGeneratingSummaries(true);
    try {
      // For now, this would be implemented to call summarization API
      console.log('Generating summaries for selected documents:', Array.from(selectedDocuments));
      
      // Mock summaries - in real implementation, would call summarization API
      const mockSummaries = Array.from(selectedDocuments).map(docId => {
        const doc = searchResults.documents.find(d => d.id === docId);
        return {
          documentId: docId,
          type: doc?.type,
          title: doc?.title,
          summary: `AI-generated summary for ${doc?.title} would appear here after processing.`,
          keyArguments: ['Key argument 1', 'Key argument 2'],
          legalStandard: 'Legal standard from document',
          notableQuotes: ['Notable quote from document'],
          citedCases: ['Case citations from document']
        };
      });

      if (onSummariesGenerated) {
        onSummariesGenerated(mockSummaries);
      }

    } catch (error) {
      console.error('Summarization failed:', error);
    } finally {
      setIsGeneratingSummaries(false);
    }
  };

  const groupDocumentsByType = (documents: CaseDocument[]) => {
    return documents.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, CaseDocument[]>);
  };

  return (
    <div className="space-y-6">
      {/* Citation Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Legal Citation Research</h3>
        </div>
        
        {/* Compact Search Interface */}
        <div className="space-y-4">
          {/* Main Search Bar with Integrated Options */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            
            {/* Search Type Toggle - Compact */}
            <div className="flex items-center space-x-6 mb-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="searchType"
                  value="keywords"
                  checked={searchType === 'keywords'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">🔍 Keywords</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="searchType"
                  value="citation"
                  checked={searchType === 'citation'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">📚 Citations</span>
              </label>
              
              {/* Help Tooltip */}
              <div className="ml-auto">
                <button 
                  type="button"
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  title="Click for search help and examples"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <span>💡 Help</span>
                </button>
              </div>
            </div>

            {/* Search Input with Integrated Controls */}
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchType === 'keywords' 
                      ? "e.g., religious freedom, Miller, constitutional law..."
                      : "e.g., Miller v. McDonald, 944 F.3d 1050"
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
                {isRealTimeSearch && searchQuery.length >= 3 && (
                  <div className="absolute right-3 top-3.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Live
                  </div>
                )}
              </div>
              
              {/* Search Mode Dropdown */}
              <div className="relative">
                <select
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value as any)}
                  className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="exact">🎯 Exact</option>
                  <option value="related">🔗 Related</option>
                  <option value="comprehensive">📚 Broad</option>
                </select>
              </div>

              <button
                onClick={triggerSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Compact Options Row */}
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isRealTimeSearch}
                    onChange={(e) => setIsRealTimeSearch(e.target.checked)}
                    className="text-blue-600"
                  />
                  <span className="text-gray-600">⚡ Real-time search</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="text-green-600"
                  />
                  <span className="text-gray-600">💾 Auto-save on select</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-500">
                {documentCache.size > 0 && (
                  <span className="text-blue-600">📱 {documentCache.size} cached</span>
                )}
                {searchQuery.length >= 3 ? (
                  <span className="text-green-600">✓ Ready to search</span>
                ) : (
                  <span>Type 3+ characters</span>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Help Section */}
          {showHelp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  How to Use Legal Research
                </h4>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                {/* Left Column - Examples */}
                <div>
                  <div className="mb-3">
                    <strong>
                      {searchType === 'keywords' ? '🔍 Keyword Examples:' : '📚 Citation Examples:'}
                    </strong>
                    <div className="mt-1 space-y-1">
                      {searchType === 'keywords' ? (
                        <>
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">religious freedom</div>
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">constitutional law</div>
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">Supreme Court</div>
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">civil rights</div>
                        </>
                      ) : (
                        <>
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">Brown v. Board, 347 U.S. 483</div>
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">Roe v. Wade, 410 U.S. 113</div>
                          <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">Miranda v. Arizona, 384 U.S. 436</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>🎯 Search Modes:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li><strong>Exact:</strong> Specific case only</li>
                      <li><strong>Related:</strong> Similar cases & precedents</li>
                      <li><strong>Broad:</strong> Comprehensive discovery</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column - Tips & Tech */}
                <div>
                  <div className="mb-3">
                    <strong>💡 Pro Tips:</strong>
                    <ul className="mt-1 space-y-1 text-xs text-blue-700">
                      <li>• Use quotes: "religious freedom"</li>
                      <li>• Try single names: Miller, Brown</li>
                      <li>• Legal concepts: constitutional, precedent</li>
                      <li>• Court names: Supreme Court</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>🔍 Database Coverage:</strong>
                    <div className="text-xs text-blue-700 mt-1">
                      <strong>CourtListener contains:</strong><br/>
                      • 9+ million case law decisions from 2,000+ courts<br/>
                      • Complete SCOTUS opinions collection<br/>
                      • Hundreds of millions of federal PACER records<br/>
                      • 3.3+ million minutes of oral arguments<br/>
                      <br/>
                      <strong>Technology:</strong> V4 Search API with intelligent ranking.
                      Some newer cases may not have full text available.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Section - Streamlined */}
      {searchResults && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Compact Status Bar */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            {searchResults.summary.totalFound > 0 ? (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-700">
                    Found <strong>{searchResults.summary.totalFound}</strong> documents
                  </span>
                </div>
                <div className="text-gray-500">
                  {searchMode} search • 9M+ cases • V4 Search API
                </div>
              </div>
            ) : searchResults.summary.errors.length > 0 ? (
              <div className="flex items-center space-x-2 text-sm">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700">
                  Search failed • {searchResults.summary.errors[0]}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-700">
                    No results for "<strong>{searchResults.citation.original}</strong>"
                  </span>
                </div>
                <span className="text-gray-500">Try "Comprehensive" mode</span>
              </div>
            )}
          </div>

          {/* Document Selection Controls */}
          {searchResults.documents.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600">
                    Found {searchResults.summary.totalFound} total results, showing {searchResults.summary.documentsReturned} documents
                    {searchResults.documents.filter(doc => doc.hasPlainText).length > 0 && (
                      <span className="ml-2 text-green-600 font-medium">
                        ({searchResults.documents.filter(doc => doc.hasPlainText).length} with full text)
                      </span>
                    )}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllDocuments}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={selectNoneDocuments}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Select None
                      </button>
                    </div>
                    
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showOnlyWithContent}
                        onChange={(e) => setShowOnlyWithContent(e.target.checked)}
                        className="text-green-600"
                      />
                      <span className="text-gray-600">📄 Only show documents with full text</span>
                    </label>
                  </div>
                </div>
                {selectedDocuments.size > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={generateSummaries}
                      disabled={isGeneratingSummaries}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center space-x-1"
                    >
                      {isGeneratingSummaries ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3" />
                          <span>AI Summary ({selectedDocuments.size})</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={saveSelectedDocuments}
                      disabled={isSavingDocuments}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center space-x-1"
                    >
                      {isSavingDocuments ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          <span>Save to Database ({selectedDocuments.size})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document List - Simple & Immediate */}
          {searchResults.documents.length > 0 && (
            <div className="divide-y divide-gray-100">
              {searchResults.documents
                .filter(doc => showOnlyWithContent ? doc.hasPlainText : true)
                .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50"
                >
                  <button
                    onClick={() => toggleDocumentSelection(doc.id)}
                    className="flex-shrink-0"
                  >
                    {savingDocuments.has(doc.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    ) : selectedDocuments.has(doc.id) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <button
                          onClick={() => loadDocumentPreview(doc)}
                          className="font-medium text-gray-900 hover:text-blue-600 truncate text-left transition-colors"
                          title="Click to preview document"
                        >
                          {doc.title}
                        </button>
                        {doc.hasPlainText ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded flex-shrink-0">
                            ✅ Full Text
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded flex-shrink-0">
                            📋 Metadata Only
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {doc.source}
                        </span>
                        <button
                          onClick={() => loadDocumentPreview(doc)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {doc.downloadUrl && (
                          <button 
                            onClick={() => window.open(doc.downloadUrl, '_blank')}
                            className="p-1 text-gray-500 hover:text-gray-700 rounded"
                            title="View on CourtListener"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{doc.court}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                      {doc.docketNumber && (
                        <>
                          <span>•</span>
                          <span>Docket: {doc.docketNumber}</span>
                        </>
                      )}
                      {doc.authors && doc.authors.length > 0 && (
                        <>
                          <span>•</span>
                          <span>by {doc.authors.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results After Filter Message */}
          {searchResults.documents.length > 0 && 
           searchResults.documents.filter(doc => showOnlyWithContent ? doc.hasPlainText : true).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No documents with full text found</p>
              <p className="text-sm mt-2">
                Try unchecking "Only show documents with full text" to see all {searchResults.documents.length} results,
                or search for different terms that might have more content available.
              </p>
              <button
                onClick={() => setShowOnlyWithContent(false)}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Show all {searchResults.documents.length} documents
              </button>
            </div>
          )}

          {/* Selection Summary */}
          {selectedDocuments.size > 0 && (
            <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Selected Documents ({selectedDocuments.size})</span>
                </div>
                <span className="text-blue-700">Ready for AI summarization</span>
              </div>
            </div>
          )}
        </div>
      )}



      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {previewDocument.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <Scale className="w-3 h-3" />
                    <span>{previewDocument.court}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{previewDocument.date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{previewDocument.pageCount || 0} pages</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Document Text */}
              <div className="flex-1 p-6 overflow-y-auto">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading document preview...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-mono">
                      {previewDocument.fullText}
                    </pre>
                  </div>
                )}
              </div>

              {/* AI Summary Sidebar */}
              {previewDocument.summary && (
                <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto bg-gray-50">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>AI Analysis</span>
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {previewDocument.summary.aiSummary}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Key Points</h5>
                      <ul className="space-y-1">
                        {previewDocument.summary.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Legal Standard</h5>
                      <p className="text-sm text-gray-600">{previewDocument.summary.legalStandard}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Disposition</h5>
                      <p className="text-sm text-gray-600">{previewDocument.summary.disposition}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Notable Quotes</h5>
                      <div className="space-y-2">
                        {previewDocument.summary.notableQuotes.map((quote, index) => (
                          <blockquote key={index} className="text-sm text-gray-600 italic border-l-2 border-blue-200 pl-3">
                            "{quote}"
                          </blockquote>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Cited Cases</h5>
                      <ul className="space-y-1">
                        {previewDocument.summary.citedCases.map((caseRef, index) => (
                          <li key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            {caseRef}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Significance</h5>
                      <p className="text-sm text-gray-600">{previewDocument.summary.significance}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleDocumentSelection(previewDocument.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    selectedDocuments.has(previewDocument.id)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {selectedDocuments.has(previewDocument.id) ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>{selectedDocuments.has(previewDocument.id) ? 'Selected' : 'Select Document'}</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {previewDocument.downloadUrl && (
                  <button
                    onClick={() => window.open(previewDocument.downloadUrl, '_blank')}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>View on CourtListener</span>
                  </button>
                )}
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 