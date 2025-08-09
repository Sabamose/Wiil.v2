import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Upload, Download, ArrowLeft, Users, FileText, CheckCircle, AlertCircle, X, Info, CalendarIcon, Clock, Globe } from "lucide-react";
import TestOutboundCallModal from "./TestOutboundCallModal";
import Papa from "papaparse";

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
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [uploadStatus, setUploadStatus] = useState<{
    loading: boolean;
    validRecipients: number;
    invalidRecipients: number;
    duplicatesRemoved: number;
    errors: string[];
  }>({
    loading: false,
    validRecipients: 0,
    invalidRecipients: 0,
    duplicatesRemoved: 0,
    errors: []
  });

  // Mock assistants data - would come from useAssistants hook in real implementation
  const mockAssistants = [
    { id: "1", name: "Valeria", phoneNumber: "+1 (234) 567-890" },
    { id: "2", name: "Sales Agent 2", phoneNumber: "+1 (987) 654-321" },
    { id: "3", name: "Support Agent 1", phoneNumber: undefined }, // No phone number
  ];

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic E.164-ish validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone?.trim() || '');
  };

  const processCSVData = (data: any[]) => {
    const phoneNumbers = new Set<string>();
    const validRecipients: any[] = [];
    const invalidRecipients: any[] = [];
    let duplicatesRemoved = 0;

    data.forEach((row) => {
      const phoneNumber = row.phone_number || row.phone || row.Phone || row.PhoneNumber;
      
      if (!phoneNumber) {
        invalidRecipients.push({ ...row, error: 'Missing phone number' });
        return;
      }

      if (!validatePhoneNumber(phoneNumber)) {
        invalidRecipients.push({ ...row, error: 'Invalid phone number format' });
        return;
      }

      const normalizedPhone = phoneNumber.replace(/\D/g, '');
      if (phoneNumbers.has(normalizedPhone)) {
        duplicatesRemoved++;
        return;
      }

      phoneNumbers.add(normalizedPhone);
      validRecipients.push({ ...row, phone_number: phoneNumber });
    });

    return {
      validRecipients,
      invalidCount: invalidRecipients.length,
      duplicatesRemoved
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus(prev => ({ ...prev, loading: true, errors: [] }));
    setUploadedFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadStatus(prev => ({
            ...prev,
            loading: false,
            errors: results.errors.map(e => e.message)
          }));
          return;
        }

        const { validRecipients, invalidCount, duplicatesRemoved } = processCSVData(results.data);
        
        setCsvData(validRecipients);
        setUploadStatus({
          loading: false,
          validRecipients: validRecipients.length,
          invalidRecipients: invalidCount,
          duplicatesRemoved,
          errors: []
        });
      },
      error: (error) => {
        setUploadStatus(prev => ({
          ...prev,
          loading: false,
          errors: [error.message]
        }));
      }
    });
  };

  const downloadTemplate = () => {
    const template = `phone_number,company_name,first_name,last_name
+1234567890,Acme Corp,John,Doe
+1987654321,Tech Solutions,Jane,Smith`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setCsvData([]);
    setUploadStatus({
      loading: false,
      validRecipients: 0,
      invalidRecipients: 0,
      duplicatesRemoved: 0,
      errors: []
    });
  };

  const handleSubmit = () => {
    const assistant = mockAssistants.find(a => a.id === selectedAssistant);
    if (!assistant?.phoneNumber || csvData.length === 0) return;

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

  const canSubmit = () => {
    const assistant = mockAssistants.find(a => a.id === selectedAssistant);
    return assistant?.phoneNumber && csvData.length > 0 && !uploadStatus.loading;
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Max 25MB</span>
                <Badge variant="outline">CSV</Badge>
                <Badge variant="outline">XLSX</Badge>
              </div>
            </div>

            {/* Info Box */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>How it works:</strong>
                <ol className="mt-2 space-y-1 ml-4 list-decimal">
                  <li>Upload a CSV/XLSX file with recipient phone numbers</li>
                  <li>We'll validate and preview your contacts</li>
                  <li>Start your campaign to call all recipients</li>
                </ol>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="link" size="sm" onClick={downloadTemplate} className="p-0 h-auto">
                    <Download className="h-3 w-3 mr-1" />
                    Download template
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              {!uploadedFile ? (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground/60" />
                  <div className="space-y-2">
                    <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                      Choose file
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      CSV or XLSX with <code className="bg-muted px-1 rounded text-xs">phone_number</code> column required
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Status */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Loading State */}
                  {uploadStatus.loading && (
                    <div className="text-sm text-muted-foreground">
                      Processing file...
                    </div>
                  )}

                  {/* Validation Results */}
                  {!uploadStatus.loading && csvData.length > 0 && (
                    <div className="space-y-4">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Valid Recipients</span>
                          </div>
                          <p className="text-lg font-bold text-green-900">{uploadStatus.validRecipients}</p>
                        </div>
                        
                        {uploadStatus.invalidRecipients > 0 && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Invalid</span>
                            </div>
                            <p className="text-lg font-bold text-orange-900">{uploadStatus.invalidRecipients}</p>
                          </div>
                        )}
                        
                        {uploadStatus.duplicatesRemoved > 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Duplicates Removed</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">{uploadStatus.duplicatesRemoved}</p>
                          </div>
                        )}
                      </div>

                      {/* Preview Table */}
                      <div>
                        <h4 className="font-medium mb-2 text-left">Preview (first 3 rows)</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Phone Number</TableHead>
                                {Object.keys(csvData[0] || {})
                                  .filter(key => key !== 'phone_number')
                                  .slice(0, 2)
                                  .map(key => (
                                    <TableHead key={key}>{key}</TableHead>
                                  ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {csvData.slice(0, 3).map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-mono text-sm">{row.phone_number}</TableCell>
                                   {Object.entries(row)
                                     .filter(([key]) => key !== 'phone_number')
                                     .slice(0, 2)
                                     .map(([key, value]) => (
                                       <TableCell key={key}>{String(value) || '--'}</TableCell>
                                     ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {uploadStatus.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {uploadStatus.errors.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
            
            {!uploadedFile && (
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm">No recipients yet</p>
                <p className="text-xs">Upload a file to add recipients to this campaign</p>
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
                className={`flex-1 ${timing === 'immediate' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
              >
                Send immediately
              </Button>
              <Button
                variant={timing === 'scheduled' ? 'default' : 'outline'}
                onClick={() => {
                  setTiming('scheduled');
                  setSchedulerOpen(true);
                }}
                className={`flex-1 ${timing === 'scheduled' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
              >
                Schedule for later
              </Button>
            </div>
            
            {/* Scheduled Details */}
            {timing === 'scheduled' && scheduledDate && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-2 text-teal-800 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="font-medium">Scheduled for:</span>
                </div>
                <p className="text-sm text-teal-700">
                  {format(scheduledDate, "PPPP")} at {scheduledTime} ({timezone})
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setSchedulerOpen(true)}
                  className="p-0 h-auto text-teal-600 hover:text-teal-700"
                >
                  Change schedule
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => setTestModalOpen(true)}>Test call</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit()}
              className="ml-auto"
            >
              Start Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduler Modal */}
      <Dialog open={schedulerOpen} onOpenChange={setSchedulerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-700">
              <Clock className="h-5 w-5" />
              Schedule Campaign
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Select value={scheduledTime} onValueChange={setScheduledTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return [
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{hour}:00</SelectItem>,
                      <SelectItem key={`${hour}:30`} value={`${hour}:30`}>{hour}:30</SelectItem>
                    ];
                  }).flat()}
                </SelectContent>
              </Select>
            </div>

            {/* Timezone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Timezone
              </label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSchedulerOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => setSchedulerOpen(false)}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                disabled={!scheduledDate}
              >
                Schedule Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Call Modal */}
      <TestOutboundCallModal 
        open={testModalOpen} 
        onOpenChange={setTestModalOpen} 
      />
    </div>
  );
};

export default BatchCallForm;