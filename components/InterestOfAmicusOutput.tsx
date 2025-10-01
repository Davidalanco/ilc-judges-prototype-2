'use client';

import { useState } from 'react';

export interface InterestOfAmicusOutput {
  section: string;
  text_markdown: string;
  footnotes: Array<{
    marker: string;
    text: string;
  }>;
  metadata: {
    word_count: number;
    flags: {
      contains_merits_argument: boolean;
      missing_unique_value: boolean;
      missing_rule37: boolean;
    };
  };
}

export interface QualityScores {
  uniqueValue: number; // 0-5
  textFirst: number; // 0-5
  evidenceFit: number; // 0-5
  compliance: number; // 0-5
  coherence: number; // 0-100%
}

interface InterestOfAmicusOutputProps {
  output: InterestOfAmicusOutput;
  qualityScores: QualityScores;
  revisionAttempts: number;
  onRegenerate?: () => void;
  onEdit?: (content: string) => void;
}

export default function InterestOfAmicusOutput({ 
  output, 
  qualityScores, 
  revisionAttempts,
  onRegenerate,
  onEdit 
}: InterestOfAmicusOutputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(output.text_markdown);

  const getScoreColor = (score: number, maxScore: number = 5) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCoherenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleSaveEdit = () => {
    onEdit?.(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(output.text_markdown);
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {output.section} - Generated Output
            </h2>
            <p className="text-gray-600">
              AI-generated content with automated quality validation and scoring
            </p>
          </div>
          <div className="flex space-x-3">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Regenerate
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isEditing ? '👁️ View' : '✏️ Edit'}
            </button>
          </div>
        </div>

        {/* Quality Scores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`p-3 rounded-lg text-center ${getScoreColor(qualityScores.uniqueValue)}`}>
            <div className="text-sm font-medium">Unique Value</div>
            <div className="text-xl font-bold">{qualityScores.uniqueValue}/5</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${getScoreColor(qualityScores.textFirst)}`}>
            <div className="text-sm font-medium">Specifics First</div>
            <div className="text-xl font-bold">{qualityScores.textFirst}/5</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${getScoreColor(qualityScores.evidenceFit)}`}>
            <div className="text-sm font-medium">Evidence Fit</div>
            <div className="text-xl font-bold">{qualityScores.evidenceFit}/5</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${getScoreColor(qualityScores.compliance)}`}>
            <div className="text-sm font-medium">Compliance</div>
            <div className="text-xl font-bold">{qualityScores.compliance}/5</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${getCoherenceColor(qualityScores.coherence)}`}>
            <div className="text-sm font-medium">Coherence</div>
            <div className="text-xl font-bold">{qualityScores.coherence}%</div>
          </div>
        </div>

        {/* Revision Info */}
        {revisionAttempts > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              🔄 <strong>Auto-revision applied:</strong> {revisionAttempts} revision(s) made to improve quality scores
            </p>
          </div>
        )}

        {/* Quality Flags */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quality Flags</h3>
          <div className="flex flex-wrap gap-2">
            {output.metadata.flags.contains_merits_argument && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                ⚠️ Contains merits argument
              </span>
            )}
            {output.metadata.flags.missing_unique_value && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                ⚠️ Missing unique value
              </span>
            )}
            {output.metadata.flags.missing_rule37 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                ⚠️ Missing Rule 37.6
              </span>
            )}
            {!output.metadata.flags.contains_merits_argument && 
             !output.metadata.flags.missing_unique_value && 
             !output.metadata.flags.missing_rule37 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                ✅ All quality checks passed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {isEditing ? (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edit Content
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                style={{ 
                  fontFamily: 'Times, "Times New Roman", serif',
                  lineHeight: '1.8'
                }}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Document Header */}
            <div className="text-center mb-8 border-b border-gray-300 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {output.section}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Word Count:</strong> {output.metadata.word_count}</p>
                <p><strong>Quality Score:</strong> {Math.round((qualityScores.uniqueValue + qualityScores.textFirst + qualityScores.evidenceFit + qualityScores.compliance) / 4 * 20)}%</p>
              </div>
            </div>

            {/* Document Body */}
            <div 
              className="prose prose-lg max-w-none"
              style={{ 
                fontFamily: 'Times, "Times New Roman", serif',
                lineHeight: '1.8',
                fontSize: '16px'
              }}
            >
              <div 
                className="text-base leading-7 text-gray-900 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: output.text_markdown
                    .replace(/\^(\d+)/g, '<sup class="text-blue-600 font-semibold">$1</sup>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>')
                }}
              />
            </div>

            {/* Footnotes */}
            {output.footnotes.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Footnotes</h3>
                <div className="space-y-3">
                  {output.footnotes.map((footnote, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-blue-600 font-semibold text-sm mt-1">
                        {footnote.marker}.
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {footnote.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quality Analysis */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Quality Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Scoring Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unique Value</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(qualityScores.uniqueValue / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{qualityScores.uniqueValue}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Specifics First</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(qualityScores.textFirst / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{qualityScores.textFirst}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Evidence Fit</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(qualityScores.evidenceFit / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{qualityScores.evidenceFit}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Compliance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(qualityScores.compliance / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{qualityScores.compliance}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Coherence</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${qualityScores.coherence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{qualityScores.coherence}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <div className="space-y-2 text-sm">
              {qualityScores.uniqueValue < 4 && (
                <p className="text-yellow-700">• Add more specific details about amicus expertise and unique perspective</p>
              )}
              {qualityScores.textFirst < 4 && (
                <p className="text-yellow-700">• Include more concrete numbers, dates, and verifiable specifics</p>
              )}
              {qualityScores.evidenceFit < 4 && (
                <p className="text-yellow-700">• Better connect credentials and experience to the question presented</p>
              )}
              {qualityScores.compliance < 4 && (
                <p className="text-yellow-700">• Ensure proper Rule 37.6 disclosure and Supreme Court formatting</p>
              )}
              {qualityScores.coherence < 60 && (
                <p className="text-yellow-700">• Improve flow and connection between paragraphs</p>
              )}
              {qualityScores.uniqueValue >= 4 && qualityScores.textFirst >= 4 && 
               qualityScores.evidenceFit >= 4 && qualityScores.compliance >= 4 && 
               qualityScores.coherence >= 60 && (
                <p className="text-green-700">✅ All quality metrics meet Supreme Court standards</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
