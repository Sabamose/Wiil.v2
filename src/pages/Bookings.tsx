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
    <div className="flex min-h-screen">
      <AdaptiveNavigation />
      
      {/* Main Content */}
      <main className={`flex-1 flex flex-col bg-gray-50 transition-all duration-200 ease-in-out ${
        isMobile ? 'ml-0' : (isHome ? 'ml-60' : (isCollapsed ? 'ml-20' : 'ml-60'))
      }`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Appointments Made By AI Assistants</h1>
            <p className="text-sm text-gray-500">Monitor appointments scheduled by your phone and website assistants.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleGenerateBookings}
              disabled={isGenerating}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              variant="ghost"
              size="sm"
            >
              <Database className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleClearBookings}
              disabled={isClearing}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              variant="ghost"
              size="sm"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-y-auto max-h-screen">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Total Appointments</h3>
              <p className="text-3xl font-semibold text-gray-800">{bookings.length}</p>
              <p className="text-xs text-gray-400">All time bookings</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Confirmed & Ready</h3>
              <p className="text-3xl font-semibold text-green-600">{confirmedBookings.length}</p>
              <p className="text-xs text-gray-400">Customers are all set</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-amber-400 shadow-sm">
              <h3 className="text-sm font-medium text-amber-600">Needs Confirmation</h3>
              <p className="text-3xl font-semibold text-amber-500">{bookings.filter(b => b.status === 'pending').length}</p>
              <p className="text-xs text-amber-500">Action needed</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Booked Today</h3>
              <p className="text-3xl font-semibold text-gray-800">{todaysBookings.length}</p>
              <p className="text-xs text-gray-400">By AI assistants</p>
            </div>
          </div>

          {/* Calendar Component */}
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading calendar...</p>
                </div>
              </div>
            </div>
          ) : (
            <BookingCalendar
              bookings={bookings}
              assistants={assistants.map(a => ({ id: a.id, name: a.name }))}
              onBookingSelect={handleBookingSelect}
            />
          )}
        </div>
      </main>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Bookings;