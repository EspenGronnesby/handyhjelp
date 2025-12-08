import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Briefcase, Star, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatsSkeleton, PageHeaderSkeleton } from '@/components/ui/skeleton-loaders';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: 'Totalt forespørsler',
      value: stats.totalQuotes,
      icon: FileText,
      link: '/dashboard/activity',
      description: 'Se alle dine forespørsler'
    },
    {
      title: 'Aktive jobber',
      value: stats.activeJobs,
      icon: Briefcase,
      link: '/dashboard/activity',
      description: 'Jobber under arbeid'
    },
    {
      title: 'Fullførte jobber',
      value: stats.completedJobs,
      icon: Star,
      link: '/dashboard/activity',
      description: 'Ferdigstilte prosjekter'
    },
    {
      title: 'Uleste varsler',
      value: stats.unreadNotifications,
      icon: Bell,
      link: '/dashboard/notifications',
      description: 'Nye oppdateringer'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <StatsSkeleton />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Velkommen til din profil</h1>
        <p className="text-muted-foreground">
          Her kan du holde oversikt over alle dine tilbud, jobber og varslinger
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                <Link to={card.link}>
                  <Button variant="link" className="px-0 mt-2">
                    Se detaljer →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kom i gang</CardTitle>
          <CardDescription>
            Her er noen ting du kan gjøre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start">
              Send inn en ny tilbudsforespørsel
            </Button>
          </Link>
          <Link to="/dashboard/profile">
            <Button variant="outline" className="w-full justify-start">
              Oppdater din profil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
