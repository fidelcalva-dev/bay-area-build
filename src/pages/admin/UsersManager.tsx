// Admin User Manager - Create Users, Assign Roles, Manage Status
import { StaffInviteDialog } from '@/components/admin/StaffInviteDialog';
import { useEffect, useState, useMemo } from 'react';
import { 
  UserCog, Plus, Loader2, Shield, Check, X, Search, 
  Trash2, Edit, UserPlus, Eye, Power, PowerOff,
  Building, Phone, Mail, Clock, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

// Types
type AppRole = Database['public']['Enums']['app_role'];
type StaffStatus = 'active' | 'inactive' | 'pending';

interface StaffUser {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  department: string;
  status: StaffStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  notes: string | null;
  roles: AppRole[];
}

interface RoleDefinition {
  role: AppRole;
  label: string;
  description: string;
  department: string;
  allowed_routes: string[];
  allowed_actions: string[];
}

interface UserAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  target_email: string;
  before_data: any;
  after_data: any;
  created_at: string;
}

// Constants
const DEPARTMENTS = [
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'sales', label: 'Sales' },
  { value: 'dispatch_logistics', label: 'Dispatch/Logistics' },
  { value: 'drivers_field_ops', label: 'Drivers/Field Ops' },
  { value: 'finance_billing', label: 'Finance/Billing' },
  { value: 'operations_admin', label: 'Operations Admin' },
  { value: 'system_admin', label: 'System Admin' },
  { value: 'executive', label: 'Executive/Owner' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  system_admin: 'bg-purple-100 text-purple-800 border-purple-200',
  ops_admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  cs: 'bg-teal-100 text-teal-800 border-teal-200',
  cs_agent: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  sales: 'bg-blue-100 text-blue-800 border-blue-200',
  dispatcher: 'bg-violet-100 text-violet-800 border-violet-200',
  driver: 'bg-orange-100 text-orange-800 border-orange-200',
  owner_operator: 'bg-amber-100 text-amber-800 border-amber-200',
  finance: 'bg-green-100 text-green-800 border-green-200',
  billing_specialist: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  executive: 'bg-rose-100 text-rose-800 border-rose-200',
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: Power },
  inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800 border-red-200', icon: PowerOff },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
};

