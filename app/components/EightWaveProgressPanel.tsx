'use client';

import { useState, useEffect } from 'react';
import { Waves, Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react';
import AIThoughtProcess from './AIThoughtProcess';

interface WaveJob {
  id: string;
  case_id: string;
  job_status: string;
  current_wave: number;
  total_waves: number;
  wave_status: Record<number, string>;
  wave_logs: Record<number, any>;
  wave_artifacts: Record<number, any>;
  wave_timestamps: Record<number, string>;
  created_at: string;
  updated_at: string;
  error_message?: string;
  final_brief_id?: string;
  final_word_count?: number;
}

interface WaveLog {
  id: string;
  wave_number: number;
  wave_name: string;
  log_level: string;
  message: string;
  metadata: any;
  created_at: string;
}

interface EightWaveProgressPanelProps {
  caseId?: string;
  className?: string;
}

const WAVE_NAMES = {
  1: 'Backbone Draft',
  2: 'Historical Integration', 
  3: 'Document Integration',
  4: 'Justice Targeting',
  5: 'Adversarial Analysis',
  6: 'Style Conformance',
  7: 'Bluebook & Citations',
  8: 'Final Consolidation'
};

export default function EightWaveProgressPanel({ caseId, className = '' }: EightWaveProgressPanelProps) {
  const [jobs, setJobs] = useState<WaveJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<WaveJob | null>(null);
  const [waveLogs, setWaveLogs] = useState<WaveLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch jobs for the case
  const fetchJobs = async () => {
    if (!caseId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ai/eight-wave-brief?caseId=${caseId}`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs || []);
        
        // Auto-select the most recent job
        if (data.jobs && data.jobs.length > 0 && !selectedJob) {
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching 8-wave jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch logs for selected job
  const fetchLogs = async (jobId: string) => {
    try {
      const response = await fetch(`/api/ai/eight-wave-brief/logs?jobId=${jobId}`);
      const data = await response.json();
      
      if (data.success) {
        setWaveLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching wave logs:', error);
    }
  };

  // Auto-refresh jobs
  useEffect(() => {
    if (!autoRefresh) return;
    
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Refresh every 3 seconds
    
    return () => clearInterval(interval);
  }, [caseId, autoRefresh]);

  // Fetch logs when job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchLogs(selectedJob.id);
    }
  }, [selectedJob]);

  const getWaveStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'running': return <Play className="h-5 w-5 text-blue-600" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'queued': return <Clock className="h-5 w-5 text-gray-400" />;
      default: return <Pause className="h-5 w-5 text-gray-300" />;
    }
  };

  const getWaveStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'running': return 'bg-blue-50 border-blue-200 animate-pulse';
      case 'failed': return 'bg-red-50 border-red-200';
      case 'queued': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  const startEightWaveGeneration = async () => {
    if (!caseId) return;
    
    try {
      const response = await fetch('/api/ai/eight-wave-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('🚀 Started 8-wave generation:', data.jobId);
        fetchJobs(); // Refresh to show new job
      } else {
        console.error('Failed to start 8-wave generation:', data.error);
      }
    } catch (error) {
      console.error('Error starting 8-wave generation:', error);
    }
  };

  if (!caseId) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Waves className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Select a case to view 8-wave brief generation progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Waves className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">8-Wave Brief Generation</h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button
              onClick={startEightWaveGeneration}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Start 8-Wave Generation
            </button>
          </div>
        </div>
      </div>

      {/* Job List */}
      {jobs.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Generation Jobs</h4>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedJob?.id === job.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {job.job_status === 'completed' ? '✅' : 
                       job.job_status === 'in_progress' ? '🔄' : 
                       job.job_status === 'failed' ? '❌' : '⏳'}
                    </span>
                    <span className="ml-2 text-sm">
                      Wave {job.current_wave}/{job.total_waves} - {job.job_status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(job.created_at).toLocaleTimeString()}
                  </span>
                </div>
                {job.error_message && (
                  <p className="text-xs text-red-600 mt-1">{job.error_message}</p>
                )}
                {job.job_status === 'completed' && job.final_brief_id && (
                  <div className="mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/briefs/${job.final_brief_id}`, '_blank');
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      📄 View Brief ({job.final_word_count || 0} words)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wave Progress */}
      {selectedJob && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Wave Progress</h4>
          <div className="grid gap-3">
            {Array.from({ length: 8 }, (_, i) => {
              const waveNum = i + 1;
              const status = selectedJob.wave_status?.[waveNum] || 'queued';
              const timestamp = selectedJob.wave_timestamps?.[waveNum];
              const artifacts = selectedJob.wave_artifacts?.[waveNum];
              
              return (
                <div
                  key={waveNum}
                  className={`p-3 rounded-lg border ${getWaveStatusColor(status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getWaveStatusIcon(status)}
                      <div>
                        <span className="font-medium text-sm">
                          Wave {waveNum}: {WAVE_NAMES[waveNum as keyof typeof WAVE_NAMES]}
                        </span>
                        <p className="text-xs text-gray-600 capitalize">{status}</p>
                      </div>
                    </div>
                    {timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Wave artifacts/results */}
                  {artifacts && (
                    <div className="mt-2 text-xs text-gray-600">
                      {artifacts.wordCount && <span>Words: {artifacts.wordCount} | </span>}
                      {artifacts.citationsAdded && <span>Citations: {artifacts.citationsAdded} | </span>}
                      {artifacts.sourcesUsed && <span>Sources: {artifacts.sourcesUsed.length}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wave Logs */}
      {selectedJob && waveLogs.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Wave Logs</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {waveLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded text-xs ${
                  log.log_level === 'error' ? 'bg-red-50 text-red-700' :
                  log.log_level === 'warn' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-medium">Wave {log.wave_number}: {log.wave_name}</span>
                  <span className="text-gray-500">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1">{log.message}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-gray-500">Metadata</summary>
                    <pre className="mt-1 bg-gray-100 p-1 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Thought Process */}
      {selectedJob && selectedJob.job_status === 'in_progress' && (
        <div className="border-t border-gray-200">
          <AIThoughtProcess 
            jobId={selectedJob.id}
            className="rounded-none border-0"
          />
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && !isLoading && (
        <div className="p-8 text-center text-gray-500">
          <Waves className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="mb-3">No 8-wave generation jobs found for this case</p>
          <button
            onClick={startEightWaveGeneration}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Start First 8-Wave Generation
          </button>
        </div>
      )}
    </div>
  );
}
