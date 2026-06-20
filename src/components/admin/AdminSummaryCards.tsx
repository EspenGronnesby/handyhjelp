import { Users, FileText, Briefcase } from 'lucide-react';

interface AdminSummaryCardsProps {
  totalCustomers: number;
  pendingQuotes: number;
  activeJobs: number;
}

export const AdminSummaryCards = ({ totalCustomers, pendingQuotes, activeJobs }: AdminSummaryCardsProps) => {
  const stats = [
    { title: 'Totalt kunder', value: totalCustomers, icon: Users, desc: 'Registrerte brukere' },
    { title: 'Nye forespørsler', value: pendingQuotes, icon: FileText, desc: 'Venter på behandling' },
    { title: 'Aktive jobber', value: activeJobs, icon: Briefcase, desc: 'Under arbeid' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="card-professional card-hover-lift p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
          </div>
        );
      })}
    </div>
  );
};
