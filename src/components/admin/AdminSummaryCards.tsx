import { Users, FileText, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      link: '/dashboard/admin?category=brukere&tab=kunder',
    },
    {
      title: 'Nye forespørsler',
      value: pendingQuotes,
      icon: FileText,
      desc: 'Venter på behandling',
      gradient: 'from-amber-500 via-orange-500 to-rose-600',
      link: '/dashboard/admin?category=oppdrag&tab=single-jobs',
    },
    {
      title: 'Aktive jobber',
      value: activeJobs,
      icon: Briefcase,
      desc: 'Under arbeid',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      link: '/dashboard/admin?category=oppdrag&tab=single-jobs',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.title} to={stat.link}>
            <div className={`card-hover-lift p-5 rounded-xl bg-gradient-to-br ${stat.gradient} text-white relative overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-white/30 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-white/80">{stat.title}</p>
                <Icon className="h-8 w-8 text-white/30" strokeWidth={1.5} />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs mt-1 text-white/60">{stat.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
