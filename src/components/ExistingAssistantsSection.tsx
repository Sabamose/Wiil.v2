import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Phone, MessageCircle, Globe, Smartphone, Play } from "lucide-react";

interface Assistant {
  id: string;
  name: string;
  type: string;
  channels: string[];
  status: "live" | "setup" | "inactive";
  lastActivity: string;
}

const ExistingAssistantsSection = () => {
  // Mock data - in real app this would come from API
  const assistants: Assistant[] = [
    {
      id: "1",
      name: "Customer Support",
      type: "Support",
      channels: ["voice", "web", "phone"],
      status: "live",
      lastActivity: "2 min ago"
    },
    {
      id: "2", 
      name: "Sales Assistant",
      type: "Sales",
      channels: ["chat", "web", "mobile"],
      status: "live",
      lastActivity: "5 min ago"
    },
    {
      id: "3",
      name: "Tech Support",
      type: "Technical",
      channels: ["voice", "chat", "phone"],
      status: "setup",
      lastActivity: "1 hour ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-success";
      case "setup": return "bg-yellow-500";
      case "inactive": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "voice": return <Phone className="w-3 h-3" />;
      case "chat": return <MessageCircle className="w-3 h-3" />;
      case "web": return <Globe className="w-3 h-3" />;
      case "mobile": return <Smartphone className="w-3 h-3" />;
      case "phone": return <Phone className="w-3 h-3" />;
      default: return <MessageCircle className="w-3 h-3" />;
    }
  };

  const handleTryAssistant = (assistantId: string) => {
    alert(`Testing assistant ${assistantId} - this would open the test interface`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Your Assistants</CardTitle>
            <div className="flex space-x-2">
              <Button variant="test-action" size="sm">
                <Play className="w-4 h-4" />
                🧪 Try Any
              </Button>
              <Button variant="default" size="sm">
                + Create
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Assistant Name</div>
            <div className="col-span-3">Type & Channels</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Last Activity</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {/* Assistant Rows */}
          <div className="space-y-0">
            {assistants.map((assistant) => (
              <div key={assistant.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border last:border-b-0 items-center">
                {/* Name */}
                <div className="col-span-3">
                  <div className="font-medium text-foreground">{assistant.name}</div>
                </div>
                
                {/* Type & Channels */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{assistant.type}</span>
                    <div className="flex space-x-1">
                      {assistant.channels.map((channel, index) => (
                        <div key={index} className="p-1 bg-accent rounded">
                          {getChannelIcon(channel)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(assistant.status)}`} />
                    <span className="text-sm capitalize text-foreground">{assistant.status}</span>
                  </div>
                </div>
                
                {/* Last Activity */}
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">{assistant.lastActivity}</span>
                </div>
                
                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="test-action" 
                      size="sm"
                      onClick={() => handleTryAssistant(assistant.id)}
                    >
                      🧪 Try
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Template Inspiration */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Need inspiration? Try our templates:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">📞 Customer Support</Button>
              <Button variant="outline" size="sm">💼 Sales</Button>
              <Button variant="outline" size="sm">🔧 Technical</Button>
              <Button variant="outline" size="sm">+ View All</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExistingAssistantsSection;