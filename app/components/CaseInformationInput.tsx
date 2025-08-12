'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2, RefreshCw, AlertCircle, FileText, Gavel, Scale } from 'lucide-react';

interface CaseAnalysis {
  caseName: string;
  courtLevel: string;
  constitutionalQuestion: string;
  penalties: string;
  targetPrecedent: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  legalIssues: string[];
  keyArguments: string[];
  confidence: number;
}

interface CaseInformationInputProps {
  transcript?: string;
  onCaseInfoComplete?: (caseInfo: any) => void;
  autoAnalyze?: boolean;
  caseId?: string | null;
  initialCaseInfo?: any;
}

export default function CaseInformationInput({ 
  transcript, 
  onCaseInfoComplete,
  autoAnalyze = true,
  caseId,
  initialCaseInfo
}: CaseInformationInputProps) {
  // Form state
  const [caseName, setCaseName] = useState('');
  const [courtLevel, setCourtLevel] = useState('');
  const [constitutionalQuestion, setConstitutionalQuestion] = useState('');
  const [penalties, setPenalties] = useState('');
  const [targetPrecedent, setTargetPrecedent] = useState('');

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Track which transcript has been analyzed to prevent duplicates
  const [analyzedTranscript, setAnalyzedTranscript] = useState<string>('');

  // Load existing case data when initialCaseInfo is provided (AI analysis should already be done server-side)
  useEffect(() => {
    if (transcript && transcript.length > 50) {
      console.log('📋 Transcript available - AI analysis should have been performed server-side during transcription save');
      
      // Check if we have existing case data, if not, the analysis may still be processing
      const hasExistingData = caseName || courtLevel || constitutionalQuestion || penalties || targetPrecedent;
      if (!hasExistingData && initialCaseInfo) {
        console.log('📋 Loading case information from database (should contain AI analysis results)');
      }
    }
  }, [transcript, caseName, courtLevel, constitutionalQuestion, penalties, targetPrecedent, initialCaseInfo]);

  // Populate form fields when initialCaseInfo is provided
  useEffect(() => {
    if (initialCaseInfo) {
      console.log('📋 Populating form with initial case info:', initialCaseInfo);
      setCaseName(initialCaseInfo.caseName || '');
      setCourtLevel(initialCaseInfo.courtLevel || '');
      setConstitutionalQuestion(initialCaseInfo.constitutionalQuestion || '');
      setPenalties(initialCaseInfo.penalties || '');
      setTargetPrecedent(initialCaseInfo.targetPrecedent || '');
    }
  }, [initialCaseInfo]);

  const saveCaseInformation = async (analysisData: any, targetCaseId: string) => {
    try {
      const response = await fetch(`/api/cases/${targetCaseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_name: analysisData.caseName,
          court_level: analysisData.courtLevel,
          constitutional_question: analysisData.constitutionalQuestion,
          penalties: analysisData.penalties,
          precedent_target: analysisData.targetPrecedent
        }),
      });

      if (response.ok) {
        console.log('✅ Case information saved to database successfully');
      } else {
        console.error('❌ Failed to save case information to database');
      }
    } catch (error) {
      console.error('❌ Error saving case information:', error);
    }
  };

  const performAnalysis = async () => {
    if (!transcript) {
      setAnalysisError('No transcript available for analysis');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log('📤 Sending transcript for AI analysis...');
      
      const response = await fetch('/api/ai/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      console.log('📥 Received AI analysis:', data);

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setConfidence(data.analysis.confidence);
        
        // Auto-populate form fields
        setCaseName(data.analysis.caseName);
        setCourtLevel(data.analysis.courtLevel);
        setConstitutionalQuestion(data.analysis.constitutionalQuestion);
        setPenalties(data.analysis.penalties);
        setTargetPrecedent(data.analysis.targetPrecedent);

        console.log('✅ Case information auto-populated from AI analysis');
        
        // Automatically save the case information to database if caseId is available
        if (caseId) {
          console.log('💾 Auto-saving case information to database...', { caseId });
          saveCaseInformation(data.analysis, caseId);
        } else {
          console.log('⚠️ No caseId available for auto-save');
        }
        
        setHasAnalyzed(true); // Mark as analyzed to prevent duplicate calls
        setAnalyzedTranscript(transcript); // Track this specific transcript as analyzed
      } else {
        throw new Error('Invalid analysis response');
      }

    } catch (error) {
      console.error('❌ Error analyzing transcript:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      setHasAnalyzed(true); // Mark as analyzed even on error to prevent infinite retries
      setAnalyzedTranscript(transcript); // Track this transcript as analyzed even on error
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    const caseInfo = {
      caseName,
      courtLevel,
      constitutionalQuestion,
      penalties,
      targetPrecedent,
      analysis,
      confidence
    };

    console.log('📋 Case information completed:', caseInfo);
    onCaseInfoComplete?.(caseInfo);
  };

  const isFormComplete = caseName && courtLevel && constitutionalQuestion;

  return (
    <div className="space-y-6">
      {/* AI Analysis Status */}
      {transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">AI Case Analysis</h3>
            </div>
            
            {!analyzing && (
              <button
                onClick={performAnalysis}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-analyze</span>
              </button>
            )}
          </div>

          {analyzing && (
            <div className="flex items-center space-x-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing transcript with AI...</span>
            </div>
          )}

          {analysisError && (
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{analysisError}</span>
            </div>
          )}

          {analysis && !analyzing && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Analysis complete (Confidence: {Math.round(confidence * 100)}%)
                </span>
              </div>
              
              <div className="text-sm text-blue-700 bg-blue-100 rounded p-2">
                <strong>AI Detected:</strong> {analysis.caseName} - {analysis.courtLevel}
              </div>
              
              {analysis.legalIssues.length > 0 && (
                <div className="text-xs text-blue-600">
                  <strong>Key Issues:</strong> {analysis.legalIssues.slice(0, 3).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Case Information Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Gavel className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Case Information</h3>
        </div>

        <div className="space-y-4">
          {/* Case Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Case Name
            </label>
            <input
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              placeholder="e.g., Miller v. New York State Department of Health"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Court Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Court Level
            </label>
            <input
              type="text"
              value={courtLevel}
              onChange={(e) => setCourtLevel(e.target.value)}
              placeholder="e.g., U.S. Supreme Court (Cert Petition from Second Circuit)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Constitutional Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Constitutional Question
            </label>
            <textarea
              value={constitutionalQuestion}
              onChange={(e) => setConstitutionalQuestion(e.target.value)}
              placeholder="Whether Employment Division v. Smith should be overruled when neutral and generally applicable laws burden sincere religious exercise"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Penalties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penalties
              </label>
              <input
                type="text"
                value={penalties}
                onChange={(e) => setPenalties(e.target.value)}
                placeholder="$118,000 in fines against Amish schools"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Precedent
              </label>
              <input
                type="text"
                value={targetPrecedent}
                onChange={(e) => setTargetPrecedent(e.target.value)}
                placeholder="Employment Division v. Smith (1990)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Analysis Info */}
          {analysis && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Scale className="w-4 h-4 mr-2" />
                AI Analysis Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-700">Parties:</strong>
                  <p className="text-gray-600">
                    {analysis.parties.plaintiff} v. {analysis.parties.defendant}
                  </p>
                </div>
                
                {analysis.keyArguments.length > 0 && (
                  <div>
                    <strong className="text-gray-700">Key Arguments:</strong>
                    <ul className="text-gray-600 list-disc list-inside">
                      {analysis.keyArguments.slice(0, 2).map((arg, index) => (
                        <li key={index}>{arg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!isFormComplete}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              isFormComplete
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Complete Case Information</span>
          </button>
          
          {!isFormComplete && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Please fill in case name, court level, and constitutional question
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
