import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/provider';
import { useToast } from '@/hooks/use-toast';

export const useProviders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        // Return demo providers for non-authenticated users
        const demoProviders: ServiceProvider[] = [
          {
            id: 'demo-provider-1',
            user_id: 'demo-user',
            name: 'Dr. Sarah Johnson',
            specialization: 'General Medicine',
            email: 'sarah@healthclinic.com',
            phone: '+1 (555) 123-4567',
            is_active: true,
            working_hours: {
              monday: { start: '09:00', end: '17:00' },
              tuesday: { start: '09:00', end: '17:00' },
              wednesday: { start: '09:00', end: '17:00' },
              thursday: { start: '09:00', end: '17:00' },
              friday: { start: '09:00', end: '15:00' },
              saturday: null,
              sunday: null,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-provider-2',
            user_id: 'demo-user',
            name: 'Dr. Michael Chen',
            specialization: 'Cardiology',
            email: 'michael@healthclinic.com',
            phone: '+1 (555) 234-5678',
            is_active: true,
            working_hours: {
              monday: { start: '08:00', end: '16:00' },
              tuesday: { start: '08:00', end: '16:00' },
              wednesday: { start: '08:00', end: '16:00' },
              thursday: { start: '08:00', end: '16:00' },
              friday: { start: '08:00', end: '14:00' },
              saturday: { start: '09:00', end: '13:00' },
              sunday: null,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-provider-3',
            user_id: 'demo-user',
            name: 'Dr. Emily Rodriguez',
            specialization: 'Pediatrics',
            email: 'emily@healthclinic.com',
            phone: '+1 (555) 345-6789',
            is_active: true,
            working_hours: {
              monday: { start: '10:00', end: '18:00' },
              tuesday: { start: '10:00', end: '18:00' },
              wednesday: { start: '10:00', end: '18:00' },
              thursday: { start: '10:00', end: '18:00' },
              friday: { start: '10:00', end: '16:00' },
              saturday: null,
              sunday: null,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        return demoProviders;
      }

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as ServiceProvider[];
    },
  });

  const createProvider = useMutation({
    mutationFn: async (provider: Omit<ServiceProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('service_providers')
        .insert({
          ...provider,
          user_id: user.user.id,
          working_hours: provider.working_hours as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast({
        title: 'Provider added',
        description: 'New service provider has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding provider',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProvider = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceProvider> }) => {
      const { data, error } = await supabase
        .from('service_providers')
        .update({
          ...updates,
          working_hours: updates.working_hours ? (updates.working_hours as any) : undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast({
        title: 'Provider updated',
        description: 'Provider information has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating provider',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteProvider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast({
        title: 'Provider removed',
        description: 'Service provider has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error removing provider',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    providers,
    isLoading,
    createProvider,
    updateProvider,
    deleteProvider,
  };
};