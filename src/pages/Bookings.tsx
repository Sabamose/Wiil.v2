import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Plus, Phone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingDetailsModal } from '@/components/BookingDetailsModal';
import { useBookings } from '@/hooks/useBookings';
import { useAssistants } from '@/hooks/useAssistants';
import { Booking } from '@/types/booking';

const Bookings = () => {
  const { bookings, isLoading, updateBooking } = useBookings();
  const { assistants } = useAssistants();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 relative">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-teal-600">Bookings</h1>
            <div className="h-1 w-20 bg-gradient-to-r from-teal-600 to-teal-400 rounded-full" />
          </div>
          <p className="text-muted-foreground">Manage your appointment bookings and schedule with Cal.com integration</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-teal-600/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysBookings.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-teal-600/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">All appointments</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-teal-600/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Phone className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings.length}</div>
              <p className="text-xs text-muted-foreground">Ready to go</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-teal-600/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <Plus className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <Button 
                size="sm" 
                className="w-full bg-teal-600 hover:bg-teal-700"
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
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