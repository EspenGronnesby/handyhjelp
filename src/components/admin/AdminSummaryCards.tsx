import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminSummaryCardsProps {
  totalCustomers: number;
  pendingQuotes: number;
  activeJobs: number;
}

export const AdminSummaryCards = ({ totalCustomers, pendingQuotes, activeJobs }: AdminSummaryCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card className="interactive-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totalt kunder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
        </CardContent>
      </Card>
      <Card className="interactive-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nye forespørsler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingQuotes}</div>
        </CardContent>
      </Card>
      <Card className="interactive-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktive jobber</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeJobs}</div>
        </CardContent>
      </Card>
    </div>
  );
};
