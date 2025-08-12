'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  CheckCircle, 
  Brain, 
  BookOpen, 
  Heart, 
  Target, 
  Shield, 
  PenTool, 
  Eye,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  UserCheck,
  Gavel,
  History,
  MessageSquare,
  Zap,
  Search,
  Edit3,
  RefreshCw,
  XCircle,
  Scale,
  AlertTriangle,
  Database,
  ChevronUp,
  Clock
} from 'lucide-react';
import FileUpload from '@/app/components/FileUpload';
import CitationResearch from '@/app/components/CitationResearch';
import DebugLogPanel, { debugLog } from '@/app/components/DebugLogPanel';
import CaseInformationInput from '@/app/components/CaseInformationInput';
import WorkflowStep1 from '@/app/components/WorkflowStep1';
import SpeakerTranscriptDisplay from '@/app/components/SpeakerTranscriptDisplay';

// Component for managing open cases
interface OpenCasesManagerProps {
  currentCaseId: string | null;
  onCaseSelect: (caseId: string) => void;
}

function OpenCasesManager({ currentCaseId, onCaseSelect }: OpenCasesManagerProps) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cases on component mount
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cases');
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      } else {
        setError('Failed to load cases');
      }
    } catch (error) {
      console.error('Error loading cases:', error);
      setError('Error loading cases');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = (caseId: string) => {
    debugLog.info('Case Selection', `Opening case: ${caseId}`);
    onCaseSelect(caseId);
    // Store in localStorage for persistence
    localStorage.setItem('workflow_case_id', caseId);
    
    // Switch to workflow tab and load case data
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('switchToWorkflow', { 
        detail: { 
          clearTranscript: false, // Don't clear - we want to LOAD existing data
          loadCaseData: true,
          caseId: caseId 
        } 
      });
      window.dispatchEvent(event);
    }
  };

  const handleDeleteCase = async (caseId: string, caseName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${caseName}"?\n\nThis action cannot be undone and will permanently remove the case and all associated data.`
    );
    
    if (!confirmed) {
      debugLog.info('Case Management', 'Case deletion cancelled by user');
      return;
    }

    debugLog.info('Case Management', `Deleting case: ${caseName} (${caseId})`);
    
    try {
      debugLog.api('API Call', 'DELETE /api/cases', { caseId, caseName });
      
      const response = await fetch(`/api/cases?id=${caseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        debugLog.success('Case Management', `Case "${caseName}" deleted successfully`, result);
        
        // Remove case from local state
        setCases(prev => prev.filter(c => c.id !== caseId));
        
        // If this was the current case, clear it
        if (currentCaseId === caseId) {
          onCaseSelect('');
          localStorage.removeItem('workflow_case_id');
        }
        
        // Show success message
        const toast = document.createElement('div');
        toast.textContent = `✅ "${caseName}" deleted successfully`;
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
        
      } else {
        const errorData = await response.json();
        debugLog.error('Case Management', `Failed to delete case: ${errorData.error || 'Unknown error'}`, errorData);
        setError(`Failed to delete case: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      debugLog.error('Case Management', 'Error deleting case', error);
      console.error('Error deleting case:', error);
      setError('Error deleting case');
    }
  };

  const startNewWorkflow = () => {
    debugLog.info('Workflow', 'Starting new workflow - case will be created on first file upload');
    
    // Force clear ALL workflow-related localStorage items
    const workflowKeys = [
      'workflow_case_id',
      'workflow_file_data', 
      'workflow_completed_steps',
      'workflow_current_step'
    ];
    
    workflowKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Cleared localStorage: ${key}`);
    });
    
    // Set initial step
    localStorage.setItem('workflow_current_step', '1');
    
    // Trigger a refresh/navigation to workflow tab in clean state
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('switchToWorkflow', { 
        detail: { 
          clearTranscript: true,
          loadCaseData: false,
          startNewWorkflow: true
        } 
      });
      window.dispatchEvent(event);
    }
    
    debugLog.success('Workflow', 'Ready to start new workflow - upload an audio file to begin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button
          onClick={loadCases}
          className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Open Cases</h2>
          <p className="text-gray-600 mt-1">Manage your active legal cases and continue your brief development</p>
        </div>
        <button
          onClick={startNewWorkflow}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Gavel className="w-4 h-4 mr-2" />
          Start New Workflow
        </button>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Cases Yet</h3>
          <p className="text-gray-500 mb-4">Start your first workflow by uploading an audio file - the case will be created automatically</p>
          <button
            onClick={startNewWorkflow}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Gavel className="w-4 h-4 mr-2" />
            Start Your First Workflow
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer ${
                currentCaseId === caseItem.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleCaseSelect(caseItem.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {caseItem.case_name || 'Untitled Case'}
                    </h3>
                    {currentCaseId === caseItem.id && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Court Level:</span>
                      <p className="capitalize">{caseItem.court_level || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Case Type:</span>
                      <p className="capitalize">{caseItem.case_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p className="capitalize">{caseItem.status || 'Draft'}</p>
                    </div>
                  </div>
                  
                  {caseItem.constitutional_question && (
                    <div className="mt-3">
                      <span className="font-medium text-sm text-gray-600">Constitutional Question:</span>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {caseItem.constitutional_question}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(caseItem.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCase(caseItem.id, caseItem.case_name || 'Untitled Case');
                        }}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-medium border border-red-200 hover:border-red-300 px-2 py-1 rounded transition-all duration-200"
                        title="Delete this case permanently"
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCaseSelect(caseItem.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {currentCaseId === caseItem.id ? 'Continue Working →' : 'Open Case →'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkflowPage() {
  // Initialize debug logging
  React.useEffect(() => {
    debugLog.info('Workflow', 'Supreme Court Brief Workflow loaded');
    debugLog.info('System', 'Debug panel initialized - ready for upload testing');
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('workflow');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [documentSummaries, setDocumentSummaries] = useState<any[]>([]);
  const [briefSectionChats, setBriefSectionChats] = useState<{[key: string]: Array<{role: 'user' | 'assistant', content: string}>}>({});
  const [chatInputs, setChatInputs] = useState<{[key: string]: string}>({});
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceRender, setForceRender] = useState(0);
  const [caseInformation, setCaseInformation] = useState<any>(null);

  // Always load case information from database when caseId is available
  useEffect(() => {
    if (currentCaseId && currentCaseId !== 'null' && currentCaseId !== 'undefined') {
      console.log('💾 Loading case information from database for current case:', currentCaseId);
      loadCaseInformation(currentCaseId);
    }
  }, [currentCaseId]);

  // Force re-render when uploadedFileData changes
  useEffect(() => {
    if (uploadedFileData) {
      setForceRender(prev => prev + 1);
    }
  }, [uploadedFileData]);

  // Load existing workflow data on component mount
  useEffect(() => {
    const loadWorkflowData = async () => {
      try {
        // Check localStorage for existing workflow session
        const savedCaseId = localStorage.getItem('workflow_case_id');
        const savedFileData = localStorage.getItem('workflow_file_data');
        const savedSteps = localStorage.getItem('workflow_completed_steps');
        const savedCurrentStep = localStorage.getItem('workflow_current_step');

        // Validate case ID exists in database before using it
        if (savedCaseId && savedCaseId !== 'null' && savedCaseId !== 'undefined') {
          try {
            console.log('🔍 Validating saved case ID:', savedCaseId);
            const response = await fetch('/api/cases');
            if (response.ok) {
              const data = await response.json();
              const caseExists = data.cases && data.cases.some((c: any) => c.id === savedCaseId);
              if (caseExists) {
                setCurrentCaseId(savedCaseId);
                console.log('✅ Validated case ID from localStorage:', savedCaseId);
              } else {
                console.log('❌ Case ID not found in database, clearing localStorage');
                localStorage.removeItem('workflow_case_id');
                setCurrentCaseId(null);
              }
            } else {
              console.log('❌ Failed to validate case ID, clearing localStorage');
              localStorage.removeItem('workflow_case_id');
              setCurrentCaseId(null);
            }
          } catch (error) {
            console.log('❌ Error validating case ID, clearing localStorage:', error);
            localStorage.removeItem('workflow_case_id');
            setCurrentCaseId(null);
          }
        }

        if (savedFileData) {
          const fileData = JSON.parse(savedFileData);
          setUploadedFileData(fileData);
          console.log('📂 Restored file data from localStorage:', fileData.fileName);
        }

        if (savedSteps) {
          const steps = JSON.parse(savedSteps);
          setCompletedSteps(steps);
          console.log('📂 Restored completed steps:', steps);
        }

        if (savedCurrentStep) {
          const step = parseInt(savedCurrentStep);
          setCurrentStep(step);
          console.log('📂 Restored current step:', step);
        }

        // If we have a case ID, try to load recent transcriptions AND case information
        if (savedCaseId && savedCaseId !== 'null' && savedCaseId !== 'undefined') {
          console.log('🔍 Attempting to load recent transcriptions for case:', savedCaseId);
          await loadRecentTranscriptions(savedCaseId);
          
          // Also load case information to ensure it's available
          console.log('📋 Loading case information for persistence');
          await loadCaseInformation(savedCaseId);
          
                  // Force a refresh of case information to ensure it's current
        console.log('🔄 Force refresh case information after load');
        setTimeout(() => {
          console.log('🔄 Delayed case information refresh');
          loadCaseInformation(savedCaseId);
        }, 1000); // Small delay to ensure component is fully mounted
        } else {
          console.log('📭 No valid case ID found - skipping transcription load');
        }

      } catch (error) {
        console.error('Error loading workflow data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflowData();
  }, []);

  // Save workflow state to localStorage whenever it changes
  useEffect(() => {
    if (currentCaseId) {
      localStorage.setItem('workflow_case_id', currentCaseId);
    }
  }, [currentCaseId]);

  useEffect(() => {
    if (uploadedFileData) {
      localStorage.setItem('workflow_file_data', JSON.stringify(uploadedFileData));
    }
  }, [uploadedFileData]);

  useEffect(() => {
    localStorage.setItem('workflow_completed_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem('workflow_current_step', currentStep.toString());
  }, [currentStep]);

  // Load recent transcriptions for a case
  const loadRecentTranscriptions = async (caseId: string) => {
    if (!caseId || caseId === 'undefined' || caseId === 'null') {
      console.log('⚠️ Invalid caseId provided to loadRecentTranscriptions:', caseId);
      return;
    }
    
    try {
      console.log('🔍 Loading recent transcriptions for valid caseId:', caseId);
      const response = await fetch(`/api/transcriptions?caseId=${caseId}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        const transcriptions = data.data || [];
        
        if (transcriptions.length > 0) {
          const latest = transcriptions[0];
          console.log('📂 Found recent transcription:', latest.file_name);
          
          // Reconstruct the file data from the database record
          const reconstructedFileData = {
            fileName: latest.file_name,
            fileSize: latest.file_size,
            duration: `${latest.duration_seconds}s`,
            transcription: latest.transcript || latest.transcription_text,
            language: 'eng', // Default since not stored
            speakers: latest.speakers || [],
            speakerCount: latest.speaker_count || 0,
            s3Key: latest.s3_key,
            conversationId: latest.id,
            transcriptionProvider: 'Database' // Indicate this came from saved data
          };
          
          setUploadedFileData(reconstructedFileData);
          
          // Mark step 1 as completed if we have transcription data
          if (!completedSteps.includes(1)) {
            setCompletedSteps(prev => [...prev, 1]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading recent transcriptions:', error);
    }
  };

  // Load case information from database
  const loadCaseInformation = async (caseId: string) => {
    try {
      console.log('📋 Loading case information from database for:', caseId);
      const response = await fetch(`/api/cases/${caseId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.case) {
          const caseInfo = {
            caseName: data.case.case_name || data.case.title || '',
            courtLevel: data.case.court_level || '',
            constitutionalQuestion: data.case.constitutional_question || '',
            penalties: data.case.penalties || '',
            targetPrecedent: data.case.precedent_target || ''
          };
          
          // Only update if we have meaningful data
          const hasData = Object.values(caseInfo).some(v => v && v.trim() !== '');
          if (hasData) {
            setCaseInformation(caseInfo);
            console.log('✅ Case information loaded from database:', caseInfo);
            debugLog.success('Workflow', 'Case information loaded from database', { caseId, hasData });
            
            // Save to localStorage as backup
            localStorage.setItem(`case_information_${caseId}`, JSON.stringify(caseInfo));
          } else {
            console.log('⚠️ Case information exists but is empty - skipping update');
          }
        }
      } else {
        console.log('⚠️ Failed to load case information from database - response not ok');
        
        // Try loading from localStorage as fallback
        const fallbackData = localStorage.getItem(`case_information_${caseId}`);
        if (fallbackData) {
          const caseInfo = JSON.parse(fallbackData);
          setCaseInformation(caseInfo);
          console.log('📂 Loaded case information from localStorage fallback:', caseInfo);
        }
      }
    } catch (error) {
      console.error('❌ Error loading case information:', error);
      
      // Try loading from localStorage as fallback
      try {
        const fallbackData = localStorage.getItem(`case_information_${caseId}`);
        if (fallbackData) {
          const caseInfo = JSON.parse(fallbackData);
          setCaseInformation(caseInfo);
          console.log('📂 Loaded case information from localStorage fallback after error:', caseInfo);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback loading also failed:', fallbackError);
      }
    }
  };

  // Listen for case selection events to switch to workflow tab
  useEffect(() => {
    const handleSwitchToWorkflow = async (event: any) => {
      setActiveTab('workflow');
      
      // Handle new workflow start
      if (event.detail?.startNewWorkflow) {
        debugLog.info('Workflow', 'Starting completely new workflow');
        console.log('🆕 Starting new workflow - clearing all data');
        
        // Force clear all state and localStorage
        setCurrentCaseId(null);
        setUploadedFileData(null);
        setCurrentStep(1);
        setCompletedSteps([]);
        setExpandedStep(1); // Auto-expand step 1 to show upload
        
        // Extra safety: clear localStorage again
        localStorage.removeItem('workflow_case_id');
        localStorage.removeItem('workflow_file_data');
        localStorage.removeItem('workflow_completed_steps');
        
        console.log('🧹 All workflow data cleared - ready for fresh start');
        return; // Exit early for new workflow
      }
      
      // Clear transcript data if switching to a new case
      if (event.detail?.clearTranscript) {
        debugLog.info('Workflow', 'Clearing transcript data for new case');
        console.log('🔄 Clearing transcript data for case switch');
        
        // Only clear if we're actually starting a completely new workflow
        if (event.detail?.startNewWorkflow) {
          console.log('🆕 Confirmed new workflow - clearing all data');
          setUploadedFileData(null);
          setCurrentStep(1);
          setCompletedSteps([]);
          localStorage.removeItem('workflow_file_data');
          localStorage.removeItem('workflow_completed_steps');
          localStorage.setItem('workflow_current_step', '1');
        } else {
          console.log('⚠️ clearTranscript=true but not startNewWorkflow - preserving state to prevent data loss');
        }
      } else {
        debugLog.info('Workflow', 'Loading existing case data (not clearing transcript)');
      }
      
      // Load case data if specified
      if (event.detail?.loadCaseData && event.detail?.caseId) {
        const caseId = event.detail.caseId;
        console.log('📁 Loading case data for:', caseId);
        
        try {
          // First check localStorage for case-specific transcript data
          const savedFileData = localStorage.getItem(`workflow_file_data_${caseId}`);
          
          if (savedFileData) {
            console.log('📂 Found localStorage transcript for case:', caseId);
            const fileData = JSON.parse(savedFileData);
            setUploadedFileData(fileData);
            setCompletedSteps([1]);
            setCurrentStep(2);
            console.log('✅ Loaded existing transcript from localStorage for case:', caseId);
            
            // Also load case information from database
            loadCaseInformation(caseId);
          } else {
            // If no localStorage data, check database for existing transcriptions
            console.log('🔍 Checking database for existing transcriptions for case:', caseId);
            
            try {
              const response = await fetch(`/api/transcriptions?caseId=${caseId}&limit=1`);
              if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.data && data.data.length > 0) {
                  const transcription = data.data[0];
                  console.log('📄 Found database transcription:', transcription.file_name);
                  
                  // Convert database transcription to uploadedFileData format
                  const analysisResult = transcription.analysis_result || {};
                  const fileData = {
                    fileName: transcription.file_name,
                    fileSize: transcription.file_size || 0,
                    duration: analysisResult.duration_seconds ? `${Math.floor(analysisResult.duration_seconds / 60)}:${(analysisResult.duration_seconds % 60).toString().padStart(2, '0')}` : '0:00',
                    transcription: transcription.transcript || transcription.transcription_text || 'No transcription available',
                    language: 'eng',
                    speakers: analysisResult.speakers || [],
                    speakerCount: analysisResult.speaker_count || 0,
                    conversationId: transcription.id,
                    transcriptionProvider: 'Database',
                    s3Key: transcription.s3_url || null
                  };
                  
                  debugLog.success('Workflow', 'Loaded existing transcription from database', {
                    fileName: fileData.fileName,
                    duration: fileData.duration,
                    transcriptionLength: fileData.transcription.length,
                    speakerCount: fileData.speakerCount
                  });
                  
                  setUploadedFileData(fileData);
                  setCompletedSteps([1]);
                  setCurrentStep(2);
                  
                  // Save to localStorage for future use
                  localStorage.setItem(`workflow_file_data_${caseId}`, JSON.stringify(fileData));
                  console.log('✅ Loaded transcription from database and saved to localStorage');
                  
                  // Also load case information from database
                  loadCaseInformation(caseId);
                } else {
                  debugLog.info('Workflow', `No transcriptions found for case: ${caseId} - will show upload screen`);
                  console.log('📭 No transcriptions found in database for case:', caseId);
                }
              } else {
                debugLog.error('Workflow', 'Failed to fetch transcriptions from database');
                console.error('❌ Failed to fetch transcriptions from database');
              }
            } catch (dbError) {
              debugLog.error('Workflow', 'Error fetching transcriptions from database', dbError);
              console.error('❌ Error fetching transcriptions from database:', dbError);
            }
          }
        } catch (error) {
          console.error('❌ Error loading case transcriptions:', error);
        }
      }
    };

    window.addEventListener('switchToWorkflow', handleSwitchToWorkflow);
    return () => {
      window.removeEventListener('switchToWorkflow', handleSwitchToWorkflow);
    };
  }, []);

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
    if (stepNumber < steps.length) {
      setCurrentStep(stepNumber + 1);
    }
  };

  const handleFileUploadComplete = (fileData: any) => {
    // Enhanced logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group('📋 FileUpload Completed Successfully');
      console.log('File Name:', fileData.fileName);
      console.log('File Size:', `${(fileData.fileSize / 1024 / 1024).toFixed(2)}MB`);
      console.log('Duration:', fileData.duration);
      console.log('Transcription Length:', fileData.transcription?.length || 0, 'characters');
      console.log('Speakers Detected:', fileData.speakerCount || 0);
      console.log('Language:', fileData.language || 'Unknown');
      console.log('Has Transcription:', !!fileData.transcription);
      console.groupEnd();
    } else {
      // Production logging - minimal
      console.log('📋 FileUpload completed:', fileData.fileName);
    }
    
    // Set the uploaded file data - this will trigger a re-render
    setUploadedFileData(fileData);
    
    // Store case ID if this upload created one
    if (fileData.caseId && fileData.caseId !== 'none') {
      setCurrentCaseId(fileData.caseId);
      localStorage.setItem('workflow_case_id', fileData.caseId);
      console.log('🆔 Case ID from upload set:', fileData.caseId);
      debugLog.success('Workflow', 'Case ID updated from file upload', { caseId: fileData.caseId });
    }
    
    // Mark step as complete after state is set
    handleStepComplete(1);
    
    // CRITICAL: Automatically expand Step 1 to show the completed transcription
    setExpandedStep(1);
    console.log('🔍 Automatically expanding Step 1 to show transcript');
    
    // Ensure we're on the workflow tab
    setActiveTab('workflow');
    console.log('📂 Switched to workflow tab to show results');
  };

  // Create a test case for the workflow demo
  const createTestCase = async () => {
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_name: 'Workflow Demo Case',
          case_type: 'constitutional',
          court_level: 'supreme',
          constitutional_question: 'Religious liberty and vaccination mandates',
          client_type: 'individual',
          jurisdiction: 'federal'
        })
      });
      
      if (response.ok) {
        const caseData = await response.json();
        console.log('✅ Test case created:', caseData.id);
        return caseData.id;
      } else {
        console.error('❌ Failed to create test case');
        return null;
      }
    } catch (error) {
      console.error('❌ Error creating test case:', error);
      return null;
    }
  };

  const handleStepClick = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleBriefSectionChat = (sectionId: string, userMessage: string) => {
    if (!userMessage.trim()) return;
    
    // Add user message
    setBriefSectionChats(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        { role: 'user', content: userMessage }
      ]
    }));
    
    // Clear input
    setChatInputs(prev => ({
      ...prev,
      [sectionId]: ''
    }));
    
    // Simulate AI response (in real implementation, this would call an API)
    setTimeout(() => {
      const responses = {
        'question': [
          "I can help refine the question presented. Would you like me to make it more specific to the Amish community, or broader to cover all religious minorities?",
          "The current formulation focuses on Smith doctrine. Should we emphasize the religious targeting angle more strongly?",
          "I notice we could strengthen the constitutional framing. Would you like me to add more originalist language for Justice Thomas?"
        ],
        'summary': [
          "The summary effectively previews our three-part argument. Should we adjust the emphasis on any particular pillar?",
          "I can enhance the emotional appeal while maintaining legal precision. What tone would you prefer?",
          "The Yoder parallel is strong here. Should we draw more explicit connections to that precedent?"
        ],
        'argument1': [
          "This section builds our textual and historical foundation. Should we add more founding-era evidence?",
          "The Yoder analysis is central here. Would you like me to strengthen the factual parallels?",
          "I can add more citations to support the historical accommodation tradition. What time period should we focus on?"
        ],
        'argument2': [
          "The religious targeting argument is powerful. Should we emphasize the selective exemption angle more?",
          "I can strengthen the Lukumi parallels. Would you like more detailed factual comparisons?",
          "The neutrality violation is clear. Should we add more examples of government religious hostility?"
        ],
        'argument3': [
          "This section tackles Smith directly. Should we be more aggressive in calling for its overruling?",
          "I can provide more narrow paths to avoid overturning Smith. Which justices are you most concerned about?",
          "The institutional competence argument could be stronger. Should we emphasize judicial vs. bureaucratic decision-making?"
        ],
        'conclusion': [
          "The conclusion ties everything together. Should we add more emotional appeal for the Amish family?",
          "I can strengthen the constitutional imperative language. Would you like more forceful rhetoric?",
          "The remedy section could be more specific. Should we detail exactly what accommodation we're seeking?"
        ]
      };
      
      const sectionResponses = responses[sectionId as keyof typeof responses] || [
        "I can help you refine this section. What specific changes would you like to make?",
        "What aspect of this argument would you like to strengthen or modify?",
        "I'm ready to help improve this section. What's your main concern?"
      ];
      
      const randomResponse = sectionResponses[Math.floor(Math.random() * sectionResponses.length)];
      
      setBriefSectionChats(prev => ({
        ...prev,
        [sectionId]: [
          ...prev[sectionId],
          { role: 'assistant', content: randomResponse }
        ]
      }));
    }, 1000);
  };

  const renderChatInterface = (sectionId: string) => (
    <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h6 className="font-medium text-gray-800 text-sm">💬 Discuss This Section</h6>
        <span className="text-xs text-gray-500">AI Legal Assistant</span>
      </div>
      
      {/* Chat Messages */}
      {briefSectionChats[sectionId] && briefSectionChats[sectionId].length > 0 && (
        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          {briefSectionChats[sectionId].map((message, index) => (
            <div key={index} className={`text-xs p-2 rounded ${
              message.role === 'user' 
                ? 'bg-blue-100 text-blue-800 ml-4' 
                : 'bg-white text-gray-700 mr-4 border'
            }`}>
              <span className="font-medium">{message.role === 'user' ? 'You: ' : 'AI: '}</span>
              {message.content}
            </div>
          ))}
        </div>
      )}
      
      {/* Chat Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Ask about this section or suggest changes..."
          value={chatInputs[sectionId] || ''}
          onChange={(e) => setChatInputs(prev => ({...prev, [sectionId]: e.target.value}))}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleBriefSectionChat(sectionId, chatInputs[sectionId] || '');
            }
          }}
          className="flex-1 text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={() => handleBriefSectionChat(sectionId, chatInputs[sectionId] || '')}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );

  const steps = [
    {
      id: 1,
      title: "Strategic Discussion Audio Upload",
      icon: Upload,
      color: "bg-blue-500",
      description: "Upload audio recording of legal team's strategy discussion about the case, or record a new session directly in the app.",
      details: "The AI uses 11Labs transcription with advanced speaker identification to capture the collaborative thinking process, automatically identifying different team members and extracting the core strategic framework, potential arguments, and the team's approach to the case.",
      mockData: {
        file: "attorney_strategy_discussion_miller_case.mp3",
        duration: "17:32",
        speakers: [
          { name: "Lead Attorney", segments: 87, confidence: 96 },
          { name: "Constitutional Law Expert", segments: 23, confidence: 94 },
          { name: "Religious Liberty Specialist", segments: 15, confidence: 92 },
          { name: "Strategy Advisor", segments: 31, confidence: 89 }
        ],
        transcriptionQuality: 98,
        keyTopics: ["Smith Decision", "Religious Targeting", "Amish Community", "Bodily Autonomy", "Historical Context"],
        emotionalTone: "Collaborative, Strategic, Optimistic",
        status: "Transcription Complete - 599 segments processed"
      }
    },
    {
      id: 2,
      title: "Case Information Input",
      icon: FileText,
      color: "bg-green-500",
      description: "Provide basic case details including parties, court level, legal issues, and constitutional questions.",
      details: "Users provide case details including the parties, court level, legal issues involved, and the specific constitutional question being addressed. They'll also indicate whether they're seeking cert or writing for a case already granted review, and specify their client/amicus party.",
      mockData: {
        caseName: "Miller v. New York State Department of Health",
        parties: "Amish families and schools vs. New York State Department of Health",
        courtLevel: "U.S. Supreme Court (Cert Petition from Second Circuit)",
        currentStatus: "Lost at Second Circuit - seeking certiorari",
        constitutionalQuestion: "Whether Employment Division v. Smith should be overruled when neutral and generally applicable laws burden sincere religious exercise",
        clientType: "First Liberty Institute (Amicus Brief)",
        jurisdiction: "New York State",
        penalties: "$118,000 in fines against Amish schools",
        precedentTarget: "Employment Division v. Smith (1990)"
      }
    },
    {
      id: 3,
      title: "Judge Profile Analysis",
      icon: Users,
      color: "bg-purple-500",
      description: "AI automatically analyzes psychological profiles and judicial philosophies of all relevant judges.",
      details: "For Supreme Court cases, this includes detailed analysis of all nine justices' previous opinions, speeches, and decision patterns, identifying their values, preferred legal frameworks, and potential pressure points for persuasion.",
      mockData: {
        justices: [
          { 
            name: "Alito", 
            alignment: 95, 
            keyFactors: ["Religious liberty champion", "Anti-Smith sentiment", "Traditional values"],
            strategy: "Emphasize historical religious persecution",
            confidence: "Natural ally - minimal persuasion needed"
          },
          { 
            name: "Gorsuch", 
            alignment: 93, 
            keyFactors: ["Explicit Smith critic", "Textualist approach", "Individual liberty"],
            strategy: "Focus on textual meaning of Free Exercise Clause",
            confidence: "Strong ally - has criticized Smith in opinions"
          },
          { 
            name: "Thomas", 
            alignment: 90, 
            keyFactors: ["Originalism", "Religious liberty", "Anti-Smith inclination"],
            strategy: "Historical analysis of Founding Era protections",
            confidence: "Reliable vote - originalist approach favors religious liberty"
          },
          { 
            name: "Barrett", 
            alignment: 75, 
            keyFactors: ["Religious liberty background", "Judicial minimalism", "Institutional concerns"],
            strategy: "Emphasize narrow application to insular communities",
            confidence: "Likely ally but may prefer incremental approach"
          },
          { 
            name: "Kavanaugh", 
            alignment: 70, 
            keyFactors: ["Moderate conservatism", "Institutional stability", "Precedent respect"],
            strategy: "Focus on limited impact to Amish communities",
            confidence: "Persuadable - concerned about broader implications"
          },
          { 
            name: "Roberts", 
            alignment: 65, 
            keyFactors: ["Institutional concerns", "Judicial minimalism", "Narrow rulings"],
            strategy: "Provide pathway for narrow ruling without Smith reversal",
            confidence: "Swing vote - institutional concerns may outweigh religious liberty"
          }
        ],
        liberalJustices: [
          {
            name: "Kagan",
            alignment: 45,
            strategy: "Frame as minority rights and bodily autonomy issue",
            keyFactors: ["Minority rights", "Bodily autonomy arguments", "Government authority"]
          },
          {
            name: "Sotomayor", 
            alignment: 40,
            strategy: "Emphasize protection of vulnerable minority communities",
            keyFactors: ["Public health focus", "Minority protection", "Government authority"]
          },
          {
            name: "Jackson",
            alignment: 35,
            strategy: "Focus on historical persecution of religious minorities",
            keyFactors: ["Public health priority", "Civil rights focus", "Government skepticism"]
          }
        ]
      }
    },
    {
      id: 4,
      title: "Vehicle Assessment",
      icon: Gavel,
      color: "bg-yellow-500",
      description: "Review AI-generated analysis of whether this case provides the 'perfect vehicle' the court is seeking.",
      details: "The system evaluates the case's potential to overturn precedent (like Employment Division v. Smith), its optics for public perception, and whether it gives justices the tools they need to explain their decision to the broader legal community.",
      mockData: {
        vehicleScore: 89,
        precedentImpact: "High - Multiple justices have criticized Smith",
        publicOptics: "Favorable - Sympathetic Amish plaintiffs, contained community", 
        judicialTools: "Strong - Clear constitutional principles and historical precedent",
        politicalRisks: "Medium - Vaccine politics but not COVID-related",
        strengths: [
          "Sympathetic plaintiffs (Amish community)",
          "Clear constitutional violation (religious targeting)",
          "Insular community with minimal public impact",
          "Strong historical precedent for religious accommodation"
        ],
        weaknesses: [
          "Vaccine politics may concern some justices",
          "Potential broader civil rights implications",
          "Public health arguments from opposition"
        ]
      }
    },
    {
      id: 5,
      title: "Historical Context Research",
      icon: History,
      color: "bg-indigo-500",
      description: "AI conducts comprehensive research into founding documents, historical precedents, and relevant stories.",
      details: "The AI researches founding documents, historical precedents, and relevant stories from American history that support the legal arguments. Users can review and select from historical examples like conscientious objection to warfare, religious persecution in colonial times, or other foundational principles.",
      mockData: {
        foundingDocs: [
          "Madison's Memorial and Remonstrance Against Religious Assessments (1785)",
          "Pennsylvania Charter of Privileges (1701)",
          "First Amendment debates in Congress (1789)",
          "Virginia Statute for Religious Freedom (1786)"
        ],
        historicalCases: [
          "Wisconsin v. Yoder (1972) - Amish education rights",
          "Pierce v. Society of Sisters (1925) - Parental rights",
          "Sherbert v. Verner (1963) - Religious accommodation",
          "West Virginia v. Barnette (1943) - Compelled speech/action"
        ],
        colonialExamples: [
          "Quaker and Mennonite oath exemptions in Pennsylvania",
          "Conscientious objection to military service",
          "Religious tax exemptions for dissenting churches",
          "Pennsylvania's 'holy experiment' in religious tolerance"
        ]
      }
    },
    {
      id: 6,
      title: "Storytelling Integration",
      icon: Heart,
      color: "bg-pink-500",
      description: "Select specific human stories and concrete examples that make legal arguments emotionally resonant.",
      details: "The user selects specific human stories and concrete examples that will make the legal arguments emotionally resonant. This includes detailed narratives about the actual people affected (specific Amish families, individual circumstances) while connecting these stories to broader constitutional principles.",
      mockData: {
        primaryStories: [
          {
            family: "Miller Family",
            details: "Five children, third-generation farmers in rural New York, face $23,600 in fines for keeping children in Amish school",
            impact: "Cannot afford fines, may lose farm that's been in family for 60 years",
            religiousConnection: "Believe vaccines interfere with God's natural immunity design"
          },
          {
            community: "Swartzentruber Amish District",
            details: "127 families, completely self-sufficient community on 2,400 acres",
            impact: "School serves only Amish children, no contact with public school system",
            religiousConnection: "Traditional healing practices based on herbal medicine and prayer"
          }
        ]
      }
    },
    {
      id: 7,
      title: "Multi-Perspective Argument Crafting",
      icon: Target,
      color: "bg-red-500",
      description: "AI generates arguments framed to appeal across ideological lines.",
      details: "The AI generates arguments framed to appeal across ideological lines, ensuring the brief doesn't 'scare' any justices by presenting religious liberty as protection for all minority viewpoints rather than just conservative Christian interests.",
      mockData: {
        conservativeFraming: {
          title: "Traditional Religious Liberty and Constitutional Text",
          arguments: [
            "Original meaning of Free Exercise Clause protects religious practice",
            "Historical tradition of religious accommodation dating to colonial era", 
            "Parental rights to direct children's upbringing and education",
            "Smith decision inconsistent with constitutional text and history"
          ]
        },
        liberalFraming: {
          title: "Minority Rights Protection and Bodily Autonomy",
          arguments: [
            "Protection of vulnerable religious minority from government targeting",
            "Bodily autonomy and right to refuse unwanted medical intervention",
            "Equal protection - medical exemptions prove religious targeting",
            "Preventing government coercion of deeply held convictions"
          ]
        }
      }
    },
    {
      id: 8,
      title: "Counter-Argument Analysis & Response Strategy",
      icon: AlertTriangle,
      color: "bg-orange-500",
      description: "AI identifies all potential opposition arguments and develops strategic responses.",
      details: "The system analyzes the government's likely arguments, identifies potential weaknesses in our case, and develops strategic responses. This includes arguments to address directly in the brief versus those to avoid engaging, and how to inoculate against the strongest opposition points.",
      mockData: {
        counterArgumentsIdentified: 23,
        criticalThreats: 7,
        strategicResponses: 15,
        avoidanceRecommendations: 8,
        inoculationStrategies: 12,
        threatLevel: {
          high: ["Public Health Emergency", "Smith Precedent", "Slippery Slope"],
          medium: ["Equal Treatment", "Anti-Science Framing", "Child Welfare"],
          low: ["COVID Politics", "Religious Targeting Claims", "Broad Revolution"]
        }
      }
    },
    {
      id: 9,
      title: "Citation and Precedent Verification",
      icon: Shield,
      color: "bg-teal-500",
      description: "System automatically verifies all citations and cross-references legal precedents.",
      details: "The system automatically verifies all citations, cross-references legal precedents, and ensures accuracy of quotes and case references. Multiple AI models cross-check each other to prevent hallucinations and false citations.",
      mockData: {
        citationsChecked: 247,
        precedentsVerified: 89,
        quotesValidated: 156,
        accuracyScore: 99.7
      }
    },
    {
      id: 10,
      title: "Brief Structure and Drafting",
      icon: PenTool,
      color: "bg-indigo-500",
      description: "AI generates the full brief structure incorporating all research, stories, and strategic elements.",
      details: "The AI generates the full brief structure with introduction, argument sections, and conclusion, incorporating all the research, stories, and strategic elements identified in previous steps. Users can edit and refine the draft while maintaining the strategic framework.",
      mockData: {
        totalWordCount: 10952,
        overallPersuasionScore: 92,
        justiceSpecificScores: {
          "Thomas": 96,
          "Alito": 94, 
          "Gorsuch": 93,
          "Barrett": 85,
          "Kavanaugh": 78,
          "Roberts": 72,
          "Kagan": 58,
          "Sotomayor": 54,
          "Jackson": 49
        },
        briefSections: [
          "Statement of the Question Presented",
          "Statement of Parties",
          "Statement of the Case",
          "Summary of Argument",
          "Argument I: The Free Exercise Clause Requires Accommodation",
          "Argument II: Religious Targeting Violates Neutrality",
          "Argument III: Smith Should Be Limited or Overruled",
          "Conclusion"
        ]
      }
    },
    {
      id: 11,
      title: "Final Review and Optimization",
      icon: Eye,
      color: "bg-gray-500",
      description: "Conduct final review with AI assistance to ensure consistent messaging and effective balance.",
      details: "Users conduct final review with AI assistance to ensure the brief maintains consistent messaging, doesn't contain contradictions, and effectively balances legal argumentation with persuasive storytelling. The system provides a final assessment of how well the brief addresses each justice's likely concerns and interests.",
      mockData: {
        consistencyScore: 96,
        contradictions: 0,
        messagingAlignment: 94,
        factualAccuracy: 99,
        overallAssessment: {
          winProbability: 73,
          certProbability: 85
        }
      }
    }
  ];

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'available';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'available': return 'bg-gray-300';
      case 'locked': return 'bg-gray-200';
      default: return 'bg-gray-200';
    }
  };

  // Add navigation functions
  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    setExpandedStep(stepNumber);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setExpandedStep(currentStep - 1);
    }
  };

  const goForward = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setExpandedStep(currentStep + 1);
    }
  };

  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < steps.length;
  const isStepEditable = (stepNumber: number) => {
    return completedSteps.includes(stepNumber) || stepNumber === currentStep;
  };

  // Show loading state while data is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supreme Court Brief Writing Tool</h1>
              <p className="mt-2 text-gray-600">AI-powered legal brief generation for constitutional cases</p>
              {currentCaseId && (
                <p className="text-sm text-blue-600 mt-1">Active Case ID: {currentCaseId}</p>
              )}
            </div>
            <div className="flex space-x-3">
              {(uploadedFileData || currentCaseId) && (
                <button
                  onClick={() => {
                    if (confirm('Clear all workflow data and start fresh?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Clear Session
                </button>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Workflow</span>
              </div>
            </button>
            
                          <button
                onClick={() => setActiveTab('cases')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Gavel className="w-4 h-4" />
                  <span>Open Cases</span>
                </div>
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'workflow' ? (
          <>
            {/* Progress Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Workflow Progress</h2>
                <div className="text-sm text-gray-600 font-medium">
                  {completedSteps.length} of {steps.length} steps completed
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goBack}
                  disabled={!canGoBack}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    canGoBack
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ← Previous Step
                </button>
                
                <div className="text-sm text-gray-600">
                  Step {currentStep} of {steps.length}
                </div>
                
                <button
                  onClick={goForward}
                  disabled={!canGoForward}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    canGoForward
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Step →
                </button>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSteps.includes(step.id) 
                        ? 'bg-green-500 text-white' 
                        : step.id === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-1 mx-1 ${
                        completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Click any step below to explore the detailed analysis and results
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const status = getStepStatus(step.id);
                const isExpanded = expandedStep === step.id;
                
                return (
                  <div key={step.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div 
                      className={`p-6 cursor-pointer transition-colors ${
                        status === 'current' ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleStepClick(step.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.color}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {completedSteps.includes(step.id) && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          {status === 'current' && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Edit button for completed steps */}
                      {completedSteps.includes(step.id) && (
                        <div className="mt-2">
                          <button
                            onClick={() => goToStep(step.id)}
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit Step
                          </button>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 border-t bg-gray-50">
                        <div className="pt-6">
                          <p className="text-gray-700 mb-6">{step.details}</p>
                          
                          {/* Step-specific UI components with real data */}
                          {step.id === 1 && (
                            <WorkflowStep1
                              caseId={currentCaseId}
                              onTranscriptionComplete={handleFileUploadComplete}
                              isCompleted={completedSteps.includes(1)}
                              uploadedFileData={uploadedFileData}
                            />
                          )}
                          
                          {step.id === 999 && ( // Disabled old step 1
                            <div className="space-y-4">
                              {step.id === currentStep ? (
                                // Show FileUpload for current step
                                <div className="space-y-6">
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Upload Attorney Strategy Session</h3>
                                    <p className="text-blue-700 text-sm">
                                      Upload audio recordings of your legal team's strategy discussions. Our AI will transcribe 
                                      and identify key constitutional arguments, precedents, and strategic approaches.
                                    </p>
                                  </div>

                                  <FileUpload 
                                    onUploadComplete={handleFileUploadComplete}
                                    acceptedTypes=".mp3,.wav,.m4a,.mp4,.mov,.webm"
                                    maxSizeMB={50} // 50MB (Supabase free tier limit)
                                    // No caseId - we'll create a case dynamically if needed
                                  />

                                  {uploadedFileData && (
                                    <div key={`transcription-${forceRender}`} className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in slide-in-from-bottom duration-500">
                                      <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Transcription Complete
                                      </h4>

                                      <div className="text-sm text-green-700 space-y-1">
                                        <p><strong>File:</strong> {uploadedFileData.fileName}</p>
                                        <p><strong>Duration:</strong> {uploadedFileData.duration}</p>
                                        <p><strong>Language:</strong> {uploadedFileData.language}</p>
                                        <p><strong>Speakers Identified:</strong> {uploadedFileData.speakerCount}</p>
                                        {uploadedFileData.transcriptionProvider && (
                                          <p><strong>Transcription Service:</strong> {uploadedFileData.transcriptionProvider}</p>
                                        )}
                                        {uploadedFileData.s3Key && (
                                          <p><strong>File Saved:</strong> ✓ Yes (Supabase Storage)</p>
                                        )}
                                        {uploadedFileData.conversationId && (
                                          <p><strong>Database Record:</strong> ✓ Yes</p>
                                        )}
                                        {!uploadedFileData.conversationId && (
                                          <p><strong>Database Record:</strong> ⚠️ Failed (using local data)</p>
                                        )}
                                      </div>
                                      

                                      {uploadedFileData.transcription && (
                                        <div className="mt-4 border-t border-green-300 pt-4">
                                          <SpeakerTranscriptDisplay
                                            segments={uploadedFileData.segments}
                                            speakers={uploadedFileData.speakers}
                                            transcription={uploadedFileData.transcription}
                                            showTimestamps={true}
                                            showSpeakerStats={true}
                                            maxHeight="max-h-96"
                                          />
                                        </div>
                                      )}


                                      
                                      <div className="mt-4">
                                        <button
                                          onClick={() => handleStepComplete(1)}
                                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                          Continue to Step 2 <ChevronRight className="w-4 h-4 ml-1 inline" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // Show mock data for completed step
                                <div className="bg-white rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Audio Analysis: Strategy Session</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center bg-green-50">
                                        <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        <p className="text-sm text-green-700">{step.mockData.file}</p>
                                        <p className="text-xs text-green-600 mt-1">Duration: {step.mockData.duration}</p>
                                      </div>
                                      <div className="mt-4 text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                          {step.mockData.status}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="text-sm">
                                        <strong>Speakers Identified:</strong> {step.mockData?.speakers?.length || 0}
                                      </div>
                                      <div className="text-sm">
                                        <strong>Transcription Quality:</strong> {step.mockData?.transcriptionQuality || 0}%
                                      </div>
                                      <div className="text-sm">
                                        <strong>Key Topics:</strong> {step.mockData?.keyTopics?.join(", ") || ""}
                                      </div>
                                      <div className="text-sm">
                                        <strong>Tone:</strong> {step.mockData.emotionalTone}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {step.id === 2 && (
                            <div className="space-y-6">
                              {/* AI-Powered Case Information Input */}
                              <CaseInformationInput
                                transcript={uploadedFileData?.transcription}
                                autoAnalyze={true}
                                caseId={currentCaseId}
                                initialCaseInfo={caseInformation}
                                onCaseInfoComplete={async (caseInfo) => {
                                  setCaseInformation(caseInfo);
                                  console.log('📋 Case information completed:', caseInfo);
                                  
                                  // Save case information to database
                                  if (currentCaseId) {
                                    try {
                                      console.log('💾 Saving case information to database...');
                                      
                                      const response = await fetch(`/api/cases?id=${currentCaseId}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          case_name: caseInfo.caseName,
                                          court_level: caseInfo.courtLevel,
                                          constitutional_question: caseInfo.constitutionalQuestion,
                                          penalties: caseInfo.penalties,
                                          precedent_target: caseInfo.targetPrecedent,
                                          current_step: 2,
                                          status: 'case_info_complete'
                                        })
                                      });
                                      
                                      if (response.ok) {
                                        const savedCase = await response.json();
                                        console.log('✅ Case information saved to database:', savedCase.case?.case_name);
                                        
                                        // Save AI analysis to localStorage as backup
                                        if (caseInfo.analysis) {
                                          localStorage.setItem(`case_analysis_${currentCaseId}`, JSON.stringify({
                                            ...caseInfo.analysis,
                                            confidence: caseInfo.confidence,
                                            saved_at: new Date().toISOString()
                                          }));
                                          console.log('📋 AI analysis saved to localStorage as backup');
                                        }
                                      } else {
                                        const errorData = await response.json();
                                        console.error('❌ Failed to save case information:', errorData);
                                        
                                        // Still save to localStorage if database fails
                                        localStorage.setItem(`case_info_${currentCaseId}`, JSON.stringify(caseInfo));
                                        console.log('💾 Case info saved to localStorage as fallback');
                                      }
                                    } catch (error) {
                                      console.error('❌ Error saving case information:', error);
                                      
                                      // Save to localStorage as fallback
                                      localStorage.setItem(`case_info_${currentCaseId}`, JSON.stringify(caseInfo));
                                      console.log('💾 Case info saved to localStorage as fallback');
                                    }
                                  }
                                  
                                  // Show completion status
                                  const toast = document.createElement('div');
                                  toast.textContent = '✅ Case Information Analysis Complete & Saved!';
                                  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 font-medium';
                                  document.body.appendChild(toast);
                                  setTimeout(() => {
                                    if (document.body.contains(toast)) {
                                      document.body.removeChild(toast);
                                    }
                                  }, 3000);
                                  
                                  // Auto-advance to next step
                                  setTimeout(() => {
                                    handleStepComplete(2);
                                  }, 1000);
                                }}
                              />

                              {/* Show when case info is completed */}
                              {caseInformation && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Case Information Complete
                                  </h4>
                                  <div className="text-sm text-green-700 space-y-1">
                                    <p><strong>Case:</strong> {caseInformation.caseName}</p>
                                    <p><strong>Court:</strong> {caseInformation.courtLevel}</p>
                                    {caseInformation.confidence && (
                                      <p><strong>AI Confidence:</strong> {Math.round(caseInformation.confidence * 100)}%</p>
                                    )}
                                  </div>
                                  
                                  <div className="mt-4">
                                    <button
                                      onClick={() => handleStepComplete(2)}
                                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                    >
                                      Continue to Legal Research <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Citation Research Component - Show after case info is complete */}
                              {caseInformation && (
                                <div className="space-y-4">
                                  <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Research & Citations</h3>
                                    <CitationResearch
                                      onDocumentsSelected={setSelectedDocuments}
                                      onSummariesGenerated={setDocumentSummaries}
                                    />
                                  </div>

                                  {/* Document Summaries Display */}
                                  {documentSummaries.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <h4 className="font-semibold text-blue-900 mb-2">✓ Document Analysis Complete</h4>
                                      <p className="text-sm text-blue-700">
                                        {documentSummaries.length} documents analyzed and summarized for case context.
                                      </p>
                                    </div>
                                  )}

                                  {/* Selected Documents Count */}
                                  {selectedDocuments.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <h4 className="font-semibold text-blue-900 mb-2">Selected Documents</h4>
                                      <p className="text-sm text-blue-700">
                                        {selectedDocuments.length} documents selected for brief generation.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Placeholder for remaining steps */}
                          {step.id > 2 && (
                            <div className="text-center py-8">
                              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h3>
                              <p className="text-gray-500">
                                This step will be available once the previous steps are completed.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Open Cases Tab */
          <OpenCasesManager currentCaseId={currentCaseId} onCaseSelect={setCurrentCaseId} />
        )}
      </div>
      
      {/* Debug Log Panel */}
      <DebugLogPanel />
    </div>
  );
}