import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Globe, Inbox } from "lucide-react";

interface CreateAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAssistantModal = ({ isOpen, onClose }: CreateAssistantModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Create New Assistant</DialogTitle>
        </DialogHeader>
        <div>
          <h3 className="font-semibold text-muted-foreground mb-1">What type of assistant do you need?</h3>
          <p className="text-sm text-muted-foreground mb-4">Choose the channel your assistant will operate on.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phone Assistant */}
            <div className="border border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition group">
              <Phone className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary" />
              <h4 className="font-semibold text-foreground">Phone Assistant</h4>
              <p className="text-xs text-muted-foreground">Handles phone calls and voice interactions.</p>
            </div>
            
            {/* Website Assistant */}
            <div className="border border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition group">
              <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary" />
              <h4 className="font-semibold text-foreground">Website Assistant</h4>
              <p className="text-xs text-muted-foreground">Provides support through web chat.</p>
            </div>
            
            {/* Email Assistant - Featured */}
            <div className="border-2 border-primary bg-primary/5 rounded-lg p-4 text-center cursor-pointer transition ring-4 ring-primary/20">
              <Inbox className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold text-primary">Email Assistant</h4>
              <p className="text-xs text-muted-foreground">Manages your team's shared inbox.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};