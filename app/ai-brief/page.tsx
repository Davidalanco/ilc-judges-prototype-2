'use client';

import { useState, useEffect } from 'react';
import { AmicusBriefBuilder, SUPREME_COURT_AMICUS_TEMPLATE, BriefCoherenceContext, BriefCoherenceAnalysis, QualityRubric, SectionGuidance } from '@/lib/amicus-brief-template';
import { BriefCaseInformationInput } from '@/components/BriefCaseInformationInput';
import InterestOfAmicusForm, { InterestOfAmicusData } from '@/components/InterestOfAmicusForm';
import InterestOfAmicusOutput, { InterestOfAmicusOutput as InterestOutput, QualityScores } from '@/components/InterestOfAmicusOutput';

interface BriefSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: string;
  required: boolean;
  placeholder: string;
  aiPrompt?: string;
  aiInstructions?: string; // User's specific instructions to AI
  wordCount?: number;
  lastModified?: Date;
}

export default function AIBriefBuilder() {
  const [briefBuilder, setBriefBuilder] = useState<AmicusBriefBuilder | null>(null);
  const [sections, setSections] = useState<BriefSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>('interest-of-amicus');
  const [coherenceAnalysis, setCoherenceAnalysis] = useState<BriefCoherenceAnalysis | null>(null);
  const [qualityRubric, setQualityRubric] = useState<QualityRubric | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCaseSetup, setShowCaseSetup] = useState(true);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestData, setInterestData] = useState<InterestOfAmicusData | null>(null);
  const [interestOutput, setInterestOutput] = useState<InterestOutput | null>(null);
  const [interestQualityScores, setInterestQualityScores] = useState<QualityScores | null>(null);
  const [interestRevisionAttempts, setInterestRevisionAttempts] = useState(0);
  const [isResearching, setIsResearching] = useState(false);
  const [lastResearchSources, setLastResearchSources] = useState<any[]>([]);
  const [caseInfo, setCaseInfo] = useState({
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

  // Initialize brief builder only when user explicitly proceeds from case setup
  const initializeBriefBuilder = () => {
    if (caseInfo.caseName && caseInfo.legalIssue) {
      const coherenceContext: BriefCoherenceContext = {
        caseName: caseInfo.caseName,
        legalIssue: caseInfo.legalIssue,
        courtLevel: caseInfo.courtLevel,
        parties: {
          petitioner: caseInfo.petitioner,
          respondent: caseInfo.respondent
        },
        keyPrecedents: caseInfo.keyPrecedents,
        constitutionalQuestions: caseInfo.constitutionalQuestions,
        overallTheme: caseInfo.overallTheme
      };

      const builder = new AmicusBriefBuilder(SUPREME_COURT_AMICUS_TEMPLATE, coherenceContext);
      setBriefBuilder(builder);
      setSections(builder.getSections());
      setShowCaseSetup(false); // Hide case setup and show brief sections
    }
  };

  // Update coherence analysis and quality rubric when sections change
  useEffect(() => {
    if (briefBuilder) {
      const analysis = briefBuilder.analyzeCoherence();
      const quality = briefBuilder.analyzeQuality();
      setCoherenceAnalysis(analysis);
      setQualityRubric(quality);
    }
  }, [sections, briefBuilder]);

  const updateSection = (sectionId: string, content: string) => {
    if (!briefBuilder) return;

    try {
      briefBuilder.updateSection(sectionId, content);
      setSections(builder => builder.map(s => 
        s.id === sectionId 
          ? { ...s, content, lastModified: new Date(), wordCount: content.trim().split(/\s+/).length }
          : s
      ));
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

  const exportBrief = () => {
    if (!briefBuilder) return;
    
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
  };

  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'summary': return 'bg-blue-50 border-blue-200';
      case 'argument': return 'bg-green-50 border-green-200';
      case 'conclusion': return 'bg-purple-50 border-purple-200';
      case 'citation': return 'bg-gray-50 border-gray-200';
      case 'header': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getCoherenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!caseInfo.caseName || !caseInfo.legalIssue || showCaseSetup) {
    return (
      <div className="h-screen flex bg-gray-50">
        {/* Left Sidebar - Case Setup */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => window.location.href = '/'}
              className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center"
            >
              ← Back to Home
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
          onCaseInfoChange={setCaseInfo}
          initialData={caseInfo}
          onProceedToBrief={initializeBriefBuilder}
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

  return (
    <div className="h-screen flex bg-gray-50">
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
                caseInfo={caseInfo}
                onCaseInfoChange={setCaseInfo}
                onSubmit={() => setShowCaseSetup(false)}
              />
            </div>
          </div>
        </div>
      )}

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
              onClick={() => window.location.href = '/'}
              className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
            >
              ← Back to Home
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
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  activeSection === section.id
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
            onClick={exportBrief}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            📄 Export Brief
          </button>
          
          {activeSection && (
            <button
              onClick={() => generateWithAI(activeSection)}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isGenerating ? '🤖 Generating...' : '🤖 AI Generate'}
            </button>
          )}
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
                {sections.find(s => s.id === activeSection)?.title || 'Amicus Curiae Brief'}
              </h2>
              <p className="text-sm text-gray-500">
                {caseInfo.caseName} • {caseInfo.courtLevel}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {sections.find(s => s.id === activeSection)?.wordCount || 0} words
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="max-w-5xl mx-auto bg-white shadow-lg min-h-full">
            {activeSection && (
              <div className="p-12">
                {/* Document Header */}
                <div className="text-center mb-12 border-b border-gray-300 pb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {sections.find(s => s.id === activeSection)?.title}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Case:</strong> {caseInfo.caseName}</p>
                    <p><strong>Court:</strong> {caseInfo.courtLevel}</p>
                    <p><strong>Section Type:</strong> {sections.find(s => s.id === activeSection)?.type.charAt(0).toUpperCase() + sections.find(s => s.id === activeSection)?.type.slice(1)}</p>
                  </div>
                </div>

                {/* Document Body - Show Template Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 min-h-[600px]">
                    {/* Show actual brief content if it exists, otherwise show template/placeholder */}
                    <div 
                      className="text-base leading-7 text-gray-900"
                      style={{ 
                        fontFamily: 'Times, "Times New Roman", serif',
                        lineHeight: '1.8',
                        fontSize: '16px'
                      }}
                    >
                      {sections.find(s => s.id === activeSection)?.content ? (
                        <div className="whitespace-pre-wrap">
                          {sections.find(s => s.id === activeSection)?.content}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          <p className="mb-4 font-semibold text-gray-700">Template Content:</p>
                          <div className="whitespace-pre-wrap text-gray-600">
                            {sections.find(s => s.id === activeSection)?.placeholder}
                          </div>
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                              💡 <strong>Tip:</strong> Click "AI Generate" in the left sidebar to create content for this section, or edit directly below.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
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
                  <textarea
                    value={sections.find(s => s.id === activeSection)?.aiInstructions || ''}
                    onChange={(e) => updateAIInstructions(activeSection, e.target.value)}
                    placeholder={`Example: "Focus on the textual analysis of Title VII, emphasize the 'undue hardship' standard, and include specific examples from our member companies. Research recent EEOC guidance, Supreme Court trends in religious accommodation cases, and connect it to the question presented. Look for recent circuit court decisions that support our position."`}
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  
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
                      onClick={() => generateWithAI(activeSection)}
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
                    value={sections.find(s => s.id === activeSection)?.content || ''}
                    onChange={(e) => updateSection(activeSection, e.target.value)}
                    placeholder={sections.find(s => s.id === activeSection)?.placeholder}
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {sections.find(s => s.id === activeSection)?.wordCount || 0} words
                    </span>
                    <span>
                      {sections.find(s => s.id === activeSection)?.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
                  <div className="flex justify-between items-center">
                    <div>
                      {sections.find(s => s.id === activeSection)?.lastModified && (
                        <span>
                          Last modified: {sections.find(s => s.id === activeSection)?.lastModified?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Based on winning template: {SUPREME_COURT_AMICUS_TEMPLATE.basedOn}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Guidance Sidebar */}
        {briefBuilder && activeSection && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">📚 Section Guidance</h3>
              <p className="text-sm text-gray-600 mt-1">
                GPT-5 Supreme Court Methodology
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const guidance = briefBuilder.getSectionGuidance(activeSection);
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
                onClick={() => generateWithAI(activeSection)}
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