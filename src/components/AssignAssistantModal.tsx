import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PhoneNumber } from "@/types/phoneNumber";

interface AssignAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: PhoneNumber | null;
  onAssignComplete: (phoneNumberId: string, assistantId: string, assistantName: string) => void;
}

const AssignAssistantModal = ({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  onAssignComplete 
}: AssignAssistantModalProps) => {
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  
  // Mock assistant data - in real app this would come from your assistant store/API
  const availableAssistants = [
    { id: "1", name: "Customer Support Bot", status: "active" as const },
    { id: "2", name: "Sales Assistant", status: "active" as const },
    { id: "3", name: "Technical Support", status: "active" as const },
    { id: "4", name: "Booking Assistant", status: "draft" as const },
  ];

  const handleAssign = () => {
    if (selectedAssistant && phoneNumber) {
      const assistant = availableAssistants.find(a => a.id === selectedAssistant);
      if (assistant) {
        onAssignComplete(phoneNumber.id, selectedAssistant, assistant.name);
        setSelectedAssistant("");
        onClose();
      }
    }
  };

  const handleClose = () => {
    setSelectedAssistant("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
            <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
              {phoneNumber?.number}
            </div>
          </div>

          <div>
            <Label htmlFor="assistant" className="text-sm font-medium text-gray-700">
              Select Assistant
            </Label>
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose an assistant..." />
              </SelectTrigger>
              <SelectContent>
                {availableAssistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{assistant.name}</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        assistant.status === "active" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {assistant.status}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedAssistant}
            >
              Assign Assistant
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAssistantModal;