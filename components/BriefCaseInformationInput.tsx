'use client';

import { useState } from 'react';
import { Gavel, Scale, FileText, CheckCircle, ArrowRight, Upload, FileAudio, Trash2, AlertCircle } from 'lucide-react';
import FileUpload from '@/app/components/FileUpload';
import SpeakerTranscriptDisplay from '@/app/components/SpeakerTranscriptDisplay';

interface BriefCaseInformationInputProps {
  onCaseInfoChange: (caseInfo: any) => void;
  initialData?: any;
  onSubmit?: () => void;
  onProceedToBrief?: () => void;
}

interface TranscriptionData {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  duration?: string;
  transcription?: string;
  language?: string;
  speakers?: any[];
  speakerCount?: number;
  s3Key?: string;
  conversationId?: string;
  segments?: any[];
}

export function BriefCaseInformationInput({ onCaseInfoChange, initialData, onSubmit, onProceedToBrief }: BriefCaseInformationInputProps) {
  const [caseInfo, setCaseInfo] = useState({
    caseName: '',
    legalIssue: '',
    courtLevel: 'U.S. Supreme Court',
    petitioner: '',
    respondent: '',
    keyPrecedents: [],
    constitutionalQuestions: [],
    overallTheme: ''
  });

  const [newPrecedent, setNewPrecedent] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData | null>(null);
  const [showTranscriptionUpload, setShowTranscriptionUpload] = useState(false);
  const [showTranscriptionPaste, setShowTranscriptionPaste] = useState(false);
  const [pastedTranscription, setPastedTranscription] = useState('');
  const [isAnalyzingTranscription, setIsAnalyzingTranscription] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const updateCaseInfo = (updates: any) => {
    const newCaseInfo = { ...caseInfo, ...updates };
    setCaseInfo(newCaseInfo);
    onCaseInfoChange({ ...newCaseInfo, transcriptionData });
  };

  const handleTranscriptionUpload = async (fileData: TranscriptionData) => {
    console.log('📄 Transcription uploaded:', fileData.fileName);
    setTranscriptionData(fileData);
    setShowTranscriptionUpload(false);
    setIsAnalyzingTranscription(true);
    
    try {
      setAnalysisError(null);
      // Use AI to intelligently extract case information from transcription
      const extractedInfo = await extractCaseInfoWithAI(fileData.transcription || '');
      
      // Store transcription and case info in database
      await storeCaseAndTranscription(extractedInfo, fileData);
      
      // Update case info with both transcription data and extracted information
      const updatedCaseInfo = { ...caseInfo, ...extractedInfo, transcriptionData: fileData };
      setCaseInfo(updatedCaseInfo);
      onCaseInfoChange(updatedCaseInfo);
    } catch (error) {
      console.error('❌ Error processing transcription:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze transcription');
    } finally {
      setIsAnalyzingTranscription(false);
    }
  };

  const extractCaseInfoWithAI = async (transcription: string): Promise<Partial<typeof caseInfo>> => {
    console.log('🤖 Using AI to analyze transcription...');
    
    const response = await fetch('/api/ai/analyze-transcription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription: transcription
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI analysis failed: ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ AI analysis complete:', result);
    
    return result.extractedInfo || {};
  };

  const storeCaseAndTranscription = async (extractedInfo: Partial<typeof caseInfo>, transcriptionData: TranscriptionData) => {
    try {
      console.log('💾 Storing case and transcription in database...');
      
      const response = await fetch('/api/cases/store-case-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseInfo: extractedInfo,
          transcriptionData: transcriptionData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store case and transcription');
      }

      const result = await response.json();
      console.log('✅ Case and transcription stored:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error storing case and transcription:', error);
      throw error;
    }
  };

  const handleTranscriptionError = (error: string) => {
    console.error('❌ Transcription upload error:', error);
    // You could add error state handling here
  };

  const removeTranscription = () => {
    setTranscriptionData(null);
    onCaseInfoChange({ ...caseInfo, transcriptionData: null });
  };

  const handlePastedTranscription = async () => {
    if (!pastedTranscription.trim()) return;
    
    console.log('📄 Pasted transcription processed');
    setIsAnalyzingTranscription(true);
    
    try {
      setAnalysisError(null);
      // Create a mock transcription data object
      const mockTranscriptionData: TranscriptionData = {
        fileName: 'Pasted Transcription',
        fileUrl: '',
        fileSize: pastedTranscription.length,
        duration: 'Unknown',
        transcription: pastedTranscription,
        language: 'en',
        speakers: [],
        speakerCount: 0,
        s3Key: '',
        conversationId: '',
        segments: []
      };
      
      // Use AI to intelligently extract case information from pasted transcription
      const extractedInfo = await extractCaseInfoWithAI(pastedTranscription);
      
      // Store transcription and case info in database
      await storeCaseAndTranscription(extractedInfo, mockTranscriptionData);
      
      // Update case info with both transcription data and extracted information
      const updatedCaseInfo = { ...caseInfo, ...extractedInfo, transcriptionData: mockTranscriptionData };
      setCaseInfo(updatedCaseInfo);
      onCaseInfoChange(updatedCaseInfo);
      setTranscriptionData(mockTranscriptionData);
      setShowTranscriptionPaste(false);
      setPastedTranscription('');
    } catch (error) {
      console.error('❌ Error processing pasted transcription:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze transcription');
    } finally {
      setIsAnalyzingTranscription(false);
    }
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
          Start by uploading your strategy session recording, then review and complete the case information.
        </p>
      </div>

      {/* Transcription Upload Section - MOVED TO TOP */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileAudio className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Strategy Session Recording</h3>
          <span className="text-sm text-indigo-600 font-medium">(Auto-fills form below)</span>
        </div>
        
        <p className="text-indigo-700 text-sm mb-4">
          Upload audio recordings or paste existing transcriptions of your legal team's strategy discussions. 
          Our AI will transcribe and automatically extract case information to populate the form below.
        </p>
        
        {!transcriptionData && !showTranscriptionUpload && !showTranscriptionPaste && !isAnalyzingTranscription && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTranscriptionUpload(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Audio Recording</span>
            </button>
            <button
              onClick={() => setShowTranscriptionPaste(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Paste Transcription</span>
            </button>
          </div>
        )}

        {isAnalyzingTranscription && (
          <div className="flex items-center justify-center space-x-3 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <div className="text-indigo-700">
              <p className="font-medium">AI is analyzing your transcription...</p>
              <p className="text-sm">Extracting case information and populating form fields</p>
            </div>
          </div>
        )}

        {analysisError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  AI Analysis Failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{analysisError}</p>
                  <p className="mt-1">
                    Please check your OpenAI API key configuration in <code className="bg-red-100 px-1 rounded">.env.local</code>
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => setAnalysisError(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {showTranscriptionUpload && !transcriptionData && (
          <div className="space-y-4">
            <FileUpload 
              onUploadComplete={handleTranscriptionUpload}
              onUploadError={handleTranscriptionError}
              acceptedTypes=".mp3,.wav,.m4a,.mp4,.mov,.webm"
              maxSizeMB={50}
            />
            <button
              onClick={() => setShowTranscriptionUpload(false)}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              Cancel Upload
            </button>
          </div>
        )}

        {showTranscriptionPaste && !transcriptionData && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Your Transcription
              </label>
              <textarea
                value={pastedTranscription}
                onChange={(e) => setPastedTranscription(e.target.value)}
                placeholder="Paste your strategy session transcription here... (supports timestamps and speaker labels)"
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports various formats including timestamps, speaker labels, and plain text
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePastedTranscription}
                disabled={!pastedTranscription.trim() || isAnalyzingTranscription}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzingTranscription ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Process Transcription</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowTranscriptionPaste(false);
                  setPastedTranscription('');
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {transcriptionData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <FileAudio className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{transcriptionData.fileName}</p>
                  <p className="text-sm text-green-700">
                    {transcriptionData.duration && `${transcriptionData.duration} • `}
                    {transcriptionData.speakerCount && `${transcriptionData.speakerCount} speakers • `}
                    {Math.round(transcriptionData.fileSize / 1024 / 1024 * 100) / 100} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeTranscription}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {transcriptionData.transcription && (
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Transcription Preview</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <SpeakerTranscriptDisplay
                    segments={transcriptionData.segments || []}
                    speakers={transcriptionData.speakers || []}
                    transcription={transcriptionData.transcription}
                    showTimestamps={true}
                    showSpeakerStats={false}
                    maxHeight="max-h-64"
                  />
                </div>
              </div>
            )}
          </div>
        )}
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
              <div className="flex items-center space-x-4">
                {transcriptionData && (
                  <div className="text-sm text-green-600">
                    <p className="font-medium">✅ AI Analysis Complete</p>
                    <p>Case information extracted</p>
                  </div>
                )}
                <button
                  onClick={onProceedToBrief}
                  className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span>Proceed to Brief Writing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
