import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Link2, Plus, Copy, Trash2, ExternalLink, 
  CheckCircle, XCircle, Clock, Users, Loader2,
  Package, MapPin, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  getQuickLinks, 
  createQuickLink, 
  disableQuickLink, 
  buildQuickLinkUrl,
  QuickLink,
  QuickLinkConfig 
} from '@/lib/quickLinkService';
import { supabase } from '@/integrations/supabase/client';

const DUMPSTER_SIZES = [6, 8, 10, 20, 30, 40, 50];
const EXPIRATION_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '', label: 'Never expires' },
];

interface Customer {
  id: string;
  company_name: string | null;
  phone: string | null;
}

export default function QuickLinksManager() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formZip, setFormZip] = useState('');
  const [formSize, setFormSize] = useState<string>('20');
  const [formMaterial, setFormMaterial] = useState<'general' | 'heavy'>('general');
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formAddress, setFormAddress] = useState('');
  const [formExpiration, setFormExpiration] = useState<string>('30');
  const [formMaxUses, setFormMaxUses] = useState<string>('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    
    // Load quick links
    const linksData = await getQuickLinks();
    setLinks(linksData);
    
    // Load customers for dropdown
    const { data: customersData } = await supabase
      .from('customers')
      .select('id, company_name, phone')
      .order('company_name');
    
    if (customersData) {
      setCustomers(customersData);
    }
    
    setIsLoading(false);
  }

  async function handleCreate() {
    setIsCreating(true);
    
    const config: QuickLinkConfig = {
      name: formName || undefined,
      zip: formZip || undefined,
      size: formSize ? parseInt(formSize, 10) : undefined,
      material: formMaterial,
      customerId: formCustomerId || undefined,
      preferredAddress: formAddress || undefined,
      expiresInDays: formExpiration ? parseInt(formExpiration, 10) : undefined,
      maxUses: formMaxUses ? parseInt(formMaxUses, 10) : undefined,
    };
    
    const result = await createQuickLink(config);
    
    if (result.quickLink) {
      toast.success('Quick link created!');
      setLinks([result.quickLink, ...links]);
      resetForm();
      setCreateDialogOpen(false);
    } else {
      toast.error(result.error || 'Failed to create link');
    }
    
    setIsCreating(false);
  }

  async function handleDisable(linkId: string) {
    const result = await disableQuickLink(linkId);
    
    if (result.success) {
      toast.success('Link disabled');
      setLinks(links.map(l => l.id === linkId ? { ...l, is_active: false } : l));
    } else {
      toast.error(result.error || 'Failed to disable link');
    }
  }

  function handleCopyLink(token: string) {
    const url = buildQuickLinkUrl(token);
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  }

  function resetForm() {
    setFormName('');
    setFormZip('');
    setFormSize('20');
    setFormMaterial('general');
    setFormCustomerId('');
    setFormAddress('');
    setFormExpiration('30');
    setFormMaxUses('');
  }

  function getLinkStatus(link: QuickLink): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
    if (!link.is_active) {
      return { label: 'Disabled', variant: 'destructive' };
    }
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return { label: 'Expired', variant: 'secondary' };
    }
    if (link.max_uses && link.use_count >= link.max_uses) {
      return { label: 'Max Uses', variant: 'secondary' };
    }
    return { label: 'Active', variant: 'default' };
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-6 h-6 text-primary" />
            Quick Order Links
          </h1>
          <p className="text-muted-foreground">
            Create shareable links for fast ordering
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Quick Order Link</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>Link Name (optional)</Label>
                <Input 
                  placeholder="e.g., Spring Sale 20-Yard"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              
              {/* Customer (optional) */}
              <div className="space-y-2">
                <Label>Customer (optional)</Label>
                <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No customer (public link)</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company_name || 'Unknown'} ({c.phone || 'No phone'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Size */}
                <div className="space-y-2">
                  <Label>Dumpster Size</Label>
                  <Select value={formSize} onValueChange={setFormSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMPSTER_SIZES.map(size => (
                        <SelectItem key={size} value={String(size)}>
                          {size} Yard
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Material */}
                <div className="space-y-2">
                  <Label>Material Type</Label>
                  <Select value={formMaterial} onValueChange={(v) => setFormMaterial(v as 'general' | 'heavy')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Debris</SelectItem>
                      <SelectItem value="heavy">Heavy Materials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* ZIP */}
              <div className="space-y-2">
                <Label>Service ZIP Code</Label>
                <Input 
                  placeholder="e.g., 94601"
                  value={formZip}
                  onChange={(e) => setFormZip(e.target.value)}
                  maxLength={5}
                />
              </div>
              
              {/* Address */}
              <div className="space-y-2">
                <Label>Preferred Address (optional)</Label>
                <Input 
                  placeholder="e.g., 123 Main St, Oakland CA"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Expiration */}
                <div className="space-y-2">
                  <Label>Expires In</Label>
                  <Select value={formExpiration} onValueChange={setFormExpiration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRATION_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Max Uses */}
                <div className="space-y-2">
                  <Label>Max Uses (optional)</Label>
                  <Input 
                    type="number"
                    placeholder="Unlimited"
                    value={formMaxUses}
                    onChange={(e) => setFormMaxUses(e.target.value)}
                    min={1}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{links.length}</p>
                <p className="text-sm text-muted-foreground">Total Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {links.filter(l => l.is_active && (!l.expires_at || new Date(l.expires_at) > new Date())).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {links.reduce((sum, l) => sum + l.use_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Uses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {links.filter(l => l.expires_at && new Date(l.expires_at) < new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No quick links created yet</p>
              <p className="text-sm">Create your first link to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / Token</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => {
                  const status = getLinkStatus(link);
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{link.name || 'Unnamed Link'}</div>
                          <div className="text-xs text-muted-foreground font-mono">{link.token}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {link.preset_size && (
                            <Badge variant="outline" className="text-xs">
                              <Package className="w-3 h-3 mr-1" />
                              {link.preset_size}YD
                            </Badge>
                          )}
                          {link.preset_material && (
                            <Badge variant="outline" className="text-xs">
                              {link.preset_material === 'heavy' ? '🪨' : '🗑️'}
                            </Badge>
                          )}
                          {link.preset_zip && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {link.preset_zip}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {link.customer_id ? (
                          <span className="text-sm">
                            {customers.find(c => c.id === link.customer_id)?.company_name || 'Unknown'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Public</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{link.use_count}</span>
                        {link.max_uses && (
                          <span className="text-muted-foreground">/{link.max_uses}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {link.expires_at ? (
                          <span className="text-sm">
                            {format(new Date(link.expires_at), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCopyLink(link.token)}
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => window.open(buildQuickLinkUrl(link.token), '_blank')}
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {link.is_active && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDisable(link.id)}
                              title="Disable link"
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* SMS/Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Messaging Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-2">SMS Template</div>
            <div className="text-sm text-muted-foreground bg-background p-3 rounded border font-mono">
              Here's your quick order link — just confirm and we'll handle the rest: {"{{quick_link_url}}"}
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-2">Email Template</div>
            <div className="text-sm text-muted-foreground bg-background p-3 rounded border font-mono">
              Hi {"{{customer_name}}"},<br/><br/>
              Use this link to place your order in seconds:<br/>
              {"{{quick_link_url}}"}<br/><br/>
              Questions? Reply to this email or call us at (510) 555-1234.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
