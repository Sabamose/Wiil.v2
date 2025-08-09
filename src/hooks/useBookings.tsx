import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';

export const useBookings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      // For demo mode, return sample booking data
      if (!user.user) {
        const now = new Date();
        const demoBookings: Booking[] = [
          {
            id: 'demo-booking-1',
            user_id: 'demo-user',
            assistant_id: 'demo-1',
            title: 'Healthcare Consultation',
            customer_name: 'John Smith',
            customer_email: 'john@example.com',
            customer_phone: '+1 (555) 123-4567',
            start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            end_time: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
            status: 'confirmed',
            source: 'website',
            notes: 'Initial consultation for new patient',
            timezone: 'UTC',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
          {
            id: 'demo-booking-2',
            user_id: 'demo-user',
            assistant_id: 'demo-1',
            title: 'Follow-up Appointment',
            customer_name: 'Sarah Johnson',
            customer_email: 'sarah@example.com',
            customer_phone: '+1 (555) 987-6543',
            start_time: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
            end_time: new Date(now.getTime() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Day after tomorrow + 30 min
            status: 'confirmed',
            source: 'phone',
            notes: 'Follow-up after initial treatment',
            timezone: 'UTC',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
          {
            id: 'demo-booking-3',
            user_id: 'demo-user',
            assistant_id: 'demo-1',
            title: 'Routine Checkup',
            customer_name: 'Michael Davis',
            customer_email: 'michael@example.com',
            customer_phone: '+1 (555) 456-7890',
            start_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
            end_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // Next week + 45 min
            status: 'pending',
            source: 'website',
            notes: 'Annual routine checkup',
            timezone: 'UTC',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          }
        ];
        return demoBookings;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
  });

  const createBooking = useMutation({
    mutationFn: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Booking created",
        description: "The booking has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Booking> }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Booking updated",
        description: "The booking has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Booking deleted",
        description: "The booking has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    bookings: bookings || [],
    isLoading,
    createBooking,
    updateBooking,
    deleteBooking,
  };
};