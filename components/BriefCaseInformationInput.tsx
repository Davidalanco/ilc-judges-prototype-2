'use client';

import { useState } from 'react';
import { Gavel, Scale, FileText, CheckCircle, ArrowRight } from 'lucide-react';

interface BriefCaseInformationInputProps {
  onCaseInfoChange: (caseInfo: any) => void;
  initialData?: any;
}

export function BriefCaseInformationInput({ onCaseInfoChange, initialData }: BriefCaseInformationInputProps) {
  const [caseInfo, setCaseInfo] = useState({
    caseName: initialData?.caseName || '',
    legalIssue: initialData?.legalIssue || '',
    courtLevel: initialData?.courtLevel || 'U.S. Supreme Court',
    petitioner: initialData?.petitioner || '',
    respondent: initialData?.respondent || '',
    keyPrecedents: initialData?.keyPrecedents || [],
    constitutionalQuestions: initialData?.constitutionalQuestions || [],
    overallTheme: initialData?.overallTheme || ''
  });

  const [newPrecedent, setNewPrecedent] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  const updateCaseInfo = (updates: any) => {
    const newCaseInfo = { ...caseInfo, ...updates };
    setCaseInfo(newCaseInfo);
    onCaseInfoChange(newCaseInfo);
  };

  const addPrecedent = () => {
    if (newPrecedent.trim()) {
      const precedents = [...caseInfo.keyPrecedents, newPrecedent.trim()];
      updateCaseInfo({ keyPrecedents: precedents });
      setNewPrecedent('');
    }
  };

  const removePrecedent = (index: number) => {
    const precedents = caseInfo.keyPrecedents.filter((_, i) => i !== index);
    updateCaseInfo({ keyPrecedents: precedents });
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      const questions = [...caseInfo.constitutionalQuestions, newQuestion.trim()];
      updateCaseInfo({ constitutionalQuestions: questions });
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    const questions = caseInfo.constitutionalQuestions.filter((_, i) => i !== index);
    updateCaseInfo({ constitutionalQuestions: questions });
  };

  const isComplete = caseInfo.caseName && caseInfo.legalIssue && caseInfo.petitioner && caseInfo.respondent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏛️ Set Up Your Amicus Brief
        </h2>
        <p className="text-gray-600">
          Provide the essential case information to generate your AI-powered amicus brief
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Basic Case Information */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Gavel className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Case Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Name *
              </label>
              <input
                type="text"
                value={caseInfo.caseName}
                onChange={(e) => updateCaseInfo({ caseName: e.target.value })}
                placeholder="e.g., Miller v. New York State Department of Health"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Court Level
              </label>
              <select
                value={caseInfo.courtLevel}
                onChange={(e) => updateCaseInfo({ courtLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="U.S. Supreme Court">U.S. Supreme Court</option>
                <option value="U.S. Court of Appeals">U.S. Court of Appeals</option>
                <option value="U.S. District Court">U.S. District Court</option>
                <option value="State Supreme Court">State Supreme Court</option>
                <option value="State Court of Appeals">State Court of Appeals</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Legal Issue *
            </label>
            <textarea
              value={caseInfo.legalIssue}
              onChange={(e) => updateCaseInfo({ legalIssue: e.target.value })}
              placeholder="Describe the main legal question or constitutional issue at stake..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Parties */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Scale className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Parties</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Petitioner/Plaintiff *
              </label>
              <input
                type="text"
                value={caseInfo.petitioner}
                onChange={(e) => updateCaseInfo({ petitioner: e.target.value })}
                placeholder="e.g., Miller"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Respondent/Defendant *
              </label>
              <input
                type="text"
                value={caseInfo.respondent}
                onChange={(e) => updateCaseInfo({ respondent: e.target.value })}
                placeholder="e.g., New York State Department of Health"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Key Precedents */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Key Precedents</h3>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrecedent}
                onChange={(e) => setNewPrecedent(e.target.value)}
                placeholder="e.g., Employment Division v. Smith (1990)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addPrecedent()}
              />
              <button
                onClick={addPrecedent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>

            {caseInfo.keyPrecedents.length > 0 && (
              <div className="space-y-2">
                {caseInfo.keyPrecedents.map((precedent, index) => (
                  <div key={index} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <span className="text-sm text-purple-900">{precedent}</span>
                    <button
                      onClick={() => removePrecedent(index)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Constitutional Questions */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Scale className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Constitutional Questions</h3>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g., Whether neutral and generally applicable laws violate the Free Exercise Clause..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
              />
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add
              </button>
            </div>

            {caseInfo.constitutionalQuestions.length > 0 && (
              <div className="space-y-2">
                {caseInfo.constitutionalQuestions.map((question, index) => (
                  <div key={index} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <span className="text-sm text-orange-900">{question}</span>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overall Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Theme or Narrative
          </label>
          <textarea
            value={caseInfo.overallTheme}
            onChange={(e) => updateCaseInfo({ overallTheme: e.target.value })}
            placeholder="Describe the broader narrative or theme that ties your arguments together..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Completion Status */}
        <div className="pt-6 border-t border-gray-200">
          <div className={`flex items-center justify-between p-4 rounded-lg ${
            isComplete ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              {isComplete ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <div className="w-6 h-6 border-2 border-yellow-600 rounded-full"></div>
              )}
              <div>
                <h4 className={`font-medium ${isComplete ? 'text-green-900' : 'text-yellow-900'}`}>
                  {isComplete ? 'Ready to Build Brief' : 'Complete Required Fields'}
                </h4>
                <p className={`text-sm ${isComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isComplete 
                    ? 'All required information has been provided. You can now start building your amicus brief.'
                    : 'Please fill in the required fields marked with * to proceed.'
                  }
                </p>
              </div>
            </div>
            
            {isComplete && (
              <ArrowRight className="w-5 h-5 text-green-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
