import { Campaign, CampaignRecipient } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Phone, Calendar, TrendingUp, RotateCcw, X } from "lucide-react";

interface CampaignDetailsProps {
  campaign: Campaign;
  onBack: () => void;
  onRecipientClick: (recipient: any) => void;
}

const CampaignDetails = ({ campaign, onBack, onRecipientClick }: CampaignDetailsProps) => {
  // Get all dynamic variable keys from the first recipient
  const dynamicKeys = campaign.csvData.length > 0 
    ? Object.keys(campaign.csvData[0]).filter(key => 
        !['id', 'phone_number', 'status'].includes(key)
      )
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>;
      case 'no-answer':
        return <Badge variant="destructive">📞 No answer</Badge>;
      default:
        return <Badge variant="secondary">⏳ Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 p-0 h-auto">
              <ArrowLeft className="h-4 w-4" />
              Outgoing Calls
            </Button>
            <span>/</span>
            <span>{campaign.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>


      {/* Call Recipients Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Call Recipients</h2>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    <div className="text-xs text-gray-500">phone_number</div>
                  </TableHead>
                  {dynamicKeys.map((key) => (
                    <TableHead key={key} className="px-4 py-3">
                       <div className="flex items-center gap-2">
                         <span>📋</span>
                         Data
                       </div>
                      <div className="text-xs text-gray-500">{key}</div>
                    </TableHead>
                  ))}
                  <TableHead className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      Status
                    </div>
                    <div className="text-xs text-gray-500">status</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.csvData.map((recipient) => (
                  <TableRow 
                    key={recipient.id}
                    className="cursor-pointer hover:bg-gray-50 border-b"
                    onClick={() => onRecipientClick(recipient)}
                  >
                    <TableCell className="px-4 py-3 font-medium">
                      {recipient.phone_number}
                    </TableCell>
                    {dynamicKeys.map((key) => (
                      <TableCell key={key} className="px-4 py-3">
                        {recipient[key] || '--'}
                      </TableCell>
                    ))}
                    <TableCell className="px-4 py-3">
                      {getStatusBadge(recipient.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignDetails;