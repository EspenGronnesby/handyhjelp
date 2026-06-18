import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  User, 
  Globe, 
  MessageSquare, 
  Check, 
  X, 
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useEmailLogs, EmailLog, EmailLogsFilter } from '@/hooks/useEmailLogs';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export function EmailHistory() {
  const [filter, setFilter] = useState<EmailLogsFilter>({
    recipientType: 'all',
    status: 'all',
  });
  const { logs, loading, refreshLogs } = useEmailLogs(filter);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const handleFilterChange = (key: keyof EmailLogsFilter, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            E-posthistorikk
          </h3>
          <p className="text-sm text-muted-foreground">
            Oversikt over alle sendte e-poster
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Oppdater
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Mottakertype</Label>
              <Select 
                value={filter.recipientType || 'all'} 
                onValueChange={(v) => handleFilterChange('recipientType', v)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="customer">Kunder</SelectItem>
                  <SelectItem value="external">Eksterne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select 
                value={filter.status || 'all'} 
                onValueChange={(v) => handleFilterChange('status', v)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="sent">Sendt</SelectItem>
                  <SelectItem value="failed">Feilet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ingen e-poster funnet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="md:max-h-[500px] md:overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Dato</TableHead>
                    <TableHead>Mottaker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Emne</TableHead>
                    <TableHead>Mal</TableHead>
                    <TableHead className="w-[50px] text-center">FB</TableHead>
                    <TableHead>Avsender</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.sent_at), 'dd.MM.yy HH:mm', { locale: nb })}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="text-sm font-medium truncate">
                            {log.recipient_name || log.recipient_email}
                          </div>
                          {log.recipient_name && (
                            <div className="text-xs text-muted-foreground truncate">
                              {log.recipient_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.recipient_type === 'customer' ? (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <User className="h-3 w-3" />
                            Kunde
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Globe className="h-3 w-3" />
                            Ekstern
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate block max-w-[200px]">
                          {log.subject}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {log.template_name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {log.included_feedback_button ? (
                          <MessageSquare className="h-4 w-4 mx-auto text-primary" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="truncate max-w-[100px]">{log.sender_name || '-'}</div>
                          {log.sender_role && (
                            <div className="text-xs text-muted-foreground capitalize">
                              {log.sender_role === 'platform_owner' ? 'Owner' : log.sender_role}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.status === 'sent' ? (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Sendt
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <X className="h-3 w-3 mr-1" />
                            Feilet
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      )}

      {/* Log Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>E-postdetaljer</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Sendt</Label>
                  <p className="text-sm">
                    {format(new Date(selectedLog.sent_at), 'dd. MMMM yyyy HH:mm:ss', { locale: nb })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>
                    {selectedLog.status === 'sent' ? (
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                        Sendt
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Feilet
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Mottaker</Label>
                <div className="flex items-center gap-2">
                  {selectedLog.recipient_type === 'customer' ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {selectedLog.recipient_name && `${selectedLog.recipient_name} - `}
                    {selectedLog.recipient_email}
                  </span>
                  <Badge variant={selectedLog.recipient_type === 'customer' ? 'secondary' : 'outline'} className="text-xs">
                    {selectedLog.recipient_type === 'customer' ? 'Kunde' : 'Ekstern'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Emne</Label>
                <p className="text-sm font-medium">{selectedLog.subject}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Innhold</Label>
                <ScrollArea className="h-[150px] rounded-md border p-3">
                  <p className="text-sm whitespace-pre-wrap">{selectedLog.content}</p>
                </ScrollArea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mal brukt</Label>
                  <p className="text-sm">{selectedLog.template_name || 'Ingen (egendefinert tekst)'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Tilbakemeldingsknapp</Label>
                  <p className="text-sm">{selectedLog.included_feedback_button ? 'Ja' : 'Nei'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Avsender</Label>
                <p className="text-sm">
                  {selectedLog.sender_name || 'Ukjent'} 
                  {selectedLog.sender_role && ` (${selectedLog.sender_role === 'platform_owner' ? 'Owner' : selectedLog.sender_role})`}
                </p>
              </div>

              {selectedLog.error_message && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-destructive" />
                    Feilmelding
                  </Label>
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {selectedLog.error_message}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
