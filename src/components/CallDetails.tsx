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
    { speaker: "Agent", message: "Found it. Your order ships tomorrow. Anything else I can help with?", time: "0:25" },
    { speaker: "Customer", message: "Actually, yes. I also wanted to ask about changing the delivery address.", time: "0:35" },
    { speaker: "Agent", message: "I can help with that. What's the new address you'd like to use?", time: "0:42" },
    { speaker: "Customer", message: "123 Main Street, Springfield, IL 62701", time: "0:48" },
    { speaker: "Agent", message: "Perfect. I've updated your delivery address. Is there anything else?", time: "0:55" },
    { speaker: "Customer", message: "Can you also tell me about the return policy?", time: "1:02" },
    { speaker: "Agent", message: "Of course! You have 30 days from delivery to return items in original condition.", time: "1:08" },
    { speaker: "Customer", message: "What if I need to return something after 30 days?", time: "1:15" },
    { speaker: "Agent", message: "After 30 days, we can still help on a case-by-case basis. We'd need to review the situation.", time: "1:22" },
    { speaker: "Customer", message: "That sounds reasonable. How do I track my order?", time: "1:35" },
    { speaker: "Agent", message: "I'll send you a tracking link via email. You'll also get updates via text if you'd like.", time: "1:42" },
    { speaker: "Customer", message: "Yes, please enable text updates. My number is the same as on file.", time: "1:50" },
    { speaker: "Agent", message: "Done! You're all set for text notifications. Is there anything else I can help with today?", time: "1:58" },
    { speaker: "Customer", message: "No, that covers everything. Thank you so much for your help!", time: "2:05" },
    { speaker: "Agent", message: "You're very welcome! Have a great day and thank you for choosing us.", time: "2:12" }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-brand-teal/10 hover:text-brand-teal">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calls
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Conversation with {call.customer.name}</h1>
            <p className="text-sm text-muted-foreground">conv_{call.id.slice(0, 8)}...{call.id.slice(-8)}</p>
          </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-brand-teal animate-pulse"></div>
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
                  i < 20 ? 'bg-brand-teal' : 'bg-border'
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="client-data">Client data</TabsTrigger>
          <TabsTrigger value="phone-call">Phone call</TabsTrigger>
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
          <div className="max-w-4xl mx-auto space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {sampleTranscript.map((item, index) => (
              <div key={index} className={`flex ${item.speaker === 'Agent' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  item.speaker === 'Agent' ? 'mr-auto' : 'ml-auto'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      item.speaker === 'Agent' ? 'text-brand-teal' : 'text-secondary-foreground'
                    }`}>
                      {item.speaker === 'Agent' ? 'Agent' : 'Customer'}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    item.speaker === 'Agent' 
                      ? 'bg-primary/10 text-foreground rounded-bl-sm' 
                      : 'bg-secondary text-secondary-foreground rounded-br-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{item.message}</p>
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

      </Tabs>
    </div>
  );
};

export default CallDetails;