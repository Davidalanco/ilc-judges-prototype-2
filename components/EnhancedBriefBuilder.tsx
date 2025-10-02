'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle,
  Brain,
  FileText,
  Target,
  Users,
  BookOpen,
  Gavel,
  Scale,
  Sparkles
} from 'lucide-react';
import { DocumentSelectionPhase } from './DocumentSelectionPhase';
import { CaseOutlineBrainstorming } from './CaseOutlineBrainstorming';
import { BriefCaseInformationInput } from './BriefCaseInformationInput';

interface RelevantDocument {
  id: string;
  name: string;
  type: string;
  relevance: string;
  keyInsights: string[];
  caseContext: string;
  uploadDate: Date;
  isUploaded?: boolean;
}

interface CaseOutline {
  id: string;
  name: string;
  overallStrategy: string;
  coreThemes: string[];
  sections: any[];
  documentConnections: { [sectionId: string]: string[] };
  createdAt: Date;
  isGenerated: boolean;
}

interface CaseInfo {
  caseName: string;
  legalIssue: string;
  courtLevel: string;
  petitioner: string;
  respondent: string;
  keyPrecedents: string[];
  constitutionalQuestions: string[];
  overallTheme: string;
  transcriptionData: any;
}

type WorkflowPhase = 'case-setup' | 'document-selection' | 'case-outline' | 'brief-sections';

interface EnhancedBriefBuilderProps {
  caseId: string;
  onComplete?: () => void;
  initialData?: {
    caseInfo?: CaseInfo;
    documents?: RelevantDocument[];
    outline?: CaseOutline;
  };
}

