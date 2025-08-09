import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus, Phone, Zap, Trash2, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { SimplifiedBookingCalendar } from '@/components/SimplifiedBookingCalendar';
import { EnhancedBookingDetailsModal } from '@/components/EnhancedBookingDetailsModal';
import { useBookings } from '@/hooks/useBookings';
import { useAssistants } from '@/hooks/useAssistants';
import { useIsMobile } from '@/hooks/use-mobile';
import { Booking } from '@/types/booking';
import { generateSimulationBookings, clearSimulationBookings } from '@/lib/bookingSimulation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Bookings = () => {
  const { bookings, isLoading, updateBooking } = useBookings();
  const { assistants } = useAssistants();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, status: Booking['status']) => {
    updateBooking.mutate({ id, updates: { status } });
    setIsModalOpen(false);
  };

  const handleGenerateSimulation = async () => {
    if (!assistants.length) {
      toast({
        title: "No assistants found",
        description: "Please create at least one assistant first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await generateSimulationBookings(assistants, user.id);
      toast({
        title: "Simulation data generated",
        description: "25 realistic bookings have been created for demonstration.",
      });
    } catch (error) {
      toast({
        title: "Error generating simulation",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearSimulation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await clearSimulationBookings(user.id);
      toast({
        title: "Simulation data cleared",
        description: "All simulation bookings have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error clearing simulation",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const todaysBookings = bookings.filter(booking => {
    const today = new Date().toDateString();
    const bookingDate = new Date(booking.start_time).toDateString();
    return today === bookingDate;
  });

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  return (
    <div className="min-h-screen bg-background">
      {/* background grid moved to main for proper stacking */}
      
      <Navigation />
      
      <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-8 relative animate-fade-in bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_23px,rgba(0,0,0,0)_23px),linear-gradient(to_right,hsl(var(--brand-teal)/0.06)_1px,transparent_1px)] bg-[size:100%_24px,24px_100%]`}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-brand-teal">Bookings</h1>
                <div className="h-1 w-20 bg-gradient-to-r from-brand-teal to-brand-teal/60 rounded-full" />
              </div>
              <p className="text-muted-foreground">Manage your appointment bookings with AI-powered context</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateSimulation}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Demo Data'}
              </Button>
              
              <Button
                onClick={handleClearSimulation}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Demo Data
              </Button>
              
              <Button
                onClick={() => window.open('https://cal.com', '_blank')}
                className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-hover"
              >
                <ExternalLink className="h-4 w-4" />
                Open Cal.com
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-brand-teal/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-brand-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysBookings.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-brand-teal/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-brand-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">All appointments</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-brand-teal/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Phone className="h-4 w-4 text-brand-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings.length}</div>
              <p className="text-xs text-muted-foreground">Ready to go</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-brand-teal/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <Plus className="h-4 w-4 text-brand-teal" />
            </CardHeader>
            <CardContent>
              <Button 
                size="sm" 
                className="w-full bg-brand-teal hover:bg-brand-teal-hover text-brand-teal-foreground"
                onClick={() => window.open('https://cal.com', '_blank')}
              >
                Open Cal.com
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Component */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SimplifiedBookingCalendar
            bookings={bookings}
            assistants={assistants.map(a => ({ id: a.id, name: a.name }))}
            onBookingSelect={handleBookingSelect}
          />
        )}

        {/* Enhanced Booking Details Modal */}
        <EnhancedBookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange}
          assistants={assistants}
        />
      </main>
    </div>
  );
};

export default Bookings;