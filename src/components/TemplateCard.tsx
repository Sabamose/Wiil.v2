import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MessageCircle, Users } from "lucide-react";
import { useState } from "react";

interface TemplateCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  demoNumber?: string;
}

const TemplateCard = ({ title, icon, description, features, demoNumber }: TemplateCardProps) => {
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  const handleTryCall = () => {
    setShowPhoneNumber(true);
  };

  const handleTryChat = () => {
    // In a real implementation, this would open a chat widget
    alert("Chat demo would open here - this will be integrated with AI assistant");
  };

  return (
    <Card className="h-full border border-border bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">{icon}</div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        
        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 flex-1">{description}</p>
        
        {/* Features */}
        <div className="space-y-1 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-success rounded-full mr-2" />
              {feature}
            </div>
          ))}
        </div>
        
        {/* Demo Phone Number Display */}
        {showPhoneNumber && demoNumber && (
          <div className="mb-4 p-3 bg-accent rounded-md border border-border">
            <div className="text-sm font-medium text-foreground mb-1">Call now to try:</div>
            <div className="text-lg font-bold text-test-action">{demoNumber}</div>
            <div className="text-xs text-muted-foreground">Available 24/7 for demo</div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button 
              variant="test-action" 
              size="sm" 
              className="flex-1"
              onClick={handleTryCall}
            >
              <Phone className="w-4 h-4" />
              🧪 Try a Call
            </Button>
            <Button 
              variant="test-action" 
              size="sm" 
              className="flex-1"
              onClick={handleTryChat}
            >
              <MessageCircle className="w-4 h-4" />
              📱 Try Chat
            </Button>
          </div>
          
          <Button variant="outline" className="w-full" size="sm">
            Use This Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;