import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Play, Square, Volume2, PhoneCall, Clock, CheckCircle } from "lucide-react";

interface TestOutboundCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestOutboundCallModal = ({ open, onOpenChange }: TestOutboundCallModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'completed'>('idle');
  const [callDuration, setCallDuration] = useState("00:00");

  const agents = [
    { id: "valeria", name: "Valeria", description: "Logistics specialist" },
    { id: "valeria_followup", name: "Valeria_follow up", description: "Follow-up specialist" },
    { id: "republica", name: "Republica", description: "General sales agent" }
  ];

  const handleStartCall = () => {
    if (!phoneNumber || !selectedAgent) return;
    
    setCallStatus('connecting');
    setIsCallActive(true);
    
    // Simulate call progression
    setTimeout(() => {
      setCallStatus('active');
      // Start duration counter
      let duration = 0;
      const interval = setInterval(() => {
        duration++;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      
      // Auto end call after 30 seconds for demo
      setTimeout(() => {
        clearInterval(interval);
        setCallStatus('completed');
        setIsCallActive(false);
      }, 30000);
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus('completed');
    setIsCallActive(false);
  };

  const handleReset = () => {
    setCallStatus('idle');
    setCallDuration("00:00");
    setPhoneNumber("");
    setSelectedAgent("");
  };

  const getStatusBadge = () => {
    switch (callStatus) {
      case 'connecting':
        return <Badge variant="secondary" className="animate-pulse">🔄 Connecting...</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">📞 Call Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">✅ Call Completed</Badge>;
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Test Outbound Call
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Call Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Call Status</span>
                {getStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Duration</span>
                </div>
                <span className="font-mono text-lg">{callDuration}</span>
              </div>
            </CardContent>
          </Card>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">Your Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
                disabled={isCallActive}
              />
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent">Select Agent</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent} disabled={isCallActive}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{agent.name}</span>
                      <span className="text-xs text-gray-500">{agent.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900">Test Call Information</h4>
                  <p className="text-xs text-blue-700">
                    This will initiate a real call to your number using the selected agent. 
                    The call will be recorded for testing purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isCallActive && callStatus !== 'completed' ? (
              <Button 
                onClick={handleStartCall}
                disabled={!phoneNumber || !selectedAgent}
                className="flex-1 flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Test Call
              </Button>
            ) : isCallActive ? (
              <Button 
                onClick={handleEndCall}
                variant="destructive"
                className="flex-1 flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                End Call
              </Button>
            ) : (
              <Button 
                onClick={handleReset}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                New Test
              </Button>
            )}
            
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>

          {/* Live Call Controls (when active) */}
          {callStatus === 'active' && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-900">Call in Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestOutboundCallModal;