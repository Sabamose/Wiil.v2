import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2, X, Link, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeUploadProps {
  assistantId: string;
  onKnowledgeAdded?: (knowledge: any) => void;
}

interface KnowledgeItem {
  id: string;
  name: string;
  type: 'document' | 'url' | 'text';
  content?: string;
  status: 'processing' | 'completed' | 'error';
}

const KnowledgeUpload: React.FC<KnowledgeUploadProps> = ({ assistantId, onKnowledgeAdded }) => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return;
      }

      const newItem: KnowledgeItem = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: 'document',
        status: 'processing'
      };

      setKnowledgeItems(prev => [...prev, newItem]);

      // Simulate file processing
      setTimeout(() => {
        setKnowledgeItems(prev => prev.map(item => 
          item.id === newItem.id 
            ? { ...item, status: 'completed' as const }
            : item
        ));
        
        toast({
          title: "File uploaded",
          description: `${file.name} has been processed successfully`,
        });
        
        onKnowledgeAdded?.(newItem);
      }, 2000);
    });
  }, [toast, onKnowledgeAdded]);

  const handleAddText = async () => {
    if (!textContent.trim() || !textTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const newItem: KnowledgeItem = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: textTitle,
      type: 'text',
      content: textContent,
      status: 'processing'
    };

    setKnowledgeItems(prev => [...prev, newItem]);

    // Simulate processing
    setTimeout(() => {
      setKnowledgeItems(prev => prev.map(item => 
        item.id === newItem.id 
          ? { ...item, status: 'completed' as const }
          : item
      ));
      
      toast({
        title: "Text added",
        description: "Text content has been processed successfully",
      });
      
      onKnowledgeAdded?.(newItem);
      setTextContent('');
      setTextTitle('');
      setIsProcessing(false);
    }, 1000);
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "Missing URL",
        description: "Please provide a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const newItem: KnowledgeItem = {
      id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: urlInput,
      type: 'url',
      status: 'processing'
    };

    setKnowledgeItems(prev => [...prev, newItem]);

    // Simulate processing
    setTimeout(() => {
      setKnowledgeItems(prev => prev.map(item => 
        item.id === newItem.id 
          ? { ...item, status: 'completed' as const }
          : item
      ));
      
      toast({
        title: "URL processed",
        description: "Website content has been processed successfully",
      });
      
      onKnowledgeAdded?.(newItem);
      setUrlInput('');
      setIsProcessing(false);
    }, 2000);
  };

  const removeKnowledgeItem = (id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Removed",
      description: "Knowledge item has been removed",
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Relevant Files
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Paste Text or Notes
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Website URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop files here' : 'Drop files here or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: TXT, MD, PDF, DOCX (max 10MB each)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="textTitle">Title</Label>
                <Input
                  id="textTitle"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Enter a title for this content"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="textContent">Content</Label>
                <Textarea
                  id="textContent"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here..."
                  rows={10}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleAddText} 
                disabled={isProcessing || !textContent.trim() || !textTitle.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Text Content'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="urlInput">Website URL</Label>
                <Input
                  id="urlInput"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleAddUrl} 
                disabled={isProcessing || !urlInput.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Website Content'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Knowledge Items List */}
      {knowledgeItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Added Knowledge</h3>
          {knowledgeItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.type === 'document' && <FileText className="h-4 w-4" />}
                    {item.type === 'text' && <Type className="h-4 w-4" />}
                    {item.type === 'url' && <Link className="h-4 w-4" />}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.status === 'processing' && (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing...
                          </span>
                        )}
                        {item.status === 'completed' && 'Ready'}
                        {item.status === 'error' && 'Failed'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKnowledgeItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeUpload;