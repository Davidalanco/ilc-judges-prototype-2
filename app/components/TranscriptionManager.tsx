'use client';

import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Play, FileText, Clock, Users, Download } from 'lucide-react';

interface Transcription {
  id: string;
  case_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  duration_seconds: number;
  transcript: string;
  speaker_count: number;
  speakers: any[];
  analysis: any;
  transcript_quality: number;
  conversation_type: string;
  processing_status: string;
  created_at: string;
  updated_at: string;
  cases?: {
    id: string;
    case_name: string;
    case_type: string;
    court_level: string;
    status: string;
  };
}

interface TranscriptionManagerProps {
  onSelectTranscription?: (transcription: Transcription) => void;
}

export default function TranscriptionManager({ onSelectTranscription }: TranscriptionManagerProps) {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');

  useEffect(() => {
    fetchTranscriptions();
  }, [searchTerm]);

  const fetchTranscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/transcriptions?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setTranscriptions(result.data);
      } else {
        setError('Failed to fetch transcriptions');
      }
    } catch (err) {
      setError('Error loading transcriptions');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTranscriptions(prev => prev.filter(t => t.id !== id));
        if (selectedTranscription?.id === id) {
          setSelectedTranscription(null);
        }
      } else {
        setError('Failed to delete transcription');
      }
    } catch (err) {
      setError('Error deleting transcription');
      console.error('Delete error:', err);
    }
  };

  const handleEdit = (transcription: Transcription) => {
    setSelectedTranscription(transcription);
    setEditedTranscript(transcription.transcript);
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTranscription) return;

    try {
      const response = await fetch(`/api/transcriptions/${selectedTranscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: editedTranscript
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setTranscriptions(prev => 
          prev.map(t => 
            t.id === selectedTranscription.id 
              ? { ...t, transcript: editedTranscript }
              : t
          )
        );
        setSelectedTranscription({ ...selectedTranscription, transcript: editedTranscript });
        setIsEditMode(false);
      } else {
        setError('Failed to update transcription');
      }
    } catch (err) {
      setError('Error updating transcription');
      console.error('Update error:', err);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3">Loading transcriptions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Saved Transcriptions</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcriptions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Transcriptions ({transcriptions.length})</h3>
          
          {transcriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto w-12 h-12 mb-4" />
              <p>No transcriptions found</p>
              <p className="text-sm">Upload an audio file to create your first transcription</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcriptions.map((transcription) => (
                <div
                  key={transcription.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTranscription?.id === transcription.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTranscription(transcription)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm truncate">
                      {transcription.file_name}
                    </h4>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(transcription);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(transcription.id, transcription.file_name);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {transcription.cases && (
                    <p className="text-xs text-gray-600 mb-2">
                      Case: {transcription.cases.case_name}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(transcription.duration_seconds)}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {transcription.speaker_count} speakers
                    </div>
                    <div>
                      {formatFileSize(transcription.file_size)}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    {formatDate(transcription.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transcription Detail View */}
        <div className="space-y-4">
          {selectedTranscription ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Transcription Details</h3>
                {!isEditMode && (
                  <button
                    onClick={() => handleEdit(selectedTranscription)}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">File:</span>
                    <p className="text-gray-600">{selectedTranscription.file_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-gray-600">{formatDuration(selectedTranscription.duration_seconds)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Speakers:</span>
                    <p className="text-gray-600">{selectedTranscription.speaker_count}</p>
                  </div>
                  <div>
                    <span className="font-medium">Quality:</span>
                    <p className="text-gray-600">{selectedTranscription.transcript_quality}%</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Transcript:</span>
                    {isEditMode && (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditMode(false);
                            setEditedTranscript(selectedTranscription.transcript);
                          }}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isEditMode ? (
                    <textarea
                      value={editedTranscript}
                      onChange={(e) => setEditedTranscript(e.target.value)}
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter transcript text..."
                    />
                  ) : (
                    <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="whitespace-pre-wrap">{selectedTranscription.transcript}</p>
                    </div>
                  )}
                </div>

                {selectedTranscription.speakers && selectedTranscription.speakers.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <span className="font-medium">Speakers:</span>
                    <div className="mt-2 space-y-2">
                      {selectedTranscription.speakers.map((speaker, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{speaker.name || `Speaker ${index + 1}`}</span>
                          <span className="text-gray-500">
                            Confidence: {(speaker.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto w-12 h-12 mb-4" />
              <p>Select a transcription to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 