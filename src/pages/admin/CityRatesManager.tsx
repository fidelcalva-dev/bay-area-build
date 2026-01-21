import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CityRate {
  id: string;
  zone_id: string | null;
  city_name: string;
  extra_ton_rate_standard: number;
  prepay_discount_pct: number;
  extra_ton_rate_prepay: number;
  heavy_base_10yd: number;
  is_active: boolean;
}

interface Zone {
  id: string;
  name: string;
}

export default function CityRatesManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [rates, setRates] = useState<CityRate[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CityRate | null>(null);
  const [form, setForm] = useState({
    zone_id: "",
    city_name: "",
    extra_ton_rate_standard: "165",
    prepay_discount_pct: "5",
    heavy_base_10yd: "638",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [ratesRes, zonesRes] = await Promise.all([
        supabase.from("city_rates").select("*").order("city_name"),
        supabase.from("pricing_zones").select("id, name").eq("is_active", true),
      ]);

      if (ratesRes.data) setRates(ratesRes.data);
      if (zonesRes.data) setZones(zonesRes.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function openAdd() {
    setEditingItem(null);
    setForm({
      zone_id: "",
      city_name: "",
      extra_ton_rate_standard: "165",
      prepay_discount_pct: "5",
      heavy_base_10yd: "638",
      is_active: true,
    });
    setDialogOpen(true);
  }

  function openEdit(item: CityRate) {
    setEditingItem(item);
    setForm({
      zone_id: item.zone_id || "",
      city_name: item.city_name,
      extra_ton_rate_standard: item.extra_ton_rate_standard.toString(),
      prepay_discount_pct: (item.prepay_discount_pct * 100).toString(),
      heavy_base_10yd: item.heavy_base_10yd.toString(),
      is_active: item.is_active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.city_name.trim()) {
      toast({ title: "City name is required", variant: "destructive" });
      return;
    }

    const data = {
      zone_id: form.zone_id || null,
      city_name: form.city_name.trim(),
      extra_ton_rate_standard: parseFloat(form.extra_ton_rate_standard) || 165,
      prepay_discount_pct: (parseFloat(form.prepay_discount_pct) || 5) / 100,
      heavy_base_10yd: parseFloat(form.heavy_base_10yd) || 638,
      is_active: form.is_active,
    };

    try {
      if (editingItem) {
        const { error } = await supabase.from("city_rates").update(data).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "City rate updated" });
      } else {
        const { error } = await supabase.from("city_rates").insert(data);
        if (error) throw error;
        toast({ title: "City rate added" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this city rate?")) return;
    try {
      const { error } = await supabase.from("city_rates").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted" });
      fetchData();
    } catch (err) {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  }

  const getZoneName = (id: string | null) => zones.find((z) => z.id === id)?.name || "—";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">City Rates</h1>
          <p className="text-muted-foreground">Extra ton rates and heavy base pricing by city</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add City Rate
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">$165</div>
            <p className="text-sm text-muted-foreground">Standard Extra Ton Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">$156.75</div>
            <p className="text-sm text-muted-foreground">Prepay Rate (5% discount)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">$638</div>
            <p className="text-sm text-muted-foreground">Heavy 10yd Base Price</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">City Rate Configuration</CardTitle>
          <CardDescription>Set per-city overages and heavy base pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Standard Rate</TableHead>
                <TableHead>Prepay Discount</TableHead>
                <TableHead>Prepay Rate</TableHead>
                <TableHead>Heavy 10yd Base</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No city rates configured. Add Oakland and San Jose to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rates.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.city_name}</TableCell>
                    <TableCell>{getZoneName(item.zone_id)}</TableCell>
                    <TableCell>
                      <span className="font-mono">${item.extra_ton_rate_standard.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>{(item.prepay_discount_pct * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      <span className="font-mono text-blue-600">${item.extra_ton_rate_prepay.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">${item.heavy_base_10yd.toFixed(0)}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} City Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>City Name *</Label>
              <Input
                value={form.city_name}
                onChange={(e) => setForm({ ...form, city_name: e.target.value })}
                placeholder="e.g., Oakland"
              />
            </div>
            <div className="space-y-2">
              <Label>Zone (optional)</Label>
              <Select value={form.zone_id} onValueChange={(v) => setForm({ ...form, zone_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific zone</SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Extra Ton Rate ($/ton)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.extra_ton_rate_standard}
                  onChange={(e) => setForm({ ...form, extra_ton_rate_standard: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prepay Discount (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.prepay_discount_pct}
                  onChange={(e) => setForm({ ...form, prepay_discount_pct: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Heavy 10yd Base Price ($)</Label>
              <Input
                type="number"
                step="1"
                value={form.heavy_base_10yd}
                onChange={(e) => setForm({ ...form, heavy_base_10yd: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                8yd = {(parseFloat(form.heavy_base_10yd) * 0.8).toFixed(0)}, 
                6yd = {(parseFloat(form.heavy_base_10yd) * 0.6).toFixed(0)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
