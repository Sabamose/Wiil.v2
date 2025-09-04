import React, { useState, useMemo } from 'react';
import { Booking } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO, isToday, startOfWeek, addDays, startOfDay, endOfDay } from 'date-fns';
import { Settings, Home, MessageCircle, Calendar } from 'lucide-react';

interface BookingCalendarProps {
  bookings: Booking[];
  assistants: Array<{ id: string; name: string }>;
  onBookingSelect: (booking: Booking) => void;
}

type ViewType = 'week' | 'day' | 'list';

const parseTime = (timeStr: string) => {
  // Convert from booking time format to hours/minutes
  const date = new Date(timeStr);
  return { hours: date.getHours(), minutes: date.getMinutes() };
};

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  bookings, 
  assistants,
  onBookingSelect 
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('day');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const today = new Date();

  const filteredBookings = useMemo(() => {
    if (activeFilters.length === 0) return bookings;
    return bookings.filter(booking => {
      return activeFilters.some(filter => {
        if (filter === 'needs-confirmation') return booking.status === 'pending';
        return booking.source === filter;
      });
    });
  }, [bookings, activeFilters]);

  const metrics = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const todayBookings = bookings.filter(b => 
      isToday(new Date(b.start_time))
    ).length;

    return { total, confirmed, pending, todayBookings };
  }, [bookings]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏰';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '⏰';
    }
  };

  const getActionsHTML = (status: string) => {
    if (status === 'pending') {
      return (
        <>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Available Actions</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Button variant="outline" size="sm" className="text-gray-700">Resend SMS</Button>
            <Button variant="outline" size="sm" className="text-gray-700">Resend Email</Button>
            <Button variant="outline" size="sm" className="text-gray-700">Edit Time</Button>
            <Button variant="outline" size="sm" className="text-red-600">Cancel Appointment</Button>
            <Button variant="outline" size="sm" className="col-span-2 text-gray-700">Call Customer Now</Button>
          </div>
        </>
      );
    }
    return null;
  };

  const renderTimeline = (appointmentsToRender: Booking[]) => {
    const startHour = 7;
    const endHour = 19;
    const hourHeight = 80;

    return (
      <div className="grid grid-cols-[60px_1fr]">
        {/* Time column */}
        <div>
          {Array.from({ length: endHour - startHour + 1 }, (_, i) => {
            const hour = startHour + i;
            return (
              <div 
                key={hour}
                style={{ height: `${hourHeight}px` }}
                className="text-right text-xs text-gray-400 -translate-y-2 pr-2"
              >
                {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 || hour === 24 ? 'AM' : 'PM'}
              </div>
            );
          })}
        </div>
        
        {/* Appointments column */}
        <div className="relative border-l border-gray-200">
          {appointmentsToRender.map(booking => {
            const { hours, minutes } = parseTime(booking.start_time);
            const top = ((hours - startHour) * 60 + minutes) / 60 * hourHeight;
            const duration = 60; // Default 60 minutes
            const height = (duration / 60) * hourHeight;
            const bgColor = booking.status === 'pending' ? 'bg-amber-500' : 'bg-teal-500';
            
            return (
              <div
                key={booking.id}
                className={`absolute w-full p-2 rounded-lg text-white cursor-pointer -ml-px ${bgColor}`}
                style={{ 
                  top: `${top}px`, 
                  height: `${height - 4}px`, 
                  left: '4px', 
                  right: '4px' 
                }}
                onClick={() => onBookingSelect(booking)}
              >
                <p className="font-bold text-xs">{booking.title}</p>
                <p className="text-xs">{booking.customer_name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = filteredBookings.filter(booking => 
      isToday(new Date(booking.start_time))
    );

    return (
      <div>
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {today.toLocaleDateString('en-us', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        {renderTimeline(dayBookings)}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(today);
    
    return (
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        {/* Time column header */}
        <div></div>
        
        {/* Day headers */}
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i);
          return (
            <div key={i} className="text-center p-2 border-b border-l border-gray-200 text-xs font-semibold text-gray-500">
              {day.toLocaleDateString('en-us', { weekday: 'short', day: 'numeric' })}
            </div>
          );
        })}
        
        {/* Time labels */}
        <div>
          {Array.from({ length: 13 }, (_, i) => {
            const hour = 7 + i;
            return (
              <div key={hour} style={{ height: '80px' }} className="text-right text-xs text-gray-400 -translate-y-2 pr-2">
                {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'AM' : 'PM'}
              </div>
            );
          })}
        </div>
        
        {/* Day columns */}
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i);
          const dayBookings = filteredBookings.filter(booking => {
            const bookingDate = new Date(booking.start_time);
            return bookingDate.toDateString() === day.toDateString();
          });
          
          return (
            <div key={i} className="relative border-l border-gray-200">
              {dayBookings.map(booking => {
                const { hours, minutes } = parseTime(booking.start_time);
                const top = ((hours - 7) * 60 + minutes) / 60 * 80;
                const bgColor = booking.status === 'pending' ? 'bg-amber-500' : 'bg-teal-500';
                
                return (
                  <div
                    key={booking.id}
                    className={`absolute w-full p-1 rounded text-white cursor-pointer text-xs ${bgColor}`}
                    style={{ top: `${top}px`, height: '76px', left: '2px', right: '2px' }}
                    onClick={() => onBookingSelect(booking)}
                  >
                    <p className="font-bold truncate">{booking.title}</p>
                    <p className="truncate">{booking.customer_name}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    const groupedByDate = filteredBookings.reduce((acc, booking) => {
      const date = format(new Date(booking.start_time), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);

    const sortedDates = Object.keys(groupedByDate).sort();

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service / Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {sortedDates.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-10 text-gray-500">
                No appointments match filters.
              </td>
            </tr>
          ) : (
            sortedDates.map(date => {
              const bookingsForDate = groupedByDate[date];
              return (
                <React.Fragment key={date}>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-2 text-sm font-semibold text-gray-800 border-t border-b">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </td>
                  </tr>
                  {bookingsForDate.map(booking => {
                    const statusHTML = booking.status === 'pending' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        Needs Confirmation
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    );

                    return (
                      <tr 
                        key={booking.id}
                        className="hover:bg-gray-50 cursor-pointer border-b"
                        onClick={() => onBookingSelect(booking)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                          <div className="text-sm text-gray-500">
                            {booking.source === 'website' ? '💬 Website' : '📞 Phone/SMS'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{booking.title}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(booking.start_time), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4">{statusHTML}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center space-y-6 py-6 bg-white border-r border-gray-200">
        <div className="w-9 h-9 bg-sky-500 text-white flex items-center justify-center rounded-lg font-bold text-lg">
          W
        </div>
        <nav className="flex flex-col items-center space-y-4">
          <a href="#" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Home className="h-6 w-6" />
          </a>
          <a href="#" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <MessageCircle className="h-6 w-6" />
          </a>
          <a href="#" className="p-2 bg-sky-100 text-sky-600 rounded-lg">
            <Calendar className="h-6 w-6" />
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Appointments Made By AI Assistants</h1>
            <p className="text-sm text-gray-500">Monitor appointments scheduled by your phone and website assistants.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Settings className="h-6 w-6" />
            </button>
            <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Total Appointments</h3>
              <p className="text-3xl font-semibold text-gray-800">{metrics.total}</p>
            </Card>
            <Card className="p-4 bg-white border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Confirmed & Ready</h3>
              <p className="text-3xl font-semibold text-green-600">{metrics.confirmed}</p>
            </Card>
            <Card className="p-4 bg-white border-2 border-amber-400 shadow-sm">
              <h3 className="text-sm font-medium text-amber-600">Needs Confirmation</h3>
              <p className="text-3xl font-semibold text-amber-500">{metrics.pending}</p>
            </Card>
            <Card className="p-4 bg-white border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Booked Today</h3>
              <p className="text-3xl font-semibold text-gray-800">{metrics.todayBookings}</p>
            </Card>
          </div>

          {/* Filters and Calendar View */}
          <Card className="bg-white border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              {/* Filters */}
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <Button
                  variant={activeFilters.includes('needs-confirmation') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter('needs-confirmation')}
                  className="px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 border border-amber-200 rounded-full flex items-center space-x-1.5"
                >
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span>Needs Follow-up</span>
                </Button>
                <Button
                  variant={activeFilters.includes('phone') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter('phone')}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full"
                >
                  📞 Phone & SMS
                </Button>
                <Button
                  variant={activeFilters.includes('website') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter('website')}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full"
                >
                  💬 Website
                </Button>
              </div>

              {/* View Toggles */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-full text-sm">
                  <Button
                    variant={currentView === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('week')}
                    className={`px-4 py-1.5 rounded-l-full ${currentView === 'week' ? 'bg-gray-200 font-semibold' : ''}`}
                  >
                    Week
                  </Button>
                  <Button
                    variant={currentView === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('day')}
                    className={`px-4 py-1.5 ${currentView === 'day' ? 'bg-gray-200 font-semibold' : ''}`}
                  >
                    Day
                  </Button>
                  <Button
                    variant={currentView === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('list')}
                    className={`px-4 py-1.5 rounded-r-full ${currentView === 'list' ? 'bg-gray-200 font-semibold' : ''}`}
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>

            {/* Views Container */}
            <div id="calendar-container">
              {currentView === 'day' && renderDayView()}
              {currentView === 'week' && renderWeekView()}
              {currentView === 'list' && renderListView()}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};