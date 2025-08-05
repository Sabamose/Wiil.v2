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

// Fallback data in case network requests fail
const FALLBACK_VOICES = {
  'aria': { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'Female', description: 'Young, energetic, confident' },
  'sarah': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Female', description: 'Professional, clear, trustworthy' },
  'charlotte': { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'Female', description: 'Warm, friendly, approachable' },
  'roger': { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'Male', description: 'Deep, authoritative, confident' },
  'liam': { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'Male', description: 'Professional, clear, reliable' }
};

const FALLBACK_LANGUAGES = {
  'en': { name: 'English', code: 'en' },
  'es': { name: 'Spanish', code: 'es' },
  'fr': { name: 'French', code: 'fr' },
  'de': { name: 'German', code: 'de' }
};

export const useElevenLabsLibrary = () => {
  const [voices, setVoices] = useState<Record<string, ElevenLabsVoice>>(FALLBACK_VOICES);
  const [languages, setLanguages] = useState<Record<string, ElevenLabsLanguage>>(FALLBACK_LANGUAGES);
  const [loading, setLoading] = useState(true);

  const fetchVoicesAndLanguages = async () => {
    try {
      setLoading(true);

      console.log('Starting to fetch voices and languages...');

      // Fetch voices and languages in parallel
      const [voicesResponse, languagesResponse] = await Promise.all([
        fetch(`https://zyaosogliekotdebnzpr.supabase.co/functions/v1/elevenlabs-library?action=voices`),
        fetch(`https://zyaosogliekotdebnzpr.supabase.co/functions/v1/elevenlabs-library?action=languages`)
      ]);

      console.log('Voices response status:', voicesResponse.status);
      console.log('Languages response status:', languagesResponse.status);

      if (voicesResponse.ok) {
        const voicesData = await voicesResponse.json();
        console.log('Voices loaded:', Object.keys(voicesData.voices || {}).length);
        if (voicesData.voices && Object.keys(voicesData.voices).length > 0) {
          setVoices(voicesData.voices);
        } else {
          console.log('Using fallback voices');
        }
      } else {
        console.error('Failed to fetch voices:', await voicesResponse.text());
        console.log('Using fallback voices');
      }

      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        console.log('Languages loaded:', Object.keys(languagesData.languages || {}).length);
        if (languagesData.languages && Object.keys(languagesData.languages).length > 0) {
          setLanguages(languagesData.languages);
        } else {
          console.log('Using fallback languages');
        }
      } else {
        console.error('Failed to fetch languages:', await languagesResponse.text());
        console.log('Using fallback languages');
      }

    } catch (error) {
      console.error('Error fetching ElevenLabs library:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (voiceId: string, text?: string, language: string = 'en'): Promise<string | null> => {
    try {
      console.log(`Testing voice ${voiceId} in ${language} with text:`, text);
      
      const response = await fetch(`https://zyaosogliekotdebnzpr.supabase.co/functions/v1/elevenlabs-library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceId, text, language })
      });

      console.log('Test voice response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test voice error response:', errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Test voice response data keys:', Object.keys(data));
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