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

      // Fetch voices and languages in parallel
      const [voicesResponse, languagesResponse] = await Promise.all([
        fetch(`https://zyaosogliekotdebnzpr.supabase.co/functions/v1/elevenlabs-library?action=voices`),
        fetch(`https://zyaosogliekotdebnzpr.supabase.co/functions/v1/elevenlabs-library?action=languages`)
      ]);

      if (voicesResponse.ok) {
        const voicesData = await voicesResponse.json();
        setVoices(voicesData.voices || {});
      }

      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        setLanguages(languagesData.languages || {});
      }

    } catch (error) {
      console.error('Error fetching ElevenLabs library:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (voiceId: string, text?: string): Promise<string | null> => {
    try {
      const response = await fetch(`https://zyaosogliekotdebnzpr.supabase.co/functions/v1/elevenlabs-library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceId, text })
      });

      if (!response.ok) {
        throw new Error('Failed to test voice');
      }

      const data = await response.json();
      return data?.audioContent || null;
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