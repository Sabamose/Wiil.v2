import { Campaign } from "@/types/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, ArrowLeft, Users, Building2, Globe, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";

interface CampaignListProps {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
  onBack: () => void;
}

const CampaignList = ({ campaigns, onCampaignClick, onCreateCampaign, onBack }: CampaignListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.assistant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCampaignType = (csvData: any[]) => {
    if (!csvData || csvData.length === 0) return { type: "Custom Campaign", icon: Briefcase };
    
    const columns = Object.keys(csvData[0] || {});
    
    if (columns.some(col => col.toLowerCase().includes('website'))) {
      return { type: "Website Outreach", icon: Globe };
    }
    if (columns.some(col => col.toLowerCase().includes('company') || col.toLowerCase().includes('business'))) {
      return { type: "Business Calls", icon: Building2 };
    }
    if (columns.some(col => col.toLowerCase().includes('address') || col.toLowerCase().includes('city'))) {
      return { type: "Local Outreach", icon: MapPin };
    }
    
    return { type: "Custom Campaign", icon: Briefcase };
  };

  const getDataColumns = (csvData: any[]) => {
    if (!csvData || csvData.length === 0) return [];
    
    const columns = Object.keys(csvData[0] || {})
      .filter(col => !['id', 'phone_number', 'status'].includes(col))
      .slice(0, 3);
    
    return columns.map(col => 
      col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">My Call Campaigns</h1>
        </div>
        <Button onClick={onCreateCampaign} className="bg-teal-600 hover:bg-teal-700">+ Make Calls</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => {
          const campaignType = getCampaignType(campaign.csvData);
          const dataColumns = getDataColumns(campaign.csvData);
          const IconComponent = campaignType.icon;
          
          return (
            <Card 
              key={campaign.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-brand-teal"
              onClick={() => onCampaignClick(campaign)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{campaign.recipients} recipients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      <span className="text-sm text-success font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No batches yet</p>
          <Button onClick={onCreateCampaign}>
            Create first batch
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignList;