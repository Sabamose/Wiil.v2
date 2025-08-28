import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CreateAssistantData {
  name: string;
  type: string;
  industry: string;
  use_case: string;
  assistant_type: 'inbound' | 'outbound' | 'website' | 'email';
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
  status: 'draft' | 'active' | 'testing' | 'live';
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
            status: 'live',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 123-4567'
          },
          {
            id: 'demo-2',
            user_id: 'demo-user',
            name: 'Sales Support Bot',
            type: 'Voice',
            industry: 'sales',
            use_case: 'lead-qualification',
            assistant_type: 'outbound',
            voice_id: 'echo',
            voice_name: 'Echo (Male)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are a sales assistant focused on qualifying leads and booking demos.',
            initial_message: 'Hello! I\'m calling to share some exciting opportunities that might interest you.',
            temperature: 0.8,
            max_tokens: 350,
            status: 'live',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 234-5678'
          },
          {
            id: 'demo-3',
            user_id: 'demo-user',
            name: 'Customer Service AI',
            type: 'Email',
            industry: 'customer-service',
            use_case: 'support',
            assistant_type: 'email',
            voice_id: 'nova',
            voice_name: 'Nova (Female)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are a customer service representative helping with inquiries and support.',
            initial_message: 'Thank you for calling! I\'m here to help with any questions or concerns you may have.',
            temperature: 0.6,
            max_tokens: 400,
            status: 'live',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 345-6789'
          },
          {
            id: 'demo-4',
            user_id: 'demo-user',
            name: 'Restaurant Reservations',
            type: 'Voice',
            industry: 'hospitality',
            use_case: 'reservation-booking',
            assistant_type: 'inbound',
            voice_id: 'shimmer',
            voice_name: 'Shimmer (Female)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are a restaurant reservation assistant helping customers book tables.',
            initial_message: 'Welcome to Bella Vista! I\'d be happy to help you make a reservation today.',
            temperature: 0.7,
            max_tokens: 300,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 456-7890'
          },
          {
            id: 'demo-5',
            user_id: 'demo-user',
            name: 'Real Estate Agent',
            type: 'Voice',
            industry: 'real-estate',
            use_case: 'lead-generation',
            assistant_type: 'outbound',
            voice_id: 'onyx',
            voice_name: 'Onyx (Male)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are a real estate assistant helping connect with potential buyers and sellers.',
            initial_message: 'Hi! I\'m reaching out about some great property opportunities in your area.',
            temperature: 0.8,
            max_tokens: 350,
            status: 'live',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 567-8901'
          },
          {
            id: 'demo-6',
            user_id: 'demo-user',
            name: 'IT Helpdesk Assistant',
            type: 'Voice',
            industry: 'technology',
            use_case: 'technical-support',
            assistant_type: 'inbound',
            voice_id: 'alloy',
            voice_name: 'Alloy (Male)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are an IT support assistant helping with technical issues and troubleshooting.',
            initial_message: 'IT Support here! I\'m ready to help you resolve any technical issues you\'re experiencing.',
            temperature: 0.5,
            max_tokens: 400,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 678-9012'
          },
          {
            id: 'demo-7',
            user_id: 'demo-user',
            name: 'Insurance Claims Bot',
            type: 'Voice',
            industry: 'insurance',
            use_case: 'claims-processing',
            assistant_type: 'inbound',
            voice_id: 'aria',
            voice_name: 'Aria (Female)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are an insurance claims assistant helping customers file and track claims.',
            initial_message: 'Hello! I\'m here to assist you with your insurance claim. Let\'s get started.',
            temperature: 0.6,
            max_tokens: 350,
            status: 'live',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 789-0123'
          },
          {
            id: 'demo-8',
            user_id: 'demo-user',
            name: 'E-commerce Support',
            type: 'Voice',
            industry: 'e-commerce',
            use_case: 'order-support',
            assistant_type: 'inbound',
            voice_id: 'nova',
            voice_name: 'Nova (Female)',
            language: 'en',
            language_name: 'English',
            system_prompt: 'You are an e-commerce support assistant helping with orders, returns, and product inquiries.',
            initial_message: 'Thank you for shopping with us! How can I help you with your order today?',
            temperature: 0.7,
            max_tokens: 300,
            status: 'live',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone_number: '+1 (555) 890-1234'
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