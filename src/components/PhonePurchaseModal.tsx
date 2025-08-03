import React, { useState } from 'react';
import { X, Search, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhonePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (phoneNumber: string) => void;
}

export const PhonePurchaseModal: React.FC<PhonePurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchaseComplete,
}) => {
  const [selectedProvider, setSelectedProvider] = useState('twilio');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedType, setSelectedType] = useState('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);

  const providers = [
    { id: 'twilio', name: 'Twilio', logo: '🔥' },
    { id: 'vonage', name: 'Vonage', logo: '📞' },
  ];

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  ];

  const numberTypes = [
    { id: 'local', name: 'Local', description: 'Regular local phone numbers' },
    { id: 'tollfree', name: 'Toll Free', description: '800, 888, 877 numbers' },
  ];

  // Mock available numbers
  const availableNumbers = [
    { number: '+1 (555) 123-4567', price: '$1.00/month', region: 'New York, NY' },
    { number: '+1 (555) 234-5678', price: '$1.00/month', region: 'Los Angeles, CA' },
    { number: '+1 (555) 345-6789', price: '$1.00/month', region: 'Chicago, IL' },
    { number: '+1 (555) 456-7890', price: '$1.00/month', region: 'Houston, TX' },
    { number: '+1 (555) 567-8901', price: '$1.00/month', region: 'Miami, FL' },
    { number: '+1 (555) 678-9012', price: '$1.00/month', region: 'Seattle, WA' },
  ];

  const handlePurchase = () => {
    if (selectedNumber) {
      onPurchaseComplete(selectedNumber);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold">Purchase Phone Number</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Provider Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Select Provider</h3>
            <div className="flex gap-4">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`flex items-center gap-3 p-4 border rounded-lg ${
                    selectedProvider === provider.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="text-2xl">{provider.logo}</span>
                  <span className="font-medium">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Country and Type Selection */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Country</h3>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Number Type</h3>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              >
                {numberTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Search Numbers</h3>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by area code or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Available Numbers */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Available Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableNumbers.map((number) => (
                <div
                  key={number.number}
                  onClick={() => setSelectedNumber(number.number)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedNumber === number.number
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{number.number}</div>
                      <div className="text-sm text-gray-500">{number.region}</div>
                      <div className="text-sm font-medium text-green-600">{number.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedNumber && `Selected: ${selectedNumber}`}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!selectedNumber}
              className="bg-black text-white hover:bg-gray-800"
            >
              Purchase Number
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};