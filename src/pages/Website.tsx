import { useState } from "react";
import { Copy, Code, Globe, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Website = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();

  // Mock assistant data - in real app this would come from your assistant store/API
  const availableAssistants = [
    { id: "1", name: "Customer Support Bot", status: "active" as const },
    { id: "2", name: "Sales Assistant", status: "active" as const },
    { id: "3", name: "Technical Support", status: "active" as const },
    { id: "4", name: "Booking Assistant", status: "draft" as const },
  ];

  const generateCodeSnippet = () => {
    if (!websiteUrl || !selectedAssistant) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const assistantName = availableAssistants.find(a => a.id === selectedAssistant)?.name || "Assistant";
    
    const snippet = `<!-- Wiil AI Assistant Integration -->
<div id="wiil-chat-widget"></div>
<script>
  (function() {
    // Wiil Chat Widget Configuration
    window.WiilConfig = {
      assistantId: "${selectedAssistant}",
      assistantName: "${assistantName}",
      websiteUrl: "${websiteUrl}",
      theme: {
        primaryColor: "#4F46E5",
        position: "bottom-right"
      }
    };
    
    // Load Wiil Chat Widget
    var script = document.createElement('script');
    script.src = 'https://cdn.wiil.ai/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
<!-- End Wiil AI Assistant Integration -->`;

    setCodeSnippet(snippet);
    setIsGenerated(true);
    
    toast({
      title: "Code Generated!",
      description: "Your website integration code has been generated successfully.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard.",
    });
  };

  return (
    <div>
      <Navigation />
      <div className="ml-60 pt-16 min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Website Integration</h1>
            <p className="text-gray-600 mt-1">
              Integrate your AI assistant into your website with a simple code snippet
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Website Details
                </CardTitle>
                <CardDescription>
                  Configure your website integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL *</Label>
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    The URL where your assistant will be deployed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assistant-select">Choose Assistant *</Label>
                  <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an assistant..." />
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
                  <p className="text-sm text-gray-500">
                    This assistant will handle all interactions on your website
                  </p>
                </div>

                <Button 
                  onClick={generateCodeSnippet}
                  className="w-full"
                  disabled={!websiteUrl || !selectedAssistant}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Generate Code Snippet
                </Button>
              </CardContent>
            </Card>

            {/* Code Snippet Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Integration Code
                  {isGenerated && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </CardTitle>
                <CardDescription>
                  Copy and paste this code into your website&apos;s HTML
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isGenerated ? (
                  <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Generate code snippet to see it here</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Textarea
                        value={codeSnippet}
                        readOnly
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={copyToClipboard}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Installation Instructions
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Copy the code snippet above</li>
                        <li>Paste it before the closing &lt;/body&gt; tag in your HTML</li>
                        <li>The chat widget will appear on your website automatically</li>
                        <li>Test the integration by visiting your website</li>
                      </ol>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Website;