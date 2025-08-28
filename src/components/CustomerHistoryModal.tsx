import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Download, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";

interface HistoryItem {
  type: string;
  summary: string;
  timestamp: string;
  transcript?: Array<{
    speaker: string;
    message: string;
    time: string;
  }>;
  duration?: string;
  status?: string;
  customerData?: Record<string, any>;
}

interface CustomerHistoryModalProps {
  historyItem: HistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerHistoryModal = ({ historyItem, isOpen, onClose }: CustomerHistoryModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0x");

  if (!historyItem) return null;

  const sampleTranscript = [
    { speaker: "Agent", message: "Hi, thanks for calling. How can I help today?", time: "0:00" },
    { speaker: "Customer", message: "I'm checking on my order status.", time: "0:05" },
    { speaker: "Agent", message: "Sure, I'll look that up. Could I have your order number?", time: "0:10" },
    { speaker: "Customer", message: "It's 12345.", time: "0:20" },
    { speaker: "Agent", message: "Found it. Your order ships tomorrow. Anything else I can help with?", time: "0:25" },
    { speaker: "Customer", message: "That's perfect, thank you so much!", time: "0:35" },
  ];

  const isCall = historyItem.type === "Phone Call";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isCall ? (
              <Phone className="h-5 w-5 text-blue-500" />
            ) : (
              <MessageCircle className="h-5 w-5 text-green-500" />
            )}
            {historyItem.type} - {historyItem.timestamp}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audio Controls for Phone Calls */}
          {isCall && (
            <div className="space-y-4">
              {/* Waveform Visualization */}
              <div className="h-16 bg-slate-100 rounded-lg flex items-center justify-center border">
                <div className="flex items-end gap-1 h-10">
                  {Array.from({ length: 60 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-sm transition-colors ${
                        i < 15 ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                      style={{
                        height: `${Math.random() * 30 + 6}px`,
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
                <span className="text-sm text-slate-600 ml-auto">
                  {currentTime} / {historyItem.duration || "2:15"}
                </span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Overview</TabsTrigger>
              <TabsTrigger value="transcript" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Transcript</TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Customer Data</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed text-slate-700">
                    {historyItem.summary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Type</h4>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Interaction Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {historyItem.type}
                    </Badge>
                  </div>
                </div>
                
                {historyItem.status && (
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm">Status</span>
                      <Badge variant={historyItem.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                        {historyItem.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Transcript Tab */}
            <TabsContent value="transcript" className="space-y-4 mt-6">
              <div className="max-w-4xl mx-auto space-y-3 max-h-96 overflow-y-auto pr-2">
                {(historyItem.transcript || sampleTranscript).map((item, index) => (
                  <div key={index} className={`flex ${item.speaker === 'Agent' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                      item.speaker === 'Agent' ? 'mr-auto' : 'ml-auto'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${
                          item.speaker === 'Agent' ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                          {item.speaker === 'Agent' ? 'Agent' : 'Customer'}
                        </span>
                        <span className="text-xs text-slate-500">{item.time}</span>
                      </div>
                      <div className={`p-3 rounded-2xl ${
                        item.speaker === 'Agent' 
                          ? 'bg-blue-50 text-slate-700 rounded-bl-sm border border-blue-100' 
                          : 'bg-slate-100 text-slate-700 rounded-br-sm border border-slate-200'
                      }`}>
                        <p className="text-sm leading-relaxed">{item.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Customer Data Tab */}
            <TabsContent value="data" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Collected Data</h3>
                <div className="space-y-3">
                  {historyItem.customerData ? (
                    Object.entries(historyItem.customerData).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-slate-600">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 p-6">
                      No additional data collected during this interaction.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};