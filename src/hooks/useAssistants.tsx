import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Load assistants from Supabase on mount
  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        // For demo mode, create some sample assistants
        const demoAssistants: StoredAssistant[] = [
          {
            id: 'demo-1',
            user_id: 'demo-user',
            name: 'Healthcare Assistant',
            type: 'Voice',
            industry: 'healthcare',
            use_case: 'appointment-setter',
            assistant_type: 'inbound',
            voice_id: 'aria',
            voice_name: 'Aria (Female)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are a healthcare appointment-setter voice assistant.',
            initial_message: 'Hi! I\'m here to help you schedule appointments. How can I help today?',
            temperature: 0.7,
            max_tokens: 300,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 123-4567'
          }
        ];
        setAssistants(demoAssistants);
        setLoading(false);
        return;
      }

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
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // For demo/preview mode, create a mock assistant without saving to database
      if (!user.user) {
        const mockAssistant: StoredAssistant = {
          ...data,
          id: `demo-${Date.now()}`,
          user_id: 'demo-user',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setAssistants(prev => [mockAssistant, ...prev]);
        
        toast({
          title: "Demo Assistant Created",
          description: "Assistant created for demo purposes (not saved)",
        });
        
        return mockAssistant;
      }

      const assistantData = {
        ...data,
        user_id: user.user.id,
        system_prompt: data.system_prompt || 'You are a helpful AI assistant. Keep responses concise and engaging for voice interaction.',
        initial_message: data.initial_message || 'Hello! How can I help you today?',
        temperature: data.temperature || 0.7,
        max_tokens: data.max_tokens || 300,
        status: 'draft' as const,
      };

      const { data: newAssistant, error } = await supabase
        .from('assistants')
        .insert([assistantData])
        .select()
        .single();

      if (error) throw error;

      setAssistants(prev => [newAssistant as StoredAssistant, ...prev]);
      
      toast({
        title: "Success",
        description: "Assistant created successfully",
      });

      return newAssistant as StoredAssistant;
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

  const updateAssistant = async (id: string, updates: Partial<CreateAssistantData & { phone_number?: string | null }>): Promise<StoredAssistant | null> => {
    try {
      const { data: updatedAssistant, error } = await supabase
        .from('assistants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAssistants(prev => prev.map(assistant => 
        assistant.id === id ? updatedAssistant as StoredAssistant : assistant
      ));
      
      toast({
        title: "Success",
        description: "Assistant updated successfully",
      });

      return updatedAssistant as StoredAssistant;
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

  return {
    assistants,
    loading,
    fetchAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
};