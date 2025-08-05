import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top ElevenLabs voices with natural sound
const VOICES = {
  'aria': '9BWtsMINqrJLrRacOk9x',
  'sarah': 'EXAVITQu4vr4xnSDxMaL',
  'charlotte': 'XB0fDUnXU5powFXDhCwa',
  'alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'lily': 'pFZP5JQG7iQjIQuC4Bku',
  'roger': 'CwhRBWXzGAHq8TQ4Fs17',
  'callum': 'N2lVS1w4EtoT3dr4eOWO',
  'liam': 'TX3LPaxmHKxFdv7VOQHJ'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'aria' } = await req.json();
    
    if (!text) {
      throw new Error('No text provided');
    }

    console.log(`Converting text to speech with voice: ${voice}`);

    const voiceId = VOICES[voice] || VOICES['aria'];

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
      console.error('ElevenLabs TTS error:', errorText);
      throw new Error(`ElevenLabs TTS error: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('TTS conversion successful');

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: voice 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});