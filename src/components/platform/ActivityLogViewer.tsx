import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, Crown, Shield, Hammer, User } from 'lucide-react';
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
import {
  useActivityLogs,
  ActivityLog,
  ActivityLogFilters,
  ActionCategory,
  UserRole,
  actionTypeLabels,
  categoryLabels,
  roleLabels,
  roleColors,
  actionTypeColors,
  ActionType,
} from '@/hooks/useActivityLog';
import type { LucideIcon } from 'lucide-react';

const roleIcons: Record<string, LucideIcon> = {
  platform_owner: Crown,
  admin: Shield,
  worker: Hammer,
  user: User,
};

export const ActivityLogViewer = () => {
  const [filters, setFilters] = useState<ActivityLogFilters>({
    role: 'all',
    category: 'all',
    dateRange: 'week',
    searchTerm: '',
  });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; log: ActivityLog | null }>({ 
    open: false, 
    log: null 
  });

  const { data: logs, isLoading, refetch } = useActivityLogs(filters);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilterChange = (key: keyof ActivityLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aktivitetslogg</h2>
          <p className="text-muted-foreground">Spor alle handlinger utført av eier, admin og medarbeidere</p>
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
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Søk i beskrivelse eller brukernavn..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Role filter */}
            <Select 
              value={filters.role || 'all'} 
              onValueChange={(value) => handleFilterChange('role', value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Alle roller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle roller</SelectItem>
                <SelectItem value="platform_owner">
                  <div className="flex items-center gap-2">
                    <Crown className="h-3 w-3" /> Eier
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Administrator
                  </div>
                </SelectItem>
                <SelectItem value="worker">
                  <div className="flex items-center gap-2">
                    <Hammer className="h-3 w-3" /> Medarbeider
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Category filter */}
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Alle kategorier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle kategorier</SelectItem>
                <SelectItem value="role_management">Rolleadministrasjon</SelectItem>
                <SelectItem value="job_management">Oppdragshåndtering</SelectItem>
                <SelectItem value="invoice_management">Fakturahåndtering</SelectItem>
                <SelectItem value="quote_management">Tilbudsforespørsler</SelectItem>
                <SelectItem value="agreement_management">Avtalehåndtering</SelectItem>
                <SelectItem value="content_management">Innholdsgodkjenning</SelectItem>
                <SelectItem value="customer_management">Kundehåndtering</SelectItem>
              </SelectContent>
            </Select>

            {/* Date filter */}
            <Select 
              value={filters.dateRange || 'week'} 
              onValueChange={(value) => handleFilterChange('dateRange', value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tidsperiode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Siste 24 timer</SelectItem>
                <SelectItem value="week">Siste 7 dager</SelectItem>
                <SelectItem value="month">Siste 30 dager</SelectItem>
                <SelectItem value="all">Alle</SelectItem>
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
              Ingen aktivitetslogger funnet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tidspunkt</TableHead>
                    <TableHead>Bruker</TableHead>
                    <TableHead>Handling</TableHead>
                    <TableHead className="hidden md:table-cell">Beskrivelse</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const Icon = roleIcons[log.user_role] || User;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={`${roleColors[log.user_role] || 'bg-gray-500'} flex items-center gap-1`}>
                              <Icon className="h-3 w-3" />
                              {roleLabels[log.user_role] || log.user_role}
                            </Badge>
                            <span className="text-sm hidden lg:inline">{log.user_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${actionTypeColors[log.action_type as ActionType] || 'bg-gray-500'}`}>
                            {actionTypeLabels[log.action_type as ActionType] || log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                          {log.description}
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
                    );
                  })}
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
            <DialogTitle>Aktivitetsdetaljer</DialogTitle>
          </DialogHeader>
          {detailsDialog.log && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tidspunkt:</span>
                  <p className="font-medium">{formatDate(detailsDialog.log.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bruker:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${roleColors[detailsDialog.log.user_role] || 'bg-gray-500'}`}>
                      {roleLabels[detailsDialog.log.user_role] || detailsDialog.log.user_role}
                    </Badge>
                    <span>{detailsDialog.log.user_name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Handling:</span>
                  <p>
                    <Badge className={`${actionTypeColors[detailsDialog.log.action_type as ActionType] || 'bg-gray-500'}`}>
                      {actionTypeLabels[detailsDialog.log.action_type as ActionType] || detailsDialog.log.action_type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kategori:</span>
                  <p className="font-medium">
                    {categoryLabels[detailsDialog.log.action_category as ActionCategory] || detailsDialog.log.action_category}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Beskrivelse:</span>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {detailsDialog.log.description}
                </p>
              </div>

              {detailsDialog.log.target_user_name && (
                <div>
                  <span className="text-muted-foreground text-sm">Påvirket bruker:</span>
                  <p className="font-medium">{detailsDialog.log.target_user_name}</p>
                </div>
              )}

              {detailsDialog.log.metadata && Object.keys(detailsDialog.log.metadata).length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm">Ekstra informasjon:</span>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(detailsDialog.log.metadata, null, 2)}
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