export default function UsersManager() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  
  // Data state
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');
  
  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    status: 'active' as StaffStatus,
    notes: '',
    roles: [] as AppRole[],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    
    try {
      // Fetch staff users
      const { data: staffData, error: staffError } = await supabase
        .from('staff_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (staffError) throw staffError;

      // Fetch user roles for each staff user
      const staffWithRoles: StaffUser[] = [];
      for (const staff of staffData || []) {
        let roles: AppRole[] = [];
        if (staff.user_id) {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', staff.user_id);
          roles = (rolesData || []).map(r => r.role);
        }
        staffWithRoles.push({ 
          ...staff, 
          status: staff.status as StaffStatus,
          roles 
        });
      }
      setStaffUsers(staffWithRoles);

      // Fetch role definitions
      const { data: rolesData, error: rolesError } = await supabase
        .from('role_definitions')
        .select('*')
        .order('role');

      if (rolesError) throw rolesError;
      setRoleDefinitions(rolesData || []);

      // Fetch recent audit logs
      const { data: logsData } = await supabase
        .from('user_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setAuditLogs(logsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error loading data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  // Log audit event
  async function logAuditEvent(
    action: string, 
    targetEmail: string, 
    targetUserId: string | null,
    beforeData: any, 
    afterData: any
  ) {
    try {
      await supabase.from('user_audit_logs').insert({
        admin_id: user?.id,
        action,
        target_email: targetEmail,
        target_user_id: targetUserId,
        before_data: beforeData,
        after_data: afterData,
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  // Create new user
  async function handleCreateUser() {
    if (!formData.full_name || !formData.email || !formData.department) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      // Create staff_users record (user_id will be null until they sign up)
      const { data: staffData, error: staffError } = await supabase
        .from('staff_users')
        .insert({
          full_name: formData.full_name,
          email: formData.email.toLowerCase(),
          phone: formData.phone || null,
          department: formData.department,
          status: 'pending', // Pending until they complete signup
          notes: formData.notes || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (staffError) {
        if (staffError.code === '23505') {
          toast({ title: 'Email already exists', variant: 'destructive' });
        } else {
          throw staffError;
        }
        return;
      }

      // Log audit event
      await logAuditEvent(
        'user_created',
        formData.email,
        null,
        null,
        { ...formData, id: staffData.id }
      );

      toast({ title: 'User created successfully' });
      setCreateDialogOpen(false);
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Error creating user:', error);
      toast({ title: 'Error creating user', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  // Update user
  async function handleUpdateUser() {
    if (!selectedUser) return;

    setIsSaving(true);

    try {
      const beforeData = {
        full_name: selectedUser.full_name,
        phone: selectedUser.phone,
        department: selectedUser.department,
        status: selectedUser.status,
        notes: selectedUser.notes,
        roles: selectedUser.roles,
      };

      // Update staff_users record
      const { error: updateError } = await supabase
        .from('staff_users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          department: formData.department,
          status: formData.status,
          notes: formData.notes || null,
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Update roles if user_id exists
      if (selectedUser.user_id) {
        // Remove old roles
        const rolesToRemove = selectedUser.roles.filter(r => !formData.roles.includes(r));
        if (rolesToRemove.length > 0) {
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', selectedUser.user_id)
            .in('role', rolesToRemove);
        }

        // Add new roles
        const rolesToAdd = formData.roles.filter(r => !selectedUser.roles.includes(r));
        if (rolesToAdd.length > 0) {
          await supabase
            .from('user_roles')
            .insert(rolesToAdd.map(role => ({
              user_id: selectedUser.user_id,
              role,
            })));
        }
      }

      // Log audit event
      await logAuditEvent(
        'user_updated',
        selectedUser.email,
        selectedUser.user_id,
        beforeData,
        { ...formData }
      );

      toast({ title: 'User updated successfully' });
      setEditDialogOpen(false);
      fetchData();

    } catch (error) {
      console.error('Error updating user:', error);
      toast({ title: 'Error updating user', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  // Toggle user status
  async function handleToggleStatus(staffUser: StaffUser) {
    const newStatus = staffUser.status === 'active' ? 'inactive' : 'active';

    try {
      await supabase
        .from('staff_users')
        .update({ status: newStatus })
        .eq('id', staffUser.id);

      await logAuditEvent(
        newStatus === 'active' ? 'user_activated' : 'user_disabled',
        staffUser.email,
        staffUser.user_id,
        { status: staffUser.status },
        { status: newStatus }
      );

      toast({ title: `User ${newStatus === 'active' ? 'activated' : 'disabled'}` });
      fetchData();

    } catch (error) {
      console.error('Error toggling status:', error);
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  }

  // Open edit dialog
  function openEditDialog(staffUser: StaffUser) {
    setSelectedUser(staffUser);
    setFormData({
      full_name: staffUser.full_name,
      email: staffUser.email,
      phone: staffUser.phone || '',
      department: staffUser.department,
      status: staffUser.status,
      notes: staffUser.notes || '',
      roles: staffUser.roles,
    });
    setEditDialogOpen(true);
  }

  // Open view dialog
  function openViewDialog(staffUser: StaffUser) {
    setSelectedUser(staffUser);
    setViewDialogOpen(true);
  }

  // Reset form
  function resetForm() {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      department: '',
      status: 'active' as StaffStatus,
      notes: '',
      roles: [],
    });
    setSelectedUser(null);
  }

  // Toggle role in form
  function toggleRole(role: AppRole) {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  }

  // Filter users
  const filteredUsers = useMemo(() => {
    return staffUsers.filter(u => {
      const matchesSearch = 
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.roles.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = filterDepartment === 'all' || u.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [staffUsers, searchTerm, filterDepartment, filterStatus]);

  // Get role definition
  function getRoleDefinition(role: string) {
    return roleDefinitions.find(r => r.role === role);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Create users, assign roles, and manage access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Invite with Temp Password
          </Button>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users ({staffUsers.length})</TabsTrigger>
          <TabsTrigger value="roles">Role Definitions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map(d => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((staffUser) => {
                  const statusConfig = STATUS_CONFIG[staffUser.status];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <TableRow key={staffUser.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {staffUser.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{staffUser.full_name}</p>
                            <p className="text-sm text-muted-foreground">{staffUser.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {DEPARTMENTS.find(d => d.value === staffUser.department)?.label || staffUser.department}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {staffUser.roles.length > 0 ? (
                            staffUser.roles.map((role) => (
                              <Badge key={role} variant="outline" className={ROLE_COLORS[role] || ''}>
                                {getRoleDefinition(role)?.label || role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No roles assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(staffUser.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(staffUser)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(staffUser)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleStatus(staffUser)}
                          >
                            {staffUser.status === 'active' ? (
                              <PowerOff className="w-4 h-4 text-destructive" />
                            ) : (
                              <Power className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterDepartment !== 'all' || filterStatus !== 'all' 
                        ? 'No users match your filters' 
                        : 'No users created yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Role Definitions Tab */}
        <TabsContent value="roles">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleDefinitions.map((role) => (
              <Card key={role.role}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={ROLE_COLORS[role.role] || ''}>
                      {role.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {DEPARTMENTS.find(d => d.value === role.department)?.label}
                    </span>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Allowed Routes</p>
                    <div className="flex flex-wrap gap-1">
                      {role.allowed_routes.map((route, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {route}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Actions</p>
                    <div className="flex flex-wrap gap-1">
                      {role.allowed_actions.map((action, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">{log.action.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.target_email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {log.after_data ? JSON.stringify(log.after_data).slice(0, 50) + '...' : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
                {auditLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No audit logs yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a staff member to the system. They'll receive an invite to set up their account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="john@calsan.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="(510) 555-0123"
                />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData(p => ({ ...p, department: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Any notes about this user..."
                rows={2}
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                User will be created with "Pending" status. Once they sign up with this email, 
                you can assign roles and activate their account.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData(p => ({ ...p, department: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: any) => setFormData(p => ({ ...p, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Roles */}
            {selectedUser?.user_id && (
              <div className="space-y-3">
                <Label>Assign Roles</Label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {roleDefinitions.map((role) => (
                    <div
                      key={role.role}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.roles.includes(role.role) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => toggleRole(role.role)}
                    >
                      <Checkbox
                        checked={formData.roles.includes(role.role)}
                        onCheckedChange={() => toggleRole(role.role)}
                      />
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className={ROLE_COLORS[role.role] || ''}>
                          {role.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedUser?.user_id && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This user hasn't signed up yet. Roles can only be assigned after they create their account.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {DEPARTMENTS.find(d => d.value === selectedUser.department)?.label}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedUser.status].color}>
                    {STATUS_CONFIG[selectedUser.status].label}
                  </Badge>
                </div>
                {selectedUser.phone && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Roles & Permissions */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Roles & Permissions</p>
                {selectedUser.roles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.roles.map((role) => {
                      const def = getRoleDefinition(role);
                      return (
                        <div key={role} className="p-3 bg-muted rounded-lg">
                          <Badge variant="outline" className={ROLE_COLORS[role] || ''}>
                            {def?.label || role}
                          </Badge>
                          {def && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>Routes: {def.allowed_routes.join(', ')}</p>
                              <p>Actions: {def.allowed_actions.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No roles assigned</p>
                )}
              </div>

              {selectedUser.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => { setViewDialogOpen(false); openEditDialog(selectedUser!); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Invite Dialog */}
      <StaffInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