export function EnhancedBriefBuilder({ caseId, onComplete, initialData }: EnhancedBriefBuilderProps) {
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>('case-setup');
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(initialData?.caseInfo || null);
  const [documents, setDocuments] = useState<RelevantDocument[]>(initialData?.documents || []);
  const [outline, setOutline] = useState<CaseOutline | null>(initialData?.outline || null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedCaseInfo = localStorage.getItem(`brief-case-${caseId}`);
        const savedDocuments = localStorage.getItem(`brief-documents-${caseId}`);
        const savedOutline = localStorage.getItem(`brief-outline-${caseId}`);
        const savedPhase = localStorage.getItem(`brief-phase-${caseId}`);

        if (savedCaseInfo) {
          const parsed = JSON.parse(savedCaseInfo);
          setCaseInfo(parsed);
        }

        if (savedDocuments) {
          const parsed = JSON.parse(savedDocuments);
          setDocuments(parsed.map((doc: any) => ({
            ...doc,
            uploadDate: new Date(doc.uploadDate)
          })));
        }

        if (savedOutline) {
          const parsed = JSON.parse(savedOutline);
          setOutline({
            ...parsed,
            createdAt: new Date(parsed.createdAt)
          });
        }

        if (savedPhase && ['case-setup', 'document-selection', 'case-outline', 'brief-sections'].includes(savedPhase)) {
          setCurrentPhase(savedPhase as WorkflowPhase);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, [caseId]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (caseInfo) {
      localStorage.setItem(`brief-case-${caseId}`, JSON.stringify(caseInfo));
    }
  }, [caseInfo, caseId]);

  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem(`brief-documents-${caseId}`, JSON.stringify(documents));
    }
  }, [documents, caseId]);

  useEffect(() => {
    if (outline) {
      localStorage.setItem(`brief-outline-${caseId}`, JSON.stringify(outline));
    }
  }, [outline, caseId]);

  useEffect(() => {
    localStorage.setItem(`brief-phase-${caseId}`, currentPhase);
  }, [currentPhase, caseId]);

  const handleCaseInfoComplete = (info: CaseInfo) => {
    setCaseInfo(info);
    setCurrentPhase('document-selection');
  };

  const handleDocumentsComplete = (docs: RelevantDocument[]) => {
    setDocuments(docs);
    // Don't automatically advance - let user decide when to proceed
  };

  const handleProceedToOutline = (docs: RelevantDocument[]) => {
    setDocuments(docs);
    setCurrentPhase('case-outline');
  };

  const handleOutlineComplete = (outlineData: CaseOutline) => {
    setOutline(outlineData);
    setCurrentPhase('brief-sections');
  };

  const handleBackToDocuments = () => {
    setCurrentPhase('document-selection');
  };

  const handleBackToCaseSetup = () => {
    setCurrentPhase('case-setup');
  };

  const getPhaseIcon = (phase: WorkflowPhase) => {
    switch (phase) {
      case 'case-setup': return <Gavel className="w-5 h-5" />;
      case 'document-selection': return <FileText className="w-5 h-5" />;
      case 'case-outline': return <Brain className="w-5 h-5" />;
      case 'brief-sections': return <BookOpen className="w-5 h-5" />;
    }
  };

  const getPhaseTitle = (phase: WorkflowPhase) => {
    switch (phase) {
      case 'case-setup': return 'Case Setup';
      case 'document-selection': return 'Document Selection';
      case 'case-outline': return 'Strategic Outline';
      case 'brief-sections': return 'Brief Sections';
    }
  };

  const getPhaseDescription = (phase: WorkflowPhase) => {
    switch (phase) {
      case 'case-setup': return 'Set up basic case information and upload strategy recordings';
      case 'document-selection': return 'Select and analyze relevant documents from past cases';
      case 'case-outline': return 'Create AI-powered strategic outline for your brief';
      case 'brief-sections': return 'Build detailed brief sections based on your outline';
    }
  };

  const isPhaseComplete = (phase: WorkflowPhase) => {
    switch (phase) {
      case 'case-setup': return !!caseInfo?.caseName && !!caseInfo?.legalIssue;
      case 'document-selection': return documents.length > 0;
      case 'case-outline': return !!outline;
      case 'brief-sections': return false; // This would be determined by section completion
    }
  };

  const canNavigateToPhase = (phase: WorkflowPhase) => {
    switch (phase) {
      case 'case-setup': return true;
      case 'document-selection': return isPhaseComplete('case-setup');
      case 'case-outline': return isPhaseComplete('document-selection');
      case 'brief-sections': return isPhaseComplete('case-outline');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Brief Builder</h1>
              <p className="text-gray-600">
                {caseInfo?.caseName || 'Untitled Case'} • Enhanced Workflow
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {currentPhase !== 'case-setup' && (
                <button
                  onClick={handleBackToCaseSetup}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Setup</span>
                </button>
              )}
            </div>
          </div>

          {/* Phase Progress */}
          <div className="flex items-center space-x-4">
            {(['case-setup', 'document-selection', 'case-outline', 'brief-sections'] as WorkflowPhase[]).map((phase, index) => (
              <React.Fragment key={phase}>
                <button
                  onClick={() => canNavigateToPhase(phase) ? setCurrentPhase(phase) : undefined}
                  disabled={!canNavigateToPhase(phase)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPhase === phase
                      ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                      : canNavigateToPhase(phase)
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      : 'bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed'
                  }`}
                >
                  {isPhaseComplete(phase) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : currentPhase === phase ? (
                    getPhaseIcon(phase)
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                  <div className="text-left">
                    <div className="font-medium">{getPhaseTitle(phase)}</div>
                    <div className="text-xs opacity-75">{getPhaseDescription(phase)}</div>
                  </div>
                </button>
                
                {index < 3 && (
                  <div className={`w-8 h-0.5 ${
                    isPhaseComplete(phase) ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing...</p>
            </div>
          </div>
        )}

        {/* Phase Content */}
        {currentPhase === 'case-setup' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Setup</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start by setting up your case information and uploading any strategy session recordings. 
                Our AI will analyze the content and help populate the form fields.
              </p>
            </div>
            
            <BriefCaseInformationInput
              onCaseInfoChange={handleCaseInfoComplete}
              initialData={caseInfo}
              onProceedToBrief={handleCaseInfoComplete}
            />
          </div>
        )}

        {currentPhase === 'document-selection' && caseInfo && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Selection & Analysis</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Select and analyze relevant documents from past cases, research, or legal materials. 
                Explain why each document is relevant to build a stronger strategic outline.
              </p>
            </div>

            <DocumentSelectionPhase
              onDocumentsComplete={handleDocumentsComplete}
              onProceedToOutline={handleProceedToOutline}
              initialDocuments={documents}
            />
          </div>
        )}

        {currentPhase === 'case-outline' && caseInfo && documents.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Strategic Case Outline</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                AI-powered strategic outline based on your case information and selected documents. 
                Review, edit, and refine the outline before building your brief sections.
              </p>
            </div>

            <CaseOutlineBrainstorming
              documents={documents}
              caseInfo={caseInfo}
              onOutlineComplete={handleOutlineComplete}
              onBackToDocuments={handleBackToDocuments}
              initialOutline={outline}
            />
          </div>
        )}

        {currentPhase === 'brief-sections' && caseInfo && outline && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Argument Development</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Build your core legal arguments based on your strategic outline. 
                Focus on the most impactful arguments first, guided by your document analysis.
              </p>
            </div>

            {/* Strategic Argument Priorities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Argument Priorities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outline.sections
                  .filter(section => section.title.toLowerCase().includes('argument') || section.priority === 'high')
                  .sort((a, b) => {
                    if (a.priority === 'high' && b.priority !== 'high') return -1;
                    if (b.priority === 'high' && a.priority !== 'high') return 1;
                    return a.order - b.order;
                  })
                  .map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{section.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          section.priority === 'high' ? 'bg-red-100 text-red-800' :
                          section.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {section.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">
                          <strong>Key Arguments:</strong> {section.keyArguments.length}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>Legal Basis:</strong> {section.legalBasis.length} items
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>Est. Words:</strong> {section.estimatedWords}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Navigate to argument development for this section
                          router.push(`/ai-brief/${caseId}?enhanced=false&section=${section.id}`);
                        }}
                        className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Develop This Argument
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Outline Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Strategic Foundation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Overall Strategy</h4>
                  <p className="text-sm text-gray-600">{outline.overallStrategy}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Core Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {outline.coreThemes.map((theme, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <strong>{outline.sections.length}</strong> sections planned
                  </span>
                  <span className="text-gray-600">
                    <strong>{outline.sections.reduce((total, section) => total + (section.estimatedWords || 0), 0)}</strong> words estimated
                  </span>
                  <span className="text-gray-600">
                    <strong>{documents.length}</strong> documents analyzed
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPhase('case-outline')}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Outline</span>
              </button>
              <button
                onClick={() => {
                  // Start with the highest priority argument
                  const prioritySection = outline.sections
                    .filter(s => s.priority === 'high' || s.title.toLowerCase().includes('argument'))
                    .sort((a, b) => a.order - b.order)[0];
                  
                  if (prioritySection) {
                    router.push(`/ai-brief/${caseId}?enhanced=false&section=${prioritySection.id}`);
                  } else {
                    router.push(`/ai-brief/${caseId}?enhanced=false`);
                  }
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>Start with Priority Argument</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Help */}
        {currentPhase !== 'brief-sections' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Enhanced Workflow Benefits</h4>
                <ul className="text-blue-800 text-sm mt-2 space-y-1">
                  <li>• <strong>Document Analysis:</strong> AI analyzes your past cases and materials for relevant insights</li>
                  <li>• <strong>Strategic Planning:</strong> Comprehensive outline ensures coherent argument flow</li>
                  <li>• <strong>Guided Development:</strong> Each brief section is informed by your strategic outline</li>
                  <li>• <strong>Quality Assurance:</strong> Built-in coherence checking and quality scoring</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
