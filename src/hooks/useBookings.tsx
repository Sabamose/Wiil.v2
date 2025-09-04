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
      
      // For demo mode, return comprehensive sample booking data
      if (!user.user) {
        const now = new Date();
        
        const customerData = [
          { name: "Sarah Johnson", phone: "+1 (555) 123-4567", email: "sarah.j@email.com" },
          { name: "Michael Chen", phone: "+1 (555) 234-5678", email: "m.chen@business.com" },
          { name: "Emily Rodriguez", phone: "+1 (555) 345-6789", email: "emily.r@company.co" },
          { name: "David Thompson", phone: "+1 (555) 456-7890", email: "d.thompson@corp.net" },
          { name: "Jessica Williams", phone: "+1 (555) 567-8901", email: "jessica.w@startup.io" },
          { name: "Robert Davis", phone: "+1 (555) 678-9012", email: "robert.d@firm.com" },
          { name: "Amanda Martinez", phone: "+1 (555) 789-0123", email: "a.martinez@tech.org" },
          { name: "Christopher Lee", phone: "+1 (555) 890-1234", email: "chris.lee@agency.net" },
          { name: "Lisa Anderson", phone: "+1 (555) 901-2345", email: "lisa.a@solutions.co" },
          { name: "Kevin Brown", phone: "+1 (555) 012-3456", email: "k.brown@consulting.biz" },
          { name: "Maria Garcia", phone: "+1 (555) 123-0987", email: "maria.garcia@health.com" },
          { name: "James Wilson", phone: "+1 (555) 234-1098", email: "j.wilson@medical.org" }
        ];

        const appointmentTypes = [
          { title: "Initial Consultation", duration: 30, notes: "New patient consultation for health assessment" },
          { title: "Follow-up Appointment", duration: 15, notes: "Follow-up on previous treatment plan" },
          { title: "Health Screening", duration: 45, notes: "Annual health screening and wellness check" },
          { title: "Prescription Review", duration: 20, notes: "Review current medications and adjustments" },
          { title: "Wellness Coaching", duration: 60, notes: "Lifestyle and wellness guidance session" },
          { title: "Discovery Call", duration: 30, notes: "Initial discussion about client needs and requirements" },
          { title: "Product Demo", duration: 45, notes: "Comprehensive product demonstration and Q&A" },
          { title: "Technical Support", duration: 30, notes: "Troubleshooting technical issues and solutions" },
          { title: "Training Session", duration: 60, notes: "Platform training and best practices" },
          { title: "Strategy Meeting", duration: 90, notes: "Comprehensive strategy development session" }
        ];

        const sources = ["phone", "website", "phone", "website", "phone", "website"]; // Match calendar expectations
        const statuses: Array<'confirmed' | 'pending' | 'cancelled' | 'completed'> = ['confirmed', 'pending', 'cancelled', 'completed'];
        
        const getRandomStatus = () => {
          const random = Math.random();
          if (random < 0.65) return 'confirmed';
          if (random < 0.85) return 'completed';
          if (random < 0.96) return 'pending';
          return 'cancelled';
        };

        const generateRandomDateTime = (daysOffset: number = 0): Date => {
          const baseDate = new Date();
          baseDate.setDate(baseDate.getDate() + daysOffset);
          
          // Business hours: 9 AM - 6 PM
          const hour = Math.floor(Math.random() * 9) + 9; // 9-17
          const minute = Math.random() < 0.5 ? 0 : 30; // :00 or :30
          
          baseDate.setHours(hour, minute, 0, 0);
          return baseDate;
        };

        const demoBookings: Booking[] = [];
        
        // Generate 25-30 bookings across past 2 weeks, current week, and next 3 weeks
        for (let i = 0; i < 28; i++) {
          const customer = customerData[Math.floor(Math.random() * customerData.length)];
          const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
          
          // Generate bookings across past 2 weeks, current week, and next 3 weeks
          const daysOffset = Math.floor(Math.random() * 42) - 14; // -14 to +28 days
          const startTime = generateRandomDateTime(daysOffset);
          const endTime = new Date(startTime.getTime() + appointmentType.duration * 60000);

          demoBookings.push({
            id: `demo-booking-${i + 1}`,
            user_id: 'demo-user',
            assistant_id: `demo-${Math.floor(Math.random() * 3) + 1}`,
            title: appointmentType.title,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: getRandomStatus(),
            source: sources[Math.floor(Math.random() * sources.length)],
            notes: appointmentType.notes,
            timezone: 'UTC',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          });
        }
        
        return demoBookings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
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