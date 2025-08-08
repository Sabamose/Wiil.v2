import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { StoredAssistant } from './useAssistants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAssistantVoiceConversation = (assistant?: StoredAssistant | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Add initial message when assistant is loaded
  useEffect(() => {
    if (assistant && assistant.initial_message) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: assistant.initial_message,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [assistant]);

  const startRecording = useCallback(async () => {
    if (!assistant) {
      toast({
        title: "No Assistant Selected",
        description: "Please select an assistant to start conversation.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [assistant]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    if (!assistant) return;

    try {
      // Convert audio to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Step 1: Speech-to-Text
      console.log('Converting speech to text...');
      const sttResponse = await supabase.functions.invoke('elevenlabs-stt', {
        body: { audio: base64Audio }
      });

      if (sttResponse.error) {
        throw new Error(sttResponse.error.message);
      }

      const userText = sttResponse.data.text;
      console.log('User said:', userText);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Step 2: Get AI response with assistant configuration
      console.log('Getting AI response for assistant:', assistant.id);
      const currentMessages = messages.slice(-10); // Capture current messages to avoid dependency issues
      const chatResponse = await supabase.functions.invoke('openai-chat', {
        body: { 
          message: userText,
          context: currentMessages, // Use captured messages instead of dependency
          assistantId: assistant.id // Pass assistant ID to use its configuration
        }
      });

      if (chatResponse.error) {
        throw new Error(chatResponse.error.message);
      }

      const aiText = chatResponse.data.response;
      console.log('AI responded:', aiText);

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Step 3: Text-to-Speech with assistant's voice and language
      console.log('Converting AI response to speech with voice:', assistant.voice_id, 'language:', assistant.language);
      const ttsResponse = await supabase.functions.invoke('elevenlabs-tts', {
        body: { 
          text: aiText,
          voice: assistant.voice_id, // Use assistant's configured voice
          language: assistant.language // Use assistant's configured language
        }
      });

      if (ttsResponse.error) {
        throw new Error(ttsResponse.error.message);
      }

// Play audio
const audioContent = ttsResponse.data.audioContent;
const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
setIsSpeaking(true);
audio.onended = () => setIsSpeaking(false);
audio.onerror = () => setIsSpeaking(false);
await audio.play();

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = useCallback(() => {
    setMessages(assistant?.initial_message ? [{
      id: 'welcome',
      role: 'assistant',
      content: assistant.initial_message,
      timestamp: new Date()
    }] : []);
  }, [assistant]);

return {
  isRecording,
  isProcessing,
  isSpeaking,
  messages,
  startRecording,
  stopRecording,
  clearConversation,
  assistant
};
};