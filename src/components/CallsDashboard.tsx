import { useState } from "react";
import { InboundCall, DataVariable, Customer } from "@/types/call";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Clock, Search, Users } from "lucide-react";
import CallDetails from "./CallDetails";

// Mock customers data
const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "John Smith",
    phoneNumber: "+1 (555) 123-4567",
    email: "john@example.com",
    company: "Tech Corp"
  },
  {
    id: "c2", 
    name: "Sarah Johnson",
    phoneNumber: "+1 (555) 987-6543",
    email: "sarah@demo.com",
    company: "Marketing Solutions"
  },
  {
    id: "c3",
    name: "Mike Wilson", 
    phoneNumber: "+1 (555) 456-7890",
    email: "mike@startup.com",
    company: "StartupXYZ"
  },
  {
    id: "c4",
    name: "Emily Davis",
    phoneNumber: "+1 (555) 321-0987", 
    email: "emily@retail.com",
    company: "Retail Plus"
  },
  {
    id: "c5",
    name: "David Brown",
    phoneNumber: "+1 (555) 654-3210",
    email: "david@consulting.com",
    company: "Consulting Group"
  }
];

// Mock calls data for when clicking on customers
const mockCalls: InboundCall[] = [
  {
    id: "1",
    customer: mockCustomers[0],
    status: "completed",
    duration: 480,
    timestamp: new Date("2024-01-15T10:30:00"),
    transcript: "Customer called asking about product pricing and availability...",
    summary: "Customer inquiry about pricing for enterprise package. Interested in annual subscription.",
    collectedData: {
      budget: "$50,000",
      timeline: "Q2 2024", 
      companySize: "100+ employees"
    }
  }
];

const mockDataVariables: DataVariable[] = [
  { id: "1", name: "Budget", type: "text", description: "Customer's budget range", required: true },
  { id: "2", name: "Timeline", type: "text", description: "Expected implementation timeline", required: false },
  { id: "3", name: "Company Size", type: "text", description: "Number of employees", required: true },
  { id: "4", name: "Decision Maker", type: "boolean", description: "Is this person the decision maker?", required: false }
];

const CallsDashboard = () => {
  const [callType, setCallType] = useState<'incoming' | 'outgoing'>('incoming');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<InboundCall | null>(null);

  const handleCustomerClick = (customer: Customer) => {
    // Find a call for this customer or create a mock one
    const customerCall = mockCalls.find(call => call.customer.id === customer.id) || {
      id: `call-${customer.id}`,
      customer,
      status: 'completed' as const,
      duration: 300,
      timestamp: new Date(),
      transcript: "Sample transcript for this customer...",
      summary: "Customer interaction summary"
    };
    setSelectedCall(customerCall);
  };

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedCall) {
    return (
      <CallDetails 
        call={selectedCall} 
        dataVariables={mockDataVariables}
        onBack={() => setSelectedCall(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant={callType === 'incoming' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCallType('incoming')}
          >
            Incoming Calls
          </Button>
          <Button
            variant={callType === 'outgoing' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCallType('outgoing')}
          >
            Outgoing Calls
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers by name, phone, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customer List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCustomerClick(customer)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {customer.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.company || '-'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallsDashboard;