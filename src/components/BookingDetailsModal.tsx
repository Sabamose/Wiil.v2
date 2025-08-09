import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types/booking';
import { Calendar, Clock, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Booking['status']) => void;
}

const statusVariants = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline',
} as const;

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!booking) return null;

  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            {booking.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Duration */}
          <div className="flex items-center justify-between">
            <Badge variant={statusVariants[booking.status]} className="capitalize">
              {booking.status}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {duration} minutes
            </div>
          </div>

          {/* Time Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {format(startTime, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          {booking.customer_name && (
            <div className="space-y-3">
              <h4 className="font-medium">Customer Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_name}</span>
                </div>
                
                {booking.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.customer_phone}</span>
                  </div>
                )}
                
                {booking.customer_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.customer_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Source and Timezone */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Source:</span>
              <div className="font-medium capitalize">{booking.source}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Timezone:</span>
              <div className="font-medium">{booking.timezone}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {booking.status === 'pending' && (
              <Button
                onClick={() => onStatusChange(booking.id, 'confirmed')}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm
              </Button>
            )}
            
            {(booking.status === 'confirmed' || booking.status === 'pending') && (
              <Button
                onClick={() => onStatusChange(booking.id, 'completed')}
                size="sm"
                variant="outline"
              >
                Mark Complete
              </Button>
            )}
            
            {booking.status !== 'cancelled' && (
              <Button
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                size="sm"
                variant="destructive"
              >
                Cancel
              </Button>
            )}

            {booking.customer_phone && (
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${booking.customer_phone}`}>
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </a>
              </Button>
            )}

            {booking.customer_email && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${booking.customer_email}`}>
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};