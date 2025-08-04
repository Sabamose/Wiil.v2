import { InboundCall, DataVariable } from "@/types/call";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, Clock, User, Building } from "lucide-react";

interface CallDetailsProps {
  call: InboundCall;
  dataVariables: DataVariable[];
  onBack: () => void;
}

const CallDetails = ({ call, dataVariables, onBack }: CallDetailsProps) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calls
        </Button>
        <h1 className="text-2xl font-bold">Call Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-medium">{call.customer.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {call.customer.phoneNumber}
              </p>
            </div>
            
            {call.customer.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>{call.customer.email}</p>
              </div>
            )}
            
            {call.customer.company && (
              <div>
                <label className="text-sm font-medium text-gray-500">Company</label>
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {call.customer.company}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call Information */}
        <Card>
          <CardHeader>
            <CardTitle>Call Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <Badge variant="outline" className="capitalize">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(call.status)} mr-2`} />
                {call.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Duration</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Time</span>
              <span>{call.timestamp.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Collected Data */}
        <Card>
          <CardHeader>
            <CardTitle>Collected Data</CardTitle>
          </CardHeader>
          <CardContent>
            {call.collectedData && Object.keys(call.collectedData).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(call.collectedData).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data collected yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transcript & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript */}
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            {call.transcript ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{call.transcript}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No transcript available</p>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {call.summary ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{call.summary}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No summary available</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default CallDetails;