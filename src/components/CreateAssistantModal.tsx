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
      <DialogContent className="max-w-lg bg-white border-teal-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-teal">Create New Assistant</DialogTitle>
        </DialogHeader>
        <div>
          <h3 className="font-semibold text-slate-600 mb-1">What type of assistant do you need?</h3>
          <p className="text-sm text-slate-500 mb-6">Choose the channel your assistant will operate on.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phone Assistant */}
            <div className="border border-teal-200 rounded-lg p-4 text-center hover:border-teal-400 hover:bg-teal-25 cursor-pointer transition-all duration-200 group hover:shadow-md">
              <Phone className="h-8 w-8 mx-auto mb-3 text-slate-400 group-hover:text-teal-600 transition-colors" />
              <h4 className="font-semibold text-slate-700 group-hover:text-teal-700">Phone Assistant</h4>
              <p className="text-xs text-slate-500 mt-1">Handles phone calls and voice interactions.</p>
            </div>
            
            {/* Website Assistant */}
            <div className="border border-teal-200 rounded-lg p-4 text-center hover:border-teal-400 hover:bg-teal-25 cursor-pointer transition-all duration-200 group hover:shadow-md">
              <Globe className="h-8 w-8 mx-auto mb-3 text-slate-400 group-hover:text-teal-600 transition-colors" />
              <h4 className="font-semibold text-slate-700 group-hover:text-teal-700">Website Assistant</h4>
              <p className="text-xs text-slate-500 mt-1">Provides support through web chat.</p>
            </div>
            
            {/* Email Assistant - Featured */}
            <div className="border-2 border-teal-500 bg-gradient-to-br from-teal-50 to-teal-25 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ring-4 ring-teal-500/20 shadow-lg hover:shadow-xl">
              <Inbox className="h-8 w-8 mx-auto mb-3 text-teal-600" />
              <h4 className="font-semibold text-teal-700">Email Assistant</h4>
              <p className="text-xs text-teal-600 mt-1 font-medium">Manages your team's shared inbox.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};