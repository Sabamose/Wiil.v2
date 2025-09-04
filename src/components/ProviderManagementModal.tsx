import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User, Mail, Phone, Clock } from 'lucide-react';
import { ServiceProvider, WorkingHours } from '@/types/provider';
import { useProviders } from '@/hooks/useProviders';
import { useToast } from '@/hooks/use-toast';

interface ProviderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProviderManagementModal: React.FC<ProviderManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { providers, createProvider } = useProviders();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    is_active: true,
    working_hours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: null,
      sunday: null,
    } as WorkingHours,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProvider.name) {
      toast({
        title: "Name required",
        description: "Please enter a provider name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProvider.mutateAsync(newProvider);
      setNewProvider({
        name: '',
        specialization: '',
        email: '',
        phone: '',
        is_active: true,
        working_hours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: null,
          sunday: null,
        },
      });
      setShowAddForm(false);
    } catch (error) {
      // Error handled by the mutation
    }
  };

  const formatWorkingHours = (hours: WorkingHours) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workingDays = days.filter(day => hours[day as keyof WorkingHours]);
    
    if (workingDays.length === 0) return 'No hours set';
    if (workingDays.length === 5 && 
        workingDays.includes('monday') && 
        workingDays.includes('friday') && 
        !workingDays.includes('saturday') && 
        !workingDays.includes('sunday')) {
      const firstDay = hours.monday;
      return firstDay ? `Mon-Fri ${firstDay.start}-${firstDay.end}` : 'Mon-Fri';
    }
    
    return `${workingDays.length} days/week`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-teal" />
            Manage Service Providers
          </DialogTitle>
          <DialogDescription>
            Add and manage your team of service providers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Provider Button */}
          {!showAddForm && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Current Providers ({providers.length})</h3>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>
          )}

          {/* Add Provider Form */}
          {showAddForm && (
            <Card className="border-brand-teal/20">
              <CardHeader>
                <CardTitle className="text-lg">Add New Provider</CardTitle>
                <CardDescription>
                  Enter the details for the new service provider.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Dr. John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={newProvider.specialization}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="General Medicine, Cardiology, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newProvider.email}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="doctor@clinic.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newProvider.phone}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={newProvider.is_active}
                      onCheckedChange={(checked) => setNewProvider(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="active">Active (can receive new bookings)</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProvider.isPending}
                      className="bg-brand-teal hover:bg-brand-teal-dark text-white"
                    >
                      {createProvider.isPending ? 'Adding...' : 'Add Provider'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Providers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {provider.name}
                        {!provider.is_active && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </CardTitle>
                      {provider.specialization && (
                        <CardDescription className="mt-1">
                          {provider.specialization}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {provider.email}
                    </div>
                  )}
                  {provider.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {provider.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {formatWorkingHours(provider.working_hours)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {providers.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers yet</h3>
              <p className="text-gray-500 mb-4">Add your first service provider to get started.</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Provider
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderManagementModal;