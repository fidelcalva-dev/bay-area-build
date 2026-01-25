import { useState, useEffect } from 'react';
import { Phone, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneDisplay } from '@/lib/phoneUtils';

interface PhoneNumber {
  id: string;
  twilio_number: string;
  friendly_name: string | null;
  purpose: 'SALES' | 'CS' | 'BILLING';
  market_code: string | null;
  is_active: boolean;
  created_at: string;
}

export default function PhoneNumbersManager() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState<PhoneNumber | null>(null);
  const [formData, setFormData] = useState({
    twilio_number: '',
    friendly_name: '',
    purpose: 'SALES' as 'SALES' | 'CS' | 'BILLING',
    market_code: '',
    is_active: true,
  });
  const { toast } = useToast();

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .order('purpose', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch phone numbers',
        variant: 'destructive',
      });
    } else {
      setPhoneNumbers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const handleSave = async () => {
    const number = formData.twilio_number.startsWith('+')
      ? formData.twilio_number
      : `+1${formData.twilio_number.replace(/\D/g, '')}`;

    const payload = {
      twilio_number: number,
      friendly_name: formData.friendly_name || null,
      purpose: formData.purpose,
      market_code: formData.market_code || null,
      is_active: formData.is_active,
    };

    let error;

    if (editingNumber) {
      const result = await supabase
        .from('phone_numbers')
        .update(payload)
        .eq('id', editingNumber.id);
      error = result.error;
    } else {
      const result = await supabase.from('phone_numbers').insert(payload);
      error = result.error;
    }

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: editingNumber ? 'Phone number updated' : 'Phone number added',
      });
      setIsDialogOpen(false);
      setEditingNumber(null);
      setFormData({
        twilio_number: '',
        friendly_name: '',
        purpose: 'SALES',
        market_code: '',
        is_active: true,
      });
      fetchPhoneNumbers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phone number?')) return;

    const { error } = await supabase.from('phone_numbers').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Phone number removed',
      });
      fetchPhoneNumbers();
    }
  };

  const handleEdit = (number: PhoneNumber) => {
    setEditingNumber(number);
    setFormData({
      twilio_number: number.twilio_number,
      friendly_name: number.friendly_name || '',
      purpose: number.purpose,
      market_code: number.market_code || '',
      is_active: number.is_active,
    });
    setIsDialogOpen(true);
  };

  const purposeColors: Record<string, string> = {
    SALES: 'bg-blue-100 text-blue-800',
    CS: 'bg-green-100 text-green-800',
    BILLING: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phone Numbers</h1>
          <p className="text-muted-foreground">
            Manage Twilio phone numbers for sales, CS, and billing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingNumber(null);
              setFormData({
                twilio_number: '',
                friendly_name: '',
                purpose: 'SALES',
                market_code: '',
                is_active: true,
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingNumber ? 'Edit Phone Number' : 'Add Phone Number'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Twilio Number</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={formData.twilio_number}
                  onChange={(e) =>
                    setFormData({ ...formData, twilio_number: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Friendly Name</Label>
                <Input
                  placeholder="Main Sales Line"
                  value={formData.friendly_name}
                  onChange={(e) =>
                    setFormData({ ...formData, friendly_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Purpose</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(v) =>
                    setFormData({ ...formData, purpose: v as 'SALES' | 'CS' | 'BILLING' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES">Sales</SelectItem>
                    <SelectItem value="CS">Customer Service</SelectItem>
                    <SelectItem value="BILLING">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Market Code (optional)</Label>
                <Input
                  placeholder="e.g., oakland_east_bay"
                  value={formData.market_code}
                  onChange={(e) =>
                    setFormData({ ...formData, market_code: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingNumber ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Configured Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : phoneNumbers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No phone numbers configured
                  </TableCell>
                </TableRow>
              ) : (
                phoneNumbers.map((number) => (
                  <TableRow key={number.id}>
                    <TableCell className="font-mono">
                      {formatPhoneDisplay(number.twilio_number)}
                    </TableCell>
                    <TableCell>{number.friendly_name || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${purposeColors[number.purpose]}`}>
                        {number.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {number.market_code || '-'}
                    </TableCell>
                    <TableCell>
                      {number.is_active ? (
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(number)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(number.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Twilio Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-medium">1. Configure Twilio Webhook URLs</p>
            <p className="text-sm text-muted-foreground">
              For each phone number in your Twilio console, set:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
              <li>
                <strong>Voice Webhook:</strong>{' '}
                <code className="bg-background px-1 rounded">
                  {window.location.origin.replace('id-preview--', '').replace('.lovable.app', '.supabase.co')}/functions/v1/calls-inbound-handler
                </code>
              </li>
              <li>
                <strong>Status Callback:</strong>{' '}
                <code className="bg-background px-1 rounded">
                  .../functions/v1/calls-status-callback
                </code>
              </li>
            </ul>
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-medium">2. Required Secrets</p>
            <p className="text-sm text-muted-foreground">
              Ensure these secrets are configured in your backend:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-4">
              <li>TWILIO_ACCOUNT_SID</li>
              <li>TWILIO_AUTH_TOKEN</li>
              <li>TWILIO_PHONE_NUMBER (for SMS)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
