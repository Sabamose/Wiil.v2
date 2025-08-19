import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, Code2, ChevronDown, Check } from 'lucide-react';

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
      'Multi-user dashboard access',
      'Advanced analytics & reporting', 
      'Team management tools',
      'Priority customer support',
      'Custom integrations',
      'Usage monitoring'
    ]
  },
  {
    id: 'developer',
    title: 'Developer',
    tagline: 'For individual & more complex projects',
    icon: Code2,
    primaryFeature: 'Full API access & tools',
    features: [
      'Complete API documentation',
      'Custom webhook endpoints',
      'Advanced configuration options',
      'Development tools & SDKs',
      'Debugging & testing suite',
      'Technical community access'
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
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand-teal/5 hover:-translate-y-0.5 border border-border/30 hover:border-brand-teal/20 bg-white/60 backdrop-blur-sm rounded-3xl"
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-sm text-brand-teal hover:text-brand-teal-hover hover:bg-brand-teal/5 mb-4 p-2"
                      >
                        View all features
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-80 bg-white/95 backdrop-blur-sm border border-border/30 z-50"
                      align="center"
                    >
                      {workspace.features.map((feature, index) => (
                        <DropdownMenuItem 
                          key={index}
                          className="flex items-center gap-2 py-2 px-3 hover:bg-brand-teal/10 rounded-lg"
                        >
                          <Check className="h-4 w-4 text-brand-teal" />
                          <span className="text-sm">{feature}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

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