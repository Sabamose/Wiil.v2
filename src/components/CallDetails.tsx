import { InboundCall, DataVariable } from "@/types/call";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Download } from "lucide-react";
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
      case 'completed': return 'bg-green-500';
      case 'missed': return 'bg-destructive';
      case 'queued': return 'bg-accent';
      default: return 'bg-border';
    }
  };

  const sampleTranscript = [
    { speaker: "Agent", message: "Hi, thanks for calling. How can I help today?", time: "0:00" },
    { speaker: "Customer", message: "I'm checking on my order status.", time: "0:05" },
    { speaker: "Agent", message: "Sure, I'll look that up. Could I have your order number?", time: "0:10" },
    { speaker: "Customer", message: "It's 12345.", time: "0:20" },
    { speaker: "Agent", message: "Found it. Your order ships tomorrow. Anything else I can help with?", time: "0:25" }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calls
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Conversation with {call.customer.name}</h1>
            <p className="text-sm text-muted-foreground">conv_{call.id.slice(0, 8)}...{call.id.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Waveform and Audio Controls */}
      <div className="space-y-4">
        {/* Waveform Visualization */}
        <div className="h-20 bg-muted rounded-lg flex items-center justify-center border">
          <div className="flex items-end gap-1 h-12">
            {Array.from({ length: 80 }, (_, i) => (
              <div
                key={i}
                className={`w-1 rounded-sm transition-colors ${
                  i < 20 ? 'bg-primary' : 'bg-border'
                }`}
                style={{
                  height: `${Math.random() * 40 + 8}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-4">
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
          <span className="text-sm text-muted-foreground ml-auto">
            {currentTime} / {formatDuration(call.duration)}
          </span>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="client-data">Client data</TabsTrigger>
          <TabsTrigger value="phone-call">Phone call</TabsTrigger>
          <TabsTrigger value="batch-call">Batch call</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Summary</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">
                {call.summary || `${call.customer.name} called regarding their recent inquiry. The conversation covered their specific needs and we provided relevant information. The call was completed successfully with all questions addressed.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Call status</h4>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Status</span>
                <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                  {call.status === 'completed' ? 'Successful' : call.status}
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">User ID</h4>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">User ID</span>
                <span className="text-sm text-muted-foreground">
                  {call.customer.id ? call.customer.id.slice(0, 8) : 'No user ID'}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Transcription Tab */}
        <TabsContent value="transcription" className="space-y-4 mt-6">
          <div className="space-y-4">
            {sampleTranscript.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {item.speaker === 'Agent' ? 'A' : 'C'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{item.speaker === 'Agent' ? 'Agent' : 'Customer'}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg max-w-2xl">
                    <p className="text-sm">{item.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Client Data Tab */}
        <TabsContent value="client-data" className="space-y-4 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Dynamic Variables</h3>
            <div className="space-y-4">
              {call.collectedData && Object.keys(call.collectedData).length > 0 ? (
                Object.entries(call.collectedData).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Name</span>
                    <span className="text-muted-foreground">{call.customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Phone</span>
                    <span className="text-muted-foreground">{call.customer.phoneNumber}</span>
                  </div>
                  {call.customer.email && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Email</span>
                      <span className="text-muted-foreground">{call.customer.email}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Phone Call Tab */}
        <TabsContent value="phone-call" className="space-y-4 mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Status</span>
              <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                {call.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Duration</span>
              <span className="text-muted-foreground">{formatDuration(call.duration)}</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Time</span>
              <span className="text-muted-foreground">{call.timestamp.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Phone Number</span>
              <span className="text-muted-foreground">{call.customer.phoneNumber}</span>
            </div>
          </div>
        </TabsContent>

        {/* Batch Call Tab */}
        <TabsContent value="batch-call" className="space-y-4 mt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>No batch call information available</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CallDetails;