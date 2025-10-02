'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  ArrowRight, 
  ArrowLeft,
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  BookOpen,
  Scale,
  Shield,
  Users,
  Gavel,
  FileText,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Copy,
  Save
} from 'lucide-react';

interface RelevantDocument {
  id: string;
  name: string;
  type: string;
  relevance: string;
  keyInsights: string[];
  caseContext: string;
}

interface CaseOutlineSection {
  id: string;
  title: string;
  description: string;
  keyArguments: string[];
  supportingEvidence: string[];
  legalBasis: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedWords: number;
  order: number;
  isCustom: boolean;
}

interface CaseOutline {
  id: string;
  name: string;
  overallStrategy: string;
  coreThemes: string[];
  sections: CaseOutlineSection[];
  documentConnections: { [sectionId: string]: string[] };
  createdAt: Date;
  isGenerated: boolean;
}

interface CaseOutlineBrainstormingProps {
  documents: RelevantDocument[];
  caseInfo: {
    caseName: string;
    legalIssue: string;
    petitioner: string;
    respondent: string;
    keyPrecedents: string[];
    constitutionalQuestions: string[];
    overallTheme: string;
  };
  onOutlineComplete: (outline: CaseOutline) => void;
  onBackToDocuments: () => void;
  initialOutline?: CaseOutline;
}

