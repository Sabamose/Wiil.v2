import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CreateAssistantData {
  name: string;
  type: string;
  industry: string;
  use_case: string;
  assistant_type: 'inbound' | 'outbound';
  voice_id: string;
  voice_name: string;
  language: string;
  language_name: string;
  system_prompt: string;
  initial_message: string;
  temperature: number;
  max_tokens: number;
}

export interface StoredAssistant extends CreateAssistantData {
  id: string;
  user_id: string;
  phone_number?: string;
  status: 'draft' | 'active' | 'testing';
  created_at: string;
  updated_at: string;
}

export const useAssistants = () => {
  const [assistants, setAssistants] = useState<StoredAssistant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load assistants from localStorage on mount
  useEffect(() => {
    const savedAssistants = localStorage.getItem('lovable_assistants');
    if (savedAssistants) {
      try {
        setAssistants(JSON.parse(savedAssistants));
      } catch (error) {
        console.error('Error loading saved assistants:', error);
      }
    }
  }, []);

  // Save assistants to localStorage whenever assistants change
  useEffect(() => {
    localStorage.setItem('lovable_assistants', JSON.stringify(assistants));
  }, [assistants]);

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Assistants are already loaded from localStorage
    } catch (error) {
      console.error('Error fetching assistants:', error);
      toast({
        title: "Error",
        description: "Failed to load assistants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssistant = async (data: CreateAssistantData): Promise<StoredAssistant | null> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAssistant: StoredAssistant = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'demo-user',
        ...data,
        system_prompt: data.system_prompt || 'You are a helpful AI assistant. Keep responses concise and engaging for voice interaction.',
        initial_message: data.initial_message || 'Hello! How can I help you today?',
        temperature: data.temperature || 0.7,
        max_tokens: data.max_tokens || 300,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setAssistants(prev => [newAssistant, ...prev]);
      
      toast({
        title: "Success",
        description: "Assistant created successfully",
      });

      return newAssistant;
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast({
        title: "Error",
        description: "Failed to create assistant",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAssistant = async (id: string, updates: Partial<CreateAssistantData>): Promise<StoredAssistant | null> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAssistants = assistants.map(assistant => 
        assistant.id === id 
          ? { ...assistant, ...updates, updated_at: new Date().toISOString() }
          : assistant
      );
      
      setAssistants(updatedAssistants);
      
      const updatedAssistant = updatedAssistants.find(a => a.id === id);
      
      toast({
        title: "Success",
        description: "Assistant updated successfully",
      });

      return updatedAssistant || null;
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast({
        title: "Error",
        description: "Failed to update assistant",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteAssistant = async (id: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssistants(prev => prev.filter(assistant => assistant.id !== id));
      
      toast({
        title: "Success",
        description: "Assistant deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting assistant:', error);
      toast({
        title: "Error",
        description: "Failed to delete assistant",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    assistants,
    loading,
    fetchAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
};