import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types/booking';
import { Calendar, Clock, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
      <DialogContent className="sm:max-w-[500px]" aria-describedby="booking-details-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            {booking.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" id="booking-details-description">
          {/* AI Assistant Source */}
          <div className="bg-brand-teal/10 border border-brand-teal/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-lg">{booking.source === 'phone' ? '📞' : '💻'}</div>
              <div>
                <div className="font-semibold text-brand-teal">
                  Booked by AI Assistant via {booking.source === 'phone' ? 'Phone Call' : 'Website Chat'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Customer reached out about: {booking.title}
                </div>
              </div>
            </div>
          </div>

          {/* Status and Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant={statusVariants[booking.status]} 
                className={cn("capitalize text-sm px-3 py-1", {
                  "bg-emerald-100 text-emerald-800": booking.status === 'confirmed',
                  "bg-amber-100 text-amber-800": booking.status === 'pending',
                  "bg-gray-100 text-gray-800": booking.status === 'completed',
                  "bg-red-100 text-red-800": booking.status === 'cancelled',
                })}
              >
                {booking.status === 'confirmed' && '✅ Customer Confirmed'}
                {booking.status === 'pending' && '⏰ Needs Confirmation'}
                {booking.status === 'completed' && '🎉 Appointment Done'}
                {booking.status === 'cancelled' && '❌ Cancelled'}
              </Badge>
            </div>
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

          {/* Conversation Context */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                💬
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Conversation Context</h4>
                <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                  <div className="text-sm text-gray-600">
                    Source: {booking.source === 'phone' ? 'Phone/SMS' : 'Website'} • Ref ID: conv_{booking.source}_{booking.id.slice(-4)}
                  </div>
                  <div className="text-sm text-gray-900">
                    Received {booking.source === 'phone' ? 'SMS' : 'message'} to book a follow-up.
                  </div>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View full transcript →
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            {booking.status === 'confirmed' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Confirmation</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-800 font-medium">
                      Customer confirmed via {booking.source === 'phone' ? 'SMS' : 'website'}.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Business Action Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground">What would you like to do?</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {booking.status === 'pending' && (
                <Button
                  onClick={() => onStatusChange(booking.id, 'confirmed')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 justify-start"
                >
                  ✅ Confirm with Customer
                </Button>
              )}
              
              {(booking.status === 'confirmed' || booking.status === 'pending') && (
                <Button
                  onClick={() => onStatusChange(booking.id, 'completed')}
                  size="sm"
                  variant="outline"
                  className="justify-start"
                >
                  🎉 Mark as Done
                </Button>
              )}
              
              {booking.customer_phone && (
                <Button size="sm" variant="outline" asChild className="justify-start">
                  <a href={`tel:${booking.customer_phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer Now
                  </a>
                </Button>
              )}

              {booking.customer_email && (
                <Button size="sm" variant="outline" asChild className="justify-start">
                  <a href={`mailto:${booking.customer_email}?subject=Appointment Confirmation - ${booking.title}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Confirmation Email
                  </a>
                </Button>
              )}

              {booking.status !== 'cancelled' && (
                <Button
                  onClick={() => onStatusChange(booking.id, 'cancelled')}
                  size="sm"
                  variant="destructive"
                  className="justify-start"
                >
                  ❌ Cancel Appointment
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};