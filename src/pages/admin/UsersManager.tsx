import { useEffect, useState } from 'react';
import { UserCog, Plus, Loader2, Shield, Check, X, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AppRole } from '@/hooks/useAdminAuth';

interface UserWithRoles {
  user_id: string;
  email: string;
  roles: AppRole[];
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

const ALL_ROLES: { value: AppRole; label: string; description: string; color: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full system access', color: 'bg-red-100 text-red-800' },
  { value: 'sales', label: 'Sales', description: 'Quotes and leads', color: 'bg-blue-100 text-blue-800' },
  { value: 'dispatcher', label: 'Dispatcher', description: 'Scheduling and assignments', color: 'bg-purple-100 text-purple-800' },
  { value: 'finance', label: 'Finance', description: 'Tickets and receipts', color: 'bg-green-100 text-green-800' },
  { value: 'driver', label: 'Driver', description: 'Job execution', color: 'bg-orange-100 text-orange-800' },
  { value: 'owner_operator', label: 'Owner Operator', description: 'Driver + payouts', color: 'bg-amber-100 text-amber-800' },
  { value: 'customer', label: 'Customer', description: 'Portal access', color: 'bg-gray-100 text-gray-800' },
];

export default function UsersManager() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [allRoles, setAllRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    
    // Fetch all user roles
    const { data: rolesData, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading users', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    setAllRoles(rolesData as UserRole[]);

    // Group by user_id to get unique users with their roles
    const userMap = new Map<string, UserWithRoles>();
    
    for (const role of rolesData) {
      if (!userMap.has(role.user_id)) {
        userMap.set(role.user_id, {
          user_id: role.user_id,
          email: '', // Will be populated if we have user_profiles
          roles: [],
          created_at: role.created_at,
        });
      }
      userMap.get(role.user_id)!.roles.push(role.role as AppRole);
    }

    // Fetch user profiles to get emails
    const userIds = Array.from(userMap.keys());
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      if (profiles) {
        for (const profile of profiles) {
          const user = userMap.get(profile.user_id);
          if (user) {
            user.email = profile.display_name || profile.user_id.slice(0, 8);
          }
        }
      }
    }

    setUsers(Array.from(userMap.values()));
    setIsLoading(false);
  }

  function openEditDialog(user: UserWithRoles) {
    setSelectedUser(user);
    setSelectedRoles([...user.roles]);
    setEditDialogOpen(true);
  }

  function toggleRole(role: AppRole) {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  }

  async function handleSaveRoles() {
    if (!selectedUser) return;

    // Get current roles for this user
    const currentRoles = allRoles.filter(r => r.user_id === selectedUser.user_id);
    const currentRoleValues = currentRoles.map(r => r.role);

    // Roles to add
    const toAdd = selectedRoles.filter(r => !currentRoleValues.includes(r));
    // Roles to remove
    const toRemove = currentRoleValues.filter(r => !selectedRoles.includes(r as AppRole));

    // Remove roles
    if (toRemove.length > 0) {
      const idsToRemove = currentRoles
        .filter(r => toRemove.includes(r.role))
        .map(r => r.id);

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .in('id', idsToRemove);

      if (error) {
        toast({ title: 'Error removing roles', variant: 'destructive' });
        return;
      }
    }

    // Add roles
    if (toAdd.length > 0) {
      const { error } = await supabase
        .from('user_roles')
        .insert(toAdd.map(role => ({
          user_id: selectedUser.user_id,
          role,
        })));

      if (error) {
        toast({ title: 'Error adding roles', variant: 'destructive' });
        return;
      }
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'update_roles',
      entity_type: 'user_roles',
      entity_id: selectedUser.user_id,
      before_data: { roles: currentRoleValues },
      after_data: { roles: selectedRoles },
      changes_summary: `Updated roles: removed [${toRemove.join(', ')}], added [${toAdd.join(', ')}]`,
    });

    toast({ title: 'Roles updated successfully' });
    setEditDialogOpen(false);
    fetchUsers();
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.roles.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, ID, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_ROLES.map((role) => (
          <Badge key={role.value} className={role.color}>
            {role.label}
          </Badge>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCog className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email || 'No Name'}</p>
                      <p className="text-xs text-muted-foreground">{user.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => {
                      const roleInfo = ALL_ROLES.find(r => r.value === role);
                      return (
                        <Badge key={role} className={roleInfo?.color || 'bg-gray-100'}>
                          {roleInfo?.label || role}
                        </Badge>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                    <Shield className="w-4 h-4 mr-1" />
                    Edit Roles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No users match your search' : 'No users with roles found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Roles Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              {selectedUser?.email || selectedUser?.user_id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {ALL_ROLES.map((role) => (
              <div
                key={role.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRoles.includes(role.value) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => toggleRole(role.value)}
              >
                <Checkbox
                  checked={selectedRoles.includes(role.value)}
                  onCheckedChange={() => toggleRole(role.value)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={role.color}>{role.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveRoles} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
