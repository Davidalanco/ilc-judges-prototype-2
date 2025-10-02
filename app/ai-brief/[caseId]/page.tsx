'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { AmicusBriefBuilder, SUPREME_COURT_AMICUS_TEMPLATE, BriefCoherenceContext, BriefCoherenceAnalysis, QualityRubric } from '@/lib/amicus-brief-template';
import { BriefCaseInformationInput } from '@/components/BriefCaseInformationInput';
import { EnhancedBriefBuilder } from '@/components/EnhancedBriefBuilder';
import { sanitizeData, safeParse } from '@/lib/utils/sanitize';

interface BriefSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: string;
  required: boolean;
  placeholder: string;
  aiPrompt?: string;
  aiInstructions?: string;
  wordCount?: number;
  lastModified?: Date;
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

export default function CaseBriefBuilder({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const sectionId = searchParams.get('section') || 'interest-of-amicus';
  const useEnhancedWorkflow = searchParams.get('enhanced') === 'true' || searchParams.get('enhanced') === '1';
  
  const [briefBuilder, setBriefBuilder] = useState<AmicusBriefBuilder | null>(null);
  const [sections, setSections] = useState<BriefSection[]>([]);
  const [coherenceAnalysis, setCoherenceAnalysis] = useState<BriefCoherenceAnalysis | null>(null);
  const [qualityRubric, setQualityRubric] = useState<QualityRubric | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCaseSetup, setShowCaseSetup] = useState(false);
  const [caseInfo, setCaseInfo] = useState<CaseInfo>({
    caseName: '',
    legalIssue: '',
    courtLevel: 'U.S. Supreme Court',
    petitioner: '',
    respondent: '',
    keyPrecedents: [],
    constitutionalQuestions: [],
    overallTheme: '',
    transcriptionData: null
  });


  // Load case data from localStorage or API
  useEffect(() => {
    const loadCaseData = () => {
      try {
        const stored = localStorage.getItem(`brief-case-${resolvedParams.caseId}`);
        if (stored) {
          const data = sanitizeData(safeParse(stored));
          setCaseInfo(data);
          initializeBriefBuilder(data);
        }
      } catch (error) {
        console.error('Error loading case data:', error);
        // Redirect to case setup if no data
        router.push(`/ai-brief/${resolvedParams.caseId}`);
      }
    };

    loadCaseData();
  }, [resolvedParams.caseId, router]);

  // Initialize brief builder when case data is available
  const initializeBriefBuilder = (caseData: CaseInfo) => {
    if (caseData.caseName && caseData.legalIssue) {
      const coherenceContext: BriefCoherenceContext = {
        caseName: caseData.caseName,
        legalIssue: caseData.legalIssue,
        courtLevel: caseData.courtLevel,
        parties: {
          petitioner: caseData.petitioner,
          respondent: caseData.respondent
        },
        keyPrecedents: caseData.keyPrecedents,
        constitutionalQuestions: caseData.constitutionalQuestions,
        overallTheme: caseData.overallTheme
      };

      const builder = new AmicusBriefBuilder(SUPREME_COURT_AMICUS_TEMPLATE, coherenceContext);
      setBriefBuilder(builder);
      setSections(builder.getSections());
    }
  };

  // Update coherence analysis when sections change
  useEffect(() => {
    if (briefBuilder) {
      const analysis = briefBuilder.analyzeCoherence();
      const quality = briefBuilder.analyzeQuality();
      setCoherenceAnalysis(analysis);
      setQualityRubric(quality);
    }
  }, [sections, briefBuilder]);

  // Navigate to a specific section
  const navigateToSection = (newSectionId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', newSectionId);
    router.push(url.pathname + url.search);
  };

  // Save case data
  const saveCaseData = (data: CaseInfo) => {
    setCaseInfo(data);
    localStorage.setItem(`brief-case-${resolvedParams.caseId}`, JSON.stringify(data));
    initializeBriefBuilder(data);
  };

  // Use enhanced workflow if requested
  if (useEnhancedWorkflow) {
    return (
      <EnhancedBriefBuilder
        caseId={resolvedParams.caseId}
        onComplete={() => {
          // Redirect to traditional brief builder after enhanced workflow
          const url = new URL(window.location.href);
          url.searchParams.delete('enhanced');
          router.push(url.pathname + url.search);
        }}
      />
    );
  }

  // If no case data, show setup
  if (!caseInfo.caseName || !caseInfo.legalIssue) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        {/* Left Sidebar - Case Setup */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => router.push('/ai-brief')}
              className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center"
            >
              ← Back to Brief Builder
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              🏛️ AI Brief Builder
            </h1>
            <p className="text-sm text-gray-600">
              Set up your case information to start building your amicus brief
            </p>
          </div>

          <div className="flex-1 p-6">
            <BriefCaseInformationInput
              onCaseInfoChange={saveCaseData}
              initialData={caseInfo}
              onProceedToBrief={() => {
                // Case data is already saved, just close setup
                setShowCaseSetup(false);
              }}
            />
          </div>
        </div>

        {/* Right Panel - Brief Template Preview */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Brief Template Preview
                </h2>
                <p className="text-sm text-gray-500">
                  Based on winning template: {SUPREME_COURT_AMICUS_TEMPLATE.basedOn}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {sections.length} sections
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto bg-white shadow-lg min-h-full">
              <div className="p-12">
                {/* Brief Overview */}
                <div className="text-center mb-12 border-b border-gray-300 pb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Amicus Curiae Brief Template
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Template:</strong> {SUPREME_COURT_AMICUS_TEMPLATE.name}</p>
                    <p><strong>Success Rate:</strong> {SUPREME_COURT_AMICUS_TEMPLATE.successRate}</p>
                    <p><strong>Based On:</strong> {SUPREME_COURT_AMICUS_TEMPLATE.basedOn}</p>
                  </div>
                </div>

                {/* Template Sections Overview */}
                <div className="prose prose-lg max-w-none">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Brief Structure</h3>
                    
                    <div className="space-y-4">
                      {sections.map((section, index) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {index + 1}. {section.title}
                                {section.required && <span className="text-red-500 ml-1">*</span>}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {section.required ? 'Required' : 'Optional'}
                            </div>
                          </div>
                          
                          {/* Show first few lines of template content */}
                          <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-300">
                            <div className="font-mono text-xs text-gray-600 mb-2">Template Preview:</div>
                            <div className="whitespace-pre-wrap">
                              {section.placeholder.substring(0, 200)}
                              {section.placeholder.length > 200 && '...'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        💡 <strong>Complete the case information on the left to start building your brief with AI assistance.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main brief builder interface
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <button
              onClick={() => router.push('/ai-brief')}
              className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
            >
              ← Back to Brief Builder
            </button>
            <button
              onClick={() => setShowCaseSetup(true)}
              className="text-green-600 hover:text-green-800 text-xs flex items-center"
            >
              ✏️ Edit Case Info
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            🏛️ AI Brief Builder
          </h1>
          <h2 className="text-sm text-gray-600 truncate">{caseInfo.caseName}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Based on: {SUPREME_COURT_AMICUS_TEMPLATE.basedOn}
          </p>
        </div>

        {/* Quality Scores */}
        {qualityRubric && (
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className={`p-3 rounded-lg ${getCoherenceColor(qualityRubric.overallScore * 20)}`}>
              <div className="text-sm font-medium">Overall Quality Score</div>
              <div className="text-2xl font-bold">{qualityRubric.overallScore}/5.0</div>
              {qualityRubric.needsRevision && (
                <div className="text-xs text-red-600 mt-1">⚠ Needs Revision</div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Unique Value</div>
                <div className="text-lg font-bold">{qualityRubric.uniqueValue}/5</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Text First</div>
                <div className="text-lg font-bold">{qualityRubric.textFirstLegality}/5</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Evidence Fit</div>
                <div className="text-lg font-bold">{qualityRubric.evidenceFit}/5</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Compliance</div>
                <div className="text-lg font-bold">{qualityRubric.compliance}/5</div>
              </div>
            </div>
          </div>
        )}

        {/* Coherence Score */}
        {coherenceAnalysis && (
          <div className="p-4 border-b border-gray-200">
            <div className={`p-3 rounded-lg ${getCoherenceColor(coherenceAnalysis.overallCoherence)}`}>
              <div className="text-sm font-medium">Coherence Score</div>
              <div className="text-2xl font-bold">{coherenceAnalysis.overallCoherence}%</div>
            </div>
          </div>
        )}

        {/* Section Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">📋 Brief Sections</h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => navigateToSection(section.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  sectionId === section.id
                    ? 'bg-blue-100 border-blue-300 text-blue-900'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-xs">{section.title}</div>
                    {section.wordCount && (
                      <div className="text-xs text-gray-500 mt-1">
                        {section.wordCount} words
                      </div>
                    )}
                  </div>
                  {section.required && (
                    <div className="text-red-500 text-xs">*</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Recommendations */}
          {coherenceAnalysis && coherenceAnalysis.recommendations.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-gray-900 mb-2">💡 Recommendations</h4>
              <div className="space-y-1">
                {coherenceAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => {
              if (briefBuilder) {
                const briefText = briefBuilder.exportBrief();
                const blob = new Blob([briefText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${caseInfo.caseName.replace(/\s+/g, '_')}_amicus_brief.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            📄 Export Brief
          </button>
        </div>
      </div>

      {/* Right Content Area - This will be the section-specific content */}
      <div className="flex-1 flex">
        {/* Redirect to section-specific page */}
        {typeof window !== 'undefined' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading section...</p>
            </div>
          </div>
        )}
      </div>

      {/* Case Setup Modal */}
      {showCaseSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Edit Case Information</h2>
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
                initialData={caseInfo}
                onCaseInfoChange={saveCaseData}
                onSubmit={() => setShowCaseSetup(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getCoherenceColor(score: number) {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }
}