export function CaseOutlineBrainstorming({ 
  documents, 
  caseInfo, 
  onOutlineComplete, 
  onBackToDocuments,
  initialOutline 
}: CaseOutlineBrainstormingProps) {
  const [outline, setOutline] = useState<CaseOutline | null>(initialOutline || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDocumentConnections, setShowDocumentConnections] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate outline when component mounts or documents change
  useEffect(() => {
    if (!outline && documents.length > 0) {
      generateCaseOutline();
    }
  }, [documents]);

  const generateCaseOutline = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/ai/generate-case-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseInfo,
          documents: documents.map(doc => ({
            name: doc.name,
            type: doc.type,
            relevance: doc.relevance,
            keyInsights: doc.keyInsights,
            caseContext: doc.caseContext
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate case outline');
      }

      const generatedOutline = await response.json();
      setOutline(generatedOutline);
    } catch (error) {
      console.error('Error generating case outline:', error);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOutline = (updates: Partial<CaseOutline>) => {
    if (outline) {
      setOutline({ ...outline, ...updates });
    }
  };

  const updateSection = (sectionId: string, updates: Partial<CaseOutlineSection>) => {
    if (outline) {
      const updatedSections = outline.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      );
      setOutline({ ...outline, sections: updatedSections });
    }
  };

  const addCustomSection = () => {
    if (outline) {
      const newSection: CaseOutlineSection = {
        id: `section_${Date.now()}`,
        title: 'New Section',
        description: '',
        keyArguments: [''],
        supportingEvidence: [''],
        legalBasis: [''],
        priority: 'medium',
        estimatedWords: 500,
        order: outline.sections.length + 1,
        isCustom: true
      };
      setOutline({
        ...outline,
        sections: [...outline.sections, newSection]
      });
      setEditingSection(newSection.id);
    }
  };

  const removeSection = (sectionId: string) => {
    if (outline) {
      const updatedSections = outline.sections.filter(section => section.id !== sectionId);
      setOutline({ ...outline, sections: updatedSections });
    }
  };

  const addArrayItem = (sectionId: string, field: 'keyArguments' | 'supportingEvidence' | 'legalBasis', value: string = '') => {
    if (outline) {
      const section = outline.sections.find(s => s.id === sectionId);
      if (section) {
        const updatedArray = [...section[field], value];
        updateSection(sectionId, { [field]: updatedArray });
      }
    }
  };

  const updateArrayItem = (sectionId: string, field: 'keyArguments' | 'supportingEvidence' | 'legalBasis', index: number, value: string) => {
    if (outline) {
      const section = outline.sections.find(s => s.id === sectionId);
      if (section) {
        const updatedArray = [...section[field]];
        updatedArray[index] = value;
        updateSection(sectionId, { [field]: updatedArray });
      }
    }
  };

  const removeArrayItem = (sectionId: string, field: 'keyArguments' | 'supportingEvidence' | 'legalBasis', index: number) => {
    if (outline) {
      const section = outline.sections.find(s => s.id === sectionId);
      if (section && section[field].length > 1) {
        const updatedArray = section[field].filter((_, i) => i !== index);
        updateSection(sectionId, { [field]: updatedArray });
      }
    }
  };

  const reorderSections = (sectionId: string, direction: 'up' | 'down') => {
    if (outline) {
      const sections = [...outline.sections];
      const index = sections.findIndex(s => s.id === sectionId);
      
      if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }

      // Update order numbers
      sections.forEach((section, idx) => {
        section.order = idx + 1;
      });

      setOutline({ ...outline, sections });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const saveOutline = async () => {
    if (!outline) return;

    setIsSaving(true);
    try {
      // Save to localStorage and/or API
      localStorage.setItem(`case-outline-${caseInfo.caseName}`, JSON.stringify(outline));
      // You could also save to your API here
      console.log('Outline saved:', outline);
    } catch (error) {
      console.error('Error saving outline:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const proceedToBrief = () => {
    if (outline) {
      saveOutline();
      onOutlineComplete(outline);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Case Outline Brainstorming
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered strategic outline based on your case information and selected documents. 
          Review, edit, and refine the outline before building your brief sections.
        </p>
      </div>

      {/* Case Info Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Case:</span>
            <span className="ml-2 text-gray-900">{caseInfo.caseName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Petitioner:</span>
            <span className="ml-2 text-gray-900">{caseInfo.petitioner}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Respondent:</span>
            <span className="ml-2 text-gray-900">{caseInfo.respondent}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Documents Analyzed:</span>
            <span className="ml-2 text-gray-900">{documents.length}</span>
          </div>
        </div>
        <div className="mt-4">
          <span className="font-medium text-gray-700">Legal Issue:</span>
          <p className="mt-1 text-gray-900">{caseInfo.legalIssue}</p>
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Strategic Outline</h3>
            <p className="text-gray-600">
              Analyzing your documents and case information to create a comprehensive brief outline...
            </p>
          </div>
        </div>
      )}

      {/* Generation Error */}
      {generationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Generation Failed</h3>
              <p className="text-red-700 mt-1">{generationError}</p>
              <button
                onClick={generateCaseOutline}
                className="mt-3 flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outline Content */}
      {outline && !isGenerating && (
        <div className="space-y-6">
          {/* Overall Strategy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Overall Strategy</h2>
              <button
                onClick={() => setEditingSection('strategy')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            {editingSection === 'strategy' ? (
              <div className="space-y-4">
                <textarea
                  value={outline.overallStrategy}
                  onChange={(e) => updateOutline({ overallStrategy: e.target.value })}
                  placeholder="Describe the overall strategic approach for this amicus brief..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingSection(null)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{outline.overallStrategy}</p>
            )}
          </div>

          {/* Core Themes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Core Themes</h2>
              <button
                onClick={() => setEditingSection('themes')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {outline.coreThemes.map((theme, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">{theme}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brief Sections */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Brief Sections</h2>
              <button
                onClick={addCustomSection}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-4">
              {outline.sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">#{section.order}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(section.priority)}`}>
                            {getPriorityIcon(section.priority)} {section.priority.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        {section.isCustom && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{section.estimatedWords} words</span>
                        <button
                          onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {expandedSection === section.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section Content */}
                  {expandedSection === section.id && (
                    <div className="p-6 space-y-6">
                      {/* Section Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Description
                        </label>
                        <textarea
                          value={section.description}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          placeholder="Describe what this section will cover..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      {/* Key Arguments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Key Arguments
                        </label>
                        <div className="space-y-2">
                          {section.keyArguments.map((argument, argIndex) => (
                            <div key={argIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={argument}
                                onChange={(e) => updateArrayItem(section.id, 'keyArguments', argIndex, e.target.value)}
                                placeholder="Enter a key argument for this section"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              {section.keyArguments.length > 1 && (
                                <button
                                  onClick={() => removeArrayItem(section.id, 'keyArguments', argIndex)}
                                  className="p-2 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addArrayItem(section.id, 'keyArguments')}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Argument</span>
                          </button>
                        </div>
                      </div>

                      {/* Supporting Evidence */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supporting Evidence
                        </label>
                        <div className="space-y-2">
                          {section.supportingEvidence.map((evidence, evIndex) => (
                            <div key={evIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={evidence}
                                onChange={(e) => updateArrayItem(section.id, 'supportingEvidence', evIndex, e.target.value)}
                                placeholder="Enter supporting evidence or citations"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              {section.supportingEvidence.length > 1 && (
                                <button
                                  onClick={() => removeArrayItem(section.id, 'supportingEvidence', evIndex)}
                                  className="p-2 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addArrayItem(section.id, 'supportingEvidence')}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Evidence</span>
                          </button>
                        </div>
                      </div>

                      {/* Legal Basis */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Legal Basis
                        </label>
                        <div className="space-y-2">
                          {section.legalBasis.map((basis, basisIndex) => (
                            <div key={basisIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={basis}
                                onChange={(e) => updateArrayItem(section.id, 'legalBasis', basisIndex, e.target.value)}
                                placeholder="Enter legal basis (statutes, precedents, constitutional provisions)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              {section.legalBasis.length > 1 && (
                                <button
                                  onClick={() => removeArrayItem(section.id, 'legalBasis', basisIndex)}
                                  className="p-2 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addArrayItem(section.id, 'legalBasis')}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Legal Basis</span>
                          </button>
                        </div>
                      </div>

                      {/* Section Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <select
                            value={section.priority}
                            onChange={(e) => updateSection(section.id, { priority: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Words
                          </label>
                          <input
                            type="number"
                            value={section.estimatedWords}
                            onChange={(e) => updateSection(section.id, { estimatedWords: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Document Connections */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Document Connections</h2>
              <button
                onClick={() => setShowDocumentConnections(!showDocumentConnections)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span>{showDocumentConnections ? 'Hide' : 'Show'} Connections</span>
                {showDocumentConnections ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            
            {showDocumentConnections && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  This shows how your selected documents connect to each brief section:
                </p>
                {documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{doc.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{doc.relevance}</p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Key Insights:</span>
                      <ul className="mt-1 list-disc list-inside">
                        {doc.keyInsights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBackToDocuments}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Documents</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={saveOutline}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Outline'}</span>
                </button>
                
                <button
                  onClick={proceedToBrief}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>Proceed to Brief Sections</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
