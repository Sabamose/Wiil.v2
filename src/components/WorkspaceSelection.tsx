import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Code2 } from 'lucide-react';

interface WorkspaceOption {
  id: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  primaryFeature: string;
}

const workspaceOptions: WorkspaceOption[] = [
  {
    id: 'enterprise',
    title: 'Enterprise',
    tagline: 'Scale your business',
    icon: Building2,
    primaryFeature: 'Team collaboration & analytics'
  },
  {
    id: 'developer',
    title: 'Developer',
    tagline: 'Build & customize',
    icon: Code2,
    primaryFeature: 'Full API access & tools'
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

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {workspaceOptions.map((workspace) => {
            const IconComponent = workspace.icon;
            
            return (
              <Card 
                key={workspace.id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand-teal/5 hover:-translate-y-0.5 border border-border/30 hover:border-brand-teal/20 bg-white/60 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-teal/10 to-brand-teal/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <IconComponent className="h-10 w-10 text-brand-teal" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {workspace.title}
                  </h3>
                  <p className="text-sm text-brand-teal font-medium mb-3">
                    {workspace.tagline}
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    {workspace.primaryFeature}
                  </p>

                  <Button
                    onClick={() => onWorkspaceSelect(workspace.id)}
                    className="w-full bg-brand-teal hover:bg-brand-teal-hover text-brand-teal-foreground font-medium py-2.5 transition-all duration-200 group-hover:shadow-md"
                  >
                    Get Started
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