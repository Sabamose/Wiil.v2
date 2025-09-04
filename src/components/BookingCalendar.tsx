import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Booking } from '@/types/booking';
import { Search, Phone, Globe } from 'lucide-react';

interface BookingCalendarProps {
  bookings: Booking[];
  assistants: { id: string; name: string }[];
  onBookingSelect: (booking: Booking) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  onBookingSelect,
}) => {
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('list');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Apply filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(booking => {
        return activeFilters.some(filter => {
          if (filter === 'needs-confirmation') return booking.status === 'pending';
          return booking.source === filter;
        });
      });
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [bookings, activeFilters, searchQuery]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getSourceIcon = (source: string) => {
    // Randomize source for demo purposes if not set
    const actualSource = source === 'phone' || source === 'website' ? source : 
                         Math.random() > 0.5 ? 'phone' : 'website';
    
    return actualSource === 'phone' ? Phone : Globe;
  };

  const renderListView = () => {
    const sortedBookings = [...filteredBookings].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    // Group bookings by date
    const groupedBookings = sortedBookings.reduce((groups, booking) => {
      const dateKey = new Date(booking.start_time).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(booking);
      return groups;
    }, {} as Record<string, typeof sortedBookings>);

    const sortedDateKeys = Object.keys(groupedBookings).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    if (sortedDateKeys.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No appointments found</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {sortedDateKeys.map((dateKey) => {
          const date = new Date(dateKey);
          const bookingsForDate = groupedBookings[dateKey];
          const isToday = dateKey === new Date().toDateString();
          const isPast = date < new Date() && !isToday;
          
          return (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className={`flex items-center justify-between py-3 px-4 rounded-lg border-l-4 ${
                isToday ? 'bg-sky-50 border-sky-400' : isPast ? 'bg-gray-50 border-gray-300' : 'bg-teal-50 border-teal-400'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-semibold ${
                    isToday ? 'text-sky-700' : isPast ? 'text-gray-600' : 'text-teal-700'
                  }`}>
                    {isToday ? 'Today' : date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </div>
                  {isToday && (
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <div className={`text-sm font-medium ${
                  isToday ? 'text-sky-600' : isPast ? 'text-gray-500' : 'text-teal-600'
                }`}>
                  {bookingsForDate.length} appointment{bookingsForDate.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Appointments for this date */}
              <div className="space-y-2">
                {bookingsForDate.map((booking) => {
                  const statusColor = booking.status === 'pending' ? 'amber' : 
                                    booking.status === 'confirmed' ? 'green' : 
                                    booking.status === 'completed' ? 'blue' : 'gray';
                  
                  return (
                    <div
                      key={booking.id}
                      onClick={() => onBookingSelect(booking)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{booking.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          statusColor === 'amber' ? 'bg-amber-100 text-amber-700' :
                          statusColor === 'green' ? 'bg-green-100 text-green-700' :
                          statusColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{booking.customer_name}</span>
                          <span>
                            {new Date(booking.start_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {(() => {
                            const SourceIcon = getSourceIcon(booking.source);
                            return <SourceIcon className="w-3 h-3 text-gray-500" />;
                          })()}
                          <span className="text-xs text-gray-500 capitalize">{booking.source}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        bookings: dayBookings,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: date.toDateString() === today.toDateString()
      });
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              variant="outline"
              size="sm"
            >
              ←
            </Button>
            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              size="sm"
            >
              Today
            </Button>
            <Button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              variant="outline"
              size="sm"
            >
              →
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => (
            <div
              key={index}
              className={`bg-white p-2 min-h-[120px] border-r border-b border-gray-200 ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${day.isToday ? 'bg-sky-50' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-sky-600' : ''}`}>
                {day.date.getDate()}
              </div>
                <div className="space-y-1">
                  {day.bookings.slice(0, 3).map(booking => {
                    const SourceIcon = getSourceIcon(booking.source);
                    return (
                      <div
                        key={booking.id}
                        onClick={() => onBookingSelect(booking)}
                        className={`text-xs p-1 rounded cursor-pointer truncate flex items-center space-x-1 ${
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        <SourceIcon className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{booking.title}</span>
                      </div>
                    );
                  })}
                  {day.bookings.length > 3 && (
                    <div className="text-xs text-gray-500">+{day.bookings.length - 3} more</div>
                  )}
                </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate.toDateString() === date.toDateString();
      });
      
      weekDays.push({ date, bookings: dayBookings });
    }

    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
              variant="outline"
              size="sm"
            >
              ← Previous Week
            </Button>
            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              size="sm"
            >
              This Week
            </Button>
            <Button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
              variant="outline"
              size="sm"
            >
              Next Week →
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-gray-200 rounded-lg overflow-hidden">
          {/* Time axis */}
          <div className="bg-gray-50">
            <div className="h-16 border-b border-gray-200"></div>
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-200 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-gray-500">
                  {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>
          
          {/* Week days */}
          {weekDays.map((day, index) => (
            <div key={index} className="bg-white border-r border-gray-200 last:border-r-0">
              {/* Day header */}
              <div className="h-16 p-2 border-b border-gray-200 text-center">
                <div className="text-xs font-semibold text-gray-500">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm font-medium">
                  {day.date.getDate()}
                </div>
              </div>
              
              {/* Time grid */}
              <div className="relative">
                {hours.map(hour => (
                  <div key={hour} className="h-20 border-b border-gray-200"></div>
                ))}
                
                {/* Positioned bookings */}
                {day.bookings.map(booking => {
                  const startTime = new Date(booking.start_time);
                  const hour = startTime.getHours();
                  const minute = startTime.getMinutes();
                  const top = ((hour - 6) * 80) + (minute * 80 / 60);
                  const SourceIcon = getSourceIcon(booking.source);
                  
                  return (
                    <div
                      key={booking.id}
                      onClick={() => onBookingSelect(booking)}
                      className={`absolute left-1 right-1 p-1 rounded cursor-pointer text-xs ${
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-teal-100 text-teal-800 border-teal-300'
                      } border-l-2`}
                      style={{ top: `${top}px`, minHeight: '40px' }}
                    >
                      <div className="flex items-center space-x-1">
                        <SourceIcon className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="font-medium truncate">{booking.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return bookingDate.toDateString() === currentDate.toDateString();
    });

    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - 1);
                setCurrentDate(newDate);
              }}
              variant="outline"
              size="sm"
            >
              ← Previous Day
            </Button>
            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              size="sm"
            >
              Today
            </Button>
            <Button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + 1);
                setCurrentDate(newDate);
              }}
              variant="outline"
              size="sm"
            >
              Next Day →
            </Button>
          </div>
        </div>
        
        {dayBookings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-500 text-lg">No appointments on this day</div>
            <div className="text-gray-400 text-sm mt-2">Try selecting a different day or check your filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-[60px_1fr] bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50">
              {hours.map(hour => (
                <div key={hour} className="h-20 border-b border-gray-200 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-500">
                    {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="relative">
              {hours.map(hour => (
                <div key={hour} className="h-20 border-b border-gray-200"></div>
              ))}
              
              {dayBookings.map(booking => {
                const startTime = new Date(booking.start_time);
                const hour = startTime.getHours();
                const minute = startTime.getMinutes();
                
                // Adjust positioning to handle bookings outside 6-22 hour range
                let top = 0;
                if (hour >= 6 && hour < 22) {
                  top = ((hour - 6) * 80) + (minute * 80 / 60);
                } else if (hour < 6) {
                  // Show early bookings at the top
                  top = 0;
                } else {
                  // Show late bookings at the bottom
                  top = 15 * 80; // Near bottom of the calendar
                }
                
                const SourceIcon = getSourceIcon(booking.source);
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => onBookingSelect(booking)}
                    className={`absolute left-1 right-1 p-2 rounded cursor-pointer ${
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-teal-100 text-teal-800 border-teal-300'
                    } border-l-4`}
                    style={{ top: `${top}px`, minHeight: '60px' }}
                  >
                    <div className="flex items-center space-x-1 mb-1">
                      <SourceIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium text-sm">{booking.title}</span>
                    </div>
                    <div className="text-xs">{booking.customer_name}</div>
                    <div className="text-xs opacity-75">
                      {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        {/* Filters */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Button
            onClick={() => toggleFilter('phone')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              activeFilters.includes('phone')
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'text-gray-600 bg-gray-100 border-gray-200'
            } border`}
            variant="outline"
          >
            📞 Phone & SMS Bookings
          </Button>
          <Button
            onClick={() => toggleFilter('website')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              activeFilters.includes('website')
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'text-gray-600 bg-gray-100 border-gray-200'
            } border`}
            variant="outline"
          >
            💬 Website Bookings
          </Button>
        </div>

        {/* Search and View Toggles */}
        <div className="flex items-center space-x-4">
          <div className="relative w-full max-w-xs">
            <Input
              type="text"
              placeholder="Search customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1.5 w-full text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center border border-gray-300 rounded-full text-sm">
            {['month', 'week', 'day', 'list'].map((view) => (
              <Button
                key={view}
                onClick={() => setCurrentView(view as any)}
                className={`px-4 py-1.5 ${
                  currentView === view ? 'bg-gray-200 font-semibold' : ''
                } ${view === 'month' ? 'rounded-l-full' : ''} ${
                  view === 'list' ? 'rounded-r-full' : ''
                }`}
                variant="ghost"
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Views Container */}
      <div>
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView()}
        {currentView === 'list' && renderListView()}
      </div>
    </div>
  );
};