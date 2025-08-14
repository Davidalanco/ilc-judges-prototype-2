'use client';

import { useState, useCallback } from 'react';
import { Upload, FileAudio, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { debugLog } from '@/app/components/DebugLogPanel';
// Supabase upload handled via server-side API to avoid client-side environment variable issues

interface FileUploadProps {
  onUploadComplete?: (fileData: {
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
  }) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  className?: string;
  caseId?: string; // Add caseId prop for organizing files
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  fileSize?: number;
  duration?: string;
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  acceptedTypes = '.mp3,.wav,.m4a,.mp4,.mov,.webm',
  maxSizeMB = 50,
  className = '',
  caseId
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type
    const allowedTypes = acceptedTypes.split(',').map(t => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return `File type not supported. Allowed: ${acceptedTypes}`;
    }

    return null;
  };

  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        URL.revokeObjectURL(url);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('Unknown');
      };
      
      audio.src = url;
    });
  };

  const uploadFileToSupabase = async (file: File) => {
    debugLog.info('File Upload', `Starting upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    try {
      setUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'uploading',
        fileSize: file.size
      });

      // Create form data for server-side upload
      const formData = new FormData();
      formData.append('file', file);
      if (caseId) {
        formData.append('caseId', caseId);
        debugLog.info('File Upload', `Upload associated with case ID: ${caseId}`);
      }

      // Send directly to transcription API with animated progress
      let progressValue = 30;
      setUploadProgress(prev => prev ? {
        ...prev,
        progress: progressValue,
        status: 'processing'
      } : null);

      // Animate progress during transcription
      const progressInterval = setInterval(() => {
        progressValue = Math.min(progressValue + Math.random() * 10, 85);
        setUploadProgress(prev => prev ? {
          ...prev,
          progress: progressValue,
          status: 'processing'
        } : null);
      }, 1000);

      let response;
      try {
        debugLog.api('File Upload', 'POST /api/transcribe-direct', { 
          fileName: file.name, 
          fileSize: file.size, 
          caseId: caseId || 'none' 
        });
        response = await fetch('/api/transcribe-direct', {
          method: 'POST',
          body: formData
        });
      } finally {
        // Always clear the progress animation
        clearInterval(progressInterval);
      }

      if (!response.ok) {
        let errorMessage = 'Transcription failed';
        try {
          const result = await response.json();
          errorMessage = result.error || errorMessage;
          debugLog.error('File Upload', `Upload failed: ${errorMessage}`, result);
          
          // Handle specific error types
          if (response.status === 429) {
            errorMessage = 'ElevenLabs API is currently busy. Please try again in a few minutes.';
          }
        } catch (jsonError) {
          // If we can't parse the JSON, use the status text
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      debugLog.success('File Upload', 'Upload completed successfully!', result);
      
      // Debug the API response structure
      console.log('🔍 Full API Response:', result);
      console.log('🔍 Result.data:', result.data);
      console.log('🔍 Result.data.conversationId:', result.data?.conversationId);
      console.log('🔍 Result.data.caseId:', result.data?.caseId);

      setUploadProgress(prev => prev ? {
        ...prev,
        progress: 95,
        status: 'processing'
      } : null);

      // Extract transcription data from API response
      const { data: transcriptionData } = result;

      setUploadProgress(prev => prev ? {
        ...prev,
        progress: 100,
        status: 'complete',
        duration: `${transcriptionData.duration}s`
      } : null);

      // Call success callback with transcription data
      if (onUploadComplete) {
        onUploadComplete({
          fileName: transcriptionData.fileName,
          fileUrl: transcriptionData.fileUrl, // Use actual S3 URL for audio playback
          fileSize: transcriptionData.fileSize,
          duration: `${transcriptionData.duration}s`,
          transcription: transcriptionData.transcription,
          language: transcriptionData.language,
          speakers: transcriptionData.speakers || [],
          speakerCount: transcriptionData.speakerCount || 0,
          s3Key: transcriptionData.s3Key,
          conversationId: transcriptionData.conversationId,
          caseId: transcriptionData.caseId // Pass the caseId for workflow persistence
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      debugLog.error('File Upload', 'Upload failed with error', {
        error: errorMessage,
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhanced error logging for development
      if (process.env.NODE_ENV === 'development') {
        console.group('❌ FileUpload Error');
        console.error('Error details:', error);
        console.log('File name:', file.name);
        console.log('File size:', `${(file.size / 1024 / 1024).toFixed(2)}MB`);
        console.log('Error message:', errorMessage);
        console.groupEnd();
      }
      
      setUploadProgress(prev => prev ? {
        ...prev,
        status: 'error',
        error: errorMessage
      } : null);

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  const handleFileSelection = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      if (onUploadError) {
        onUploadError(validationError);
      }
      return;
    }

    await uploadFileToSupabase(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const resetUpload = () => {
    setUploadProgress(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!uploadProgress && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <input
            id="file-upload-input"
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop your file here, or{' '}
            <span className="text-blue-600 hover:text-blue-700">browse</span>
          </p>
          <p className="text-sm text-gray-500">
            Supports: {acceptedTypes} (max {maxSizeMB}MB)
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {uploadProgress.status === 'uploading' || uploadProgress.status === 'processing' ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : uploadProgress.status === 'complete' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {uploadProgress.fileName}
                </p>
                <span className="text-sm text-gray-500">
                  {uploadProgress.fileSize && (
                    `${(uploadProgress.fileSize / (1024 * 1024)).toFixed(1)}MB`
                  )}
                </span>
              </div>
              
              {uploadProgress.status !== 'error' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      uploadProgress.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {uploadProgress.status === 'uploading' && 'Uploading file...'}
                  {uploadProgress.status === 'processing' && uploadProgress.progress < 50 && 'Analyzing audio format...'}
                  {uploadProgress.status === 'processing' && uploadProgress.progress >= 50 && 'Transcribing with ElevenLabs Scribe...'}
                  {uploadProgress.status === 'complete' && (
                    <>
                      Transcription complete {uploadProgress.duration && `• Duration: ${uploadProgress.duration}`}
                    </>
                  )}
                  {uploadProgress.status === 'error' && `Error: ${uploadProgress.error}`}
                </p>
                
                {uploadProgress.status === 'complete' && (
                  <button
                    onClick={resetUpload}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Upload Another
                  </button>
                )}
                
                {uploadProgress.status === 'error' && (
                  <button
                    onClick={resetUpload}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 