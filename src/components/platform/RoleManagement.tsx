import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, X, Loader2, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  tenant_id: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

const roleLabels: Record<string, string> = {
  platform_owner: 'Platform Owner',
  tenant_admin: 'Tenant Admin',
  worker: 'Worker',
  admin: 'Admin (Legacy)',
  moderator: 'Moderator',
  user: 'Bruker',
};

const roleColors: Record<string, string> = {
  platform_owner: 'bg-purple-500',
  tenant_admin: 'bg-blue-500',
  worker: 'bg-green-500',
  admin: 'bg-orange-500',
  moderator: 'bg-yellow-500',
  user: 'bg-gray-500',
};

export const RoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newTenantId, setNewTenantId] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roleId: string | null; roleName: string }>({ 
    open: false, 
    roleId: null,
    roleName: '' 
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Tenant[];
    },
  });

  const { data: searchResults, isLoading: searching, refetch: searchUsers } = useQuery({
    queryKey: ['user-search', searchEmail],
    queryFn: async () => {
      if (!searchEmail || searchEmail.length < 3) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, tenant_id')
        .ilike('email', `%${searchEmail}%`)
        .limit(5);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: searchEmail.length >= 3,
  });

  const { data: userRoles, refetch: refetchRoles } = useQuery({
    queryKey: ['user-roles', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', selectedUser.id);
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!selectedUser,
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: role as any }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', selectedUser?.id] });
      refetchRoles();
      toast({ title: 'Rolle lagt til', description: 'Brukerens rolle er oppdatert.' });
      setNewRole('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke legge til rolle.', 
        variant: 'destructive' 
      });
    },
  });

  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', selectedUser?.id] });
      refetchRoles();
      toast({ title: 'Rolle fjernet', description: 'Brukerens rolle er fjernet.' });
      setDeleteDialog({ open: false, roleId: null, roleName: '' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke fjerne rolle.', 
        variant: 'destructive' 
      });
    },
  });

  const updateTenant = useMutation({
    mutationFn: async ({ userId, tenantId }: { userId: string; tenantId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Tenant oppdatert', description: 'Brukerens tenant er endret.' });
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, tenant_id: newTenantId || null });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke oppdatere tenant.', 
        variant: 'destructive' 
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers();
  };

  const handleAddRole = () => {
    if (!selectedUser || !newRole) return;
    addRole.mutate({ userId: selectedUser.id, role: newRole });
  };

  const handleUpdateTenant = () => {
    if (!selectedUser) return;
    updateTenant.mutate({ userId: selectedUser.id, tenantId: newTenantId || null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Brukeradministrasjon</h2>
        <p className="text-muted-foreground">Søk etter brukere og administrer roller</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Søk etter bruker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Søk på e-post..."
              className="flex-1"
            />
            <Button type="submit" disabled={searching || searchEmail.length < 3}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <div 
                  key={user.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setSelectedUser(user);
                    setNewTenantId(user.tenant_id || '');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || 'Uten navn'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchResults && searchResults.length === 0 && searchEmail.length >= 3 && (
            <p className="mt-4 text-muted-foreground text-center py-4">Ingen brukere funnet</p>
          )}
        </CardContent>
      </Card>

      {/* Selected User Details */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedUser.full_name || selectedUser.email}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Roles */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Nåværende roller</Label>
              <div className="flex flex-wrap gap-2">
                {userRoles && userRoles.length > 0 ? (
                  userRoles.map((role) => (
                    <Badge 
                      key={role.id} 
                      className={`${roleColors[role.role] || 'bg-gray-500'} flex items-center gap-1`}
                    >
                      {roleLabels[role.role] || role.role}
                      <button
                        onClick={() => setDeleteDialog({ open: true, roleId: role.id, roleName: roleLabels[role.role] || role.role })}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">Ingen roller tildelt</span>
                )}
              </div>
            </div>

            {/* Add Role */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Legg til rolle</Label>
              <div className="flex gap-2">
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Velg rolle..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform_owner">Platform Owner</SelectItem>
                    <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="admin">Admin (Legacy)</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddRole} 
                  disabled={!newRole || addRole.isPending}
                >
                  {addRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Assign Tenant */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Tilordne tenant</Label>
              <div className="flex gap-2">
                <Select value={newTenantId} onValueChange={setNewTenantId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Velg tenant..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ingen tenant</SelectItem>
                    {tenants?.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleUpdateTenant}
                  disabled={updateTenant.isPending}
                >
                  {updateTenant.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lagre'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fjern rolle?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil fjerne rollen "{deleteDialog.roleName}" fra denne brukeren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.roleId) {
                  removeRole.mutate(deleteDialog.roleId);
                }
              }}
            >
              Fjern rolle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
