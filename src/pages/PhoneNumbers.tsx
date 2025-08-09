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
    },
    {
      id: "3",
      number: "+44 20 7946 0958",
      provider: "Twilio",
      assignedAssistant: {
        id: "2",
        name: "UK Sales Assistant"
      },
      status: "active",
      purchaseDate: "2024-01-18",
      monthlyCost: 18.50,
      country: "United Kingdom",
      type: "local"
    },
    {
      id: "4",
      number: "+61 2 8765 4321",
      provider: "SignalWire",
      status: "inactive",
      purchaseDate: "2024-01-22",
      monthlyCost: 22.00,
      country: "Australia",
      type: "local"
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
      <div className={`${isMobile ? 'ml-0' : 'ml-60'} pt-16 min-h-screen bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_23px,rgba(0,0,0,0)_23px),linear-gradient(to_right,hsl(var(--brand-teal)/0.06)_1px,transparent_1px)] bg-[size:100%_24px,24px_100%]`}>
        <div className="p-4 md:p-8">
          <header className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-brand-teal">Phone Numbers</h1>
            <div className="h-0.5 w-24 bg-brand-teal/30 rounded-full mt-2" />
            <p className="text-gray-600 mt-3">Manage your purchased phone numbers and assistant assignments</p>
          </header>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
            <Button 
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full lg:w-auto bg-teal-600 hover:bg-teal-700 text-white"
            >
               <Plus className="w-4 h-4 text-white" />
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
                     className="cursor-pointer hover:bg-teal-600/10 transition-colors duration-200"
                    onClick={() => handlePhoneNumberClick(phoneNumber)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                         <span className="hover:text-teal-600 transition-colors duration-200 text-sm">
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
                        <span className="text-teal-600 text-sm cursor-pointer hover:text-teal-700 hover:scale-105 transition-all duration-200 hover:font-semibold hover:underline inline-block">
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
                            <MoreHorizontal className="w-4 h-4 text-teal-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (phoneNumber.assignedAssistant) {
                                handleUnassign(phoneNumber.id);
                              } else {
                                handlePhoneNumberClick(phoneNumber);
                              }
                            }}
                          >
                            {phoneNumber.assignedAssistant ? "Disconnect" : "Connect"}
                          </DropdownMenuItem>
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