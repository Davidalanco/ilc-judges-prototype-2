'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BriefCaseInformationInput } from '@/components/BriefCaseInformationInput';
import { EnhancedBriefBuilder } from '@/components/EnhancedBriefBuilder';
import { sanitizeData, safeStringify, safeParse } from '@/lib/utils/sanitize';
import { Brain, FileText, ArrowRight } from 'lucide-react';

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
  id: string;
  createdAt: Date;
  lastModified: Date;
}

export default function AIBriefBuilder() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [showCaseSetup, setShowCaseSetup] = useState(false);
  const [showEnhancedWorkflow, setShowEnhancedWorkflow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Load cases from localStorage
  useEffect(() => {
    const loadCases = () => {
      try {
        const storedCases = localStorage.getItem('brief-cases');
        
        if (storedCases) {
          const parsedCases = safeParse(storedCases).map((caseData: any) => ({
            ...sanitizeData(caseData),
            createdAt: new Date(caseData.createdAt),
            lastModified: new Date(caseData.lastModified)
          }));
          setCases(parsedCases);
        }
      } catch (error) {
        console.error('Error loading cases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, []);

  // Create a new case
  const createCase = (caseData: Omit<CaseInfo, 'id' | 'createdAt' | 'lastModified'>) => {
    console.log('🔍 Original case data:', caseData);
    
    // Sanitize the case data to remove any circular references
    const sanitizedCaseData = sanitizeData(caseData);
    console.log('🧹 Sanitized case data:', sanitizedCaseData);
    
    const newCase: CaseInfo = {
      ...sanitizedCaseData,
      id: `case-${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date()
    };

    console.log('📦 New case object:', newCase);

    const updatedCases = [...cases, newCase];
    setCases(updatedCases);
    
    try {
      console.log('💾 Attempting to save to localStorage...');
      localStorage.setItem('brief-cases', safeStringify(updatedCases));
      localStorage.setItem(`brief-case-${newCase.id}`, safeStringify(newCase));
      console.log('✅ Successfully saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving case data:', error);
      console.error('Error details:', error);
      alert('Error saving case data. Please try again.');
      return;
    }

    // Navigate to the first section of the new case
    router.push(`/ai-brief/${newCase.id}/interest-of-amicus`);
  };

  // Delete a case
  const deleteCase = (caseId: string) => {
    if (confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      const updatedCases = cases.filter(c => c.id !== caseId);
      setCases(updatedCases);
      localStorage.setItem('brief-cases', safeStringify(updatedCases));
      localStorage.removeItem(`brief-case-${caseId}`);
    }
  };

  // Navigate to a case
  const openCase = (caseId: string) => {
    router.push(`/ai-brief/${caseId}`);
  };

  // Navigate to enhanced workflow
  const openEnhancedWorkflow = (caseId: string) => {
    router.push(`/ai-brief/${caseId}?enhanced=true`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Case Setup Modal */}
      {showCaseSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Create New Case</h2>
                <button
                  onClick={() => setShowCaseSetup(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <BriefCaseInformationInput
                onCaseInfoChange={() => {}} // Not needed for this flow
                initialData={{
                  caseName: '',
                  legalIssue: '',
                  courtLevel: 'U.S. Supreme Court',
                  petitioner: '',
                  respondent: '',
                  keyPrecedents: [],
                  constitutionalQuestions: [],
                  overallTheme: '',
                  transcriptionData: null
                }}
                onProceedToBrief={(caseData) => {
                  createCase(caseData);
                  setShowCaseSetup(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
            <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
            >
              ← Back to Home
            </button>
              <h1 className="text-3xl font-bold text-gray-900">
                🏛️ AI Brief Builder
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage AI-powered amicus briefs for Supreme Court cases
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCaseSetup(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <span className="mr-2">+</span>
                New Case
              </button>
              <button
                onClick={() => setShowEnhancedWorkflow(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Brain className="w-4 h-4 mr-2" />
                Enhanced Workflow
              </button>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Cases Yet</h2>
                <p className="text-gray-600 mb-6">
                  Create your first amicus brief case to get started
                </p>
              <button
                  onClick={() => setShowCaseSetup(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Case
              </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseData) => (
                <div
                  key={caseData.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {caseData.caseName}
                      </h3>
                      <button
                        onClick={() => deleteCase(caseData.id)}
                        className="text-gray-400 hover:text-red-600 text-sm"
                        title="Delete case"
                      >
                        🗑️
                      </button>
                  </div>
                  
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>Issue:</strong> {caseData.legalIssue}</p>
                      <p><strong>Court:</strong> {caseData.courtLevel}</p>
                      <p><strong>Petitioner:</strong> {caseData.petitioner}</p>
                      <p><strong>Respondent:</strong> {caseData.respondent}</p>
                  </div>

                    <div className="text-xs text-gray-500 mb-4">
                      <p>Created: {caseData.createdAt.toLocaleDateString()}</p>
                      <p>Modified: {caseData.lastModified.toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openCase(caseData.id)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Traditional</span>
                        </button>
                        <button
                          onClick={() => openEnhancedWorkflow(caseData.id)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          <Brain className="w-4 h-4" />
                          <span>Enhanced</span>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          // Copy case data to clipboard
                          navigator.clipboard.writeText(JSON.stringify(caseData, null, 2));
                          alert('Case data copied to clipboard');
                        }}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        title="Copy case data"
                      >
                        📋 Copy Case Data
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
        </div>

        {/* Enhanced Workflow Modal */}
        {showEnhancedWorkflow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Enhanced Workflow</h2>
                  <button
                    onClick={() => setShowEnhancedWorkflow(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Enhanced AI Brief Builder</h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      A sophisticated 4-phase workflow that leverages document analysis and strategic planning 
                      to create more compelling and coherent amicus briefs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Phase 1: Case Setup</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Upload strategy session recordings</li>
                        <li>• AI extracts case information automatically</li>
                        <li>• Complete basic case details</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Phase 2: Document Selection</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Select relevant documents from past cases</li>
                        <li>• Explain relevance to current case</li>
                        <li>• AI analyzes document insights</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Phase 3: Strategic Outline</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• AI creates comprehensive case outline</li>
                        <li>• Review and refine strategic approach</li>
                        <li>• Plan section structure and arguments</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Phase 4: Argument Development</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Build core legal arguments first</li>
                        <li>• Prioritize high-impact arguments</li>
                        <li>• AI assists with argument generation</li>
                        <li>• Quality scoring and coherence checking</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-900 mb-3">Benefits of Enhanced Workflow</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                      <div>
                        <ul className="space-y-1">
                          <li>• <strong>Document Intelligence:</strong> Leverage past case insights</li>
                          <li>• <strong>Strategic Planning:</strong> Comprehensive outline development</li>
                        </ul>
                      </div>
                      <div>
                        <ul className="space-y-1">
                          <li>• <strong>Guided Development:</strong> Outline-driven section creation</li>
                          <li>• <strong>Quality Assurance:</strong> Built-in coherence checking</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowEnhancedWorkflow(false)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowEnhancedWorkflow(false);
                        // Generate a new case ID for enhanced workflow
                        const caseId = `case-${Date.now()}`;
                        router.push(`/ai-brief/${caseId}?enhanced=true`);
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Start Enhanced Workflow
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="text-center text-sm text-gray-500">
            <p>
              💡 <strong>Tip:</strong> Each case gets its own URL and can be bookmarked or shared. 
              Sections within each case also have individual URLs for deep linking.
            </p>
            <p className="mt-2">
              🧠 <strong>Enhanced Workflow:</strong> For complex cases, use the enhanced workflow to leverage 
              document analysis and strategic planning for better brief quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}