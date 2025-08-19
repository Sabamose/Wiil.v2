import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Code2, Check } from 'lucide-react';

interface WorkspaceOption {
  id: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  primaryFeature: string;
  features: string[];
}

const workspaceOptions: WorkspaceOption[] = [
  {
    id: 'business',
    title: 'Business',
    tagline: 'For growing companies',
    icon: Building2,
    primaryFeature: 'Team collaboration & analytics',
    features: [
      'Simple Assistant Setup',
      'Essential Assistant Integrations',
      'Personal Knowledge Sources',
      'Analytics',
      'Campaign Management'
    ]
  },
  {
    id: 'developer',
    title: 'Developer',
    tagline: 'For individual & more complex projects',
    icon: Code2,
    primaryFeature: 'Full API access & tools',
    features: [
      'Full API access',
      'Custom integrations',
      'Development tools',
      'Advanced Customization',
      'Project Key Management',
      'Technical Documentation'
    ]
  }
];

interface WorkspaceSelectionProps {
  onWorkspaceSelect: (workspaceId: string) => void;
}

const WorkspaceSelection: React.FC<WorkspaceSelectionProps> = ({ onWorkspaceSelect }) => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Lovable-style teal sunrise background - subtle with edge blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-600/40 via-teal-200/20 to-white"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-radial from-teal-500/30 via-transparent to-transparent" style={{ backgroundPosition: 'center 80%', backgroundSize: '60% 80%' }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 via-transparent to-white/95"></div>
      
      {/* Content overlay */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What best describes your project?
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {workspaceOptions.map((workspace) => {
            const IconComponent = workspace.icon;
            
            return (
              <Card 
                key={workspace.id}
                className="group transition-all duration-200 hover:shadow-md border border-border bg-white rounded-xl"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-brand-teal" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {workspace.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {workspace.tagline}
                  </p>

                  <div className="mb-6 space-y-2">
                    {workspace.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-brand-teal flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => onWorkspaceSelect(workspace.id)}
                    className="w-full bg-brand-teal hover:bg-brand-teal-hover text-brand-teal-foreground font-medium"
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