import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Gift, Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'earned' | 'spent' | 'expired' | 'bonus' | 'referral' | 'welcome';
  description: string;
  created_at: string;
  expires_at: string | null;
}

interface PointsHistoryProps {
  transactions: Transaction[];
}

export const PointsHistory = ({ transactions }: PointsHistoryProps) => {
  const getTransactionIcon = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'earned':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'spent':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'bonus':
      case 'welcome':
        return <Gift className="h-4 w-4 text-primary" />;
      case 'referral':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTransactionBadge = (type: Transaction['transaction_type']) => {
    const config = {
      earned: { label: 'Opptjent', variant: 'default' as const },
      spent: { label: 'Brukt', variant: 'secondary' as const },
      expired: { label: 'Utløpt', variant: 'outline' as const },
      bonus: { label: 'Bonus', variant: 'default' as const },
      referral: { label: 'Anbefaling', variant: 'default' as const },
      welcome: { label: 'Velkomst', variant: 'default' as const }
    };

    const { label, variant } = config[type];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Poenghistorikk</CardTitle>
          <CardDescription>Din transaksjonshistorikk vises her</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Ingen transaksjoner ennå
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poenghistorikk</CardTitle>
        <CardDescription>
          {transactions.length} transaksjon{transactions.length !== 1 ? 'er' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: nb })}
                    </p>
                    {getTransactionBadge(transaction.transaction_type)}
                  </div>
                  {transaction.expires_at && new Date(transaction.expires_at) > new Date() && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Utløper: {format(new Date(transaction.expires_at), 'dd MMM yyyy', { locale: nb })}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">poeng</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
