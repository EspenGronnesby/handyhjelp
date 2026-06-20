import { Users, FileText, Briefcase } from 'lucide-react';

interface AdminSummaryCardsProps {
  totalCustomers: number;
  pendingQuotes: number;
  activeJobs: number;
}

export const AdminSummaryCards = ({ totalCustomers, pendingQuotes, activeJobs }: AdminSummaryCardsProps) => {
  const stats = [
    {
      title: 'Totalt kunder',
      value: totalCustomers,
      icon: Users,
      desc: 'Registrerte brukere',
      gradient: 'from-fuchsia-500 via-purple-500 to-indigo-600',
      hero: true,
    },
    {
      title: 'Nye forespørsler',
      value: pendingQuotes,
      icon: FileText,
      desc: 'Venter på behandling',
      gradient: 'from-amber-500 via-orange-500 to-rose-600',
      hero: false,
    },
    {
      title: 'Aktive jobber',
      value: activeJobs,
      icon: Briefcase,
      desc: 'Under arbeid',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      hero: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`card-hover-lift p-5 rounded-xl ${
              stat.hero
                ? 'bg-gradient-to-br from-secondary to-secondary/80 text-white border border-white/10'
                : 'card-professional'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-medium ${stat.hero ? 'text-white/70' : 'text-muted-foreground'}`}>
                {stat.title}
              </p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm ${stat.gradient}`}>
                <Icon className="h-4 w-4 text-white drop-shadow" />
              </div>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className={`text-xs mt-1 ${stat.hero ? 'text-white/50' : 'text-muted-foreground'}`}>
              {stat.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
