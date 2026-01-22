import { useState, useEffect } from 'react';
import { 
  Users, Shield, ChevronRight, Search, Loader2, 
  UserPlus, AlertTriangle, Check 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createAuditLog } from '@/lib/auditLog';
import { PermissionGate, ReasonNoteDialog } from '@/components/admin/config';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import type { AppRole } from '@/hooks/useAdminAuth';

interface UserWithRoles {
  user_id: string;
  email: string;
  roles: AppRole[];
  created_at: string;
}

// All available roles with metadata
const ALL_ROLES: { value: AppRole; label: string; description: string; color: string; category: 'admin' | 'staff' | 'external' }[] = [
  // Admin-level roles
  { value: 'system_admin', label: 'System Admin', description: 'Full access to all system settings', color: 'bg-red-500', category: 'admin' },
  { value: 'admin', label: 'Admin', description: 'Full access (legacy)', color: 'bg-red-400', category: 'admin' },
  { value: 'ops_admin', label: 'Ops Admin', description: 'Inventory, dispatch, yards, zones', color: 'bg-orange-500', category: 'admin' },
  { value: 'finance_admin', label: 'Finance Admin', description: 'Rates, overage, billing settings', color: 'bg-yellow-500', category: 'admin' },
  { value: 'sales_admin', label: 'Sales Admin', description: 'Programs, discounts, templates', color: 'bg-green-500', category: 'admin' },
  { value: 'read_only_admin', label: 'Read-Only Admin', description: 'Dashboard viewing only', color: 'bg-gray-400', category: 'admin' },
  // Staff roles
  { value: 'sales', label: 'Sales', description: 'Quote creation, lead management', color: 'bg-blue-500', category: 'staff' },
  { value: 'dispatcher', label: 'Dispatcher', description: 'Scheduling and route management', color: 'bg-purple-500', category: 'staff' },
  { value: 'finance', label: 'Finance', description: 'Invoicing and payment processing', color: 'bg-emerald-500', category: 'staff' },
  { value: 'driver', label: 'Driver', description: 'W2 driver access', color: 'bg-cyan-500', category: 'staff' },
  { value: 'owner_operator', label: 'Owner Operator', description: '1099 driver access', color: 'bg-teal-500', category: 'staff' },
  // External
  { value: 'customer', label: 'Customer', description: 'Customer portal access', color: 'bg-slate-400', category: 'external' },
];

export default function UserRolesManager() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isSystemAdmin } = useAdminPermissions();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    
    // Get all user roles
    const { data: rolesData, error } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at');

    if (error) {
      toast({ title: 'Error loading users', description: error.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    // Group by user_id
    const userMap = new Map<string, { roles: AppRole[]; created_at: string }>();
    rolesData?.forEach((r) => {
      const existing = userMap.get(r.user_id);
      if (existing) {
        existing.roles.push(r.role as AppRole);
      } else {
        userMap.set(r.user_id, { roles: [r.role as AppRole], created_at: r.created_at });
      }
    });

    // Get user emails from profiles
    const userIds = Array.from(userMap.keys());
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    const emailMap = new Map<string, string>();
    profiles?.forEach((p) => {
      // Use display_name or truncated user_id as fallback
      if (p.display_name) emailMap.set(p.user_id, p.display_name);
    });

    // Build user list
    const userList: UserWithRoles[] = Array.from(userMap.entries()).map(([userId, data]) => ({
      user_id: userId,
      email: emailMap.get(userId) || userId.slice(0, 8) + '...',
      roles: data.roles,
      created_at: data.created_at,
    }));

    setUsers(userList.sort((a, b) => a.email.localeCompare(b.email)));
    setIsLoading(false);
  }

  function openEditDialog(user: UserWithRoles) {
    setEditingUser(user);
    setSelectedRoles([...user.roles]);
  }

  function toggleRole(role: AppRole) {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  }

  function handleSaveClick() {
    if (!editingUser) return;
    
    // Check if roles actually changed
    const added = selectedRoles.filter((r) => !editingUser.roles.includes(r));
    const removed = editingUser.roles.filter((r) => !selectedRoles.includes(r));
    
    if (added.length === 0 && removed.length === 0) {
      setEditingUser(null);
      return;
    }
    
    setReasonDialogOpen(true);
  }

  async function handleSaveRoles(reasonNote: string) {
    if (!editingUser) return;

    setSaving(true);

    const added = selectedRoles.filter((r) => !editingUser.roles.includes(r));
    const removed = editingUser.roles.filter((r) => !selectedRoles.includes(r));

    try {
      // Remove old roles
      if (removed.length > 0) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', editingUser.user_id)
          .in('role', removed);
      }

      // Add new roles
      if (added.length > 0) {
        await supabase
          .from('user_roles')
          .insert(added.map((role) => ({
            user_id: editingUser.user_id,
            role,
          })));
      }

      // Create audit log
      await createAuditLog({
        action: 'update',
        entityType: 'user_roles',
        entityId: editingUser.user_id,
        beforeData: { roles: editingUser.roles, email: editingUser.email },
        afterData: { roles: selectedRoles, email: editingUser.email },
        changesSummary: `${reasonNote} | Added: ${added.join(', ') || 'none'} | Removed: ${removed.join(', ') || 'none'}`,
      });

      toast({ title: 'Roles updated', description: `Updated roles for ${editingUser.email}` });
      setEditingUser(null);
      setReasonDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error updating roles', description: String(err), variant: 'destructive' });
    }

    setSaving(false);
  }

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.roles.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadgeColor = (role: AppRole) => {
    const config = ALL_ROLES.find((r) => r.value === role);
    return config?.color || 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PermissionGate module="users" action="read">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage user roles and permissions
            </p>
          </div>
        </div>

        {/* Role Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Role Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Admin Roles</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_ROLES.filter((r) => r.category === 'admin').map((r) => (
                    <Badge key={r.value} className={`${r.color} text-white text-xs`}>
                      {r.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Staff Roles</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_ROLES.filter((r) => r.category === 'staff').map((r) => (
                    <Badge key={r.value} className={`${r.color} text-white text-xs`}>
                      {r.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">External</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_ROLES.filter((r) => r.category === 'external').map((r) => (
                    <Badge key={r.value} className={`${r.color} text-white text-xs`}>
                      {r.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <Card key={user.user_id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          className={`${getRoleBadgeColor(role)} text-white text-xs`}
                        >
                          {ALL_ROLES.find((r) => r.value === role)?.label || role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {isSystemAdmin() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    Edit Roles
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No users found matching your search.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Roles Dialog */}
      <Dialog open={!!editingUser && !reasonDialogOpen} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              {editingUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {['admin', 'staff', 'external'].map((category) => (
              <div key={category}>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {category === 'admin' ? 'Admin Roles' : category === 'staff' ? 'Staff Roles' : 'External'}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {ALL_ROLES.filter((r) => r.category === category).map((role) => (
                    <div
                      key={role.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRoles.includes(role.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => toggleRole(role.value)}
                    >
                      <Checkbox
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={() => toggleRole(role.value)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${role.color}`} />
                          <Label className="font-medium cursor-pointer">{role.label}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reason Note Dialog */}
      <ReasonNoteDialog
        open={reasonDialogOpen}
        onOpenChange={setReasonDialogOpen}
        onConfirm={handleSaveRoles}
        title="Confirm Role Changes"
        description="Role changes are logged in the audit trail. Please provide a reason for this change."
        isLoading={saving}
      />
    </PermissionGate>
  );
}
