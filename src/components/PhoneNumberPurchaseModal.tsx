import { useState } from "react";
import { X, Check } from "lucide-react";
import { PhoneNumber, PurchasePhoneNumberRequest } from "@/types/phoneNumber";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhoneNumberPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (phoneNumber: PhoneNumber) => void;
}

const PhoneNumberPurchaseModal = ({ isOpen, onClose, onPurchaseComplete }: PhoneNumberPurchaseModalProps) => {
  const { toast } = useToast();
  const [provider, setProvider] = useState<"SignalWire" | "Twilio">("SignalWire");
  const [country, setCountry] = useState("US");
  const [numberType, setNumberType] = useState<"local" | "toll-free">("local");
  const [selectedNumber, setSelectedNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock available numbers
  const availableNumbers = [
    { number: "+1 (555) 234-5678", cost: 15.00 },
    { number: "+1 (555) 345-6789", cost: 15.00 },
    { number: "+1 (555) 456-7890", cost: 15.00 },
    { number: "+1 (800) 123-4567", cost: 25.00 },
    { number: "+1 (800) 234-5678", cost: 25.00 },
  ];

  const filteredNumbers = availableNumbers.filter(num => 
    numberType === "toll-free" ? num.number.includes("(800)") : !num.number.includes("(800)")
  );

  const handlePurchase = async () => {
    if (!selectedNumber) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const selectedNumberData = filteredNumbers.find(n => n.number === selectedNumber);
      if (selectedNumberData) {
        const newPhoneNumber: PhoneNumber = {
          id: Date.now().toString(),
          number: selectedNumber,
          provider,
          status: "active",
          purchaseDate: new Date().toISOString().split('T')[0],
          monthlyCost: selectedNumberData.cost,
          country: "United States",
          type: numberType
        };
        
        toast({
          title: "Phone Number Purchased!",
          description: `${selectedNumber} has been successfully purchased and connected to your assistant.`,
          duration: 5000,
        });
        
        onPurchaseComplete(newPhoneNumber);
      }
      setIsLoading(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Buy Phone Number</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider("SignalWire")}
                className={`p-4 border rounded-lg text-left ${
                  provider === "SignalWire" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SignalWire</div>
                    <div className="text-sm text-gray-600">Recommended</div>
                  </div>
                  {provider === "SignalWire" && <Check className="w-5 h-5 text-blue-500" />}
                </div>
              </button>
              <button
                onClick={() => setProvider("Twilio")}
                className={`p-4 border rounded-lg text-left ${
                  provider === "Twilio" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Twilio</div>
                    <div className="text-sm text-gray-600">Alternative</div>
                  </div>
                  {provider === "Twilio" && <Check className="w-5 h-5 text-blue-500" />}
                </div>
              </button>
            </div>
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Number Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNumberType("local")}
                className={`p-3 border rounded-lg text-center ${
                  numberType === "local" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">Local</div>
                <div className="text-sm text-gray-600">$15/month</div>
              </button>
              <button
                onClick={() => setNumberType("toll-free")}
                className={`p-3 border rounded-lg text-center ${
                  numberType === "toll-free" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">Toll-Free</div>
                <div className="text-sm text-gray-600">$25/month</div>
              </button>
            </div>
          </div>

          {/* Available Numbers */}
          <div>
            <label className="block text-sm font-medium mb-2">Available Numbers</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredNumbers.map((number) => (
                <button
                  key={number.number}
                  onClick={() => setSelectedNumber(number.number)}
                  className={`w-full p-3 border rounded-lg text-left flex justify-between items-center ${
                    selectedNumber === number.number 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium">{number.number}</span>
                  <span className="text-sm text-gray-600">${number.cost}/month</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={!selectedNumber || isLoading}
          >
            {isLoading ? "Purchasing..." : "Buy Number"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberPurchaseModal;