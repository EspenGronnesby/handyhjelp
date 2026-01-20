import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { logActivity } from '@/hooks/useActivityLog';
import { Search, Plus, X, Loader2, User, Crown, Shield, Hammer } from 'lucide-react';
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
import type { LucideIcon } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

// Norwegian role labels
const roleLabels: Record<string, string> = {
  platform_owner: 'Eier',
  admin: 'Administrator',
  worker: 'Medarbeider',
  moderator: 'Moderator',
  user: 'Bruker',
};

// Role colors
const roleColors: Record<string, string> = {
  platform_owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  worker: 'bg-green-500',
  moderator: 'bg-yellow-500',
  user: 'bg-gray-500',
};

// Role icons
const roleIcons: Record<string, LucideIcon> = {
  platform_owner: Crown,
  admin: Shield,
  worker: Hammer,
  moderator: User,
  user: User,
};

export const RoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roleId: string | null; roleName: string }>({ 
    open: false, 
    roleId: null,
    roleName: '' 
  });

  // Fetch all registered users
  const { data: allUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Search results (filter from all users)
  const searchResults = searchEmail.length >= 2
    ? allUsers?.filter(u => 
        u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchEmail.toLowerCase())
      ).slice(0, 10)
    : [];

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
    mutationFn: async ({ userId, role, userName }: { userId: string; role: string; userName: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: role as any }]);
      if (error) throw error;
      return { userName, role };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', selectedUser?.id] });
      refetchRoles();
      toast({ title: 'Rolle lagt til', description: 'Brukerens rolle er oppdatert.' });
      setNewRole('');
      
      // Log activity
      await logActivity(
        'role_assigned',
        'role_management',
        `Tildelte rollen "${roleLabels[data.role] || data.role}" til ${data.userName}`,
        { role: data.role },
        selectedUser?.id,
        data.userName
      );
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message?.includes('duplicate') 
          ? 'Brukeren har allerede denne rollen.' 
          : error.message || 'Kunne ikke legge til rolle.', 
        variant: 'destructive' 
      });
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ roleId, roleName }: { roleId: string; roleName: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      if (error) throw error;
      return { roleName };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', selectedUser?.id] });
      refetchRoles();
      toast({ title: 'Rolle fjernet', description: 'Brukerens rolle er fjernet.' });
      
      // Log activity
      await logActivity(
        'role_removed',
        'role_management',
        `Fjernet rollen "${data.roleName}" fra ${selectedUser?.full_name || selectedUser?.email}`,
        { role: deleteDialog.roleName },
        selectedUser?.id,
        selectedUser?.full_name || selectedUser?.email
      );
      
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

  const handleAddRole = () => {
    if (!selectedUser || !newRole) return;
    addRole.mutate({ userId: selectedUser.id, role: newRole, userName: selectedUser.full_name || selectedUser.email });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Brukeradministrasjon</h2>
        <p className="text-muted-foreground">Se registrerte brukere og administrer roller</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Søk etter bruker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Søk på e-post eller navn..."
                className="pl-10"
              />
            </div>
          </div>

          {/* All users list or search results */}
          <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
            {loadingUsers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              (searchEmail.length >= 2 ? searchResults : allUsers?.slice(0, 10))?.map((user) => (
                <div 
                  key={user.id}
                  className={`p-3 rounded-lg border cursor-pointer subtle-hover ${
                    selectedUser?.id === user.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
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
              ))
            )}
            
            {!loadingUsers && allUsers && allUsers.length > 10 && searchEmail.length < 2 && (
              <p className="text-center text-sm text-muted-foreground py-2">
                Viser 10 av {allUsers.length} brukere. Søk for å finne flere.
              </p>
            )}

            {searchEmail.length >= 2 && searchResults?.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Ingen brukere funnet</p>
            )}
          </div>
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
            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Roles */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Nåværende roller</Label>
              <div className="flex flex-wrap gap-2">
                {userRoles && userRoles.length > 0 ? (
                  userRoles.map((role) => {
                    const Icon = roleIcons[role.role] || User;
                    return (
                      <Badge 
                        key={role.id} 
                        className={`${roleColors[role.role] || 'bg-gray-500'} flex items-center gap-1`}
                      >
                        <Icon className="h-3 w-3" />
                        {roleLabels[role.role] || role.role}
                        <button
                          onClick={() => setDeleteDialog({ open: true, roleId: role.id, roleName: roleLabels[role.role] || role.role })}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })
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
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="worker">Medarbeider</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddRole} 
                  disabled={!newRole || addRole.isPending}
                >
                  {addRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Administrator: Full driftstilgang. Medarbeider: Kan sende inn innhold til godkjenning.
              </p>
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
                  removeRole.mutate({ roleId: deleteDialog.roleId, roleName: deleteDialog.roleName });
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
