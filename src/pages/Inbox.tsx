import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdaptiveNavigation from "@/components/AdaptiveNavigation";
import { InboxConversationList } from "@/components/InboxConversationList";
import { InboxConversationView } from "@/components/InboxConversationView";
import { InboxMagicSidebar } from "@/components/InboxMagicSidebar";
import { CreateAssistantModal } from "@/components/CreateAssistantModal";
import { EmailProviderConnectionModal } from "@/components/EmailProviderConnectionModal";
import { useResponsive } from "@/hooks/use-responsive";
import { useChatLayout } from "@/hooks/useChatLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Plus } from "lucide-react";

export interface EmailConversation {
  id: number;
  customer: string;
  subject: string;
  preview: string;
  timestamp: string;
  status: 'needs_review' | 'drafted' | 'replied' | 'closed';
  channel: string;
  history: Array<{
    type: string;
    summary: string;
    timestamp: string;
  }>;
  thread: Array<{
    from: string;
    to: string;
    body: string;
  }>;
  ai_draft?: string;
  ai_source?: {
    name: string;
    type: string;
  };
}

const mockConversations: EmailConversation[] = [
  {
    id: 1,
    customer: 'Alex Thompson',
    subject: 'Question about my recent order #A5821',
    preview: 'Hi there, I was wondering if you could give me an update on the shipping status...',
    timestamp: '15m ago',
    status: 'needs_review',
    channel: 'email',
    history: [
      { type: 'call', summary: 'Called 2 hours ago about a billing discrepancy.', timestamp: '2h ago' }
    ],
    thread: [
      { from: 'Alex Thompson', to: 'support@wiil.ai', body: 'Hi there,\n\nI was wondering if you could give me an update on the shipping status for my recent order, #A5821? I placed it two days ago and haven\'t received a tracking number yet.\n\nThanks,\nAlex' }
    ],
    ai_draft: 'Hi Alex,\n\nThanks for reaching out. I\'ve looked up your order #A5821 and I can see that it has been packed and is scheduled for pickup by the courier this afternoon. You should receive an email with the tracking number by the end of the day.\n\nLet me know if there\'s anything else I can help with!\n\nBest,\nThe Wiil Team',
    ai_source: { name: 'shipping_policy.pdf', type: 'knowledge_base' }
  },
  {
    id: 2,
    customer: 'Samantha Lee',
    subject: 'Booking Reschedule Request',
    preview: 'Hello, I need to reschedule my consultation appointment for this Friday. Is that possible?',
    timestamp: '45m ago',
    status: 'drafted',
    channel: 'email',
    history: [],
    thread: [
      { from: 'Samantha Lee', to: 'support@wiil.ai', body: 'Hello,\n\nI need to reschedule my consultation appointment for this Friday, August 29th. Is that possible? Please let me know what other times are available next week.\n\nThank you,\nSamantha' }
    ],
    ai_draft: 'Hi Samantha,\n\nOf course. I\'ve cancelled your appointment for this Friday. Looking at the calendar, we have the following times available next week:\n\n- Monday, Sep 1st at 2:00 PM\n- Wednesday, Sep 3rd at 11:00 AM\n\nDo either of these times work for you?\n\nBest regards,\nThe Wiil Team',
    ai_source: { name: 'Calendar / Booking Engine', type: 'integration' }
  },
  {
    id: 3,
    customer: 'David Chen',
    subject: 'Re: Your recent call',
    preview: 'Thanks for the summary, that was really helpful!',
    timestamp: '1h ago',
    status: 'replied',
    channel: 'email',
    history: [
      { type: 'call', summary: 'Called to inquire about enterprise pricing.', timestamp: '3h ago' }
    ],
    thread: [
      { from: 'support@wiil.ai', to: 'David Chen', body: 'Hi David, here is the summary of our call...' },
      { from: 'David Chen', to: 'support@wiil.ai', body: 'Thanks for the summary, that was really helpful!' }
    ]
  }
];

const Inbox = () => {
  const { isMobile } = useResponsive();
  const { marginLeft } = useChatLayout();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<EmailConversation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEmailConnectionModalOpen, setIsEmailConnectionModalOpen] = useState(false);

  // Check if user came from email assistant selection
  useEffect(() => {
    const fromEmailAssistant = searchParams.get('from') === 'email-assistant';
    const hasConnectedEmail = localStorage.getItem('email-provider-connected');
    
    if (fromEmailAssistant && !hasConnectedEmail) {
      setIsEmailConnectionModalOpen(true);
      // Clean up URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleEmailConnectionComplete = () => {
    // Mark email as connected in localStorage
    localStorage.setItem('email-provider-connected', 'true');
    setIsEmailConnectionModalOpen(false);
  };

  const filteredConversations = mockConversations.filter(convo =>
    convo.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convo.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <AdaptiveNavigation />
      <main 
        className="transition-all duration-200 ease-in-out mt-16 relative"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-8 border-b border-teal-100 bg-white/80 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-semibold text-brand-teal mb-2">Inbox</h1>
            <div className="h-1 w-16 bg-brand-teal/30 rounded-full mb-2"></div>
            <p className="text-sm text-muted-foreground">Unified conversations from support@wiil.ai</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-brand-teal hover:bg-teal-50">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assistant
            </Button>
          </div>
        </header>

        {/* Three-Pane Layout */}
        <div className="flex h-[calc(100vh-10rem)] overflow-hidden bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_100%]">
          {/* Pane 1: Conversation List */}
          <div className="w-1/4 xl:w-1/5 bg-white/90 backdrop-blur-sm border-r border-teal-100 flex flex-col shadow-sm">
            <div className="p-4 border-b border-teal-50">
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <InboxConversationList
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
              />
            </div>
          </div>

          {/* Pane 2: Conversation Thread */}
          <div className="w-1/2 xl:w-3/5 bg-white/60 backdrop-blur-sm flex flex-col">
            <InboxConversationView conversation={selectedConversation} />
          </div>

          {/* Pane 3: AI Assistant Sidebar */}
          <div className="w-1/4 xl:w-1/5 bg-white/90 backdrop-blur-sm border-l border-teal-100 flex flex-col shadow-sm">
            <InboxMagicSidebar conversation={selectedConversation} />
          </div>
        </div>

        <CreateAssistantModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        <EmailProviderConnectionModal
          isOpen={isEmailConnectionModalOpen}
          onClose={() => setIsEmailConnectionModalOpen(false)}
          onComplete={handleEmailConnectionComplete}
        />
      </main>
    </div>
  );
};

export default Inbox;