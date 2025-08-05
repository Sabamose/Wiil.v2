import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing audio with ElevenLabs STT');

    // Convert base64 to binary
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Prepare form data for ElevenLabs
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('audio', blob, 'audio.webm');
    formData.append('model_id', 'eleven_multilingual_v2');

    // Send to ElevenLabs STT API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT error:', errorText);
      throw new Error(`ElevenLabs STT error: ${errorText}`);
    }

    const result = await response.json();
    console.log('STT result:', result);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in elevenlabs-stt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});