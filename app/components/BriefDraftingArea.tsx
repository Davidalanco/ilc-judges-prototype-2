'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit3, 
  Save, 
  Download, 
  Eye, 
  RefreshCw, 
  MessageSquare, 
  Target, 
  Brain,
  BookOpen,
  Users,
  Scale,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import BriefUpload from './BriefUpload';
import EightWaveProgressPanel from './EightWaveProgressPanel';

interface BriefSection {
  id: string;
  title: string;
  content: string;
  type: 'statement_of_interest' | 'question_presented' | 'summary_of_argument' | 'argument' | 'conclusion' | 'other';
  order: number;
  isExpanded?: boolean;
  isEditing?: boolean;
  wordCount?: number;
  persuasionScore?: number;
}

interface BriefData {
  id?: string;
  caseId?: string;
  sections: BriefSection[];
  metadata: {
    totalWordCount: number;
    overallPersuasionScore: number;
    briefType: 'amicus' | 'petitioner' | 'respondent';
    status: 'draft' | 'review' | 'final';
    lastSaved: string;
  };
  exampleBrief?: {
    id: string;
    fileName: string;
    structure: BriefSection[];
  };
}

interface BriefDraftingAreaProps {
  caseId?: string;
  caseInformation?: any;
  selectedDocuments?: any[];
  documentSummaries?: string[];
  justiceAnalysis?: any;
  historicalResearch?: any;
  referenceBrief?: any;
  onBriefSaved?: (briefData: BriefData) => void;
}

