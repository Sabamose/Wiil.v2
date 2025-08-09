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
      <div className="flex justify-between items-center border-b border-teal-100/50 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 hover:bg-teal-50 hover:text-teal-700">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold relative">
            My Call Campaigns
            <div className="absolute -bottom-1 left-0 w-16 h-0.5 bg-gradient-to-r from-teal-500 to-teal-300"></div>
          </h1>
        </div>
        <Button onClick={onCreateCampaign} className="bg-teal-600 hover:bg-teal-700 shadow-sm border border-teal-500/20">+ Make Calls</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400 h-4 w-4" />
        <Input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-teal-100 focus:border-teal-300 focus:ring-teal-200"
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
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-teal-100/30 hover:border-teal-200 relative group"
              onClick={() => onCampaignClick(campaign)}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-300 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-teal-600" />
                    <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded-full">
                      {campaignType.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-teal-700 transition-colors">{campaign.name}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3 text-teal-500" />
                      <span>{campaign.recipients} recipients</span>
                    </div>
                    <Badge 
                      variant={campaign.status === 'completed' ? 'default' : campaign.status === 'in-progress' ? 'secondary' : 'outline'}
                      className={
                        campaign.status === 'completed' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                        campaign.status === 'in-progress' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                        'border-teal-200 text-teal-600'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  {dataColumns.length > 0 && (
                    <div className="pt-2 border-t border-teal-50">
                      <p className="text-xs text-teal-600 font-medium mb-1">Data fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {dataColumns.map((column, index) => (
                          <span key={index} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">
                            {column}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
            <Users className="h-10 w-10 text-teal-400" />
          </div>
          <p className="text-muted-foreground mb-4">No campaigns yet</p>
          <Button onClick={onCreateCampaign} className="bg-teal-600 hover:bg-teal-700">
            Create first campaign
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignList;