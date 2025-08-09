import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface CallData {
  id: string;
  recipientName?: string;
  phoneNumber: string;
  duration: string;
  status: 'completed' | 'failed' | 'no-answer';
  timestamp: Date;
  summary: string;
  criteria: {
    name: string;
    status: 'success' | 'failure' | 'unknown';
    description: string;
  }[];
  dataCollected: {
    [key: string]: string | null;
  };
  transcript?: string;
}

interface OutboundCallDetailsProps {
  call: CallData;
  onBack: () => void;
}

const OutboundCallDetails = ({ call, onBack }: OutboundCallDetailsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0x");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'unknown':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'no-answer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const successfulCriteria = call.criteria.filter(c => c.status === 'success').length;
  const totalCriteria = call.criteria.length;

  const sampleTranscript = [
    { speaker: "Agent", message: "Hello, this is calling from Armstrong Transport. May I speak with someone regarding your logistics needs?", time: "0:00" },
    { speaker: "Contact", message: "Yes, this is speaking. What can you help me with?", time: "0:05" },
    { speaker: "Agent", message: "Great! I wanted to discuss our freight solutions that might benefit your business. We specialize in logistics and transportation services for companies like yours.", time: "0:10" },
    { speaker: "Contact", message: "We might be interested. Can you send me some information via email?", time: "0:35" },
    { speaker: "Agent", message: "Absolutely! I'd be happy to send you detailed information. Could I get your email address?", time: "0:42" },
    { speaker: "Contact", message: "Sure, it's contact@company.com", time: "0:48" },
    { speaker: "Agent", message: "Perfect! I'll send that over today. Thank you for your time.", time: "0:55" }
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
            <h1 className="text-2xl font-semibold">Conversation with {call.recipientName || "Contact"}</h1>
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
            className="flex items-center gap-2 border-brand-teal/30 hover:bg-brand-teal/10 hover:border-brand-teal"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playbackSpeed}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPlaybackSpeed(playbackSpeed === "1.0x" ? "1.5x" : playbackSpeed === "1.5x" ? "2.0x" : "1.0x")}
            className="hover:bg-brand-teal/10 hover:text-brand-teal"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-brand-teal/10 hover:text-brand-teal">
            <RotateCw className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-auto">
            {currentTime} / {call.duration}
          </span>
          <Button variant="ghost" size="sm" className="hover:bg-brand-teal/10 hover:text-brand-teal">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="transcription" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white">Transcription</TabsTrigger>
          <TabsTrigger value="client-data" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white">Client data</TabsTrigger>
          <TabsTrigger value="phone-call" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white">Phone call</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Conversation Summary</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">
                {call.summary}
              </p>
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
                      {item.speaker === 'Agent' ? 'Agent' : 'Contact'}
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
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Phone Number</span>
                <span className="text-muted-foreground">{call.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Call Duration</span>
                <span className="text-muted-foreground">{call.duration}</span>
              </div>
              {Object.entries(call.dataCollected).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-muted-foreground">{value || 'null'}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Phone Call Tab */}
        <TabsContent value="phone-call" className="space-y-4 mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Status</span>
              <Badge variant={getStatusBadge(call.status)} className="capitalize">
                {call.status === 'completed' ? 'Successful' : 
                 call.status === 'no-answer' ? 'No Answer' : 
                 call.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Duration</span>
              <span className="text-muted-foreground">{call.duration}</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Time</span>
              <span className="text-muted-foreground">{call.timestamp.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Phone Number</span>
              <span className="text-muted-foreground">{call.phoneNumber}</span>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default OutboundCallDetails;