import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Clock, X, HeadphonesIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface SupportAccess {
  id: string;
  tenant_id: string;
  granted_by: string;
  support_user_id: string;
  access_level: string;
  expires_at: string;
  reason: string | null;
  created_at: string;
  revoked_at: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export const SupportAccessPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; accessId: string | null }>({ 
    open: false, 
    accessId: null 
  });
  const [formData, setFormData] = useState({
    tenant_id: '',
    support_user_id: '',
    access_level: 'read_only',
    duration_hours: '24',
    reason: '',
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Tenant[];
    },
  });

  const { data: platformOwners } = useQuery({
    queryKey: ['platform-owners'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'platform_owner');
      
      if (rolesError) throw rolesError;
      
      const userIds = roles.map(r => r.user_id);
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      return profiles as Profile[];
    },
  });

  const { data: accessList, isLoading } = useQuery({
    queryKey: ['support-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_access')
        .select('*')
        .is('revoked_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SupportAccess[];
    },
  });

  const createAccess = useMutation({
    mutationFn: async (data: typeof formData) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(data.duration_hours));

      const { error } = await supabase
        .from('support_access')
        .insert([{
          tenant_id: data.tenant_id,
          support_user_id: data.support_user_id,
          granted_by: user?.id,
          access_level: data.access_level,
          expires_at: expiresAt.toISOString(),
          reason: data.reason || null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-access'] });
      toast({ title: 'Tilgang opprettet', description: 'Support-tilgang er gitt.' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke opprette tilgang.', 
        variant: 'destructive' 
      });
    },
  });

  const revokeAccess = useMutation({
    mutationFn: async (accessId: string) => {
      const { error } = await supabase
        .from('support_access')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', accessId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-access'] });
      toast({ title: 'Tilgang trukket', description: 'Support-tilgangen er trukket tilbake.' });
      setRevokeDialog({ open: false, accessId: null });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke trekke tilgang.', 
        variant: 'destructive' 
      });
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      tenant_id: '',
      support_user_id: '',
      access_level: 'read_only',
      duration_hours: '24',
      reason: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccess.mutate(formData);
  };

  const formatExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return 'Utløpt';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} dag${days > 1 ? 'er' : ''} igjen`;
    }
    return `${hours}t ${minutes}m igjen`;
  };

  const getTenantName = (tenantId: string) => {
    return tenants?.find(t => t.id === tenantId)?.name || 'Ukjent';
  };

  const getSupportUserName = (userId: string) => {
    const owner = platformOwners?.find(p => p.id === userId);
    return owner?.full_name || owner?.email || 'Ukjent';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support-tilgang</h2>
          <p className="text-muted-foreground">Administrer tidsbegrenset tilgang til tenants</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} variant="cta">
          <Plus className="h-4 w-4 mr-2" />
          Gi tilgang
        </Button>
      </div>

      {!accessList?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Ingen aktive support-tilganger</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessList.map((access) => {
            const isExpired = new Date(access.expires_at) < new Date();
            
            return (
              <Card key={access.id} className={isExpired ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{getTenantName(access.tenant_id)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Support: {getSupportUserName(access.support_user_id)}
                      </p>
                    </div>
                    <Badge variant={access.access_level === 'full' ? 'default' : 'secondary'}>
                      {access.access_level === 'full' ? 'Full' : 'Les'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={isExpired ? 'text-destructive' : 'text-muted-foreground'}>
                      {formatExpiry(access.expires_at)}
                    </span>
                  </div>
                  {access.reason && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{access.reason}</p>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setRevokeDialog({ open: true, accessId: access.id })}
                    disabled={isExpired}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Trekk tilbake
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gi support-tilgang</DialogTitle>
            <DialogDescription>
              Opprett tidsbegrenset tilgang til en tenant for support-formål
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tenant">Tenant *</Label>
              <Select 
                value={formData.tenant_id} 
                onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="support_user">Support-bruker *</Label>
              <Select 
                value={formData.support_user_id} 
                onValueChange={(value) => setFormData({ ...formData, support_user_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg bruker..." />
                </SelectTrigger>
                <SelectContent>
                  {platformOwners?.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.full_name || owner.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="access_level">Tilgangsnivå *</Label>
              <Select 
                value={formData.access_level} 
                onValueChange={(value) => setFormData({ ...formData, access_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read_only">Kun lesing</SelectItem>
                  <SelectItem value="full">Full tilgang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Varighet *</Label>
              <Select 
                value={formData.duration_hours} 
                onValueChange={(value) => setFormData({ ...formData, duration_hours: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 time</SelectItem>
                  <SelectItem value="4">4 timer</SelectItem>
                  <SelectItem value="24">24 timer</SelectItem>
                  <SelectItem value="72">3 dager</SelectItem>
                  <SelectItem value="168">1 uke</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Årsak (valgfritt)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Beskriv hvorfor tilgangen trengs..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Avbryt
              </Button>
              <Button 
                type="submit" 
                variant="cta" 
                disabled={!formData.tenant_id || !formData.support_user_id || createAccess.isPending}
              >
                {createAccess.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Gi tilgang
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <AlertDialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ ...revokeDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trekk tilbake tilgang?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil trekke tilbake denne support-tilgangen? Brukeren vil umiddelbart miste tilgang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeDialog.accessId) {
                  revokeAccess.mutate(revokeDialog.accessId);
                }
              }}
            >
              Trekk tilbake
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
