'use client';

import { useState, useEffect } from 'react';
import { AmicusBriefBuilder, SUCCESSFUL_AMICUS_TEMPLATE, BriefCoherenceContext, BriefCoherenceAnalysis } from '@/lib/amicus-brief-template';
import { BriefCaseInformationInput } from '@/components/BriefCaseInformationInput';

interface BriefSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: string;
  required: boolean;
  placeholder: string;
  aiPrompt?: string;
  wordCount?: number;
  lastModified?: Date;
}

export default function AIBriefBuilder() {
  const [briefBuilder, setBriefBuilder] = useState<AmicusBriefBuilder | null>(null);
  const [sections, setSections] = useState<BriefSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>('summary-of-argument');
  const [coherenceAnalysis, setCoherenceAnalysis] = useState<BriefCoherenceAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [caseInfo, setCaseInfo] = useState({
    caseName: '',
    legalIssue: '',
    courtLevel: 'U.S. Supreme Court',
    petitioner: '',
    respondent: '',
    keyPrecedents: [] as string[],
    constitutionalQuestions: [] as string[],
    overallTheme: ''
  });

  // Initialize brief builder when case info is ready
  useEffect(() => {
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

      const builder = new AmicusBriefBuilder(SUCCESSFUL_AMICUS_TEMPLATE, coherenceContext);
      setBriefBuilder(builder);
      setSections(builder.getSections());
    }
  }, [caseInfo]);

  // Update coherence analysis when sections change
  useEffect(() => {
    if (briefBuilder) {
      const analysis = briefBuilder.analyzeCoherence();
      setCoherenceAnalysis(analysis);
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

  const generateWithAI = async (sectionId: string) => {
    if (!briefBuilder) return;

    setIsGenerating(true);
    try {
      const section = briefBuilder.getSection(sectionId);
      if (!section?.aiPrompt) return;

      const prompt = briefBuilder.generateAIPrompt(sectionId);
      const context = briefBuilder.buildCoherenceContext();
      
      const response = await fetch('/api/ai/generate-brief-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionPrompt: prompt,
          context: context,
          sectionType: section.type
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateSection(sectionId, data.content);
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

  if (!caseInfo.caseName || !caseInfo.legalIssue) {
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
                  Based on winning template: {SUCCESSFUL_AMICUS_TEMPLATE.basedOn}
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
                    <p><strong>Template:</strong> {SUCCESSFUL_AMICUS_TEMPLATE.name}</p>
                    <p><strong>Success Rate:</strong> {SUCCESSFUL_AMICUS_TEMPLATE.successRate}</p>
                    <p><strong>Based On:</strong> {SUCCESSFUL_AMICUS_TEMPLATE.basedOn}</p>
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
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => window.location.href = '/'}
            className="text-blue-600 hover:text-blue-800 text-xs mb-3 flex items-center"
          >
            ← Back to Home
          </button>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            🏛️ AI Brief Builder
          </h1>
          <h2 className="text-sm text-gray-600 truncate">{caseInfo.caseName}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Based on: {SUCCESSFUL_AMICUS_TEMPLATE.basedOn}
          </p>
        </div>

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

                {/* Editing Panel */}
                <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✏️ Edit This Section</h3>
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
                      Based on winning template: {SUCCESSFUL_AMICUS_TEMPLATE.basedOn}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}