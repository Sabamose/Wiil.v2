import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus, Phone, Database, Trash2 } from 'lucide-react';
import AdaptiveNavigation from '@/components/AdaptiveNavigation';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingDetailsModal } from '@/components/BookingDetailsModal';
import { useBookings } from '@/hooks/useBookings';
import { useAssistants } from '@/hooks/useAssistants';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigationState } from '@/hooks/useNavigationState';
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
  const { isCollapsed, isHome } = useNavigationState();
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* background grid moved to main for proper stacking */}
      
      <AdaptiveNavigation />
      
      <main className={`transition-all duration-200 ease-in-out ${
        isMobile ? 'ml-0' : (isHome ? 'ml-60' : (isCollapsed ? 'ml-20' : 'ml-60'))
      } mt-16 p-4 md:p-8 relative animate-fade-in bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_100%]`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-teal">Appointments Made by AI Assistants</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-brand-teal to-brand-teal/60 rounded-full mb-3" />
          <p className="text-lg text-muted-foreground">Monitor appointments scheduled by your phone and website assistants</p>
        </div>

        {/* Context Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-teal/10 border border-brand-teal/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-brand-teal">Your assistants booked {bookings.filter(b => {
                const today = new Date().toDateString();
                const bookingDate = new Date(b.start_time).toDateString();
                return today === bookingDate;
              }).length} appointments today</span>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-700">{bookings.filter(b => b.status === 'pending').length} customers waiting for confirmation</span>
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-emerald-700">{confirmedBookings.length} appointments confirmed & ready</span>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-brand-teal/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-5 w-5 text-brand-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-brand-teal">{todaysBookings.length}</div>
                <p className="text-xs text-muted-foreground">Booked by AI assistants today</p>
                {todaysBookings.length > 0 && (
                  <div className="mt-2 text-xs text-emerald-600 font-medium">↑ Active day</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-brand-teal/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Users className="h-5 w-5 text-brand-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-brand-teal">{bookings.length}</div>
                <p className="text-xs text-muted-foreground">All time bookings</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-blue-600">📞 {bookings.filter(b => b.source === 'phone').length}</span>
                  <span className="text-purple-600">💻 {bookings.filter(b => b.source === 'website').length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-brand-teal/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Confirmed</CardTitle>
                <Phone className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{confirmedBookings.length}</div>
                <p className="text-xs text-muted-foreground">Ready to go</p>
                {confirmedBookings.length > 0 && (
                  <div className="mt-2 text-xs text-emerald-600 font-medium">✓ All set</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-amber-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Follow-up</CardTitle>
                <div className="h-5 w-5 text-amber-600">⏰</div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{bookings.filter(b => b.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Waiting for confirmation</p>
                {bookings.filter(b => b.status === 'pending').length > 0 && (
                  <div className="mt-2 text-xs text-amber-600 font-medium">⚡ Action needed</div>
                )}
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