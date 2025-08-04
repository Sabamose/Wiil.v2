import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, PhoneCall, Clock, User } from "lucide-react";
import { InboundCall, CallType } from "@/types/call";

interface CallsDashboardProps {
  onCallSelect: (call: InboundCall) => void;
}

const CallsDashboard = ({ onCallSelect }: CallsDashboardProps) => {
  const [callType, setCallType] = useState<CallType>('inbound');

  // Mock data for inbound calls
  const mockInboundCalls: InboundCall[] = [
    {
      id: '1',
      customer: {
        id: 'c1',
        name: 'John Smith',
        phoneNumber: '+1 (555) 123-4567',
        email: 'john@example.com',
        company: 'Tech Corp'
      },
      status: 'completed',
      duration: 450,
      timestamp: new Date('2024-01-15T10:30:00'),
      summary: 'Customer inquiry about product pricing and features.'
    },
    {
      id: '2',
      customer: {
        id: 'c2',
        name: 'Sarah Johnson',
        phoneNumber: '+1 (555) 987-6543',
        email: 'sarah@example.com'
      },
      status: 'active',
      duration: 0,
      timestamp: new Date('2024-01-15T11:15:00')
    },
    {
      id: '3',
      customer: {
        id: 'c3',
        name: 'Mike Wilson',
        phoneNumber: '+1 (555) 456-7890',
        company: 'Design Studio'
      },
      status: 'missed',
      duration: 0,
      timestamp: new Date('2024-01-15T09:45:00')
    },
    {
      id: '4',
      customer: {
        id: 'c4',
        name: 'Emily Davis',
        phoneNumber: '+1 (555) 234-5678',
        email: 'emily@startup.com',
        company: 'StartupCo'
      },
      status: 'completed',
      duration: 720,
      timestamp: new Date('2024-01-15T08:20:00'),
      summary: 'Support request for integration assistance.'
    }
  ];

  const getStatusBadgeVariant = (status: InboundCall['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'missed': return 'destructive';
      case 'voicemail': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Call Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Label htmlFor="call-type-toggle" className="text-sm">
              {callType === 'inbound' ? 'Inbound' : 'Outbound'}
            </Label>
            <Switch
              id="call-type-toggle"
              checked={callType === 'outbound'}
              onCheckedChange={(checked) => setCallType(checked ? 'outbound' : 'inbound')}
            />
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            {callType === 'inbound' ? (
              <Phone className="h-5 w-5 text-primary" />
            ) : (
              <PhoneCall className="h-5 w-5 text-primary" />
            )}
            <h2 className="text-xl font-semibold">
              {callType === 'inbound' ? 'Inbound Calls' : 'Outbound Calls'}
            </h2>
          </div>

          {callType === 'inbound' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInboundCalls.map((call) => (
                  <TableRow 
                    key={call.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onCallSelect(call)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{call.customer.name}</div>
                          {call.customer.company && (
                            <div className="text-sm text-muted-foreground">
                              {call.customer.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {call.customer.phoneNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(call.status)}>
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDuration(call.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimestamp(call.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PhoneCall className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Outbound calls feature coming soon...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CallsDashboard;