import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Building2, Loader2, Globe, Check, X } from 'lucide-react';
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

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  is_active: boolean;
  created_at: string;
}

export const TenantManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; tenant: Tenant | null; action: 'activate' | 'deactivate' }>({ 
    open: false, 
    tenant: null, 
    action: 'deactivate' 
  });
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    primary_color: '#00a5b5',
  });

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Tenant[];
    },
  });

  const createTenant = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('tenants')
        .insert([{
          name: data.name,
          slug: data.slug,
          domain: data.domain || null,
          primary_color: data.primary_color,
          is_active: true,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'Tenant opprettet', description: 'Ny tenant er opprettet.' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke opprette tenant.', 
        variant: 'destructive' 
      });
    },
  });

  const updateTenant = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: data.name,
          slug: data.slug,
          domain: data.domain || null,
          primary_color: data.primary_color,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'Oppdatert', description: 'Tenant er oppdatert.' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke oppdatere tenant.', 
        variant: 'destructive' 
      });
    },
  });

  const toggleTenantStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('tenants')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ 
        title: confirmDialog.action === 'activate' ? 'Aktivert' : 'Deaktivert', 
        description: `Tenant er ${confirmDialog.action === 'activate' ? 'aktivert' : 'deaktivert'}.` 
      });
      setConfirmDialog({ open: false, tenant: null, action: 'deactivate' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Feil', 
        description: error.message || 'Kunne ikke endre status.', 
        variant: 'destructive' 
      });
    },
  });

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain || '',
      primary_color: tenant.primary_color || '#00a5b5',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTenant(null);
    setFormData({
      name: '',
      slug: '',
      domain: '',
      primary_color: '#00a5b5',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTenant) {
      updateTenant.mutate({ id: editingTenant.id, data: formData });
    } else {
      createTenant.mutate(formData);
    }
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
          <h2 className="text-2xl font-bold">Tenants</h2>
          <p className="text-muted-foreground">Administrer alle tenants/nettsteder</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} variant="cta">
          <Plus className="h-4 w-4 mr-2" />
          Opprett tenant
        </Button>
      </div>

      {!tenants?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Ingen tenants ennå. Opprett din første tenant.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: tenant.primary_color || '#00a5b5' }}
                    >
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                    </div>
                  </div>
                  <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                    {tenant.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tenant.domain && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {tenant.domain}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Opprettet: {new Date(tenant.created_at).toLocaleDateString('nb-NO')}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(tenant)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Rediger
                  </Button>
                  <Button 
                    variant={tenant.is_active ? 'destructive' : 'default'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setConfirmDialog({ 
                      open: true, 
                      tenant, 
                      action: tenant.is_active ? 'deactivate' : 'activate' 
                    })}
                  >
                    {tenant.is_active ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Deaktiver
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Aktiver
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Rediger tenant' : 'Opprett ny tenant'}
            </DialogTitle>
            <DialogDescription>
              {editingTenant ? 'Oppdater tenant-innstillinger' : 'Fyll ut informasjon for ny tenant'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Navn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    slug: editingTenant ? formData.slug : generateSlug(e.target.value)
                  });
                }}
                required
                placeholder="F.eks. HandyHjelp Oslo"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="handyhjelp-oslo"
              />
              <p className="text-xs text-muted-foreground mt-1">Unik identifikator (URL-vennlig)</p>
            </div>
            <div>
              <Label htmlFor="domain">Domene (valgfritt)</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="oslo.handyhjelp.no"
              />
            </div>
            <div>
              <Label htmlFor="primary_color">Primærfarge</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#00a5b5"
                  className="flex-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Avbryt
              </Button>
              <Button type="submit" variant="cta" disabled={createTenant.isPending || updateTenant.isPending}>
                {(createTenant.isPending || updateTenant.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingTenant ? 'Lagre endringer' : 'Opprett tenant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'activate' ? 'Aktiver tenant?' : 'Deaktiver tenant?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'activate' 
                ? `Er du sikker på at du vil aktivere "${confirmDialog.tenant?.name}"? Tenanten vil bli tilgjengelig igjen.`
                : `Er du sikker på at du vil deaktivere "${confirmDialog.tenant?.name}"? Brukere vil ikke kunne logge inn.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.tenant) {
                  toggleTenantStatus.mutate({ 
                    id: confirmDialog.tenant.id, 
                    is_active: confirmDialog.action === 'activate' 
                  });
                }
              }}
            >
              {confirmDialog.action === 'activate' ? 'Aktiver' : 'Deaktiver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
