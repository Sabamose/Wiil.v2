import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const localizer = momentLocalizer(moment);

interface BookingCalendarProps {
  bookings: Booking[];
  assistants: Array<{ id: string; name: string }>;
  onBookingSelect: (booking: Booking) => void;
}

interface CalendarEvent extends Event {
  resource: Booking;
}

const statusColors = {
  confirmed: 'bg-success',
  pending: 'bg-amber-500',
  cancelled: 'bg-destructive',
  completed: 'bg-brand-teal',
};

const statusVariants = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline',
} as const;

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  bookings, 
  assistants,
  onBookingSelect 
}) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedAssistant, setSelectedAssistant] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Filter by assistant type (phone vs website) instead of specific assistant
      let matchesAssistant = true;
      if (selectedAssistant === 'phone') {
        matchesAssistant = booking.source === 'phone';
      } else if (selectedAssistant === 'website') {
        matchesAssistant = booking.source === 'website';
      }
      // 'all' shows everything
      
      const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
      const matchesSearch = searchTerm === '' || 
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesAssistant && matchesStatus && matchesSearch;
    });
  }, [bookings, selectedAssistant, selectedStatus, searchTerm]);

  const events: CalendarEvent[] = useMemo(() => {
    return filteredBookings.map((booking) => ({
      id: booking.id,
      title: booking.title,
      start: new Date(booking.start_time),
      end: new Date(booking.end_time),
      resource: booking,
    }));
  }, [filteredBookings]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const booking = event.resource;
    const status = booking.status;
    const source = booking.source;
    
    // Base colors that match the action buttons
    let bgColor = 'hsl(var(--brand-teal))'; // default
    
    // Source-based colors to match filter buttons
    if (source === 'phone') {
      bgColor = '#3b82f6'; // Blue to match phone button (text-blue-700)
    } else if (source === 'website') {
      bgColor = '#7c3aed'; // Purple to match website button (text-purple-700)
    }
    
    // Status modifications
    let opacity = 1;
    if (status === 'cancelled') {
      opacity = 0.4;
      bgColor = '#6b7280'; // Gray for cancelled
    } else if (status === 'pending') {
      // Keep source color but add yellow tint for pending
      if (source === 'phone') bgColor = '#2563eb'; // Darker blue
      else if (source === 'website') bgColor = '#6d28d9'; // Darker purple
      else bgColor = '#d97706'; // Amber for other pending
    } else if (status === 'completed') {
      bgColor = '#059669'; // Green for completed
    }
    
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '6px',
        opacity: opacity,
        color: 'white',
        border: 'none',
        fontSize: '12px',
        fontWeight: '500',
      },
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const booking = event.resource;
    const assistantName = assistants.find(a => a.id === booking.assistant_id)?.name || 'Assistant';
    const sourceIcon = booking.source === 'phone' ? '📞' : '💻';
    
    return (
      <div className="p-2 text-xs hover:bg-white/20 hover:scale-105 transition-all duration-200 rounded cursor-pointer h-full flex flex-col justify-between">
        <div>
          <div className="font-semibold truncate text-white leading-tight">{booking.title}</div>
          <div className="truncate opacity-90 text-white/90 mt-1 leading-tight">{booking.customer_name}</div>
        </div>
        <div className="flex items-center gap-1 mt-2 text-white/80 bg-black/20 rounded px-1 py-0.5">
          <span>{sourceIcon}</span>
          <span className="truncate text-[10px] font-medium">{assistantName}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Business-Friendly Filters */}
      <Card className="p-4 bg-gradient-to-r from-background to-muted/10 border-border/50">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            >
              ⚡ Needs Follow-up
            </Button>
            <Button
              variant={searchTerm.includes('phone') ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchTerm(searchTerm.includes('phone') ? '' : 'phone')}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              📞 Phone Bookings
            </Button>
            <Button
              variant={searchTerm.includes('website') ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchTerm(searchTerm.includes('website') ? '' : 'website')}
              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
            >
              💻 Website Bookings
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customer names or appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <span className="mr-2">🤖</span>
                <SelectValue placeholder="Which Assistant Type?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All AI Assistants</SelectItem>
                <SelectItem value="phone">📞 Phone Assistants</SelectItem>
                <SelectItem value="website">💻 Website Assistants</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Appointment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">✅ Customer Confirmed</SelectItem>
                <SelectItem value="pending">⏰ Needs Confirmation</SelectItem>
                <SelectItem value="completed">🎉 Appointment Done</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
              className="bg-white text-teal-600 border border-teal-600 hover:bg-teal-50"
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
              className="bg-white text-teal-600 border border-teal-600 hover:bg-teal-50"
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
              className="bg-white text-teal-600 border border-teal-600 hover:bg-teal-50"
            >
              Day
            </Button>
            <Button
              variant={view === 'agenda' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('agenda')}
              className="bg-white text-teal-600 border border-teal-600 hover:bg-teal-50"
            >
              List
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-6">
        <div className="calendar-container" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={() => {}} // Disable view changes from calendar
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
              toolbar: () => null, // Completely remove toolbar
              header: ({ label }) => (
                <div className="text-sm font-medium text-foreground p-2 bg-muted/50 border-b border-border">
                  {label}
                </div>
              ),
              agenda: {
                event: ({ event }) => {
                  const booking = event.resource;
                  const assistantName = assistants.find(a => a.id === booking.assistant_id)?.name || 'Assistant';
                  const sourceIcon = booking.source === 'phone' ? '📞' : '💻';
                  const statusIcon = booking.status === 'confirmed' ? '✅' : booking.status === 'pending' ? '⏰' : booking.status === 'completed' ? '🎉' : '❌';
                  
                  return (
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50" onClick={() => onBookingSelect(booking)}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{booking.title}</span>
                          <span className="text-xs">{statusIcon}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{booking.customer_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <span>{sourceIcon}</span>
                          <span>{assistantName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(booking.start_time), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  );
                }
              }
            }}
            onSelectEvent={(event) => onBookingSelect(event.resource)}
            className="rbc-calendar-clean"
            views={['month', 'week', 'day', 'agenda']}
            popup={false}
            min={new Date(2024, 0, 1, 8, 0, 0)} // Start at 8 AM
            max={new Date(2024, 0, 1, 22, 0, 0)} // End at 10 PM
            step={60} // 60-minute intervals for cleaner display
            timeslots={1} // Show 1-hour slots
            showMultiDayTimes={true}
            formats={{
              timeGutterFormat: (date, culture, localizer) => localizer?.format(date, 'h A', culture) || '',
              agendaTimeFormat: (date, culture, localizer) => localizer?.format(date, 'h:mm A', culture) || '',
            }}
          />
        </div>
      </Card>


      <style>{`
        /* Complete override of react-big-calendar styles */
        .rbc-calendar-clean {
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          font-family: inherit !important;
        }
        
        .rbc-calendar-clean * {
          box-sizing: border-box;
        }
        
        /* Hide all default toolbars and navigation */
        .rbc-calendar-clean .rbc-toolbar {
          display: none !important;
        }
        
        .rbc-calendar-clean .rbc-header {
          background: hsl(var(--muted)) !important;
          color: hsl(var(--foreground)) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
          padding: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }
        
        .rbc-calendar-clean .rbc-month-view, 
        .rbc-calendar-clean .rbc-time-view,
        .rbc-calendar-clean .rbc-agenda-view {
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background: hsl(var(--card)) !important;
        }
        
        .rbc-calendar-clean .rbc-date-cell {
          color: hsl(var(--foreground)) !important;
          padding: 8px !important;
          border-right: 1px solid hsl(var(--border)) !important;
          min-height: 40px !important;
        }
        
        .rbc-calendar-clean .rbc-date-cell.rbc-off-range {
          color: hsl(var(--muted-foreground)) !important;
          background: hsl(var(--muted/10)) !important;
        }
        
        .rbc-calendar-clean .rbc-today {
          background-color: hsl(var(--brand-teal) / 0.1) !important;
        }
        
        .rbc-calendar-clean .rbc-event {
          border-radius: 4px !important;
          padding: 2px 4px !important;
          border: none !important;
          color: white !important;
          font-size: 12px !important;
        }
        
        .rbc-calendar-clean .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border)) !important;
        }
        
        .rbc-calendar-clean .rbc-timeslot-group {
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        
        .rbc-calendar-clean .rbc-current-time-indicator {
          background-color: hsl(var(--brand-teal)) !important;
          height: 2px !important;
        }
        
        .rbc-calendar-clean .rbc-agenda-view table.rbc-agenda-table {
          background: transparent !important;
          width: 100% !important;
        }
        
        .rbc-calendar-clean .rbc-agenda-view .rbc-agenda-table tbody tr {
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        
        .rbc-calendar-clean .rbc-agenda-view .rbc-agenda-table tbody tr:hover {
          background-color: hsl(var(--muted)) !important;
        }
        
        /* Remove all default buttons and controls */
        .rbc-calendar-clean button {
          display: none !important;
        }
        
        /* Month view specific */
        .rbc-calendar-clean .rbc-month-row {
          border-bottom: 1px solid hsl(var(--border)) !important;
          min-height: 80px !important;
        }
        
        .rbc-calendar-clean .rbc-date-cell > a {
          color: hsl(var(--foreground)) !important;
          text-decoration: none !important;
          font-weight: 500 !important;
        }
        
        .rbc-calendar-clean .rbc-off-range .rbc-date-cell > a {
          color: hsl(var(--muted-foreground)) !important;
        }
        
        /* Week and day view */
        .rbc-calendar-clean .rbc-time-header {
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        
        .rbc-calendar-clean .rbc-time-content {
          border-top: none !important;
        }
        
        .rbc-calendar-clean .rbc-allday-cell {
          background: hsl(var(--muted/30)) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        
        /* Time labels on Y axis - Make them visible */
        .rbc-calendar-clean .rbc-time-slot {
          color: hsl(var(--muted-foreground)) !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        .rbc-calendar-clean .rbc-label {
          color: hsl(var(--foreground)) !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          padding: 4px 8px !important;
          text-align: right !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
          background: hsl(var(--background)) !important;
        }
        
        .rbc-calendar-clean .rbc-time-gutter {
          background: hsl(var(--background)) !important;
          border-right: 1px solid hsl(var(--border)) !important;
          width: 70px !important;
          flex-shrink: 0 !important;
        }
        
        .rbc-calendar-clean .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: 1px solid hsl(var(--border)) !important;
          min-height: 40px !important;
        }

        .rbc-calendar-clean .rbc-time-gutter .rbc-label {
          display: block !important;
          visibility: visible !important;
        }
        
        /* Agenda view */
        .rbc-calendar-clean .rbc-agenda-table {
          border: none !important;
        }
        
        .rbc-calendar-clean .rbc-agenda-table th {
          background: hsl(var(--muted)) !important;
          color: hsl(var(--foreground)) !important;
          font-weight: 600 !important;
          padding: 12px 8px !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        
        .rbc-calendar-clean .rbc-agenda-table td {
          padding: 8px !important;
          color: hsl(var(--foreground)) !important;
        }
      `}</style>
    </div>
  );
};