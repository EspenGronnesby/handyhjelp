import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Receipt, CreditCard, AlertTriangle, CheckCircle, Clock, Search, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logActivity } from '@/hooks/useActivityLog';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/types/admin';

interface InvoiceWithDetails {
  id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: string;
  file_url: string | null;
  created_at: string;
  job_id: string;
  user_id: string;
  jobs: {
    quotes: {
      name: string;
      email: string;
      phone: string;
      company_name: string | null;
      type: string;
    };
  };
}

export const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          jobs!inner (
            quotes!inner (
              name,
              email,
              phone,
              company_name,
              type
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data as InvoiceWithDetails[]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke hente fakturaer.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    setUpdatingId(invoiceId);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoices(invoices.map(inv =>
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      ));

      // Log activity when an invoice is marked as paid
      if (newStatus === 'paid') {
        const inv = invoices.find(i => i.id === invoiceId);
        await logActivity(
          'invoice_paid',
          'invoice_management',
          `Markerte faktura ${inv?.invoice_number || ''} som betalt${inv?.amount != null ? ` (${inv.amount.toLocaleString('nb-NO')} kr)` : ''}`,
          { invoice_id: invoiceId, invoice_number: inv?.invoice_number, amount: inv?.amount }
        );
      }

      toast({
        title: 'Status oppdatert',
        description: `Faktura markert som ${INVOICE_STATUS_LABELS[newStatus]?.toLowerCase() || newStatus}.`
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere status.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadInvoice = async (invoice: InvoiceWithDetails) => {
    if (!invoice.file_url) {
      toast({
        title: 'Ingen fil',
        description: 'Ingen PDF-fil er lastet opp for denne fakturaen.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const filePath = invoice.file_url.split('/invoices/')[1];
      if (!filePath) throw new Error('Invalid file path');

      const { data, error } = await supabase.storage
        .from('invoices')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faktura-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste ned faktura.',
        variant: 'destructive'
      });
    }
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const customerName = invoice.jobs.quotes.type === 'business' 
      ? invoice.jobs.quotes.company_name 
      : invoice.jobs.quotes.name;
    
    const matchesSearch = 
      customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.jobs.quotes.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="interactive-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totalt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 interactive-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ubetalt</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.pendingAmount)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 interactive-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Betalt</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.paidAmount)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 interactive-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Forfalt</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Alle fakturaer
          </CardTitle>
          <CardDescription>Administrer og følg opp fakturaer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk på kunde, fakturanummer eller e-post..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statuser</SelectItem>
                <SelectItem value="pending">Ubetalt</SelectItem>
                <SelectItem value="paid">Betalt</SelectItem>
                <SelectItem value="overdue">Forfalt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {invoices.length === 0 ? 'Ingen fakturaer ennå' : 'Ingen fakturaer matcher søket'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fakturanr.</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead className="text-right">Beløp</TableHead>
                    <TableHead>Forfallsdato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Handlinger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const customerName = invoice.jobs.quotes.type === 'business' 
                      ? invoice.jobs.quotes.company_name 
                      : invoice.jobs.quotes.name;
                    const isOverdue = invoice.status === 'pending' && new Date(invoice.due_date) < new Date();
                    
                    return (
                      <TableRow key={invoice.id} className={isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                        <TableCell className="font-mono text-sm">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customerName}</p>
                            <p className="text-xs text-muted-foreground">{invoice.jobs.quotes.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {new Date(invoice.due_date).toLocaleDateString('nb-NO')}
                            {isOverdue && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={INVOICE_STATUS_COLORS[invoice.status] || 'bg-gray-500'}>
                            {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.file_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {invoice.status !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                                disabled={updatingId === invoice.id}
                                className="border-green-500 text-green-600 hover:bg-green-50"
                              >
                                {updatingId === invoice.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <><CreditCard className="h-4 w-4 mr-1" /> Betalt</>
                                )}
                              </Button>
                            )}
                            {invoice.status === 'pending' && isOverdue && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(invoice.id, 'overdue')}
                                disabled={updatingId === invoice.id}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                Forfalt
                              </Button>
                            )}
                          </div>
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
    </div>
  );
};
