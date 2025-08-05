import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive ElevenLabs voice library
const VOICES = {
  // Female voices
  'aria': { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'Female', description: 'Young, energetic, confident' },
  'sarah': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Female', description: 'Professional, clear, trustworthy' },
  'charlotte': { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'Female', description: 'Warm, friendly, approachable' },
  'alice': { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'Female', description: 'British accent, sophisticated' },
  'lily': { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'Female', description: 'Soft, gentle, calming' },
  'matilda': { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'Female', description: 'Youthful, bright, cheerful' },
  'jessica': { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'Female', description: 'Mature, authoritative, professional' },
  
  // Male voices
  'roger': { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'Male', description: 'Deep, authoritative, confident' },
  'callum': { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'Male', description: 'Scottish accent, warm, friendly' },
  'liam': { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'Male', description: 'Professional, clear, reliable' },
  'george': { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'Male', description: 'British accent, distinguished' },
  'eric': { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', gender: 'Male', description: 'American accent, approachable' },
  'chris': { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'Male', description: 'Casual, friendly, relatable' },
  'brian': { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'Male', description: 'Calm, steady, trustworthy' },
  'daniel': { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'Male', description: 'Professional, articulate' },
  'bill': { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'Male', description: 'Mature, experienced, wise' },
  'will': { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', gender: 'Male', description: 'Young, energetic, modern' },
  
  // Non-binary/Unique voices
  'river': { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', gender: 'Non-binary', description: 'Neutral, versatile, modern' }
};

// Supported languages
const LANGUAGES = {
  'en': { name: 'English', code: 'en' },
  'es': { name: 'Spanish', code: 'es' },
  'fr': { name: 'French', code: 'fr' },
  'de': { name: 'German', code: 'de' },
  'it': { name: 'Italian', code: 'it' },
  'pt': { name: 'Portuguese', code: 'pt' },
  'pl': { name: 'Polish', code: 'pl' },
  'tr': { name: 'Turkish', code: 'tr' },
  'ru': { name: 'Russian', code: 'ru' },
  'nl': { name: 'Dutch', code: 'nl' },
  'cs': { name: 'Czech', code: 'cs' },
  'ar': { name: 'Arabic', code: 'ar' },
  'zh': { name: 'Chinese', code: 'zh' },
  'ja': { name: 'Japanese', code: 'ja' },
  'hi': { name: 'Hindi', code: 'hi' },
  'ko': { name: 'Korean', code: 'ko' }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'voices' || !action) {
      // Return available voices
      return new Response(JSON.stringify({ voices: VOICES }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'languages') {
      // Return supported languages
      return new Response(JSON.stringify({ languages: LANGUAGES }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'test-voice') {
      // Test a specific voice with sample text
      const { voiceId, text = "Hello! This is a test of my voice. How do I sound?", language = 'en' } = await req.json();
      
      if (!voiceId || !VOICES[voiceId]) {
        throw new Error('Invalid voice ID');
      }

      const voice = VOICES[voiceId];
      console.log(`Testing voice: ${voice.name} (${voice.id})`);

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs voice test error:', errorText);
        throw new Error(`Voice test failed: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      return new Response(JSON.stringify({ 
        audioContent: base64Audio,
        voice: voice
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action parameter');

  } catch (error) {
    console.error('Error in elevenlabs-library function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});