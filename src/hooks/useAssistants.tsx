import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface StoredAssistant {
  id: string;
  user_id: string;
  name: string;
  type: 'Voice' | 'Chat' | 'Unified';
  industry: string;
  use_case: string;
  assistant_type?: 'inbound' | 'outbound';
  phone_number?: string;
  voice_id: string;
  voice_name: string;
  language: string;
  language_name: string;
  system_prompt: string;
  initial_message: string;
  temperature: number;
  max_tokens: number;
  status: 'draft' | 'testing' | 'live' | 'error';
  created_at: string;
  updated_at: string;
}

export interface CreateAssistantData {
  name: string;
  type: 'Voice' | 'Chat' | 'Unified';
  industry: string;
  use_case: string;
  assistant_type?: 'inbound' | 'outbound';
  phone_number?: string;
  voice_id: string;
  voice_name: string;
  language: string;
  language_name: string;
  system_prompt?: string;
  initial_message?: string;
  temperature?: number;
  max_tokens?: number;
}

export const useAssistants = () => {
  const [assistants, setAssistants] = useState<StoredAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAssistants = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAssistants((data || []) as StoredAssistant[]);
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
    if (!user) return null;

    try {
      const { data: newAssistant, error } = await supabase
        .from('assistants')
        .insert([{
          user_id: user.id,
          ...data,
          system_prompt: data.system_prompt || 'You are a helpful AI assistant. Keep responses concise and engaging for voice interaction.',
          initial_message: data.initial_message || 'Hello! How can I help you today?',
          temperature: data.temperature || 0.7,
          max_tokens: data.max_tokens || 300,
        }])
        .select()
        .single();

      if (error) throw error;

      const typedAssistant = newAssistant as StoredAssistant;
      setAssistants(prev => [typedAssistant, ...prev]);
      
      toast({
        title: "Success",
        description: "Assistant created successfully",
      });

      return typedAssistant;
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

  const updateAssistant = async (id: string, updates: Partial<CreateAssistantData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assistants')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAssistants(prev => prev.map(assistant => 
        assistant.id === id ? { ...assistant, ...updates } : assistant
      ));

      toast({
        title: "Success",
        description: "Assistant updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast({
        title: "Error",
        description: "Failed to update assistant",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAssistant = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assistants')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

  const updateAssistantStatus = async (id: string, status: StoredAssistant['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assistants')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setAssistants(prev => prev.map(assistant => 
        assistant.id === id ? { ...assistant, status } : assistant
      ));

      return true;
    } catch (error) {
      console.error('Error updating assistant status:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, [user]);

  return {
    assistants,
    loading,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    updateAssistantStatus,
    refetchAssistants: fetchAssistants
  };
};