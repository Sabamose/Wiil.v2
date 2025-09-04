import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, Calendar, Settings } from 'lucide-react';
import { ProviderConfiguration } from '@/types/provider';

interface ProviderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: ProviderConfiguration) => void;
}

const ProviderSetupModal: React.FC<ProviderSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ProviderConfiguration>({
    providerCount: 1,
    businessType: 'healthcare',
    clientsRequestSpecific: false,
    allowPreferences: false,
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(config);
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const businessTypes = [
    { value: 'healthcare', label: 'Healthcare (Doctors, Dentists, Therapists)' },
    { value: 'legal', label: 'Legal Services (Lawyers, Consultants)' },
    { value: 'fitness', label: 'Fitness & Wellness (Trainers, Coaches)' },
    { value: 'beauty', label: 'Beauty & Personal Care (Stylists, Spa)' },
    { value: 'automotive', label: 'Automotive Services' },
    { value: 'consulting', label: 'Professional Consulting' },
    { value: 'education', label: 'Education & Training' },
    { value: 'other', label: 'Other Services' },
  ];

  const providerCounts = [
    { value: 1, label: 'Just me (single provider)', description: 'I\'m the only service provider' },
    { value: 2, label: '2-5 providers', description: 'Small team of professionals' },
    { value: 6, label: '6-10 providers', description: 'Medium-sized practice' },
    { value: 11, label: '10+ providers', description: 'Large organization' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-teal" />
            Setup Your Booking System
          </DialogTitle>
          <DialogDescription>
            Let's configure your appointment booking system to match your business needs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= step ? 'bg-brand-teal' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Provider Count */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  How many service providers does your business have?
                </CardTitle>
                <CardDescription>
                  This helps us customize the booking interface for your team size.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={config.providerCount.toString()}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, providerCount: parseInt(value) }))}
                  className="space-y-4"
                >
                  {providerCounts.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                      <RadioGroupItem value={option.value.toString()} id={`count-${option.value}`} className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={`count-${option.value}`} className="font-medium">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Business Type */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  What type of services do you provide?
                </CardTitle>
                <CardDescription>
                  This helps us generate relevant demo data and booking scenarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={config.businessType}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, businessType: value }))}
                  className="space-y-3"
                >
                  {businessTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value}>{type.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Booking Preferences */}
          {step === 3 && config.providerCount > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Preferences</CardTitle>
                <CardDescription>
                  Configure how clients can book with your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="request-specific">Do clients need to book with specific providers?</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable this if clients have preferred providers or need specialized services.
                    </p>
                  </div>
                  <Switch
                    id="request-specific"
                    checked={config.clientsRequestSpecific}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, clientsRequestSpecific: checked }))
                    }
                  />
                </div>

                {config.clientsRequestSpecific && (
                  <div className="flex items-center justify-between pl-4 border-l-2 border-brand-teal/20">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-preferences">Allow clients to request preferred providers?</Label>
                      <p className="text-sm text-muted-foreground">
                        Clients can request a specific provider but accept alternatives if unavailable.
                      </p>
                    </div>
                    <Switch
                      id="allow-preferences"
                      checked={config.allowPreferences}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, allowPreferences: checked }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Single Provider Confirmation */}
          {step === 3 && config.providerCount === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Single Provider Setup</CardTitle>
                <CardDescription>
                  Perfect! We'll set up a streamlined booking system for your solo practice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-brand-teal/5 rounded-lg border border-brand-teal/20">
                  <p className="text-sm">
                    Your booking calendar will show all appointments assigned to you. 
                    You can always add team members later if your business grows.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button onClick={handleNext} className="bg-brand-teal hover:bg-brand-teal-dark">
              {step === 3 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderSetupModal;