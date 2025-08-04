import { useState } from "react";
import { InboundCall, DataVariable } from "@/types/call";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone, Clock, Search } from "lucide-react";
import CallDetails from "./CallDetails";

// Mock data
const mockCalls: InboundCall[] = [
  {
    id: "1",
    customer: {
      id: "c1",
      name: "John Smith",
      phoneNumber: "+1 (555) 123-4567",
      email: "john@example.com",
      company: "Tech Corp"
    },
    status: "completed",
    duration: 480,
    timestamp: new Date("2024-01-15T10:30:00"),
    transcript: "Customer called asking about product pricing and availability...",
    summary: "Customer inquiry about pricing for enterprise package. Interested in annual subscription.",
    collectedData: {
      budget: "$50,000",
      timeline: "Q2 2024",
      companySize: "100+ employees"
    }
  },
  {
    id: "2",
    customer: {
      id: "c2",
      name: "Sarah Johnson",
      phoneNumber: "+1 (555) 987-6543",
      email: "sarah@demo.com"
    },
    status: "active",
    duration: 120,
    timestamp: new Date("2024-01-15T14:15:00"),
    transcript: "Live call in progress...",
    summary: "Customer support call - technical issue with login"
  },
  {
    id: "3",
    customer: {
      id: "c3",
      name: "Mike Wilson",
      phoneNumber: "+1 (555) 456-7890",
      company: "StartupXYZ"
    },
    status: "missed",
    duration: 0,
    timestamp: new Date("2024-01-15T09:45:00")
  }
];

const mockDataVariables: DataVariable[] = [
  { id: "1", name: "Budget", type: "text", description: "Customer's budget range", required: true },
  { id: "2", name: "Timeline", type: "text", description: "Expected implementation timeline", required: false },
  { id: "3", name: "Company Size", type: "text", description: "Number of employees", required: true },
  { id: "4", name: "Decision Maker", type: "boolean", description: "Is this person the decision maker?", required: false }
];

const CallsDashboard = () => {
  const [callType, setCallType] = useState<'inbound' | 'outbound'>('inbound');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<InboundCall | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'missed': return 'bg-red-500';
      case 'queued': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredCalls = mockCalls.filter(call =>
    call.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.customer.phoneNumber.includes(searchTerm)
  );

  if (selectedCall) {
    return (
      <CallDetails 
        call={selectedCall} 
        dataVariables={mockDataVariables}
        onBack={() => setSelectedCall(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Call Management</h1>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant={callType === 'inbound' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCallType('inbound')}
          >
            Inbound
          </Button>
          <Button
            variant={callType === 'outbound' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCallType('outbound')}
          >
            Outbound
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers or phone numbers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Calls Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {callType === 'inbound' ? 'Inbound' : 'Outbound'} Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedCall(call)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`} />
                  <div>
                    <div className="font-medium">{call.customer.name}</div>
                    <div className="text-sm text-gray-500">{call.customer.phoneNumber}</div>
                    {call.customer.company && (
                      <div className="text-xs text-gray-400">{call.customer.company}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="capitalize">
                    {call.status}
                  </Badge>
                  
                  {call.duration > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {formatDuration(call.duration)}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    {call.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallsDashboard;