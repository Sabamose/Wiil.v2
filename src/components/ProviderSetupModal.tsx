import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Building2, Calendar, User } from 'lucide-react';
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
    setupType: 'business',
    providerCount: 1,
    providerNames: [''],
  });

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Filter out empty names
      const filteredNames = config.providerNames.filter(name => name.trim() !== '');
      onComplete({
        ...config,
        providerNames: filteredNames,
        providerCount: filteredNames.length,
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSetupTypeChange = (type: 'business' | 'individuals') => {
    setConfig(prev => ({ 
      ...prev, 
      setupType: type,
      providerCount: type === 'business' ? 1 : 2,
      providerNames: type === 'business' ? [''] : ['', ''],
    }));
  };

  const handleProviderCountChange = (count: number) => {
    const newNames = Array(count).fill('').map((_, index) => 
      config.providerNames[index] || ''
    );
    
    setConfig(prev => ({
      ...prev,
      providerCount: count,
      providerNames: newNames,
    }));
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...config.providerNames];
    newNames[index] = name;
    setConfig(prev => ({ ...prev, providerNames: newNames }));
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (config.setupType === 'business') return config.providerNames[0]?.trim() !== '';
    return config.providerNames.every(name => name.trim() !== '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-teal" />
            Setup Your Booking System
          </DialogTitle>
          <DialogDescription>
            Let's configure who provides services in your business.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= step ? 'bg-brand-teal' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Who provides the service? */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Who provides the service?</h3>
                <p className="text-sm text-muted-foreground">
                  Choose how your business is structured for appointments
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Business Option */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    config.setupType === 'business' 
                      ? 'ring-2 ring-brand-teal bg-brand-teal/5' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleSetupTypeChange('business')}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className={`p-2 rounded-lg ${
                        config.setupType === 'business' ? 'bg-brand-teal text-white' : 'bg-gray-100'
                      }`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      Just the business
                    </CardTitle>
                    <CardDescription>
                      Appointments are booked with your business, not specific individuals
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Individual Providers Option */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    config.setupType === 'individuals' 
                      ? 'ring-2 ring-brand-teal bg-brand-teal/5' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleSetupTypeChange('individuals')}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className={`p-2 rounded-lg ${
                        config.setupType === 'individuals' ? 'bg-brand-teal text-white' : 'bg-gray-100'
                      }`}>
                        <Users className="h-5 w-5" />
                      </div>
                      Different people in the business
                    </CardTitle>
                    <CardDescription>
                      Customers can book with specific team members or providers
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Provider Details */}
          {step === 2 && (
            <div className="space-y-6">
              {config.setupType === 'business' ? (
                /* Business Name Input */
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Business Information
                    </CardTitle>
                    <CardDescription>
                      Enter your business name as it will appear in bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={config.providerNames[0] || ''}
                        onChange={(e) => handleNameChange(0, e.target.value)}
                        placeholder="e.g., Johnson Family Clinic, Smith Law Firm"
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Individual Providers Setup */
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      First, choose how many people provide services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Provider Count Selection */}
                    <div className="space-y-3">
                      <Label>Number of service providers</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((count) => (
                          <Button
                            key={count}
                            variant={config.providerCount === count ? "default" : "outline"}
                            className={`h-12 ${config.providerCount === count ? 'bg-brand-teal hover:bg-brand-teal-dark' : ''}`}
                            onClick={() => handleProviderCountChange(count)}
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Provider Names Input */}
                    <div className="space-y-4">
                      <Label>Enter the names of your service providers</Label>
                      <div className="space-y-3">
                        {config.providerNames.slice(0, config.providerCount).map((name, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-brand-teal/10 text-brand-teal rounded-full text-sm font-medium">
                              {index + 1}
                            </div>
                            <Input
                              value={name}
                              onChange={(e) => handleNameChange(index, e.target.value)}
                              placeholder={`e.g., Dr. Sarah Johnson, John Smith`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
            <Button 
              onClick={handleNext} 
              disabled={!canProceed()}
              className="bg-brand-teal hover:bg-brand-teal-dark"
            >
              {step === 2 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderSetupModal;