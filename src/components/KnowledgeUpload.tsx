import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, File, Type, Link, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeSource {
  id: string;
  name: string;
  type: 'file' | 'text' | 'url';
  status: 'processing' | 'completed' | 'failed';
  file_size?: number;
  created_at: string;
}

interface KnowledgeUploadProps {
  assistantId?: string;
  onKnowledgeAdded?: (knowledge: KnowledgeSource) => void;
}

export const KnowledgeUpload: React.FC<KnowledgeUploadProps> = ({ 
  assistantId, 
  onKnowledgeAdded 
}) => {
  // Mock user ID since auth is removed
  const user = { id: 'demo-user-123' };
  const { toast } = useToast();
  
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [textKnowledge, setTextKnowledge] = useState({ name: '', content: '' });
  const [urlKnowledge, setUrlKnowledge] = useState({ name: '', url: '' });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user || !assistantId) {
      toast({
        title: "Error",
        description: "Please ensure you're logged in and have selected an assistant",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    for (const file of acceptedFiles) {
      try {
        // Upload file to Supabase Storage
        const fileName = `${user.id}/${assistantId}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('knowledge-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create knowledge source record
        const { data: knowledgeSource, error: dbError } = await supabase
          .from('knowledge_sources')
          .insert({
            user_id: user.id,
            assistant_id: assistantId,
            name: file.name,
            type: 'file',
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            status: 'processing'
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Read file content for processing - but only for text files
        let fileContent = '';
        const isTextFile = file.type === 'text/plain' || 
                          file.type === 'text/markdown' || 
                          file.name.toLowerCase().endsWith('.txt') ||
                          file.name.toLowerCase().endsWith('.md');
        
        if (isTextFile && file.size < 1000000) { // Only read text files under 1MB
          try {
            fileContent = await file.text();
          } catch (error) {
            console.warn('Could not read file content, will process later:', error);
          }
        }
        
        // For PDFs and other files, we'll set a placeholder content
        if (!fileContent) {
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            fileContent = `PDF Document: ${file.name}\n\nThis PDF document has been uploaded and is being processed. Content will be available once text extraction is complete.`;
          } else {
            fileContent = `Document: ${file.name}\n\nThis document has been uploaded and is being processed.`;
          }
        }
        
        // Create a processing job for the queue
        try {
          const { error: jobError } = await supabase
            .from('processing_jobs')
            .insert({
              knowledge_source_id: knowledgeSource.id,
              user_id: user.id,
              status: 'pending'
            });

          if (jobError) {
            console.error('Failed to create processing job:', jobError);
          } else {
            // Trigger queue processing
            supabase.functions.invoke('process-queue').catch(error => {
              console.error('Failed to trigger queue processing:', error);
            });
          }
        } catch (error) {
          console.error('Processing queue setup failed:', error);
        }

        const newKnowledge = knowledgeSource as KnowledgeSource;
        setKnowledgeSources(prev => [...prev, newKnowledge]);
        onKnowledgeAdded?.(newKnowledge);

        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded and is being processed in the background`,
        });

      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setIsUploading(false);
  }, [user, assistantId, onKnowledgeAdded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: isUploading
  });

  const handleTextKnowledgeSubmit = async () => {
    if (!user || !assistantId || !textKnowledge.name || !textKnowledge.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create knowledge source record
      const { data: knowledgeSource, error: dbError } = await supabase
        .from('knowledge_sources')
        .insert({
          user_id: user.id,
          assistant_id: assistantId,
          name: textKnowledge.name,
          type: 'text',
          content: textKnowledge.content,
          status: 'processing'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create a processing job for the queue
      try {
        const { error: jobError } = await supabase
          .from('processing_jobs')
          .insert({
            knowledge_source_id: knowledgeSource.id,
            user_id: user.id,
            status: 'pending'
          });

        if (jobError) {
          console.error('Failed to create processing job:', jobError);
        } else {
          // Trigger queue processing
          supabase.functions.invoke('process-queue').catch(error => {
            console.error('Failed to trigger queue processing:', error);
          });
        }
      } catch (error) {
        console.error('Processing queue setup failed:', error);
      }

      const newKnowledge = knowledgeSource as KnowledgeSource;
      setKnowledgeSources(prev => [...prev, newKnowledge]);
      onKnowledgeAdded?.(newKnowledge);

      // Reset form
      setTextKnowledge({ name: '', content: '' });

      toast({
        title: "Knowledge added",
        description: "Text knowledge has been added and is being processed in the background",
      });

    } catch (error) {
      console.error('Error adding text knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to add text knowledge",
        variant: "destructive"
      });
    }

    setIsUploading(false);
  };

  const handleDeleteKnowledge = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setKnowledgeSources(prev => prev.filter(k => k.id !== id));
      
      toast({
        title: "Knowledge deleted",
        description: "Knowledge source has been removed",
      });

    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge source",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add Knowledge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Input
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: TXT, MD, PDF, DOCX
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="knowledge-name">Knowledge Name</Label>
                  <Input
                    id="knowledge-name"
                    placeholder="e.g., Product FAQ, Company Policies"
                    value={textKnowledge.name}
                    onChange={(e) => setTextKnowledge(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="knowledge-content">Content</Label>
                  <Textarea
                    id="knowledge-content"
                    placeholder="Enter your knowledge content here..."
                    rows={8}
                    value={textKnowledge.content}
                    onChange={(e) => setTextKnowledge(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleTextKnowledgeSubmit}
                  disabled={isUploading || !textKnowledge.name || !textKnowledge.content}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Type className="h-4 w-4 mr-2" />
                      Add Text Knowledge
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {knowledgeSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {knowledgeSources.map((source) => (
                <div 
                  key={source.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(source.status)}
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.type} • {new Date(source.created_at).toLocaleDateString()}
                        {source.file_size && ` • ${Math.round(source.file_size / 1024)} KB`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteKnowledge(source.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};