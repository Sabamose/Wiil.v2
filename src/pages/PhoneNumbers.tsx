import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import PhoneNumberPurchaseModal from "@/components/PhoneNumberPurchaseModal";
import AssignAssistantModal from "@/components/AssignAssistantModal";
import { PhoneNumber } from "@/types/phoneNumber";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PhoneNumbers = () => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
    {
      id: "1",
      number: "+1 (555) 123-4567",
      provider: "SignalWire",
      assignedAssistant: {
        id: "1",
        name: "Customer Support Bot"
      },
      status: "active",
      purchaseDate: "2024-01-15",
      monthlyCost: 15.00,
      country: "United States",
      type: "local"
    },
    {
      id: "2", 
      number: "+1 (800) 555-9876",
      provider: "Twilio",
      status: "inactive",
      purchaseDate: "2024-01-20",
      monthlyCost: 25.00,
      country: "United States",
      type: "toll-free"
    }
  ]);

  const handlePurchaseComplete = (newNumber: PhoneNumber) => {
    setPhoneNumbers([...phoneNumbers, newNumber]);
    setIsPurchaseModalOpen(false);
  };

  const handleUnassign = (numberId: string) => {
    setPhoneNumbers(phoneNumbers.map(num => 
      num.id === numberId 
        ? { ...num, assignedAssistant: undefined }
        : num
    ));
  };

  const handleToggleStatus = (numberId: string) => {
    setPhoneNumbers(phoneNumbers.map(num => 
      num.id === numberId 
        ? { ...num, status: num.status === "active" ? "inactive" : "active" }
        : num
    ));
  };

  const handlePhoneNumberClick = (phoneNumber: PhoneNumber) => {
    setSelectedPhoneNumber(phoneNumber);
    setIsAssignModalOpen(true);
  };

  const handleAssignComplete = (phoneNumberId: string, assistantId: string, assistantName: string) => {
    setPhoneNumbers(phoneNumbers.map(num => 
      num.id === phoneNumberId 
        ? { ...num, assignedAssistant: { id: assistantId, name: assistantName } }
        : num
    ));
    setIsAssignModalOpen(false);
    setSelectedPhoneNumber(null);
  };

  return (
    <div>
      <Navigation />
      <div className="ml-60 pt-16 min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Phone Numbers</h1>
              <p className="text-gray-600 mt-1">Manage your purchased phone numbers and assistant assignments</p>
            </div>
            <Button 
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buy Phone Number
            </Button>
          </div>

          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Assigned Assistant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phoneNumbers.map((phoneNumber) => (
                  <TableRow 
                    key={phoneNumber.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => handlePhoneNumberClick(phoneNumber)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="hover:text-blue-600 transition-colors duration-200">
                          {phoneNumber.number}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                    </TableCell>
                    <TableCell>{phoneNumber.provider}</TableCell>
                    <TableCell>
                      {phoneNumber.assignedAssistant ? (
                        <span className="text-gray-900">{phoneNumber.assignedAssistant.name}</span>
                      ) : (
                        <span className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                          Click to assign assistant
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        phoneNumber.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {phoneNumber.status}
                      </span>
                    </TableCell>
                    <TableCell>${phoneNumber.monthlyCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(phoneNumber.id);
                          }}>
                            {phoneNumber.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          {phoneNumber.assignedAssistant && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleUnassign(phoneNumber.id);
                            }}>
                              Unassign Assistant
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Delete Number
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <PhoneNumberPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />

      <AssignAssistantModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        phoneNumber={selectedPhoneNumber}
        onAssignComplete={handleAssignComplete}
      />
    </div>
  );
};

export default PhoneNumbers;