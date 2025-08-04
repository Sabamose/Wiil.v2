import { Campaign, CampaignRecipient } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Phone } from "lucide-react";

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Call Recipients</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{campaign.name}</span>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{campaign.recipients} recipients</span>
              <span>{campaign.agent}</span>
              <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TableHead>
                {dynamicKeys.map((key) => (
                  <TableHead key={key} className="flex items-center gap-2">
                    <span>{ }</span>
                    Dynamic Variable
                    <div className="text-xs text-gray-500 block">{key}</div>
                  </TableHead>
                ))}
                <TableHead className="flex items-center gap-2">
                  <span>📊</span>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.csvData.map((recipient) => (
                <TableRow 
                  key={recipient.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onRecipientClick(recipient)}
                >
                  <TableCell>{recipient.phone_number}</TableCell>
                  {dynamicKeys.map((key) => (
                    <TableCell key={key}>
                      {recipient[key] || '--'}
                    </TableCell>
                  ))}
                  <TableCell>
                    {getStatusBadge(recipient.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetails;