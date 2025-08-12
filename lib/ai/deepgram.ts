import { logApiCall, logInfo, logError } from '@/lib/debug-logger';

function guessContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'm4a': return 'audio/mp4';
    case 'mp4': return 'video/mp4';
    case 'webm': return 'audio/webm';
    case 'ogg': return 'audio/ogg';
    case 'flac': return 'audio/flac';
    case 'aiff': return 'audio/aiff';
    case 'mov': return 'video/quicktime';
    default: return 'application/octet-stream';
  }
}

export async function transcribeWithDeepgram(buffer: Buffer, filename: string) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('Deepgram API key missing. Set DEEPGRAM_API_KEY in environment variables.');
  }

  const contentType = guessContentType(filename);

  logApiCall('Deepgram', 'Starting Deepgram transcription with speaker diarization', {
    filename,
    contentType,
    bufferSize: buffer.length,
    bufferSizeMB: (buffer.length / 1024 / 1024).toFixed(2)
  });

  const url = 'https://api.deepgram.com/v1/listen?diarize=true&punctuate=true&model=general&smart_format=true&utterances=true';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': contentType
      },
      body: buffer
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      logError('Deepgram', 'API request failed', { 
        status: response.status, 
        statusText: response.statusText, 
        errorText 
      });
      throw new Error(`Deepgram API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }

    const data = await response.json();

    logApiCall('Deepgram', 'API response received successfully', {
      status: response.status,
      statusText: response.statusText,
      hasResults: !!data.results,
      hasChannels: !!data.results?.channels,
      hasUtterances: !!data.results?.utterances
    });

    // Parse Deepgram response structure
    const channel = data?.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];
    const utterances = data?.results?.utterances || [];
    const words = alternative?.words || [];
    const duration = data?.metadata?.duration || 0;
    const text = alternative?.transcript || '';

    logInfo('Deepgram', 'Parsing transcription data', {
      textLength: text.length,
      utteranceCount: utterances.length,
      wordCount: words.length,
      duration
    });

    // Build segments and speakers from utterances
    const speakersMap = new Map<number, { name: string; segments: number }>();
    const segments = utterances.map((utterance: any, index: number) => {
      const speakerId = typeof utterance.speaker === 'number' ? utterance.speaker : parseInt(String(utterance.speaker || 0), 10) || 0;
      const speakerName = `Speaker ${speakerId + 1}`;
      
      // Track speaker info
      const existing = speakersMap.get(speakerId);
      speakersMap.set(speakerId, { 
        name: speakerName, 
        segments: (existing?.segments || 0) + 1 
      });

      return {
        index,
        start: utterance.start,
        end: utterance.end,
        speaker: speakerName,
        text: utterance.transcript
      };
    });

    // Convert speakers map to array
    const speakers = Array.from(speakersMap.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      segments: info.segments
    }));

    logInfo('Deepgram', 'Transcription completed successfully', {
      textLength: text.length,
      speakerCount: speakers.length,
      segmentCount: segments.length,
      duration
    });

    return {
      text,
      duration,
      language: 'en', // Deepgram detected language could be added here
      segments,
      speakers,
      speakerCount: speakers.length
    };

  } catch (error) {
    logError('Deepgram', 'Transcription failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filename
    });
    throw error;
  }
}
