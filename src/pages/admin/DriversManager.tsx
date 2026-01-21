import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Truck, Loader2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  license_number: string | null;
  truck_type: string | null;
  is_owner_operator: boolean;
  assigned_yard_id: string | null;
  is_active: boolean;
}

interface Yard {
  id: string;
  name: string;
  market: string;
}

export default function DriversManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    license_number: "",
    truck_type: "",
    is_owner_operator: false,
    assigned_yard_id: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [driversRes, yardsRes] = await Promise.all([
        supabase.from("drivers").select("*").order("name"),
        supabase.from("yards").select("id, name, market").eq("is_active", true),
      ]);

      if (driversRes.data) setDrivers(driversRes.data);
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
      name: "",
      phone: "",
      email: "",
      license_number: "",
      truck_type: "",
      is_owner_operator: false,
      assigned_yard_id: "",
      is_active: true,
    });
    setDialogOpen(true);
  }

  function openEdit(item: Driver) {
    setEditingItem(item);
    setForm({
      name: item.name,
      phone: item.phone,
      email: item.email || "",
      license_number: item.license_number || "",
      truck_type: item.truck_type || "",
      is_owner_operator: item.is_owner_operator,
      assigned_yard_id: item.assigned_yard_id || "",
      is_active: item.is_active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Name and phone are required", variant: "destructive" });
      return;
    }

    const data = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      license_number: form.license_number.trim() || null,
      truck_type: form.truck_type.trim() || null,
      is_owner_operator: form.is_owner_operator,
      assigned_yard_id: form.assigned_yard_id || null,
      is_active: form.is_active,
    };

    try {
      if (editingItem) {
        const { error } = await supabase.from("drivers").update(data).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Driver updated" });
      } else {
        const { error } = await supabase.from("drivers").insert(data);
        if (error) throw error;
        toast({ title: "Driver added" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this driver?")) return;
    try {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted" });
      fetchData();
    } catch (err) {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  }

  const getYardName = (id: string | null) => yards.find((y) => y.id === id)?.name || "Unassigned";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeDrivers = drivers.filter((d) => d.is_active);
  const ownerOperators = drivers.filter((d) => d.is_owner_operator && d.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers & Owner Operators</h1>
          <p className="text-muted-foreground">Manage drivers for dispatch assignments</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeDrivers.length}</div>
                <p className="text-sm text-muted-foreground">Active Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{ownerOperators.length}</div>
                <p className="text-sm text-muted-foreground">Owner Operators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{drivers.length - activeDrivers.length}</div>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Drivers</CardTitle>
          <CardDescription>Drivers and owner operators available for job assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Assigned Yard</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No drivers configured
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {item.phone}
                        </span>
                        {item.email && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {item.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_owner_operator ? "default" : "secondary"}>
                        {item.is_owner_operator ? "Owner Op" : "Employee"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.truck_type || "—"}</TableCell>
                    <TableCell>{getYardName(item.assigned_yard_id)}</TableCell>
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
            <DialogTitle>{editingItem ? "Edit" : "Add"} Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(510) 555-1234"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="driver@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input
                  value={form.license_number}
                  onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Truck Type</Label>
                <Input
                  value={form.truck_type}
                  onChange={(e) => setForm({ ...form, truck_type: e.target.value })}
                  placeholder="e.g., Roll-off 30yd"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Yard</Label>
              <Select value={form.assigned_yard_id} onValueChange={(v) => setForm({ ...form, assigned_yard_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select yard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {yards.map((y) => (
                    <SelectItem key={y.id} value={y.id}>{y.name} ({y.market})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_owner_operator}
                  onCheckedChange={(v) => setForm({ ...form, is_owner_operator: v })}
                />
                <Label>Owner Operator</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Active</Label>
              </div>
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
