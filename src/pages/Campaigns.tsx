import AdaptiveNavigation from "@/components/AdaptiveNavigation";
import { useResponsive } from "@/hooks/use-responsive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Phone, Target, Users, Calendar, Clock, FileText, Upload, Plus, Settings, Play, Pause, BarChart3, ArrowLeft } from "lucide-react";
import { useAssistants } from "@/hooks/useAssistants";
import { useToast } from "@/hooks/use-toast";

const Campaigns = () => {
  const { isMobile } = useResponsive();
  const { assistants } = useAssistants();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  // Filter for outbound assistants only
  const outboundAssistants = assistants.filter(assistant => assistant.assistant_type === 'outbound');

  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    assistantId: '',
    phoneNumbers: '',
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: '',
    callsPerMinute: '5',
    maxAttempts: '3'
  });

  const handleCreateCampaign = async () => {
    if (!campaignData.name || !campaignData.assistantId || !campaignData.phoneNumbers) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Simulate campaign creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "🚀 Campaign Created Successfully!",
        description: `Campaign "${campaignData.name}" has been created and will start making calls.`,
      });

      // Reset form
      setCampaignData({
        name: '',
        description: '',
        assistantId: '',
        phoneNumbers: '',
        scheduleType: 'immediate',
        scheduledDate: '',
        scheduledTime: '',
        callsPerMinute: '5',
        maxAttempts: '3'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const mockCampaigns = [
    {
      id: 1,
      name: "Q1 Sales Outreach",
      assistant: "Sales Assistant Pro",
      status: "active",
      totalCalls: 1250,
      completedCalls: 856,
      successfulCalls: 234,
      scheduledFor: "Immediate",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Customer Follow-up",
      assistant: "Support Assistant",
      status: "paused",
      totalCalls: 500,
      completedCalls: 125,
      successfulCalls: 67,
      scheduledFor: "2024-01-20 09:00",
      createdAt: "2024-01-14"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <AdaptiveNavigation />
      <main className="ml-0 mt-16 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Outbound Campaigns</h1>
              <p className="text-muted-foreground">Create and manage your outbound calling campaigns</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {outboundAssistants.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Outbound Assistants Found</h3>
              <p className="text-muted-foreground mb-4">
                You need to create an outbound assistant before you can start campaigns.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                <Plus className="w-4 h-4 mr-2" />
                Create Outbound Assistant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Creation Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Create New Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaignName">Campaign Name *</Label>
                      <Input
                        id="campaignName"
                        placeholder="e.g., Q1 Sales Outreach"
                        value={campaignData.name}
                        onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your campaign goals..."
                        value={campaignData.description}
                        onChange={(e) => setCampaignData({...campaignData, description: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="assistant">Select Assistant *</Label>
                      <Select value={campaignData.assistantId} onValueChange={(value) => setCampaignData({...campaignData, assistantId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an outbound assistant" />
                        </SelectTrigger>
                        <SelectContent>
                          {outboundAssistants.map((assistant) => (
                            <SelectItem key={assistant.id} value={assistant.id}>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {assistant.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phoneNumbers">Phone Numbers *</Label>
                      <Textarea
                        id="phoneNumbers"
                        placeholder="Enter phone numbers (one per line or comma-separated)&#10;+1 (555) 123-4567&#10;+1 (555) 234-5678"
                        value={campaignData.phoneNumbers}
                        onChange={(e) => setCampaignData({...campaignData, phoneNumbers: e.target.value})}
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Support formats: +1 (555) 123-4567, 555-123-4567, or upload CSV file
                      </p>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV File
                    </Button>
                  </div>

                  {/* Schedule Settings */}
                  <div className="space-y-4">
                    <Label>Schedule</Label>
                    <Select value={campaignData.scheduleType} onValueChange={(value) => setCampaignData({...campaignData, scheduleType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Start Immediately</SelectItem>
                        <SelectItem value="scheduled">Schedule for Later</SelectItem>
                      </SelectContent>
                    </Select>

                    {campaignData.scheduleType === 'scheduled' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="scheduledDate">Date</Label>
                          <Input
                            id="scheduledDate"
                            type="date"
                            value={campaignData.scheduledDate}
                            onChange={(e) => setCampaignData({...campaignData, scheduledDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="scheduledTime">Time</Label>
                          <Input
                            id="scheduledTime"
                            type="time"
                            value={campaignData.scheduledTime}
                            onChange={(e) => setCampaignData({...campaignData, scheduledTime: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Call Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="callsPerMinute">Calls per Minute</Label>
                      <Select value={campaignData.callsPerMinute} onValueChange={(value) => setCampaignData({...campaignData, callsPerMinute: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 call/min</SelectItem>
                          <SelectItem value="3">3 calls/min</SelectItem>
                          <SelectItem value="5">5 calls/min</SelectItem>
                          <SelectItem value="10">10 calls/min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="maxAttempts">Max Attempts</Label>
                      <Select value={campaignData.maxAttempts} onValueChange={(value) => setCampaignData({...campaignData, maxAttempts: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 attempt</SelectItem>
                          <SelectItem value="2">2 attempts</SelectItem>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="5">5 attempts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleCreateCampaign} disabled={isCreating} className="w-full" size="lg">
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Create Campaign
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Active Campaigns Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{campaign.name}</h4>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span>{campaign.completedCalls}/{campaign.totalCalls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span>{Math.round((campaign.successfulCalls / campaign.completedCalls) * 100)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          {campaign.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {mockCampaigns.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No active campaigns
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1,750</div>
                    <div className="text-sm text-muted-foreground">Total Calls This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">18.7%</div>
                    <div className="text-sm text-muted-foreground">Average Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2</div>
                    <div className="text-sm text-muted-foreground">Active Campaigns</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Campaigns;