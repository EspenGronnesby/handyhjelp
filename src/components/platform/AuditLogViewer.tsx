import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuditLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
}

const actionLabels: Record<string, string> = {
  create: 'Opprettet',
  update: 'Oppdatert',
  delete: 'Slettet',
  approve: 'Godkjent',
  reject: 'Avslått',
  login: 'Innlogget',
};

const actionColors: Record<string, string> = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  approve: 'bg-emerald-500',
  reject: 'bg-orange-500',
  login: 'bg-purple-500',
};

export const AuditLogViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; log: AuditLog | null }>({ 
    open: false, 
    log: null 
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Tenant[];
    },
  });

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', selectedTenant, selectedAction, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedTenant && selectedTenant !== 'all') {
        query = query.eq('tenant_id', selectedTenant);
      }
      if (selectedAction && selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }
      if (searchTerm) {
        query = query.or(`table_name.ilike.%${searchTerm}%,record_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Logg</h2>
          <p className="text-muted-foreground">Spor alle endringer i systemet</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Oppdater
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Søk på tabell eller ID..."
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Alle tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle tenants</SelectItem>
                {tenants?.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Alle handlinger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle handlinger</SelectItem>
                <SelectItem value="create">Opprettet</SelectItem>
                <SelectItem value="update">Oppdatert</SelectItem>
                <SelectItem value="delete">Slettet</SelectItem>
                <SelectItem value="approve">Godkjent</SelectItem>
                <SelectItem value="reject">Avslått</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !logs?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              Ingen loggoppføringer funnet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tidspunkt</TableHead>
                    <TableHead>Handling</TableHead>
                    <TableHead>Tabell</TableHead>
                    <TableHead className="hidden md:table-cell">Record ID</TableHead>
                    <TableHead className="hidden lg:table-cell">IP</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${actionColors[log.action] || 'bg-gray-500'}`}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {log.record_id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {log.ip_address || '-'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDetailsDialog({ open: true, log })}
                        >
                          Detaljer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loggdetaljer</DialogTitle>
          </DialogHeader>
          {detailsDialog.log && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tidspunkt:</span>
                  <p className="font-medium">{formatDate(detailsDialog.log.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Handling:</span>
                  <p>
                    <Badge className={`${actionColors[detailsDialog.log.action] || 'bg-gray-500'}`}>
                      {actionLabels[detailsDialog.log.action] || detailsDialog.log.action}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tabell:</span>
                  <p className="font-mono">{detailsDialog.log.table_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Record ID:</span>
                  <p className="font-mono text-xs">{detailsDialog.log.record_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">IP-adresse:</span>
                  <p>{detailsDialog.log.ip_address || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bruker ID:</span>
                  <p className="font-mono text-xs">{detailsDialog.log.user_id}</p>
                </div>
              </div>

              {detailsDialog.log.old_values && (
                <div>
                  <span className="text-muted-foreground text-sm">Tidligere verdier:</span>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(detailsDialog.log.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {detailsDialog.log.new_values && (
                <div>
                  <span className="text-muted-foreground text-sm">Nye verdier:</span>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(detailsDialog.log.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
