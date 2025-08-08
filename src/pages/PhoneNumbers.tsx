import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import PhoneNumberPurchaseModal from "@/components/PhoneNumberPurchaseModal";
import AssignAssistantModal from "@/components/AssignAssistantModal";
import { PhoneNumber } from "@/types/phoneNumber";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
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
  const isMobile = useIsMobile();
  const { toast } = useToast();
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
    const phoneNumber = phoneNumbers.find(num => num.id === numberId);
    setPhoneNumbers(phoneNumbers.map(num => 
      num.id === numberId 
        ? { ...num, assignedAssistant: undefined }
        : num
    ));
    
    toast({
      title: "Assistant Disconnected",
      description: `Assistant has been disconnected from ${phoneNumber?.number}`,
    });
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
    const phoneNumber = phoneNumbers.find(num => num.id === phoneNumberId);
    setPhoneNumbers(phoneNumbers.map(num => 
      num.id === phoneNumberId 
        ? { ...num, assignedAssistant: { id: assistantId, name: assistantName } }
        : num
    ));
    setIsAssignModalOpen(false);
    setSelectedPhoneNumber(null);
    
    toast({
      title: "Assistant Connected",
      description: `${assistantName} has been connected to ${phoneNumber?.number}`,
    });
  };

  return (
    <div>
      <Navigation />
      <div className={`${isMobile ? 'ml-0' : 'ml-60'} pt-16 min-h-screen bg-gray-50`}>
        <div className="p-4 md:p-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Phone Numbers</h1>
              <p className="text-gray-600 mt-1">Manage your purchased phone numbers and assistant assignments</p>
            </div>
            <Button 
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full lg:w-auto bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Buy Phone Number
            </Button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Phone Number</TableHead>
                    <TableHead className="hidden md:table-cell">Region</TableHead>
                    <TableHead className="min-w-[120px]">Assistant</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Monthly Cost</TableHead>
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
                      <div className="flex flex-col gap-1">
                        <span className="hover:text-blue-600 transition-colors duration-200 text-sm">
                          {phoneNumber.number}
                        </span>
                        <span className="md:hidden text-xs text-gray-500">
                          {phoneNumber.provider}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {phoneNumber.country === "United States" ? "US/Canada" : phoneNumber.country}
                    </TableCell>
                    <TableCell>
                      {phoneNumber.assignedAssistant ? (
                        <span className="text-gray-900 text-sm">{phoneNumber.assignedAssistant.name}</span>
                      ) : (
                        <span className="text-teal-600 hover:text-teal-700 transition-colors duration-200 text-sm font-medium cursor-pointer underline decoration-teal-300 decoration-dashed underline-offset-2 hover:decoration-solid">
                          {isMobile ? "Connect" : "Click here to Connect Assistant"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        phoneNumber.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {phoneNumber.status === "active" ? "Connected" : "Not Connected"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">${phoneNumber.monthlyCost.toFixed(2)}</TableCell>
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
                          {phoneNumber.assignedAssistant && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleUnassign(phoneNumber.id);
                            }}>
                              Disconnect Assistant
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