import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ElevenLabsVoice {
  id: string;
  name: string;
  gender: string;
  description: string;
}

export interface ElevenLabsLanguage {
  name: string;
  code: string;
}

export const useElevenLabsLibrary = () => {
  const [voices, setVoices] = useState<Record<string, ElevenLabsVoice>>({});
  const [languages, setLanguages] = useState<Record<string, ElevenLabsLanguage>>({});
  const [loading, setLoading] = useState(true);

  const fetchVoicesAndLanguages = async () => {
    try {
      setLoading(true);

      // Fetch voices
      const voicesResponse = await supabase.functions.invoke('elevenlabs-library', {
        body: {},
        method: 'GET'
      });

      if (voicesResponse.data?.voices) {
        setVoices(voicesResponse.data.voices);
      }

      // Fetch languages
      const languagesResponse = await supabase.functions.invoke('elevenlabs-library', {
        body: {},
        method: 'GET'
      });

      if (languagesResponse.data?.languages) {
        setLanguages(languagesResponse.data.languages);
      }

    } catch (error) {
      console.error('Error fetching ElevenLabs library:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (voiceId: string, text?: string): Promise<string | null> => {
    try {
      const response = await supabase.functions.invoke('elevenlabs-library', {
        body: { voiceId, text },
        method: 'POST'
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data?.audioContent || null;
    } catch (error) {
      console.error('Error testing voice:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchVoicesAndLanguages();
  }, []);

  return {
    voices,
    languages,
    loading,
    testVoice,
    refetch: fetchVoicesAndLanguages
  };
};