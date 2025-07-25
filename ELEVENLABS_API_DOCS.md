# ElevenLabs Speech to Text API Documentation

## Overview

ElevenLabs Scribe v1 is the world's most accurate speech-to-text model, supporting 99 languages with advanced features like speaker diarization, word-level timestamps, and audio event tagging.

## Key Features

- **State-of-the-art accuracy**: Lowest word error rates across 99 languages
- **Speaker Diarization**: Automatic identification of up to 32 speakers
- **Word-level Timestamps**: Precise timing for each word and audio event
- **Audio Event Tagging**: Detection of non-speech sounds (laughter, applause, etc.)
- **Multi-language Support**: 99 languages with varying accuracy levels
- **File Format Support**: Audio and video files up to 1GB and 4.5 hours

## API Endpoint

```
POST https://api.elevenlabs.io/v1/speech-to-text
```

## Authentication

Include your API key in the request headers:

```
xi-api-key: YOUR_API_KEY
```

## Supported Models

Based on the error message in our logs, only these models are currently available:

- `scribe_v1` - Primary production model
- `scribe_v1_experimental` - Experimental version with potential new features

## Request Parameters

### Required Parameters

- **file**: The audio/video file to transcribe
- **model_id**: Must be either `scribe_v1` or `scribe_v1_experimental`

### Optional Parameters

- **optimize_streaming_latency**: Integer (0-4)
  - 0: Default mode (no optimizations)
  - 1-4: Increasing levels of latency optimization
  
- **speaker_boost**: Boolean - Enhances speaker diarization accuracy

## Response Format

The API returns a JSON object with the following structure:

```json
{
  "language_code": "en",
  "language_probability": 1.0,
  "text": "Full transcribed text...",
  "words": [
    {
      "text": "word",
      "start": 0.119,
      "end": 0.259,
      "type": "word",
      "speaker_id": "speaker_0"
    },
    {
      "text": " ",
      "start": 0.239,
      "end": 0.299,
      "type": "spacing",
      "speaker_id": "speaker_0"
    }
  ]
}
```

### Word Object Types

- **word**: A spoken word in the audio
- **spacing**: Space between words (not applicable for languages without spaces)
- **audio_event**: Non-speech sounds like laughter or applause

### Speaker Identification

Each word object includes a `speaker_id` field for speaker diarization:
- `speaker_0`, `speaker_1`, etc. - Automatically assigned speaker IDs
- Up to 32 speakers can be identified per audio file

## Language Support

### Excellent Accuracy (≤ 5% WER)
Bulgarian, Catalan, Czech, Danish, Dutch, **English**, Finnish, French, Galician, German, Greek, Hindi, Indonesian, Italian, Japanese, Kannada, Malay, Malayalam, Macedonian, Norwegian, Polish, Portuguese, Romanian, Russian, Serbian, Slovak, Spanish, Swedish, Turkish, Ukrainian, Vietnamese

### High Accuracy (>5% to ≤10% WER)
Bengali, Belarusian, Bosnian, Cantonese, Estonian, Filipino, Gujarati, Hungarian, Kazakh, Latvian, Lithuanian, Mandarin, Marathi, Nepali, Odia, Persian, Slovenian, Tamil, Telugu

### Good Accuracy (>10% to ≤25% WER)
Afrikaans, Arabic, Armenian, Assamese, Asturian, Azerbaijani, Burmese, Cebuano, Croatian, Georgian, Hausa, Hebrew, Icelandic, Javanese, Kabuverdianu, Korean, Kyrgyz, Lingala, Maltese, Mongolian, Māori, Occitan, Punjabi, Sindhi, Swahili, Tajik, Thai, Urdu, Uzbek, Welsh

## Supported File Formats

### Audio Formats
- audio/aac, audio/x-aac
- audio/x-aiff, audio/aiff
- audio/ogg, audio/opus
- audio/mpeg, audio/mp3, audio/mpeg3, audio/x-mpeg-3
- audio/wav, audio/x-wav
- audio/webm
- audio/flac, audio/x-flac
- audio/mp4, audio/x-m4a

### Video Formats
- video/mp4
- video/x-msvideo
- video/x-matroska
- video/quicktime
- video/x-ms-wmv
- video/x-flv
- video/webm
- video/mpeg
- video/3gpp

## Pricing

- **Developer API**: $0.40 per hour of transcribed audio
- **Concurrency Limits**: Vary by subscription tier (Free: 10, Creator: 25, Pro: 50, etc.)

## Error Handling

### Common Errors

- **400 Bad Request**: Invalid model_id or parameters
- **401 Unauthorized**: Invalid API key
- **413 Payload Too Large**: File exceeds 1GB limit
- **422 Unprocessable Entity**: Unsupported file format or duration > 4.5 hours

## Implementation Example

```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('model_id', 'scribe_v1');
formData.append('speaker_boost', 'true');
formData.append('optimize_streaming_latency', '0');

const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
  method: 'POST',
  headers: {
    'xi-api-key': 'YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
```

## Speaker Diarization Best Practices

1. **Enable speaker_boost**: Set to `true` for better speaker identification
2. **Audio Quality**: Clear audio with distinct speakers improves accuracy
3. **File Duration**: Longer files generally provide better speaker separation
4. **Multiple Speakers**: Model works best with 2-8 speakers; accuracy may decrease with 20+ speakers

## Limitations

- **File Size**: Maximum 1GB per file
- **Duration**: Maximum 4.5 hours per file
- **Real-time**: Current model optimized for accuracy, not real-time (low-latency version coming soon)
- **Speaker Count**: While it supports up to 32 speakers, accuracy is best with fewer speakers

## Notes

- The API automatically detects language when not specified
- Speaker diarization works automatically when multiple speakers are detected
- Word-level timestamps are always included
- Audio events (laughter, applause) are tagged when detected 