export default function BriefDraftingArea({
  caseId,
  caseInformation,
  selectedDocuments = [],
  documentSummaries = [],
  justiceAnalysis,
  historicalResearch,
  referenceBrief,
  onBriefSaved
}: BriefDraftingAreaProps) {
  const [briefData, setBriefData] = useState<BriefData>({
    id: undefined,
    caseId,
    sections: [],
    metadata: {
      totalWordCount: 0,
      overallPersuasionScore: 0,
      briefType: 'amicus',
      status: 'draft',
      lastSaved: new Date().toISOString()
    }
  });

  const [activeTab, setActiveTab] = useState<'structure' | 'upload' | 'preview' | 'eight-wave'>('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sectionChats, setSectionChats] = useState<{[key: string]: Array<{role: 'user' | 'assistant', content: string}>}>({});
  const [chatInputs, setChatInputs] = useState<{[key: string]: string}>({});
  const [strategyChatHistory, setStrategyChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [strategyChatInput, setStrategyChatInput] = useState('');
  const [isStrategyChatLoading, setIsStrategyChatLoading] = useState(false);
  const [currentOutline, setCurrentOutline] = useState<string | null>(null);
  const [showOutlinePrompt, setShowOutlinePrompt] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [approvedOutline, setApprovedOutline] = useState<string | null>(null);

  // Load reference brief if provided
  useEffect(() => {
    if (referenceBrief && !briefData.exampleBrief) {
      console.log('📄 Loading existing reference brief:', referenceBrief.fileName);
      setBriefData(prev => ({
        ...prev,
        exampleBrief: {
          id: referenceBrief.id,
          fileName: referenceBrief.fileName,
          structure: referenceBrief.structure
        }
      }));
    }
  }, [referenceBrief, briefData.exampleBrief]);

  // Load existing strategy chat and approved outline when component mounts
  useEffect(() => {
    if (caseId && strategyChatHistory.length === 0) {
      loadExistingStrategyChat();
      loadExistingApprovedOutline();
    }
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save strategy chat after each message
  useEffect(() => {
    if (strategyChatHistory.length > 0 && caseId) {
      // Debounce the save to avoid too many API calls
      const saveTimeout = setTimeout(() => {
        saveStrategyChatToDatabase();
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [strategyChatHistory, caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize with default amicus brief structure
  useEffect(() => {
    if (briefData.sections.length === 0) {
      const defaultSections: BriefSection[] = [
        {
          id: 'statement_of_interest',
          title: 'Statement of Interest',
          content: '',
          type: 'statement_of_interest',
          order: 1,
          isExpanded: true,
          wordCount: 0,
          persuasionScore: 0
        },
        {
          id: 'question_presented',
          title: 'Question Presented',
          content: '',
          type: 'question_presented',
          order: 2,
          isExpanded: false,
          wordCount: 0,
          persuasionScore: 0
        },
        {
          id: 'summary_of_argument',
          title: 'Summary of Argument',
          content: '',
          type: 'summary_of_argument',
          order: 3,
          isExpanded: false,
          wordCount: 0,
          persuasionScore: 0
        },
        {
          id: 'argument_1',
          title: 'Argument I: [To be generated based on case analysis]',
          content: '',
          type: 'argument',
          order: 4,
          isExpanded: false,
          wordCount: 0,
          persuasionScore: 0
        },
        {
          id: 'argument_2',
          title: 'Argument II: [To be generated based on case analysis]',
          content: '',
          type: 'argument',
          order: 5,
          isExpanded: false,
          wordCount: 0,
          persuasionScore: 0
        },
        {
          id: 'conclusion',
          title: 'Conclusion',
          content: '',
          type: 'conclusion',
          order: 6,
          isExpanded: false,
          wordCount: 0,
          persuasionScore: 0
        }
      ];

      setBriefData(prev => ({
        ...prev,
        sections: defaultSections
      }));
    }
  }, []);

  // Calculate total word count and persuasion score
  useEffect(() => {
    const totalWords = briefData.sections.reduce((sum, section) => {
      return sum + (section.content ? section.content.split(/\s+/).length : 0);
    }, 0);

    const averagePersuasion = briefData.sections.length > 0 
      ? briefData.sections.reduce((sum, section) => sum + (section.persuasionScore || 0), 0) / briefData.sections.length
      : 0;

    setBriefData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        totalWordCount: totalWords,
        overallPersuasionScore: Math.round(averagePersuasion)
      }
    }));
  }, [briefData.sections]);

  const handleExampleBriefUpload = (uploadedBrief: any) => {
    console.log('📄 Example brief uploaded:', uploadedBrief.fileName);
    
    setBriefData(prev => ({
      ...prev,
      exampleBrief: {
        id: uploadedBrief.id,
        fileName: uploadedBrief.fileName,
        structure: uploadedBrief.structure
      }
    }));

    // Switch to structure tab after upload
    setActiveTab('structure');

    // Show success message
    const toast = document.createElement('div');
    toast.textContent = `✅ Example brief "${uploadedBrief.fileName}" uploaded and analyzed!`;
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 font-medium';
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const generateBriefContent = async () => {
    if (!caseInformation) {
      alert('Please complete case information first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setActiveTab('structure');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Build comprehensive context for AI generation
      const contextData = {
        caseInformation,
        selectedDocuments: selectedDocuments.map(doc => ({
          id: (doc as any).id,
          title: doc.title || (doc as any).case_title,
          content: (doc as any).content || (doc as any).full_text || '',
          citation: (doc as any).citation,
          relevance: (doc as any).relevance_score,
          type: (doc as any).document_type || (doc as any).type,
          fileName: (doc as any).file_name || (doc as any).fileName,
          source: (doc as any).source || 'upload',
          url: (doc as any).s3_url || (doc as any).url
        })),
        documentSummaries,
        justiceAnalysis,
        historicalResearch,
        exampleBrief: briefData.exampleBrief,
        strategyChatHistory: strategyChatHistory, // Include the entire strategy discussion
        approvedOutline: approvedOutline // Include the approved brief outline
      };

      console.log('🤖 Generating brief content with context:', {
        caseInfo: !!contextData.caseInformation,
        documents: contextData.selectedDocuments.length,
        summaries: contextData.documentSummaries.length,
        justiceAnalysis: !!contextData.justiceAnalysis,
        historicalResearch: !!contextData.historicalResearch,
        exampleBrief: !!contextData.exampleBrief,
        strategyChatMessages: contextData.strategyChatHistory.length
      });

      const response = await fetch('/api/ai/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify({
          caseId,
          contextData,
          briefStructure: briefData.sections.map(s => ({
            id: s.id,
            title: s.title,
            type: s.type,
            order: s.order
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate brief content');
      }

      const generatedData = await response.json();
      setGenerationProgress(100);

      // Update sections with generated content
      const updatedSections = briefData.sections.map(section => {
        const generated = generatedData.sections.find((s: any) => s.id === section.id);
        if (generated) {
          return {
            ...section,
            content: generated.content,
            title: generated.title || section.title,
            wordCount: generated.content.split(/\s+/).length,
            persuasionScore: generated.persuasionScore || 75
          };
        }
        return section;
      });

      setBriefData(prev => ({
        ...prev,
        sections: updatedSections,
        id: generatedData.briefId || prev.id
      }));

      console.log('✅ Brief content generated successfully');

    } catch (error) {
      console.error('Brief generation error:', error);
      alert('Failed to generate brief content. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const saveBrief = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/briefs', {
        method: briefData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify({
          id: briefData.id,
          caseId,
          sections: briefData.sections,
          metadata: {
            ...briefData.metadata,
            lastSaved: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save brief');
      }

      const savedData = await response.json();
      
      setBriefData(prev => ({
        ...prev,
        id: savedData.brief.id,
        metadata: {
          ...prev.metadata,
          lastSaved: new Date().toISOString()
        }
      }));

      onBriefSaved?.(briefData);

      console.log('✅ Brief saved successfully');

    } catch (error) {
      console.error('Brief save error:', error);
      alert('Failed to save brief. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setBriefData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    }));
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setBriefData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { 
              ...section, 
              content,
              wordCount: content.split(/\s+/).length
            }
          : section
      )
    }));
  };

  const handleSectionChat = async (sectionId: string, message: string) => {
    if (!message.trim()) return;

    // Add user message
    setSectionChats(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        { role: 'user', content: message }
      ]
    }));

    setChatInputs(prev => ({ ...prev, [sectionId]: '' }));

    try {
      // Get current section content
      const section = briefData.sections.find(s => s.id === sectionId);
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify({
          caseId,
          sectionId,
          message,
          sectionContent: section?.content || '',
          contextData: {
            caseInformation,
            selectedDocuments,
            justiceAnalysis
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setSectionChats(prev => ({
          ...prev,
          [sectionId]: [
            ...prev[sectionId],
            { role: 'assistant', content: data.response }
          ]
        }));
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  // Load existing strategy chat from database
  const loadExistingStrategyChat = async () => {
    if (!caseId) return;

    try {
      console.log('💬 Loading existing strategy chat for case:', caseId);
      
      const response = await fetch(`/api/cases/${caseId}/strategy-chat`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chatHistory && data.chatHistory.length > 0) {
          setStrategyChatHistory(data.chatHistory);
          console.log(`✅ Loaded ${data.chatHistory.length} strategy chat messages`);
        }
      } else {
        console.log('ℹ️ No existing strategy chat found for case');
      }
    } catch (error) {
      console.error('Error loading strategy chat:', error);
    }
  };

  // Load existing approved outline from database
  const loadExistingApprovedOutline = async () => {
    if (!caseId) return;

    try {
      console.log('📋 Loading existing approved outline...');
      
      const response = await fetch(`/api/cases/${caseId}/approved-outline`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.outline) {
          setApprovedOutline(data.outline);
          console.log(`✅ Loaded approved outline`);
        }
      }
    } catch (error) {
      console.error('Error loading approved outline:', error);
    }
  };

  // Save strategy chat to database
  const saveStrategyChatToDatabase = async () => {
    if (!caseId || strategyChatHistory.length === 0) return;

    try {
      console.log('💾 Auto-saving strategy chat...');
      
      const response = await fetch(`/api/cases/${caseId}/strategy-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          chatHistory: strategyChatHistory
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Strategy chat auto-saved (${data.messageCount} messages)`);
      } else {
        console.warn('⚠️ Failed to auto-save strategy chat');
      }
    } catch (error) {
      console.error('Strategy chat save error:', error);
    }
  };

  // Clear strategy chat and remove from database
  const clearStrategyChat = async () => {
    if (!caseId) return;

    // Confirm with user
    const confirmed = confirm('Are you sure you want to clear all strategy chat messages? This action cannot be undone.');
    if (!confirmed) return;

    try {
      console.log('🗑️ Clearing strategy chat...');
      
      // Clear from database
      const response = await fetch(`/api/cases/${caseId}/strategy-chat`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Cleared ${data.deletedCount} strategy chat record(s) from database`);
        
        // Clear local state
        setStrategyChatHistory([]);
        
        // Show success notification
        const toast = document.createElement('div');
        toast.textContent = '🗑️ Strategy chat cleared successfully';
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 text-sm';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear strategy chat');
      }
    } catch (error) {
      console.error('Clear strategy chat error:', error);
      alert('Failed to clear strategy chat. Please try again.');
    }
  };

  const handleStrategyChat = async () => {
    if (!strategyChatInput.trim()) return;

    const userMessage = strategyChatInput.trim();
    
    // Add user message to chat history
    setStrategyChatHistory(prev => [
      ...prev,
      { role: 'user', content: userMessage }
    ]);

    // Clear input and start loading
    setStrategyChatInput('');
    setIsStrategyChatLoading(true);

    try {
      console.log('🧠 Sending strategy chat with full context...');
      
      const response = await fetch('/api/ai/strategy-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          chatHistory: strategyChatHistory,
          caseInformation,
          selectedDocuments: selectedDocuments.map(doc => ({
            id: (doc as any).id,
            title: doc.title || (doc as any).case_title,
            content: (doc as any).content || (doc as any).full_text || '',
            citation: (doc as any).citation,
            relevance: (doc as any).relevance_score,
            type: (doc as any).document_type || (doc as any).type,
            fileName: (doc as any).file_name || (doc as any).fileName,
            source: (doc as any).source || 'upload',
            url: (doc as any).s3_url || (doc as any).url
          })),
          historicalResearch,
          justiceAnalysis
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response to chat history
        setStrategyChatHistory(prev => [
          ...prev,
          { role: 'assistant', content: data.response }
        ]);
        
        // Show outline prompt after each AI response
        setShowOutlinePrompt(true);
        
        console.log('✅ Strategy chat response received', {
          contextUsed: data.contextUsed
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Strategy chat failed');
      }
    } catch (error) {
      console.error('Strategy chat error:', error);
      
      // Add error message to chat
      setStrategyChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: 'I apologize, but I encountered an error processing your strategy question. Please try again or rephrase your question.' }
      ]);
    } finally {
      setIsStrategyChatLoading(false);
    }
  };

  // Generate brief outline based on current strategy discussion
  const generateOutline = async () => {
    if (!strategyChatHistory.length) return;

    setIsGeneratingOutline(true);
    setShowOutlinePrompt(false);

    try {
      const response = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          strategyChatHistory,
          caseInformation,
          selectedDocuments: selectedDocuments.map(doc => ({
            title: doc.title || doc.case_title,
            content: doc.content || doc.full_text || '',
            citation: doc.citation,
            relevance: doc.relevance_score
          })),
          historicalResearch,
          justiceAnalysis
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentOutline(data.outline);
        console.log('✅ Brief outline generated successfully');
      } else {
        throw new Error('Outline generation failed');
      }
    } catch (error) {
      console.error('Outline generation error:', error);
      alert('Failed to generate brief outline. Please try again.');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // Approve the current outline for brief generation
  const approveOutline = async () => {
    if (!currentOutline || !caseId) return;

    try {
      // Save approved outline to database
      const response = await fetch(`/api/cases/${caseId}/approved-outline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          outline: currentOutline
        }),
      });

      if (response.ok) {
        setApprovedOutline(currentOutline);
        setCurrentOutline(null);
        console.log('✅ Brief outline approved and saved to database');
      } else {
        throw new Error('Failed to save approved outline');
      }
    } catch (error) {
      console.error('Error saving approved outline:', error);
      // Still approve locally even if save fails
      setApprovedOutline(currentOutline);
      setCurrentOutline(null);
      alert('Outline approved locally, but failed to save to database');
    }
  };

  // Dismiss the current outline without approving
  const dismissOutline = () => {
    setCurrentOutline(null);
    console.log('❌ Brief outline dismissed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Brief Structure and Drafting</h2>
            <p className="text-gray-600">Generate and refine your amicus brief with AI assistance</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              {briefData.metadata.totalWordCount.toLocaleString()} words
            </div>
            {briefData.metadata.overallPersuasionScore > 0 && (
              <div className="text-sm text-green-600 font-medium">
                {briefData.metadata.overallPersuasionScore}% persuasion score
              </div>
            )}
            <button
              onClick={saveBrief}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Brief
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Upload Example
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'structure'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            Draft & Edit
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </button>

          <button
            onClick={() => setActiveTab('eight-wave')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'eight-wave'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            8-Wave Generation
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <BriefUpload 
            onBriefUploaded={handleExampleBriefUpload}
            caseId={caseId}
          />
          
          {briefData.exampleBrief && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-green-900">Example Brief Loaded</h4>
                  <p className="text-green-700 text-sm">
                    {briefData.exampleBrief.fileName} - {briefData.exampleBrief.structure.length} sections identified
                  </p>
                  {briefData.exampleBrief.content && briefData.exampleBrief.content.length > 100 ? (
                    <p className="text-green-600 text-xs mt-1">
                      ✅ Content extracted ({briefData.exampleBrief.content.length} characters) - will be used for style reference
                    </p>
                  ) : (
                    <p className="text-yellow-600 text-xs mt-1">
                      ⚠️ Limited content extracted - structure will be used but style reference may be limited
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'structure' && (
        <div className="space-y-4">
                      {/* Strategy Chat */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Constitutional Strategy Chat</h3>
                </div>
                {strategyChatHistory.length > 0 && (
                  <button
                    onClick={clearStrategyChat}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Clear all chat messages"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Chat</span>
                  </button>
                )}
              </div>
            <p className="text-gray-600 text-sm mb-4">
              Share your legal strategy ideas and get expert constitutional law insights. I have access to all your case files, research, and historical documents.
            </p>
            
            {/* Chat History */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
              {strategyChatHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Start a strategy discussion</p>
                  <p className="text-sm mt-1">Ask about constitutional arguments, precedents, or creative legal approaches</p>
                  <div className="mt-4 text-xs text-left bg-white p-3 rounded border">
                    <p className="font-medium text-gray-700 mb-2">Example questions:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• "What's the strongest constitutional argument for religious liberty here?"</li>
                      <li>• "How can we frame this as a separation of powers issue?"</li>
                      <li>• "What historical precedents support our due process claim?"</li>
                      <li>• "Which justices would be most persuaded by originalist arguments?"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {strategyChatHistory.map((message, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-100 border-l-4 border-blue-500 ml-8' 
                        : 'bg-white border-l-4 border-purple-500 mr-8 shadow-sm'
                    }`}>
                      <div className="flex items-center mb-1">
                        <span className={`text-xs font-semibold ${
                          message.role === 'user' ? 'text-blue-700' : 'text-purple-700'
                        }`}>
                          {message.role === 'user' ? 'Your Strategy Question' : 'Constitutional Expert'}
                        </span>
                      </div>
                      <div className={`text-sm whitespace-pre-wrap ${
                        message.role === 'user' ? 'text-blue-800' : 'text-gray-800'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isStrategyChatLoading && (
                    <div className="bg-white border-l-4 border-purple-500 mr-8 shadow-sm p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-purple-700 font-semibold">Constitutional Expert</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Analyzing your strategy with full case context...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Outline Generation Prompt */}
            {showOutlinePrompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-blue-900">Ready to see your brief outline?</h4>
                      <p className="text-sm text-blue-700">Generate a detailed outline based on your strategy discussion to review before writing the full brief.</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={generateOutline}
                      disabled={isGeneratingOutline || strategyChatHistory.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      title={strategyChatHistory.length === 0 ? "Start a strategy discussion first" : "Generate outline based on strategy chat"}
                    >
                      {isGeneratingOutline ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Outline
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowOutlinePrompt(false)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Current Outline Display */}
            {currentOutline && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-900">Brief Outline Generated</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={approveOutline}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Use
                    </button>
                    <button
                      onClick={dismissOutline}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <div className="bg-white border rounded p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{currentOutline}</pre>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  Review this outline and approve it to ensure your brief follows this exact structure and includes all these points.
                </p>
              </div>
            )}

            {/* Approved Outline Indicator */}
            {approvedOutline && !currentOutline && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-purple-900">Approved Brief Outline Ready</h4>
                    <p className="text-sm text-purple-700">Your brief will be generated using the approved outline structure and strategy points.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Outline Generation */}
            {strategyChatHistory.length > 0 && !showOutlinePrompt && !currentOutline && !approvedOutline && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-gray-900">Generate Brief Outline</h4>
                      <p className="text-sm text-gray-600">Create a detailed outline based on your strategy discussion to review before generating the brief.</p>
                    </div>
                  </div>
                  <button
                    onClick={generateOutline}
                    disabled={isGeneratingOutline}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isGeneratingOutline ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Outline
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Chat Input */}
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={strategyChatInput}
                  onChange={(e) => setStrategyChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleStrategyChat();
                    }
                  }}
                  placeholder="Share your strategy ideas or ask for constitutional law insights... (Shift+Enter for new line)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isStrategyChatLoading}
                />
              </div>
              <button
                onClick={handleStrategyChat}
                disabled={!strategyChatInput.trim() || isStrategyChatLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStrategyChatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generation Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Brief Generation</h3>
                <p className="text-gray-600 text-sm">Generate content based on your case data and research</p>
              </div>
              <button
                onClick={generateBriefContent}
                disabled={isGenerating || !caseInformation}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Brief'}
              </button>
            </div>

            {/* Placeholder Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The AI will use placeholder text like <code>[AMICUS ORGANIZATION NAME]</code> for information not provided. 
                You can easily search and replace these placeholders with your specific organization details after generation.
              </p>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {generationProgress < 30 ? 'Analyzing case context...' :
                   generationProgress < 60 ? 'Generating legal arguments...' :
                   generationProgress < 90 ? 'Optimizing for justice targeting...' :
                   'Finalizing brief structure...'}
                </p>
              </div>
            )}
          </div>

          {/* Sections */}
          {briefData.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSectionExpanded(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{section.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{section.wordCount || 0} words</span>
                        {section.persuasionScore && section.persuasionScore > 0 && (
                          <span className="text-green-600">{section.persuasionScore}% persuasion</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {section.content && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {section.isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {section.isExpanded && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <div className="pt-4 space-y-4">
                    {/* Content Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Content
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSectionContent(section.id, e.target.value)}
                        placeholder={`Write the ${section.title.toLowerCase()} here...`}
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Chat Interface */}
                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">AI Assistant</h5>
                      
                      {/* Chat Messages */}
                      {sectionChats[section.id] && sectionChats[section.id].length > 0 && (
                        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                          {sectionChats[section.id].map((message, index) => (
                            <div key={index} className={`text-xs p-2 rounded ${
                              message.role === 'user' 
                                ? 'bg-blue-100 text-blue-800 ml-4' 
                                : 'bg-gray-100 text-gray-800 mr-4'
                            }`}>
                              <strong>{message.role === 'user' ? 'You' : 'AI'}:</strong> {message.content}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Chat Input */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Ask for help with this section..."
                          value={chatInputs[section.id] || ''}
                          onChange={(e) => setChatInputs(prev => ({...prev, [section.id]: e.target.value}))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSectionChat(section.id, chatInputs[section.id] || '');
                            }
                          }}
                          className="flex-1 text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSectionChat(section.id, chatInputs[section.id] || '')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                BRIEF OF AMICUS CURIAE
              </h1>
              <p className="text-gray-600">
                {caseInformation?.caseName || 'Case Name'}
              </p>
            </div>

            <div className="space-y-8">
              {briefData.sections
                .filter(section => section.content)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase">
                      {section.title}
                    </h2>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))}
            </div>

            {briefData.sections.filter(s => s.content).length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Content Yet</h3>
                <p className="text-gray-500">
                  Generate or write content in the Draft & Edit tab to see the preview.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'eight-wave' && (
        <div>
          <EightWaveProgressPanel 
            caseId={caseId}
            className="mb-6"
          />
        </div>
      )}
    </div>
  );
}
