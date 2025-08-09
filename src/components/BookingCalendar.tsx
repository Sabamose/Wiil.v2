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
      const matchesAssistant = selectedAssistant === 'all' || booking.assistant_id === selectedAssistant;
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
    const status = event.resource.status;
    let bgColor = 'hsl(var(--brand-teal))';
    
    if (status === 'cancelled') bgColor = 'hsl(var(--destructive))';
    else if (status === 'pending') bgColor = 'hsl(var(--amber-500) / 0.9)';
    else if (status === 'completed') bgColor = 'hsl(var(--success))';
    
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '4px',
        opacity: status === 'cancelled' ? 0.6 : 1,
        color: 'white',
        border: 'none',
        fontSize: '12px',
      },
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const booking = event.resource;
    return (
      <div className="p-1 text-xs hover:bg-white/20 hover:scale-105 transition-all duration-200 rounded cursor-pointer">
        <div className="font-medium truncate">{booking.title}</div>
        {booking.customer_name && (
          <div className="truncate opacity-90 hover:opacity-100 transition-opacity duration-200">{booking.customer_name}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 bg-gradient-to-r from-background to-muted/10 border-border/50">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Assistant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assistants</SelectItem>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Day
            </Button>
            <Button
              variant={view === 'agenda' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('agenda')}
              className="bg-teal-600 hover:bg-teal-700 text-white"
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
            }}
            onSelectEvent={(event) => onBookingSelect(event.resource)}
            className="rbc-calendar-clean"
            views={['month', 'week', 'day', 'agenda']}
            popup={false} // Disable popup to avoid conflicts
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