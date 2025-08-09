import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Booking } from '@/types/booking';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface SimplifiedBookingCalendarProps {
  bookings: Booking[];
  assistants: any[];
  onBookingSelect: (booking: Booking) => void;
}

const statusColors = {
  confirmed: 'bg-green-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  completed: 'bg-blue-500',
};

const statusVariants = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline',
} as const;

export const SimplifiedBookingCalendar: React.FC<SimplifiedBookingCalendarProps> = ({
  bookings,
  assistants,
  onBookingSelect,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAssistant, setSelectedAssistant] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesAssistant = selectedAssistant === 'all' || booking.assistant_id === selectedAssistant;
      const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
      return matchesAssistant && matchesStatus;
    });
  }, [bookings, selectedAssistant, selectedStatus]);

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter((booking) => 
      isSameDay(new Date(booking.start_time), day)
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold ml-4">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
        </div>

        <div className="flex gap-2">
          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Assistants" />
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
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
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
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayBookings = getBookingsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card key={index} className={cn(
              "p-3 min-h-[200px]",
              isToday && "ring-2 ring-primary"
            )}>
              <div className="text-sm font-medium mb-2 text-center">
                <div className={cn(
                  "p-1 rounded",
                  isToday && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
              
              <div className="space-y-1">
                {dayBookings.map((booking) => {
                  const assistant = assistants.find(a => a.id === booking.assistant_id);
                  return (
                    <div
                      key={booking.id}
                      className="p-2 rounded-sm border cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => onBookingSelect(booking)}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div className={cn("w-2 h-2 rounded-full", statusColors[booking.status as keyof typeof statusColors])} />
                        <span className="text-xs font-medium truncate">{booking.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(booking.start_time), 'HH:mm')}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {booking.customer_name}
                      </div>
                      {assistant && (
                        <div className="text-xs text-muted-foreground truncate">
                          {assistant.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusColors).map(([status, color]) => {
          const count = filteredBookings.filter(b => b.status === status).length;
          return (
            <Card key={status} className="p-4 text-center">
              <div className={cn("w-3 h-3 rounded-full mx-auto mb-2", color)} />
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">{status}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};