import { useState } from "react";
import { X, Check } from "lucide-react";
import { PhoneNumber, PurchasePhoneNumberRequest } from "@/types/phoneNumber";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
    console.log('Purchase button clicked, selectedNumber:', selectedNumber);
    if (!selectedNumber) {
      console.log('No number selected, returning early');
      return;
    }

    setIsLoading(true);
    console.log('Starting purchase simulation...');
    
    // Simulate API call
    setTimeout(() => {
      console.log('Purchase simulation completed');
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
        
        onPurchaseComplete(newPhoneNumber);
        
        toast({
          title: "Phone Number Purchased!",
          description: `${selectedNumber} has been successfully purchased and connected to your assistant.`,
        });
      }
      setIsLoading(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[60]">
        <DialogHeader>
          <DialogTitle>Buy Phone Number</DialogTitle>
          <DialogDescription>
            Select a provider and phone number for your assistant. The number will be configured automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  console.log('SignalWire provider selected');
                  setProvider("SignalWire");
                }}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  provider === "SignalWire" 
                    ? "border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06] text-[hsl(var(--brand-teal))]" 
                    : "border-border hover:border-[hsl(var(--brand-teal))]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SignalWire</div>
                    <div className="text-sm text-muted-foreground">Recommended</div>
                  </div>
                  {provider === "SignalWire" && <Check className="w-5 h-5 text-[hsl(var(--brand-teal))]" />}
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Twilio provider selected');
                  setProvider("Twilio");
                }}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  provider === "Twilio" 
                    ? "border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06] text-[hsl(var(--brand-teal))]" 
                    : "border-border hover:border-[hsl(var(--brand-teal))]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Twilio</div>
                    <div className="text-sm text-muted-foreground">Alternative</div>
                  </div>
                  {provider === "Twilio" && <Check className="w-5 h-5 text-[hsl(var(--brand-teal))]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <Select value={country} onValueChange={(value) => {
              console.log('Country changed to:', value);
              setCountry(value);
            }}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
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
                type="button"
                onClick={() => {
                  console.log('Local number type selected');
                  setNumberType("local");
                }}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  numberType === "local" 
                    ? "border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06] text-[hsl(var(--brand-teal))]" 
                    : "border-border hover:border-[hsl(var(--brand-teal))]/50"
                }`}
              >
                <div className="font-medium">Local</div>
                <div className="text-sm text-muted-foreground">$15/month</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Toll-free number type selected');
                  setNumberType("toll-free");
                }}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  numberType === "toll-free" 
                    ? "border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06] text-[hsl(var(--brand-teal))]" 
                    : "border-border hover:border-[hsl(var(--brand-teal))]/50"
                }`}
              >
                <div className="font-medium">Toll-Free</div>
                <div className="text-sm text-muted-foreground">$25/month</div>
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
                  type="button"
                  onClick={() => {
                    console.log('Number selected:', number.number);
                    setSelectedNumber(number.number);
                  }}
                  className={`w-full p-3 border rounded-lg text-left flex justify-between items-center transition-colors ${
                    selectedNumber === number.number 
                      ? "border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06] text-[hsl(var(--brand-teal))]" 
                      : "border-border hover:border-[hsl(var(--brand-teal))]/50"
                  }`}
                >
                  <span className="font-medium">{number.number}</span>
                  <span className="text-sm text-muted-foreground">${number.cost}/month</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="brand-outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="brand"
              onClick={() => {
                console.log('Buy Number button clicked, selectedNumber:', selectedNumber);
                if (selectedNumber) {
                  handlePurchase();
                }
              }}
              disabled={!selectedNumber || isLoading}
            >
              {isLoading ? "Purchasing..." : "Buy Number"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneNumberPurchaseModal;