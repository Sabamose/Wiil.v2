import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TemplateCard from "./TemplateCard";

const HeroSection = () => {
  const templates = [
    {
      title: "Customer Support",
      icon: "📞",
      description: "Handle inquiries and resolve issues with intelligent customer service",
      features: ["Handle FAQs", "Issue tracking", "Smart escalation", "24/7 availability"],
      demoNumber: "+1 (555) 123-4567"
    },
    {
      title: "Sales Assistant", 
      icon: "💼",
      description: "Qualify leads and book meetings with potential customers",
      features: ["Lead qualification", "Demo booking", "Follow-up scheduling", "CRM integration"],
      demoNumber: "+1 (555) 234-5678"
    },
    {
      title: "Technical Support",
      icon: "🔧", 
      description: "Troubleshoot technical issues and provide expert guidance",
      features: ["Issue diagnosis", "Step-by-step guidance", "Documentation access", "Expert escalation"],
      demoNumber: "+1 (555) 345-6789"
    },
    {
      title: "Medical Reception",
      icon: "🏥",
      description: "Schedule appointments and manage healthcare communications",
      features: ["Appointment scheduling", "Confirmation calls", "Reminder system", "Insurance verification"],
      demoNumber: "+1 (555) 456-7890"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Create Your AI Assistant
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create and manage your AI workforce
        </p>
        
        <div className="bg-accent rounded-lg p-6 max-w-4xl mx-auto mb-8">
          <p className="text-lg text-foreground font-medium mb-4">
            New to AI assistants? Try our demo assistants instantly:
          </p>
          <p className="text-sm text-muted-foreground">
            Experience working AI assistants in under 10 seconds - no setup required
          </p>
        </div>
      </div>
      
      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {templates.map((template, index) => (
          <TemplateCard
            key={index}
            title={template.title}
            icon={template.icon}
            description={template.description}
            features={template.features}
            demoNumber={template.demoNumber}
          />
        ))}
      </div>
      
      {/* Create from Scratch */}
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Prefer to start fresh?
        </p>
        <Button variant="outline" size="lg">
          <Plus className="w-4 h-4" />
          Create From Scratch
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;