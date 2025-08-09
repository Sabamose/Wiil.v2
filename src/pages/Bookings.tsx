import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus, Phone, Database, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingDetailsModal } from '@/components/BookingDetailsModal';
import { useBookings } from '@/hooks/useBookings';
import { useAssistants } from '@/hooks/useAssistants';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types/booking';
import { generateSimulatedBookings, clearSimulatedBookings } from '@/lib/bookingSimulation';

const Bookings = () => {
  const { bookings, isLoading, updateBooking } = useBookings();
  const { assistants } = useAssistants();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, status: Booking['status']) => {
    updateBooking.mutate({ id, updates: { status } });
    setIsModalOpen(false);
  };

  const todaysBookings = bookings.filter(booking => {
    const today = new Date().toDateString();
    const bookingDate = new Date(booking.start_time).toDateString();
    return today === bookingDate;
  });

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  const handleGenerateBookings = async () => {
    if (!assistants.length) {
      toast({
        title: "No assistants found",
        description: "Create some assistants first to generate bookings.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateSimulatedBookings(assistants);
      toast({
        title: "Bookings generated",
        description: "Sample bookings have been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error generating bookings",
        description: error instanceof Error ? error.message : "Failed to generate bookings",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearBookings = async () => {
    setIsClearing(true);
    try {
      await clearSimulatedBookings();
      toast({
        title: "Bookings cleared",
        description: "All simulated bookings have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error clearing bookings",
        description: error instanceof Error ? error.message : "Failed to clear bookings",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* background grid moved to main for proper stacking */}
      
      <Navigation />
      
      <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-8 relative animate-fade-in bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_23px,rgba(0,0,0,0)_23px),linear-gradient(to_right,hsl(var(--brand-teal)/0.06)_1px,transparent_1px)] bg-[size:100%_24px,24px_100%]`}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-teal">Bookings</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-brand-teal to-brand-teal/60 rounded-full mb-2" />
          <p className="text-muted-foreground">Manage bookings made by AI assistants</p>
        </div>

        {/* Summary Cards */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
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
          </div>
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
          <BookingCalendar
            bookings={bookings}
            assistants={assistants.map(a => ({ id: a.id, name: a.name }))}
            onBookingSelect={handleBookingSelect}
          />
        )}

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
};

export default Bookings;