import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, ArrowLeft, Users } from "lucide-react";
import TestOutboundCallModal from "./TestOutboundCallModal";

interface BatchCallFormProps {
  onBack: () => void;
  onSubmit: (data: {
    batchName: string;
    assistant: {
      id: string;
      name: string;
      phoneNumber?: string;
    };
    csvData: any[];
    timing: 'immediate' | 'scheduled';
  }) => void;
}

const BatchCallForm = ({ onBack, onSubmit }: BatchCallFormProps) => {
  const [batchName, setBatchName] = useState("Untitled Batch");
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [timing, setTiming] = useState<'immediate' | 'scheduled'>('immediate');
  const [testModalOpen, setTestModalOpen] = useState(false);

  // Mock assistants data - would come from useAssistants hook in real implementation
  const mockAssistants = [
    { id: "1", name: "Valeria", phoneNumber: "+1 (234) 567-890" },
    { id: "2", name: "Sales Agent 2", phoneNumber: "+1 (987) 654-321" },
    { id: "3", name: "Support Agent 1", phoneNumber: undefined }, // No phone number
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Parse CSV mock data for demo
      const mockCsvData = [
        { phone_number: "+1 310 417 8775", website: "https://fijiiseafood.com/", address: "10402 S La Cienega Blvd, Inglewood, CA 90304", company_name: "Fiji Seafood Marketing LLC" },
        { phone_number: "+1 657 859 3474", website: "http://kingsseafooddistribution.com/", address: "2615 S Rousselle St, Santa Ana, CA 92707", company_name: "King's Seafood Distribution" },
        { phone_number: "+1 213 629 1213", website: "https://santamonicaseafood.com/about-us/locations/los-angeles-fish-co", address: "420 Stanford Ave, Los Angeles, CA 90013", company_name: "Los Angeles Fish Co" }
      ];
      setCsvData(mockCsvData);
    }
  };

  const handleSubmit = () => {
    const assistant = mockAssistants.find(a => a.id === selectedAssistant);
    if (!assistant) return;

    onSubmit({
      batchName,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        phoneNumber: assistant.phoneNumber,
      },
      csvData,
      timing
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack} className="p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            Call Campaigns
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

          {/* Select Assistant */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Assistant</label>
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger>
                <SelectValue placeholder="Select an assistant" />
              </SelectTrigger>
              <SelectContent>
                {mockAssistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    <div className="flex flex-col">
                      <span>{assistant.name}</span>
                      {assistant.phoneNumber && (
                        <span className="text-xs text-muted-foreground">{assistant.phoneNumber}</span>
                      )}
                      {!assistant.phoneNumber && (
                        <span className="text-xs text-orange-500">No phone number</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAssistant && (() => {
              const assistant = mockAssistants.find(a => a.id === selectedAssistant);
              if (!assistant?.phoneNumber) {
                return (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700 mb-2">
                      This assistant needs a phone number to make calls.
                    </p>
                    <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100">
                      Buy & connect number
                    </Button>
                  </div>
                );
              }
              return (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Phone number:</strong> {assistant.phoneNumber}
                  </p>
                </div>
              );
            })()}
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
                                <TableHead>phone_number</TableHead>
                                <TableHead>website</TableHead>
                                <TableHead>company_name</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {csvData.slice(0, 3).map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.phone_number}</TableCell>
                                  <TableCell>{row.website || '--'}</TableCell>
                                  <TableCell>{row.company_name || '--'}</TableCell>
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
            <Button variant="outline" onClick={() => setTestModalOpen(true)}>Test call</Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Call Modal */}
      <TestOutboundCallModal 
        open={testModalOpen} 
        onOpenChange={setTestModalOpen} 
      />
    </div>
  );
};

export default BatchCallForm;