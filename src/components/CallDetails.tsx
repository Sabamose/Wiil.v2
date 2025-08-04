import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Phone, Clock, User, Building, Mail, FileText, Database } from "lucide-react";
import { InboundCall } from "@/types/call";

interface CallDetailsProps {
  call: InboundCall;
  onBack: () => void;
}

const CallDetails = ({ call, onBack }: CallDetailsProps) => {
  const [collectionVariables, setCollectionVariables] = useState([
    { key: 'customer_intent', label: 'Customer Intent', value: call.summary || '' },
    { key: 'product_interest', label: 'Product Interest', value: '' },
    { key: 'budget_range', label: 'Budget Range', value: '' },
    { key: 'timeline', label: 'Timeline', value: '' }
  ]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadgeVariant = (status: InboundCall['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'missed': return 'destructive';
      case 'voicemail': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">Call Details</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-lg">{call.customer.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone Number</Label>
                <p className="font-mono">{call.customer.phoneNumber}</p>
              </div>
              {call.customer.email && (
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{call.customer.email}</p>
                  </div>
                </div>
              )}
              {call.customer.company && (
                <div>
                  <Label className="text-sm font-medium">Company</Label>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p>{call.customer.company}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Call Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(call.status)}>
                    {call.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Duration</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p>{call.duration > 0 ? formatDuration(call.duration) : 'N/A'}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Timestamp</Label>
                <p className="text-sm">{formatTimestamp(call.timestamp)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Collected Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {collectionVariables.map((variable, index) => (
                <div key={variable.key}>
                  <Label htmlFor={variable.key} className="text-sm font-medium">
                    {variable.label}
                  </Label>
                  <Input
                    id={variable.key}
                    value={variable.value}
                    onChange={(e) => {
                      const updated = [...collectionVariables];
                      updated[index].value = e.target.value;
                      setCollectionVariables(updated);
                    }}
                    placeholder={`Enter ${variable.label.toLowerCase()}...`}
                    className="mt-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Transcript and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Call Transcript</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {call.transcript ? (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{call.transcript}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Transcript not available</p>
                  <p className="text-xs">Transcript will appear here once the call is processed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Call Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={call.summary || ''}
                placeholder="AI-generated summary will appear here..."
                className="min-h-[200px]"
                readOnly={!call.summary}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallDetails;