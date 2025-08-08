import { InboundCall, DataVariable } from "@/types/call";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Phone, Clock, User, Building, Play, Pause, RotateCcw, RotateCw, Volume2, Download } from "lucide-react";
import { useState } from "react";

interface CallDetailsProps {
  call: InboundCall;
  dataVariables: DataVariable[];
  onBack: () => void;
}

const CallDetails = ({ call, dataVariables, onBack }: CallDetailsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0x");
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary';
      case 'completed': return 'bg-secondary';
      case 'missed': return 'bg-destructive';
      case 'queued': return 'bg-accent';
      default: return 'bg-border';
    }
  };

  const sampleTranscript = "Agent: Hi, thanks for calling. How can I help today?\nCustomer: I'm checking on my order status.\nAgent: Sure, I'll look that up. Could I have your order number?\nCustomer: It's 12345.\nAgent: Found it. Your order ships tomorrow. Anything else I can help with?";
  const transcriptToShow = call.transcript && call.transcript.trim().length > 0 ? call.transcript : sampleTranscript;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calls
        </Button>
        <h1 className="text-2xl font-bold">Conversation Details</h1>
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
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-medium">{call.customer.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {call.customer.phoneNumber}
              </p>
            </div>
            
            {call.customer.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{call.customer.email}</p>
              </div>
            )}
            
            {call.customer.company && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
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
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge variant="outline" className="capitalize">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(call.status)} mr-2`} />
                {call.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Duration</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Time</span>
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
                    <label className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data collected yet</p>
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
            {transcriptToShow ? (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-line">{transcriptToShow}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {call.summary ? (
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{call.summary}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No summary available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audio Recording */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Call Recording
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Audio Player Controls */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playbackSpeed}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPlaybackSpeed(playbackSpeed === "1.0x" ? "1.5x" : playbackSpeed === "1.5x" ? "2.0x" : "1.0x")}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <div className="flex-1 bg-muted h-2 rounded-full relative">
                  <div className="bg-foreground h-2 rounded-full w-1/4"></div>
                </div>
                <span className="text-sm text-muted-foreground">{currentTime} / {formatDuration(call.duration)}</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Waveform Visualization (Mock) */}
              <div className="flex items-center justify-center h-16 bg-background rounded border">
                <div className="flex items-end gap-1 h-12">
                  {Array.from({ length: 60 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-sm ${
                        i < 15 ? 'bg-foreground' : 'bg-border'
                      }`}
                      style={{
                        height: `${Math.random() * 40 + 8}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>


          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default CallDetails;