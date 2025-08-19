import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Code2 } from 'lucide-react';

interface WorkspaceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}

const workspaceOptions: WorkspaceOption[] = [
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Designed for teams and growing businesses',
    icon: Building2,
    features: [
      'Advanced analytics',
      'Team collaboration',
      'Multi-channel deployment',
      'Business integrations',
      'Campaign management'
    ]
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'Advanced tools for developers and technical teams',
    icon: Code2,
    features: [
      'Full API access',
      'Advanced customization',
      'Developer tools',
      'Custom integrations',
      'Technical documentation',
      'Project keys management'
    ]
  }
];

interface WorkspaceSelectionProps {
  onWorkspaceSelect: (workspaceId: string) => void;
}

const WorkspaceSelection: React.FC<WorkspaceSelectionProps> = ({ onWorkspaceSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Desired Workspace
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the workspace that best fits your needs and unlock the full potential of our AI platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {workspaceOptions.map((workspace) => {
            const IconComponent = workspace.icon;
            
            return (
              <Card 
                key={workspace.id}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-teal/10 hover:-translate-y-1 border border-border/50 hover:border-brand-teal/30"
              >
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-brand-teal" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      {workspace.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {workspace.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-medium text-foreground mb-4">Key Features:</h4>
                    <ul className="space-y-2">
                      {workspace.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => onWorkspaceSelect(workspace.id)}
                    className="w-full bg-brand-teal hover:bg-brand-teal-hover text-brand-teal-foreground font-medium py-3 transition-all duration-200"
                  >
                    Choose {workspace.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelection;