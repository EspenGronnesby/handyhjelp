import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, User, X, Mail } from 'lucide-react';
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

interface Worker {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

export const TenantWorkerManagement = () => {
  const { tenantId, tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; worker: Worker | null }>({ 
    open: false, 
    worker: null 
  });
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<Worker | null>(null);
  const [searching, setSearching] = useState(false);

  const { data: workers, isLoading } = useQuery({
    queryKey: ['tenant-workers', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      // Get all users with worker role in this tenant
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .eq('tenant_id', tenantId);

      if (profilesError) throw profilesError;

      // Get user roles for these profiles
      const userIds = profiles.map(p => p.id);
      if (userIds.length === 0) return [];

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('role', 'worker');

      if (rolesError) throw rolesError;

      const workerIds = new Set(roles.map(r => r.user_id));
      return profiles.filter(p => workerIds.has(p.id)) as Worker[];
    },
    enabled: !!tenantId,
  });

  const handleSearch = async () => {
    if (!searchEmail || searchEmail.length < 3) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .ilike('email', searchEmail)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSearchResult(data as Worker);
      } else {
        toast({ title: 'Ikke funnet', description: 'Ingen bruker med denne e-posten.', variant: 'destructive' });
        setSearchResult(null);
      }
    } catch (error: any) {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const addWorker = useMutation({
    mutationFn: async (userId: string) => {
      // Add worker role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'worker' }]);

      if (roleError && !roleError.message.includes('duplicate')) throw roleError;

      // Assign to tenant
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-workers', tenantId] });
      toast({ title: 'Worker lagt til', description: 'Brukeren er nå worker i din tenant.' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
  });

  const removeWorker = useMutation({
    mutationFn: async (userId: string) => {
      // Remove worker role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'worker');

      if (roleError) throw roleError;

      // Remove from tenant
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tenant_id: null })
        .eq('id', userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-workers', tenantId] });
      toast({ title: 'Worker fjernet', description: 'Brukeren er fjernet fra din tenant.' });
      setRemoveDialog({ open: false, worker: null });
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSearchEmail('');
    setSearchResult(null);
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
          <h2 className="text-2xl font-bold">Workers</h2>
          <p className="text-muted-foreground">
            Administrer workers i {tenant?.name || 'din tenant'}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} variant="cta">
          <Plus className="h-4 w-4 mr-2" />
          Legg til worker
        </Button>
      </div>

      {!workers?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Ingen workers lagt til ennå</p>
            <p className="text-sm">Workers kan sende inn prosjekter og blogginnlegg til godkjenning</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <Card key={worker.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{worker.full_name || 'Uten navn'}</p>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setRemoveDialog({ open: true, worker })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Badge variant="secondary">Worker</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lagt til: {new Date(worker.created_at).toLocaleDateString('nb-NO')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Worker Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legg til worker</DialogTitle>
            <DialogDescription>
              Søk etter en bruker med e-post for å legge dem til som worker
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-postadresse</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="bruker@example.com"
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={searching || searchEmail.length < 3}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Søk'}
                </Button>
              </div>
            </div>

            {searchResult && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{searchResult.full_name || 'Uten navn'}</p>
                        <p className="text-sm text-muted-foreground">{searchResult.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="cta" 
                      size="sm"
                      onClick={() => addWorker.mutate(searchResult.id)}
                      disabled={addWorker.isPending}
                    >
                      {addWorker.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Legg til
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Lukk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ ...removeDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fjern worker?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil fjerne "{removeDialog.worker?.full_name || removeDialog.worker?.email}" som worker? 
              De vil miste tilgang til å sende inn innhold.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeDialog.worker) {
                  removeWorker.mutate(removeDialog.worker.id);
                }
              }}
            >
              Fjern worker
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
