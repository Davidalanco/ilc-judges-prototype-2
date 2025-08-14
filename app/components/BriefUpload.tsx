'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface BriefUploadProps {
  onBriefUploaded: (briefData: {
    id: string;
    fileName: string;
    content: string;
    structure: BriefSection[];
    metadata: BriefMetadata;
  }) => void;
  caseId?: string;
}

interface BriefSection {
  id: string;
  title: string;
  content: string;
  type: 'statement_of_interest' | 'question_presented' | 'summary_of_argument' | 'argument' | 'conclusion' | 'other';
  order: number;
}

interface BriefMetadata {
  wordCount: number;
  briefType: 'amicus' | 'petitioner' | 'respondent';
  court: string;
  caseTitle: string;
  author: string;
  uploadedAt: string;
}

export default function BriefUpload({ onBriefUploaded, caseId }: BriefUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate upload progress
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'example_brief');
      formData.append('customTitle', `Example Brief - ${file.name}`);
      formData.append('description', 'Reference brief for amicus brief structure and formatting');
      if (caseId) formData.append('caseId', caseId);

      console.log('📤 Uploading brief file:', file.name);

      // Upload file to storage
      const uploadResponse = await fetch('/api/legal/upload-document', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include session cookies for authentication
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ File uploaded successfully:', uploadData.document?.id);
      
      setUploadProgress(95);

      // Extract text content and structure from the brief
      console.log('🔍 Analyzing brief structure...');
      const analysisResponse = await fetch('/api/ai/analyze-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify({
          documentId: uploadData.document.id,
          fileName: file.name,
          caseId: caseId || null
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errorData.error || 'Failed to analyze brief structure');
      }

      const analysisData = await analysisResponse.json();
      console.log('✅ Brief analysis completed:', analysisData.sections?.length || 0, 'sections found');
      
      setUploadProgress(100);

      // Structure the analyzed brief data
      const briefData = {
        id: uploadData.document.id,
        fileName: file.name,
        content: analysisData.fullText || '',
        structure: analysisData.sections || [],
        metadata: {
          wordCount: analysisData.wordCount || 0,
          briefType: analysisData.briefType || 'amicus',
          court: analysisData.court || 'Unknown Court',
          caseTitle: analysisData.caseTitle || 'Unknown Case',
          author: analysisData.author || 'Unknown Author',
          uploadedAt: new Date().toISOString()
        }
      };

      // Save the analyzed structure to the database for persistence
      if (caseId) {
        try {
          console.log('💾 Saving analyzed brief structure to database...');
          const saveStructureResponse = await fetch(`/api/cases/${caseId}/brief-references`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              documentId: uploadData.document.id,
              analyzedStructure: {
                sections: analysisData.sections || [],
                fullText: analysisData.fullText || ''
              },
              metadata: briefData.metadata
            }),
          });

          if (saveStructureResponse.ok) {
            console.log('✅ Saved analyzed brief structure to database');
          } else {
            console.warn('⚠️ Failed to save brief structure to database');
          }
        } catch (saveError) {
          console.error('❌ Error saving brief structure:', saveError);
          // Don't fail the whole upload if structure save fails
        }
      }

      // Notify parent component
      onBriefUploaded(briefData);

      console.log('✅ Brief uploaded and analyzed successfully:', briefData.fileName);

    } catch (error) {
      console.error('Brief upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload brief');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Upload Example Brief</h3>
        <p className="text-blue-700 text-sm">
          Upload an example amicus brief to use as a reference for structure, formatting, and style. 
          The AI will analyze the brief and use it as a template for generating your new brief.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : isUploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">Processing Brief...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {uploadProgress < 30 ? 'Uploading file...' :
                 uploadProgress < 70 ? 'Extracting text content...' :
                 uploadProgress < 95 ? 'Analyzing brief structure...' :
                 'Finalizing analysis...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FileText className="w-16 h-16 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your example brief here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOCX, and TXT files (max 50MB)
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✅ Full text extraction now available for all supported formats
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900">Upload Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>What happens next:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>AI extracts full text content from PDF, DOCX, or TXT files</li>
          <li>Analyzes brief structure and identifies section types</li>
          <li>Studies writing style, tone, and formatting patterns</li>
          <li>Creates a template matching your reference brief's approach</li>
          <li>Preserves citation style and legal writing conventions</li>
        </ul>
      </div>
    </div>
  );
}
