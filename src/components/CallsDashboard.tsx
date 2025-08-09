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
import OutboundCallDetails from "./OutboundCallDetails";

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
    name: "SEO Audit Services",
    recipients: 6,
    assistant: {
      id: "1",
      name: "Valeria_follow up",
      phoneNumber: "+1234567890"
    },
    status: "completed",
    completionPercentage: 100,
    duration: "0:15",
    createdAt: new Date(),
    csvData: [
      { id: "1", phone_number: "+1 310 417 8775", website: "https://fijiiseafood.com/", address: "10402 S La Cienega Blvd", company_name: "Fiji Seafood Marketing LLC", status: "completed" },
      { id: "2", phone_number: "+1 657 859 3474", website: "http://kingsseafooddistribution.com/", address: "2615 S Rousselle St", company_name: "King's Seafood Distribution", status: "completed" }
    ]
  },
  {
    id: "2",
    name: "Food Delivery Partnership",
    recipients: 12,
    assistant: {
      id: "1",
      name: "Valeria",
      phoneNumber: "+1234567890"
    },
    status: "completed",
    completionPercentage: 100,
    duration: "167:10:39",
    createdAt: new Date(),
    csvData: [
      { id: "1", phone_number: "+1 555 123 4567", business_name: "Mario's Pizza", address: "123 Main St", city: "Los Angeles", status: "completed" },
      { id: "2", phone_number: "+1 555 987 6543", business_name: "Taco Bell", address: "456 Oak Ave", city: "Beverly Hills", status: "no-answer" }
    ]
  },
  {
    id: "3",
    name: "Cloud Software Demo",
    recipients: 28,
    assistant: {
      id: "1",
      name: "Valeria",
      phoneNumber: "+1234567890"
    },
    status: "completed",
    completionPercentage: 100,
    duration: "11:13",
    createdAt: new Date(),
    csvData: [
      { id: "1", phone_number: "+1 555 111 2222", company: "StartupXYZ", founder: "John Doe", industry: "SaaS", funding: "Series A", status: "completed" },
      { id: "2", phone_number: "+1 555 333 4444", company: "TechCorp", founder: "Jane Smith", industry: "AI", funding: "Seed", status: "completed" }
    ]
  }
];

type ViewType = 'incoming' | 'campaigns' | 'create-campaign' | 'campaign-details' | 'outbound-call-details';

const CallsDashboard = () => {
  const [view, setView] = useState<ViewType>('incoming');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<InboundCall | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedOutboundCall, setSelectedOutboundCall] = useState<any>(null);
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
    assistant: {
      id: string;
      name: string;
      phoneNumber?: string;
    };
    csvData: any[];
    timing: 'immediate' | 'scheduled';
    scheduledDate?: Date;
    scheduledTime?: string;
    timezone?: string;
  }) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: data.batchName,
      recipients: data.csvData.length,
      assistant: data.assistant,
      status: data.timing === 'immediate' ? 'in-progress' : 'pending',
      completionPercentage: data.timing === 'immediate' ? 25 : 0,
      duration: data.timing === 'immediate' ? "0:05" : "0:00",
      createdAt: new Date(),
      csvData: data.csvData.map((row, index) => ({
        id: index.toString(),
        ...row,
        status: data.timing === 'immediate' ? 
          (Math.random() > 0.7 ? 'completed' : 'pending') : 'pending'
      }))
    };
    
    setCampaigns([newCampaign, ...campaigns]);
    setView('campaigns');
  };

  const handleRecipientClick = (recipient: any) => {
    // Create mock call data based on recipient
    const mockOutboundCall = {
      id: recipient.id,
      recipientName: recipient.company_name || "Contact",
      phoneNumber: recipient.phone_number,
      duration: "0:45",
      status: recipient.status as 'completed' | 'failed' | 'no-answer',
      timestamp: new Date(),
      summary: `Outbound call to ${recipient.company_name || recipient.phone_number}. Agent attempted to discuss logistics and freight solutions.`,
      criteria: [
        {
          name: "Get info",
          status: recipient.status === 'completed' ? 'success' : 'failure' as 'success' | 'failure',
          description: recipient.status === 'completed' 
            ? "Successfully obtained contact information and company details."
            : "The agent was unable to gather required contact information during the conversation."
        },
        {
          name: "Interest",
          status: recipient.status === 'completed' ? 'success' : 'unknown' as 'success' | 'unknown',
          description: recipient.status === 'completed'
            ? "Contact showed interest in our logistics solutions."
            : "Could not determine level of interest due to call completion issues."
        }
      ],
      dataCollected: {
        phoneNumber: recipient.phone_number,
        website: recipient.website || null,
        address: recipient.address || null,
        companyName: recipient.company_name || null
      },
      transcript: `Agent: Hello, this is calling from Armstrong Transport. May I speak with someone regarding your logistics needs?\n\nContact: Yes, this is [Contact Name].\n\nAgent: Great! I wanted to discuss our freight solutions that might benefit your business...\n\n[Call continues...]`
    };
    
    setSelectedOutboundCall(mockOutboundCall);
    setView('outbound-call-details');
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
        onBack={() => setView('incoming')}
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

  if (view === 'outbound-call-details' && selectedOutboundCall) {
    return (
      <OutboundCallDetails 
        call={selectedOutboundCall}
        onBack={() => {
          setSelectedOutboundCall(null);
          setView('campaign-details');
        }}
      />
    );
  }

  if (view === 'campaign-details' && selectedCampaign) {
    return (
      <CampaignDetails 
        campaign={selectedCampaign}
        onRecipientClick={handleRecipientClick}
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
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant={view === 'incoming' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('incoming')}
            className={view === 'incoming' ? 'bg-brand-teal hover:bg-brand-teal/90 text-white' : 'hover:bg-brand-teal/10 hover:text-brand-teal'}
          >
            Incoming Calls
          </Button>
          <Button
            variant={['campaigns', 'create-campaign', 'campaign-details'].includes(view) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('campaigns')}
            className={['campaigns', 'create-campaign', 'campaign-details'].includes(view) ? 'bg-brand-teal hover:bg-brand-teal/90 text-white' : 'hover:bg-brand-teal/10 hover:text-brand-teal'}
          >
            Outgoing Calls
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-600 h-4 w-4" />
        <Input
          placeholder="Search customers by name, phone, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 focus:ring-teal-600/20 focus:border-teal-600/50"
        />
      </div>

      {/* Customer List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-teal">
            <Users className="h-5 w-5 text-teal-600" />
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
                  className="cursor-pointer hover:bg-teal-600/10 hover:shadow-sm transition-all duration-200"
                  onClick={() => handleCustomerClick(customer)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-teal-600" />
                      {customer.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.company || '-'}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-teal-600/10 hover:text-teal-600 hover:border-teal-600/30"
                    >
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