import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Bot,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Booking } from '@/types/booking';
import { format } from 'date-fns';

interface EnhancedBookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (bookingId: string, status: string) => void;
  assistants: any[];
}

const statusVariants = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline',
} as const;

export const EnhancedBookingDetailsModal: React.FC<EnhancedBookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  assistants,
}) => {
  if (!booking) return null;

  const assistant = assistants.find(a => a.id === booking.assistant_id);
  const duration = Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60));
  
  // Parse booking context if it exists
  const context = booking.booking_context || {};
  const interactionType = context.interaction_type || 'Unknown';
  const appointmentType = context.appointment_type || booking.title;
  const callDuration = context.call_duration;
  const satisfaction = context.customer_satisfaction;

  const handleCall = () => {
    if (booking.customer_phone) {
      window.open(`tel:${booking.customer_phone}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (booking.customer_email) {
      window.open(`mailto:${booking.customer_email}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {booking.title}
            <Badge variant={statusVariants[booking.status as keyof typeof statusVariants]}>
              {booking.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Details */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(booking.start_time), 'PPP p')} - {format(new Date(booking.end_time), 'p')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.timezone}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {assistant && (
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{assistant.name}</span>
                      <span className="text-muted-foreground ml-1">({assistant.type})</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{interactionType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.source}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          {(booking.customer_name || booking.customer_phone || booking.customer_email) && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {booking.customer_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.customer_name}</span>
                    </div>
                  )}
                  {booking.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.customer_phone}</span>
                    </div>
                  )}
                  {booking.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.customer_email}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {callDuration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Call Duration: {callDuration} min</span>
                    </div>
                  )}
                  {satisfaction && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Rating: {satisfaction}/5</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Type: {appointmentType}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notes */}
          {booking.notes && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {booking.status === 'pending' && (
              <Button
                onClick={() => onStatusChange(booking.id, 'confirmed')}
                size="sm"
              >
                Confirm Booking
              </Button>
            )}
            
            {booking.status === 'confirmed' && (
              <Button
                onClick={() => onStatusChange(booking.id, 'completed')}
                variant="outline"
                size="sm"
              >
                Mark Complete
              </Button>
            )}
            
            {booking.status !== 'cancelled' && (
              <Button
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                variant="destructive"
                size="sm"
              >
                Cancel Booking
              </Button>
            )}

            {booking.customer_phone && (
              <Button onClick={handleCall} variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            )}

            {booking.customer_email && (
              <Button onClick={handleEmail} variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};