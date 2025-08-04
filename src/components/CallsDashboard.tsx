import { useState } from "react";
import { InboundCall, DataVariable, Customer } from "@/types/call";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Clock, Search, Users, Upload, Download, ArrowLeft } from "lucide-react";
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
  const [batchName, setBatchName] = useState("Untitled Batch");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [timing, setTiming] = useState<'immediate' | 'scheduled'>('immediate');

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Parse CSV mock data for demo
      const mockCsvData = [
        { name: "Niv", phone_number: "+38383610429", language: "en" },
        { name: "Antoni", phone_number: "+38383610429", language: "pl" },
        { name: "Thor", phone_number: "+38383610429", language: "de" }
      ];
      setCsvData(mockCsvData);
    }
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

{callType === 'incoming' ? (
        <>
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
        </>
      ) : (
        /* Batch Call Creation Form */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Create a batch call
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Batch Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch name</label>
                <Input
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Untitled Batch"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Select value={selectedPhoneNumber} onValueChange={setSelectedPhoneNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a phone number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1234567890">+1 (234) 567-890</SelectItem>
                    <SelectItem value="+1987654321">+1 (987) 654-321</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select Agent */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Agent</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent1">Sales Agent 1</SelectItem>
                    <SelectItem value="agent2">Sales Agent 2</SelectItem>
                    <SelectItem value="agent3">Support Agent 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipients */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Recipients</label>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>25.0 MB</span>
                    <Badge variant="outline">CSV</Badge>
                    <Badge variant="outline">XLS</Badge>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {!uploadedFile ? (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                      <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                        Upload
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-green-600">
                        File uploaded: {uploadedFile.name}
                      </div>
                      {csvData.length > 0 && (
                        <div className="text-center">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Formatting Info */}
                            <div className="text-left">
                              <h4 className="font-medium mb-2">Formatting</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                The <code className="bg-gray-100 px-1 rounded">phone_number</code> column is required. You can also pass certain <code className="bg-gray-100 px-1 rounded">overrides</code>. Any other columns will be passed as dynamic variables.
                              </p>
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Template
                              </Button>
                            </div>
                            
                            {/* Preview Table */}
                            <div className="text-left">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>name</TableHead>
                                    <TableHead>phone_number</TableHead>
                                    <TableHead>language</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {csvData.map((row, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{row.name}</TableCell>
                                      <TableCell>{row.phone_number}</TableCell>
                                      <TableCell>{row.language}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {!uploadedFile && (
                  <div className="text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No recipients yet</p>
                    <p className="text-xs">Upload a CSV to start adding recipients to this batch call</p>
                  </div>
                )}
              </div>

              {/* Timing */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Timing</label>
                <div className="flex gap-4">
                  <Button
                    variant={timing === 'immediate' ? 'default' : 'outline'}
                    onClick={() => setTiming('immediate')}
                    className="flex-1"
                  >
                    Send immediately
                  </Button>
                  <Button
                    variant={timing === 'scheduled' ? 'default' : 'outline'}
                    onClick={() => setTiming('scheduled')}
                    className="flex-1"
                  >
                    Schedule for later
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline">Test call</Button>
                <Button className="flex-1">Submit a Batch Call</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CallsDashboard;