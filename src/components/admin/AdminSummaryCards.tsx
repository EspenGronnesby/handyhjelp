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
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isHero = index === 0;
        return (
          <div
            key={stat.title}
            className={`card-hover-lift p-5 rounded-xl ${
              isHero
                ? 'bg-gradient-to-br from-secondary to-secondary/80 text-white border border-white/10'
                : 'card-professional'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-medium ${isHero ? 'text-white/70' : 'text-muted-foreground'}`}>
                {stat.title}
              </p>
              <div className={`p-2 rounded-lg ${isHero ? 'bg-white/10' : 'bg-primary/10'}`}>
                <Icon className={`h-4 w-4 ${isHero ? 'text-white' : 'text-primary'}`} />
              </div>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className={`text-xs mt-1 ${isHero ? 'text-white/50' : 'text-muted-foreground'}`}>
              {stat.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
