import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, DollarSign, MapPin, Loader2 } from "lucide-react";
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

interface TollSurcharge {
  id: string;
  zone_id: string | null;
  origin_yard_id: string | null;
  surcharge_amount: number;
  description: string | null;
  applies_to_delivery: boolean;
  applies_to_pickup: boolean;
  is_active: boolean;
}

interface Zone {
  id: string;
  name: string;
  slug: string;
}

interface Yard {
  id: string;
  name: string;
  market: string;
}

export default function TollSurchargesManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [surcharges, setSurcharges] = useState<TollSurcharge[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TollSurcharge | null>(null);
  const [form, setForm] = useState({
    zone_id: "",
    origin_yard_id: "",
    surcharge_amount: "",
    description: "",
    applies_to_delivery: true,
    applies_to_pickup: true,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [surchargesRes, zonesRes, yardsRes] = await Promise.all([
        supabase.from("toll_surcharges").select("*").order("created_at"),
        supabase.from("pricing_zones").select("id, name, slug").eq("is_active", true),
        supabase.from("yards").select("id, name, market").eq("is_active", true),
      ]);

      if (surchargesRes.data) setSurcharges(surchargesRes.data);
      if (zonesRes.data) setZones(zonesRes.data);
      if (yardsRes.data) setYards(yardsRes.data);
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
      origin_yard_id: "",
      surcharge_amount: "",
      description: "",
      applies_to_delivery: true,
      applies_to_pickup: true,
      is_active: true,
    });
    setDialogOpen(true);
  }

  function openEdit(item: TollSurcharge) {
    setEditingItem(item);
    setForm({
      zone_id: item.zone_id || "",
      origin_yard_id: item.origin_yard_id || "",
      surcharge_amount: item.surcharge_amount.toString(),
      description: item.description || "",
      applies_to_delivery: item.applies_to_delivery,
      applies_to_pickup: item.applies_to_pickup,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const data = {
      zone_id: form.zone_id || null,
      origin_yard_id: form.origin_yard_id || null,
      surcharge_amount: parseFloat(form.surcharge_amount) || 0,
      description: form.description || null,
      applies_to_delivery: form.applies_to_delivery,
      applies_to_pickup: form.applies_to_pickup,
      is_active: form.is_active,
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("toll_surcharges")
          .update(data)
          .eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Toll surcharge updated" });
      } else {
        const { error } = await supabase.from("toll_surcharges").insert(data);
        if (error) throw error;
        toast({ title: "Toll surcharge added" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this toll surcharge?")) return;
    try {
      const { error } = await supabase.from("toll_surcharges").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted" });
      fetchData();
    } catch (err) {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  }

  const getZoneName = (id: string | null) => zones.find((z) => z.id === id)?.name || "All Zones";
  const getYardName = (id: string | null) => yards.find((y) => y.id === id)?.name || "All Yards";

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
          <h1 className="text-2xl font-bold">Toll Surcharges</h1>
          <p className="text-muted-foreground">v58 toll surcharge rules by zone and yard</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Surcharge
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Toll Rules</CardTitle>
          <CardDescription>Surcharges applied based on origin yard and destination zone</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origin Yard</TableHead>
                <TableHead>Destination Zone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surcharges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No toll surcharges configured
                  </TableCell>
                </TableRow>
              ) : (
                surcharges.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {getYardName(item.origin_yard_id)}
                      </div>
                    </TableCell>
                    <TableCell>{getZoneName(item.zone_id)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="w-4 h-4" />
                        {item.surcharge_amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {item.applies_to_delivery && "Delivery"}
                        {item.applies_to_delivery && item.applies_to_pickup && " + "}
                        {item.applies_to_pickup && "Pickup"}
                      </div>
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
            <DialogTitle>{editingItem ? "Edit" : "Add"} Toll Surcharge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origin Yard</Label>
                <Select value={form.origin_yard_id} onValueChange={(v) => setForm({ ...form, origin_yard_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Yards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Yards</SelectItem>
                    {yards.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destination Zone</Label>
                <Select value={form.zone_id} onValueChange={(v) => setForm({ ...form, zone_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Zones</SelectItem>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Surcharge Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.surcharge_amount}
                onChange={(e) => setForm({ ...form, surcharge_amount: e.target.value })}
                placeholder="25.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g., Bay Bridge toll"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.applies_to_delivery}
                  onCheckedChange={(v) => setForm({ ...form, applies_to_delivery: v })}
                />
                <Label>Apply to Delivery</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.applies_to_pickup}
                  onCheckedChange={(v) => setForm({ ...form, applies_to_pickup: v })}
                />
                <Label>Apply to Pickup</Label>
              </div>
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
