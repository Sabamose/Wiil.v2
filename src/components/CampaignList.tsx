import { Campaign } from "@/types/campaign";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock } from "lucide-react";
import { useState } from "react";

interface CampaignListProps {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
}

const CampaignList = ({ campaigns, onCampaignClick, onCreateCampaign }: CampaignListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.agent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Batch Calling</h1>
        <Button onClick={onCreateCampaign}>Create a batch call</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search Batch Calls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <Card 
            key={campaign.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onCampaignClick(campaign)}
          >
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{campaign.name}</h3>
                <p className="text-sm text-gray-600">{campaign.recipients} recipients</p>
                <p className="text-sm text-gray-600">{campaign.agent}</p>
              </div>
              
              <div className="space-y-2">
                <Badge 
                  variant={campaign.status === 'completed' ? 'default' : 'secondary'}
                  className="bg-green-100 text-green-800"
                >
                  ✓ Completed
                </Badge>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span>📞 {campaign.completionPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{campaign.duration}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No campaigns found</p>
          <Button onClick={onCreateCampaign} className="mt-4">
            Create your first campaign
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignList;