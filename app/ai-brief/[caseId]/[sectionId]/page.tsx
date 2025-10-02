'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, use, useRef } from 'react';
import { AmicusBriefBuilder, SUPREME_COURT_AMICUS_TEMPLATE, BriefCoherenceContext, BriefCoherenceAnalysis, QualityRubric, SectionGuidance } from '@/lib/amicus-brief-template';
import InterestOfAmicusForm, { InterestOfAmicusData } from '@/components/InterestOfAmicusForm';
import InterestOfAmicusOutput, { InterestOfAmicusOutput as InterestOutput, QualityScores } from '@/components/InterestOfAmicusOutput';
import { ContentHighlighter } from '@/components/ContentHighlighter';
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

export default function SectionEditor({ 
  params 
}: { 
  params: Promise<{ caseId: string; sectionId: string }> 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  
  const [briefBuilder, setBriefBuilder] = useState<AmicusBriefBuilder | null>(null);
  const [sections, setSections] = useState<BriefSection[]>([]);
  const [currentSection, setCurrentSection] = useState<BriefSection | null>(null);
  const [coherenceAnalysis, setCoherenceAnalysis] = useState<BriefCoherenceAnalysis | null>(null);
  const [qualityRubric, setQualityRubric] = useState<QualityRubric | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestData, setInterestData] = useState<InterestOfAmicusData | null>(null);
  const [interestOutput, setInterestOutput] = useState<InterestOutput | null>(null);
  const [interestQualityScores, setInterestQualityScores] = useState<QualityScores | null>(null);
  const [interestRevisionAttempts, setInterestRevisionAttempts] = useState(0);
  const [isResearching, setIsResearching] = useState(false);
  const [lastResearchSources, setLastResearchSources] = useState<any[]>([]);
  const [isAutoGeneratingInstructions, setIsAutoGeneratingInstructions] = useState(false);
  const [similarContent, setSimilarContent] = useState<any[]>([]);
  const [proposedChanges, setProposedChanges] = useState<any[]>([]);
  const [showHighlightingMode, setShowHighlightingMode] = useState(false);
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



  // Load case data and initialize brief builder
  useEffect(() => {
    let isMounted = true;
    
    const loadCaseData = () => {
      try {
        console.log('🔍 Section page loading case data for ID:', resolvedParams.caseId);
        const stored = localStorage.getItem(`brief-case-${resolvedParams.caseId}`);
        console.log('📦 Stored data found in section page:', !!stored);
        
        if (stored) {
          const data = sanitizeData(safeParse(stored));
          console.log('🧹 Sanitized case data in section page:', data);
          
          if (isMounted) {
            setCaseInfo(data);
            initializeBriefBuilder(data);
          }
        } else {
          console.log('❌ No stored data found for case ID in section page:', resolvedParams.caseId);
          // Redirect to case setup if no data
          if (isMounted) {
            router.push(`/ai-brief/${resolvedParams.caseId}`);
          }
        }
      } catch (error) {
        console.error('❌ Error loading case data in section page:', error);
        // Redirect to case setup if no data
        if (isMounted) {
          router.push(`/ai-brief/${resolvedParams.caseId}`);
        }
      }
    };

    loadCaseData();
    
    return () => {
      isMounted = false;
    };
  }, [resolvedParams.caseId, router]); // Only depend on caseId and router

  // Initialize brief builder
  const initializeBriefBuilder = (caseData: CaseInfo) => {
    console.log('🏗️ Initializing brief builder with case data:', caseData);
    
    if (caseData.caseName && caseData.legalIssue) {
      console.log('✅ Case data is valid, creating coherence context...');
      
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

      console.log('📋 Coherence context created:', coherenceContext);
      console.log('🔨 Creating AmicusBriefBuilder...');
      
      const builder = new AmicusBriefBuilder(SUPREME_COURT_AMICUS_TEMPLATE, coherenceContext);
      setBriefBuilder(builder);
      
      console.log('📝 Getting sections from builder...');
      const sectionsData = builder.getSections();
      setSections(sectionsData);
      
      console.log('📋 Sections loaded:', sectionsData.length, 'sections');
      console.log('🔍 Looking for section ID:', resolvedParams.sectionId);
      
      // Find current section
      const section = sectionsData.find(s => s.id === resolvedParams.sectionId);
      if (section) {
        console.log('✅ Found section:', section.title);
        setCurrentSection(section);
      } else {
        console.log('❌ Section not found, redirecting to first section');
        console.log('Available sections:', sectionsData.map(s => s.id));
        console.log('Looking for:', resolvedParams.sectionId);
        
        // Redirect to first section if section not found
        const firstSection = sectionsData[0];
        if (firstSection) {
          console.log('Redirecting to first section:', firstSection.id);
          router.push(`/ai-brief/${resolvedParams.caseId}/${firstSection.id}`);
        } else {
          console.log('No sections available, redirecting to case overview');
          router.push(`/ai-brief/${resolvedParams.caseId}`);
        }
      }
    } else {
      console.log('❌ Case data is invalid:', { caseName: caseData.caseName, legalIssue: caseData.legalIssue });
      router.push(`/ai-brief/${resolvedParams.caseId}`);
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

  // Auto-generate AI instructions when section is loaded
  useEffect(() => {
    if (currentSection && caseInfo.caseName && caseInfo.legalIssue && !currentSection.aiInstructions && !isAutoGeneratingInstructions) {
      console.log(`🤖 Auto-generating AI instructions for section: ${currentSection.title}`);
      setIsAutoGeneratingInstructions(true);
      generateAIInstructions(currentSection.id).finally(() => {
        setIsAutoGeneratingInstructions(false);
      });
    }
  }, [currentSection, caseInfo.caseName, caseInfo.legalIssue]);

  // Navigate to a different section
  const navigateToSection = (newSectionId: string) => {
    router.push(`/ai-brief/${resolvedParams.caseId}/${newSectionId}`);
  };

  // Navigate to case overview
  const navigateToCase = () => {
    router.push(`/ai-brief/${resolvedParams.caseId}`);
  };

  const updateSection = (sectionId: string, content: string) => {
    if (!briefBuilder) return;

    try {
      briefBuilder.updateSection(sectionId, content);
      setSections(sections => sections.map(s => 
        s.id === sectionId 
          ? { ...s, content, lastModified: new Date(), wordCount: content.trim().split(/\s+/).length }
          : s
      ));
      
      // Update current section if it's the one being updated
      if (sectionId === resolvedParams.sectionId) {
        setCurrentSection(prev => prev ? { ...prev, content, lastModified: new Date(), wordCount: content.trim().split(/\s+/).length } : null);
      }
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const updateAIInstructions = (sectionId: string, instructions: string) => {
    setSections(sections => sections.map(s => 
      s.id === sectionId 
        ? { ...s, aiInstructions: instructions }
        : s
    ));
    
    // Update current section if it's the one being updated
    if (sectionId === resolvedParams.sectionId) {
      setCurrentSection(prev => prev ? { ...prev, aiInstructions: instructions } : null);
    }
  };

  // Generate AI instructions
  const generateAIInstructions = async (sectionId: string) => {
    if (!caseInfo.caseName || !caseInfo.legalIssue) {
      alert('Please complete case information first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-ai-instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseInfo,
          sectionId,
          sectionTitle: sections.find(s => s.id === sectionId)?.title || 'Brief Section'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI instructions');
      }

      const data = await response.json();
      updateAIInstructions(sectionId, data.instructions);
      
    } catch (error) {
      console.error('Error generating AI instructions:', error);
      alert('Failed to generate AI instructions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithAI = async (sectionId: string) => {
    if (!briefBuilder) return;

    // Special handling for Interest of Amicus Curiae
    if (sectionId === 'interest-of-amicus') {
      setShowInterestForm(true);
      return;
    }

    setIsGenerating(true);
    try {
      const section = briefBuilder.getSection(sectionId);
      if (!section?.aiPrompt) return;

      // Get user's AI instructions for this section
      const currentSection = sections.find(s => s.id === sectionId);
      const userInstructions = currentSection?.aiInstructions || '';

      const prompt = briefBuilder.generateEnhancedAIPrompt(sectionId, userInstructions);
      const context = briefBuilder.buildCoherenceContext();
      
      // Add transcription data to context if available
      let enhancedContext = context;
      if (caseInfo.transcriptionData?.transcription) {
        enhancedContext += `\n\nSTRATEGY SESSION TRANSCRIPTION:
${caseInfo.transcriptionData.transcription}

Use insights from this strategy discussion to inform your legal analysis and arguments.`;
      }
      
      const response = await fetch('/api/ai/generate-brief-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionPrompt: prompt,
          context: enhancedContext,
          sectionType: section.type,
          userInstructions: userInstructions
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateSection(sectionId, data.content);
        
        // Store research sources if research was used
        if (data.researchUsed && data.sources) {
          setLastResearchSources(data.sources);
        }
      } else {
        const errorData = await response.json();
        console.error('Error generating section:', errorData.error);
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInterestOfAmicus = async (data: InterestOfAmicusData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-interest-of-amicus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setInterestOutput(result.output);
        setInterestQualityScores(result.quality_scores);
        setInterestRevisionAttempts(result.revision_attempts);
        setShowInterestForm(false);
        
        // Update the brief section with the generated content
        updateSection('interest-of-amicus', result.output.text_markdown);
      } else {
        const errorData = await response.json();
        console.error('Error generating Interest of Amicus Curiae:', errorData.error);
      }
    } catch (error) {
      console.error('Error generating Interest of Amicus Curiae:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInterestDataChange = (data: InterestOfAmicusData) => {
    setInterestData(data);
  };

  const handleInterestEdit = (content: string) => {
    updateSection('interest-of-amicus', content);
  };

  // Handle similar content found
  const handleSimilarContentFound = (similarContent: any[]) => {
    setSimilarContent(similarContent);
    console.log('🔍 Similar content found:', similarContent);
  };

  // Handle proposed changes
  const handleProposedChanges = (changes: any[]) => {
    setProposedChanges(changes);
    console.log('📝 Proposed changes:', changes);
  };

  // Handle content change from highlighting
  const handleContentChange = (newContent: string) => {
    updateSection(resolvedParams.sectionId, newContent);
    console.log('✅ Content updated via highlighting system');
  };

  const getCoherenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Show loading state
  if (!currentSection || !briefBuilder) {
    console.log('⏳ Loading state - currentSection:', !!currentSection, 'briefBuilder:', !!briefBuilder);
    console.log('⏳ Section ID:', resolvedParams.sectionId);
    console.log('⏳ Case info:', caseInfo);
    console.log('⏳ Sections available:', sections.length);
    console.log('⏳ All sections:', sections.map(s => ({ id: s.id, title: s.title })));
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading section...</p>
          <p className="text-sm text-gray-500 mt-2">
            Section: {resolvedParams.sectionId} | Case: {caseInfo.caseName || 'Loading...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sections loaded: {sections.length} | Current section: {currentSection?.title || 'None'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Interest of Amicus Curiae Form Modal */}
      {showInterestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Interest of Amicus Curiae - Input Form</h2>
                <button
                  onClick={() => setShowInterestForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <InterestOfAmicusForm
                onDataChange={handleInterestDataChange}
                initialData={interestData || undefined}
                onSubmit={() => {
                  if (interestData) {
                    generateInterestOfAmicus(interestData);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interest of Amicus Curiae Output Modal */}
      {interestOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Interest of Amicus Curiae - Generated Output</h2>
                <button
                  onClick={() => setInterestOutput(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <InterestOfAmicusOutput
                output={interestOutput}
                qualityScores={interestQualityScores!}
                revisionAttempts={interestRevisionAttempts}
                onRegenerate={() => {
                  if (interestData) {
                    generateInterestOfAmicus(interestData);
                  }
                }}
                onEdit={handleInterestEdit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <button
              onClick={navigateToCase}
              className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
            >
              ← Back to Case
            </button>
            <button
              onClick={() => router.push('/ai-brief')}
              className="text-gray-600 hover:text-gray-800 text-xs flex items-center"
            >
              🏠 All Cases
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            🏛️ AI Brief Builder
          </h1>
          <h2 className="text-sm text-gray-600 truncate">{caseInfo.caseName}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Section: {currentSection.title}
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
                  resolvedParams.sectionId === section.id
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
          
          <button
            onClick={() => generateWithAI(resolvedParams.sectionId)}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            {isGenerating ? '🤖 Generating...' : '🤖 AI Generate'}
          </button>
        </div>
      </div>

      {/* Right Document Panel */}
      <div className="flex-1 flex">
        {/* Main Document Area */}
        <div className="flex-1 flex flex-col">
          {/* Document Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentSection.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {caseInfo.caseName} • {caseInfo.courtLevel}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {currentSection.wordCount || 0} words
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto bg-gray-100">
            <div className="max-w-5xl mx-auto bg-white shadow-lg min-h-full">
              <div className="p-12">
                {/* Document Header */}
                <div className="text-center mb-12 border-b border-gray-300 pb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {currentSection.title}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Case:</strong> {caseInfo.caseName}</p>
                    <p><strong>Court:</strong> {caseInfo.courtLevel}</p>
                    <p><strong>Section Type:</strong> {currentSection.type.charAt(0).toUpperCase() + currentSection.type.slice(1)}</p>
                  </div>
                </div>

                {/* Document Body */}
                <div className="prose prose-lg max-w-none">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 min-h-[600px]">
                    {/* Toggle between highlighting mode and regular view */}
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Content Editor</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowHighlightingMode(!showHighlightingMode)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            showHighlightingMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {showHighlightingMode ? '✏️ Highlighting Mode' : '📝 Regular Edit'}
                        </button>
                      </div>
                    </div>

                    {showHighlightingMode ? (
                      <ContentHighlighter
                        content={currentSection.content || currentSection.placeholder}
                        sectionId={resolvedParams.sectionId}
                        sectionTitle={currentSection.title}
                        onContentChange={handleContentChange}
                        onSimilarContentFound={handleSimilarContentFound}
                        onProposedChanges={handleProposedChanges}
                        className="min-h-[500px]"
                      />
                    ) : (
                      <div 
                        className="text-base leading-7 text-gray-900"
                        style={{ 
                          fontFamily: 'Times, "Times New Roman", serif',
                          lineHeight: '1.8',
                          fontSize: '16px'
                        }}
                      >
                        {currentSection.content ? (
                          <div className="whitespace-pre-wrap">
                            {currentSection.content}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">
                            <p className="mb-4 font-semibold text-gray-700">Template Content:</p>
                            <div className="whitespace-pre-wrap text-gray-600">
                              {currentSection.placeholder}
                            </div>
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-blue-800 text-sm">
                                💡 <strong>Tip:</strong> Click "AI Generate" in the left sidebar to create content for this section, or edit directly below.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Instructions Panel */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Instructions & Research</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tell the AI exactly what to do for this section. Be specific about what you want researched, emphasized, or structured. 
                    The AI will use Perplexity API to research current legal developments and integrate them into your brief.
                    {caseInfo.transcriptionData && (
                      <span className="block mt-2 text-indigo-600 font-medium">
                        📄 Strategy session transcription is available and will inform the AI's analysis.
                      </span>
                    )}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        AI Instructions for this section
                        {isAutoGeneratingInstructions && (
                          <span className="ml-2 text-xs text-blue-600 flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                            Auto-generating...
                          </span>
                        )}
                      </label>
                      <button
                        onClick={() => generateAIInstructions(resolvedParams.sectionId)}
                        disabled={isGenerating || isAutoGeneratingInstructions}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            🤖 Generate AI Instructions
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={currentSection.aiInstructions || ''}
                      onChange={(e) => updateAIInstructions(resolvedParams.sectionId, e.target.value)}
                      placeholder={`Example: "Focus on the textual analysis of Title VII, emphasize the 'undue hardship' standard, and include specific examples from our member companies. Research recent EEOC guidance, Supreme Court trends in religious accommodation cases, and connect it to the question presented. Look for recent circuit court decisions that support our position."`}
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    />
                  </div>
                  
                  {/* Research Capabilities Info */}
                  <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">🔍 Research Capabilities</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p>• <strong>Perplexity API:</strong> Real-time legal research with current case law and precedents</p>
                      <p>• <strong>Claude GPT-5 Mini:</strong> Supreme Court-grade legal writing and analysis</p>
                      <p>• <strong>Template Guidance:</strong> GPT-5 methodology for each section type</p>
                      <p>• <strong>Quality Validation:</strong> Automated scoring and revision system</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      💡 The AI will research your instructions and combine them with template guidance
                    </div>
                    <button
                      onClick={() => generateWithAI(resolvedParams.sectionId)}
                      disabled={isGenerating || isResearching}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      {isGenerating ? (isResearching ? '🔍 Researching...' : '🤖 Generating...') : '🤖 Generate with Research'}
                    </button>
                  </div>

                  {/* Show last research sources if available */}
                  {lastResearchSources.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-900 mb-2">📚 Research Sources Used</h4>
                      <div className="space-y-1">
                        {lastResearchSources.slice(0, 3).map((source, index) => (
                          <div key={index} className="text-xs text-green-800">
                            • {source.title}: {source.snippet?.substring(0, 100)}...
                          </div>
                        ))}
                        {lastResearchSources.length > 3 && (
                          <div className="text-xs text-green-700">
                            + {lastResearchSources.length - 3} more sources
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Manual Editing Panel */}
                <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✏️ Manual Edit</h3>
                  <textarea
                    value={currentSection.content || ''}
                    onChange={(e) => updateSection(resolvedParams.sectionId, e.target.value)}
                    placeholder={currentSection.placeholder}
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {currentSection.wordCount || 0} words
                    </span>
                    <span>
                      {currentSection.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                </div>

                {/* Highlighting System Debug Panel */}
                {showHighlightingMode && (similarContent.length > 0 || proposedChanges.length > 0) && (
                  <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Highlighting System Status</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-2">Similar Content Found</h4>
                        <div className="text-sm text-gray-600">
                          <p>Matches: {similarContent.length}</p>
                          {similarContent.slice(0, 3).map((item, index) => (
                            <div key={index} className="mt-1 p-2 bg-gray-50 rounded text-xs">
                              <strong>{item.sectionTitle}:</strong> {item.text.substring(0, 100)}...
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-2">Proposed Changes</h4>
                        <div className="text-sm text-gray-600">
                          <p>Changes: {proposedChanges.length}</p>
                          {proposedChanges.slice(0, 3).map((change, index) => (
                            <div key={index} className="mt-1 p-2 bg-gray-50 rounded text-xs">
                              <strong>{change.sectionTitle}:</strong> {change.reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Debug Info:</strong> The highlighting system is working. 
                        Similar content and proposed changes are being tracked and logged to the console.
                      </p>
                    </div>
                  </div>
                )}

                {/* Document Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
                  <div className="flex justify-between items-center">
                    <div>
                      {currentSection.lastModified && (
                        <span>
                          Last modified: {currentSection.lastModified.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Based on winning template: {SUPREME_COURT_AMICUS_TEMPLATE.basedOn}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guidance Sidebar */}
        {briefBuilder && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">📚 Section Guidance</h3>
              <p className="text-sm text-gray-600 mt-1">
                GPT-5 Supreme Court Methodology
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const guidance = briefBuilder.getSectionGuidance(resolvedParams.sectionId);
                if (!guidance) {
                  return (
                    <div className="text-sm text-gray-600">
                      <p>No specific guidance available for this section.</p>
                      <p className="mt-2">This section follows standard Supreme Court formatting requirements.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Purpose & Psychology */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🎯 Purpose</h4>
                      <p className="text-sm text-gray-700 mb-2">{guidance.purpose}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-1">Psychological Effect</h5>
                        <p className="text-sm text-blue-800">{guidance.psychology}</p>
                      </div>
                    </div>

                    {/* Content Moves */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📝 Required Content Moves</h4>
                      <ul className="space-y-1">
                        {guidance.contentMoves.map((move, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {move}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quality Checklist */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">✅ Quality Checklist</h4>
                      <ul className="space-y-1">
                        {guidance.checklist.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Common Pitfalls */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">⚠️ Common Pitfalls</h4>
                      <ul className="space-y-1">
                        {guidance.pitfalls.map((pitfall, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-red-500 mr-2">⚠</span>
                            {pitfall}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quality Criteria */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🏆 Quality Criteria</h4>
                      <div className="space-y-1">
                        {guidance.qualityCriteria.map((criteria, index) => (
                          <div key={index} className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                            {criteria}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* AI Generation Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => generateWithAI(resolvedParams.sectionId)}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
              >
                {isGenerating ? '🤖 Generating...' : '🤖 AI Generate with GPT-5 Method'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
