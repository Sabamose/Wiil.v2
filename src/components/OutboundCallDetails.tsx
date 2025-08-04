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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="client-data">Client data</TabsTrigger>
          <TabsTrigger value="phone-call">Phone call</TabsTrigger>
          <TabsTrigger value="batch-call">Batch call</TabsTrigger>
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {call.transcript || "Transcription not available for this call."}
              </p>
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

        <TabsContent value="batch-call">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Batch Call Information</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">This call was part of an outbound batch calling campaign.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutboundCallDetails;