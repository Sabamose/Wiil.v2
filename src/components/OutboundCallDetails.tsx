import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, User, Phone, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
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
        return <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">✗ Failed</Badge>;
      case 'no-answer':
        return <Badge variant="secondary">📞 No Answer</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const successfulCriteria = call.criteria.filter(c => c.status === 'success').length;
  const totalCriteria = call.criteria.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Conversation with {call.recipientName || "Contact"}
          </h1>
          <p className="text-sm text-gray-500">conv_{call.id}</p>
        </div>
      </div>

      {/* Audio Player */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              1.0x
            </Button>
            <Button variant="ghost" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <RotateCw className="h-4 w-4" />
            </Button>
            <div className="flex-1 bg-gray-200 h-2 rounded-full relative">
              <div className="bg-blue-500 h-2 rounded-full w-1/4"></div>
            </div>
            <span className="text-sm text-gray-600">{currentTime} / {call.duration}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="client-data">Client data</TabsTrigger>
          <TabsTrigger value="phone-call">Phone call</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Summary */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Summary</h2>
            <p className="text-gray-700">{call.summary}</p>
          </div>

          {/* Call Status & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">Call status</h3>
              {getStatusBadge(call.status)}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">User ID</h3>
              <span className="text-sm text-gray-500">No user ID</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">Criteria evaluation</h3>
              <span className="text-sm font-medium">{successfulCriteria} of {totalCriteria} successful</span>
            </div>
          </div>

          {/* Criteria Details */}
          <div className="space-y-3">
            {call.criteria.map((criterion, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(criterion.status)}
                  <div>
                    <span className="font-medium">{criterion.name}</span>
                    <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                  </div>
                </div>
                <Badge 
                  variant={criterion.status === 'success' ? 'default' : 'destructive'}
                  className={criterion.status === 'success' ? 'bg-black text-white' : ''}
                >
                  {criterion.status === 'success' ? 'Success' : 'Failure'}
                </Badge>
              </div>
            ))}
          </div>

          {/* Data Collection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Data collection</h2>
            <div className="space-y-3">
              {Object.entries(call.dataCollected).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">string</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <span className="text-sm text-gray-500 italic">
                    {value || 'null'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transcription">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Call Transcription</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {call.transcript ? (
                <div className="space-y-4">
                  {/* Agent Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">Agent</div>
                        <p className="text-gray-800">Hello, this is calling from Armstrong Transport. May I speak with someone regarding your logistics needs?</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">00:05</div>
                    </div>
                  </div>

                  {/* Contact Message */}
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      C
                    </div>
                    <div className="flex-1">
                      <div className="bg-green-50 rounded-lg p-3 shadow-sm border border-green-200">
                        <div className="text-xs text-gray-500 mb-1 text-right">Contact</div>
                        <p className="text-gray-800">Yes, this is speaking. What can you help me with?</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-right">00:12</div>
                    </div>
                  </div>

                  {/* Agent Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">Agent</div>
                        <p className="text-gray-800">Great! I wanted to discuss our freight solutions that might benefit your business. We specialize in logistics and transportation services for companies like yours.</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">00:18</div>
                    </div>
                  </div>

                  {/* Contact Message */}
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      C
                    </div>
                    <div className="flex-1">
                      <div className="bg-green-50 rounded-lg p-3 shadow-sm border border-green-200">
                        <div className="text-xs text-gray-500 mb-1 text-right">Contact</div>
                        <p className="text-gray-800">We might be interested. Can you send me some information via email?</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-right">00:35</div>
                    </div>
                  </div>

                  {/* Agent Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">Agent</div>
                        <p className="text-gray-800">Absolutely! I'd be happy to send you detailed information. Could I get your email address?</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">00:42</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Transcription not available for this call.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="client-data">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{call.phoneNumber}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Call Duration</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{call.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phone-call">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Phone Call Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <label className="text-sm font-medium text-gray-600">Call Status</label>
                <p className="font-medium">{call.status}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="font-medium">{call.duration}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <label className="text-sm font-medium text-gray-600">Timestamp</label>
                <p className="font-medium">{call.timestamp.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="font-medium">{call.phoneNumber}</p>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default OutboundCallDetails;