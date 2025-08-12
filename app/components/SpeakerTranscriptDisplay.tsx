'use client';

import React, { useState } from 'react';
import { Clock, Users, Copy, Play, Volume2 } from 'lucide-react';

interface Segment {
  index?: number;
  start: number;
  end: number;
  speaker: string;
  text: string;
  confidence?: number;
}

interface Speaker {
  id: string | number;
  name: string;
  segments?: number;
  confidence?: number;
}

interface SpeakerTranscriptDisplayProps {
  segments?: Segment[];
  speakers?: Speaker[];
  transcription?: string; // Fallback for plain text
  className?: string;
  showTimestamps?: boolean;
  showSpeakerStats?: boolean;
  maxHeight?: string;
}

// Speaker color mapping for consistency
const SPEAKER_COLORS = [
  'bg-blue-100 text-blue-900 border-blue-200',
  'bg-green-100 text-green-900 border-green-200', 
  'bg-purple-100 text-purple-900 border-purple-200',
  'bg-orange-100 text-orange-900 border-orange-200',
  'bg-pink-100 text-pink-900 border-pink-200',
  'bg-indigo-100 text-indigo-900 border-indigo-200',
  'bg-teal-100 text-teal-900 border-teal-200',
  'bg-yellow-100 text-yellow-900 border-yellow-200'
];

export default function SpeakerTranscriptDisplay({
  segments = [],
  speakers = [],
  transcription = '',
  className = '',
  showTimestamps = true,
  showSpeakerStats = true,
  maxHeight = 'max-h-96'
}: SpeakerTranscriptDisplayProps) {
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get consistent color for speaker
  const getSpeakerColor = (speakerName: string): string => {
    const speakerIndex = speakers.findIndex(s => s.name === speakerName);
    if (speakerIndex >= 0 && speakerIndex < SPEAKER_COLORS.length) {
      return SPEAKER_COLORS[speakerIndex];
    }
    // Fallback to a hash-based color selection
    const hash = speakerName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
  };

  // Copy transcript to clipboard
  const copyToClipboard = () => {
    let textToCopy = '';
    
    if (segments.length > 0) {
      // Create formatted transcript with speakers
      textToCopy = segments.map(segment => {
        const timestamp = showTimestamps ? `[${formatTime(segment.start)}] ` : '';
        return `${timestamp}${segment.speaker}: ${segment.text}`;
      }).join('\n\n');
    } else {
      textToCopy = transcription;
    }

    navigator.clipboard.writeText(textToCopy);
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.textContent = 'Transcript copied to clipboard!';
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  // Filter segments by selected speaker
  const filteredSegments = selectedSpeaker 
    ? segments.filter(segment => segment.speaker === selectedSpeaker)
    : segments;

  // Get full transcript text
  const getFullTranscript = (): string => {
    if (segments.length > 0) {
      return segments.map(segment => segment.text).join(' ');
    }
    return transcription;
  };

  const hasSegments = segments.length > 0;
  const totalCharacters = getFullTranscript().length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h5 className="font-semibold text-gray-900 flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Transcript
            {hasSegments && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({segments.length} segments)
              </span>
            )}
          </h5>
          
          {hasSegments && speakers.length > 1 && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">{speakers.length} speakers</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {totalCharacters.toLocaleString()} characters
          </span>
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="Copy transcript"
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Speaker filter buttons */}
      {hasSegments && speakers.length > 1 && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpeaker(null)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedSpeaker === null
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              All Speakers
            </button>
            {speakers.map((speaker) => (
              <button
                key={speaker.name}
                onClick={() => setSelectedSpeaker(speaker.name)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedSpeaker === speaker.name
                    ? getSpeakerColor(speaker.name)
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {speaker.name}
                {speaker.segments && (
                  <span className="ml-1 opacity-75">({speaker.segments})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript content */}
      <div className={`${maxHeight} overflow-y-auto`}>
        {hasSegments ? (
          <div className="p-4 space-y-4">
            {filteredSegments.map((segment, index) => (
              <div key={index} className="flex space-x-3">
                {/* Speaker label */}
                <div className="flex-shrink-0">
                  <div className={`px-2 py-1 text-xs font-medium rounded border ${getSpeakerColor(segment.speaker)}`}>
                    {segment.speaker}
                  </div>
                  {showTimestamps && (
                    <div className="text-xs text-gray-400 mt-1 text-center">
                      {formatTime(segment.start)}
                    </div>
                  )}
                </div>
                
                {/* Segment text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {segment.text}
                  </p>
                  {segment.confidence && segment.confidence < 0.9 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Low confidence ({Math.round(segment.confidence * 100)}%)
                    </p>
                  )}
                </div>
              </div>
            ))}

            {filteredSegments.length === 0 && selectedSpeaker && (
              <div className="text-center py-8 text-gray-500">
                <p>No segments found for {selectedSpeaker}</p>
              </div>
            )}
          </div>
        ) : (
          // Fallback to plain text display
          <div className="p-4">
            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 font-mono leading-relaxed">
              {transcription || 'No transcript available'}
            </div>
          </div>
        )}
      </div>

      {/* Speaker statistics */}
      {showSpeakerStats && hasSegments && speakers.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h6 className="text-sm font-medium text-gray-900 mb-2">Speaker Statistics</h6>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {speakers.map((speaker) => {
              const speakerSegments = segments.filter(s => s.speaker === speaker.name);
              const speakerWordCount = speakerSegments.reduce((count, seg) => count + seg.text.split(' ').length, 0);
              const speakerDuration = speakerSegments.reduce((total, seg) => total + (seg.end - seg.start), 0);
              
              return (
                <div key={speaker.name} className={`p-2 rounded border ${getSpeakerColor(speaker.name)}`}>
                  <div className="text-xs font-medium">{speaker.name}</div>
                  <div className="text-xs opacity-75 mt-1 space-y-1">
                    <div>{speakerSegments.length} segments</div>
                    <div>{speakerWordCount} words</div>
                    <div>{formatTime(speakerDuration)} speaking</div>
                    {speaker.confidence && (
                      <div>{Math.round(speaker.confidence * 100)}% confidence</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
