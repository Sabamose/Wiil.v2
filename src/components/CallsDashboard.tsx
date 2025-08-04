import { useState } from "react";
import { InboundCall, DataVariable, Customer } from "@/types/call";
import { Campaign, CampaignRecipient } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Search, Users } from "lucide-react";
import CallDetails from "./CallDetails";
import CampaignList from "./CampaignList";
import CampaignDetails from "./CampaignDetails";
import BatchCallForm from "./BatchCallForm";

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

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "follow up 1",
    recipients: 6,
    agent: "Valeria_follow up",
    status: "completed",
    completionPercentage: 100,
    duration: "0:15",
    phoneNumber: "+1234567890",
    createdAt: new Date(),
    csvData: [
      { id: "1", phone_number: "+1 310 417 8775", website: "https://fijiiseafood.com/", address: "10402 S La Cienega Blvd, Inglewood, CA 90304", company_name: "Fiji Seafood Marketing LLC", status: "completed" },
      { id: "2", phone_number: "+1 657 859 3474", website: "http://kingsseafooddistribution.com/", address: "2615 S Rousselle St, Santa Ana, CA 92707", company_name: "King's Seafood Distribution", status: "completed" }
    ]
  },
  {
    id: "2",
    name: "LAST BATCH DIRECT",
    recipients: 12,
    agent: "Valeria",
    status: "completed",
    completionPercentage: 100,
    duration: "167:10:39",
    phoneNumber: "+1234567890",
    createdAt: new Date(),
    csvData: []
  },
  {
    id: "3",
    name: "seafood first logistics",
    recipients: 28,
    agent: "Valeria",
    status: "completed",
    completionPercentage: 100,
    duration: "11:13",
    phoneNumber: "+1234567890",
    createdAt: new Date(),
    csvData: []
  }
];

type ViewType = 'incoming' | 'campaigns' | 'create-campaign' | 'campaign-details';

const CallsDashboard = () => {
  const [view, setView] = useState<ViewType>('incoming');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<InboundCall | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

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

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setView('campaign-details');
  };

  const handleCreateCampaign = (data: {
    batchName: string;
    phoneNumber: string;
    agent: string;
    csvData: any[];
    timing: 'immediate' | 'scheduled';
  }) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: data.batchName,
      recipients: data.csvData.length,
      agent: data.agent,
      status: 'completed',
      completionPercentage: 100,
      duration: "0:30",
      phoneNumber: data.phoneNumber,
      createdAt: new Date(),
      csvData: data.csvData.map((row, index) => ({
        id: index.toString(),
        ...row,
        status: Math.random() > 0.2 ? 'completed' : 'no-answer'
      }))
    };
    
    setCampaigns([...campaigns, newCampaign]);
    setView('campaigns');
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

  if (view === 'campaigns') {
    return (
      <CampaignList 
        campaigns={campaigns}
        onCampaignClick={handleCampaignClick}
        onCreateCampaign={() => setView('create-campaign')}
      />
    );
  }

  if (view === 'create-campaign') {
    return (
      <BatchCallForm 
        onBack={() => setView('campaigns')}
        onSubmit={handleCreateCampaign}
      />
    );
  }

  if (view === 'campaign-details' && selectedCampaign) {
    return (
      <CampaignDetails 
        campaign={selectedCampaign}
        onBack={() => {
          setSelectedCampaign(null);
          setView('campaigns');
        }}
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
            variant={view === 'incoming' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('incoming')}
          >
            Incoming Calls
          </Button>
          <Button
            variant={['campaigns', 'create-campaign', 'campaign-details'].includes(view) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('campaigns')}
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