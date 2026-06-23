import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell, FileText, Briefcase, Star,
  CreditCard, Users, Mail, ArrowRight, ScrollText,
} from 'lucide-react';
import { NotificationListSkeleton } from '@/components/ui/skeleton-loaders';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

// Eksakte gradienter fra AdminDashboard (CATEGORY_GRADIENTS)
const GRADIENTS = {
  oppdrag:  'from-cyan-500 via-blue-500 to-indigo-600',
  okonomi:  'from-emerald-500 via-teal-500 to-cyan-600',
  innhold:  'from-fuchsia-500 via-purple-500 to-indigo-600',
  mail:     'from-amber-500 via-orange-500 to-rose-600',
  brukere:  'from-rose-500 via-pink-500 to-fuchsia-600',
  redigering:'from-yellow-500 via-amber-500 to-orange-600',
  logg:     'from-slate-500 via-gray-500 to-zinc-600',
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ActionLink {
  label: string;
  icon: React.ReactNode;
  url: string;
}

interface IconConfig {
  icon: React.ReactNode;
  gradient: string;
  border: string;
  bg: string;
}

const ICON_STYLES = {
  oppdrag:   { gradient: GRADIENTS.oppdrag,   border: 'border-l-blue-500',    bg: 'bg-blue-500/5'    },
  okonomi:   { gradient: GRADIENTS.okonomi,   border: 'border-l-emerald-500', bg: 'bg-emerald-500/5' },
  innhold:   { gradient: GRADIENTS.innhold,   border: 'border-l-fuchsia-500', bg: 'bg-fuchsia-500/5' },
  mail:      { gradient: GRADIENTS.mail,      border: 'border-l-orange-500',  bg: 'bg-orange-500/5'  },
  brukere:   { gradient: GRADIENTS.brukere,   border: 'border-l-rose-500',    bg: 'bg-rose-500/5'    },
  redigering:{ gradient: GRADIENTS.redigering,border: 'border-l-amber-500',   bg: 'bg-amber-500/5'   },
  logg:      { gradient: GRADIENTS.logg,      border: 'border-l-slate-500',   bg: 'bg-slate-500/5'   },
};

const getIconConfig = (notification: Notification): IconConfig => {
  const actionType = notification.metadata?.action_type as string | undefined;

  switch (actionType) {
    case 'quote_submitted':
    case 'agreement_submitted':
    case 'agreement_approved':
    case 'agreement_rejected':
    case 'agreement_updated':
    case 'job_created':
    case 'job_started':
    case 'job_completed':
    case 'job_deleted':
      return { icon: <Briefcase className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.oppdrag };

    case 'invoice_request':
      return { icon: <CreditCard className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.okonomi };

    case 'blog_submitted':
    case 'content_submission':
    case 'content_approved':
    case 'content_rejected':
    case 'review_submitted':
      return { icon: <FileText className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.innhold };

    case 'role_assigned':
    case 'role_removed':
    case 'customer_created':
      return { icon: <Users className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.brukere };

    default:
      switch (notification.type) {
        case 'job_update':
          return { icon: <Briefcase className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.oppdrag };
        case 'quote_update':
          return { icon: <Briefcase className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.oppdrag };
        case 'agreement_update':
          return { icon: <Briefcase className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.oppdrag };
        case 'invoice_sent':
        case 'invoice_request':
          return { icon: <CreditCard className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.okonomi };
        case 'content_submission':
        case 'content_approved':
        case 'content_rejected':
        case 'review_request':
          return { icon: <FileText className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.innhold };
        case 'loyalty':
          return { icon: <Star className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.redigering };
        case 'activity_update':
          return { icon: <ScrollText className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.logg };
        default:
          return { icon: <Bell className="h-6 w-6 sm:h-5 sm:w-5 text-white" />, ...ICON_STYLES.logg };
      }
  }
};

const getActionLink = (notification: Notification): ActionLink | null => {
  const meta = notification.metadata ?? {};
  const actionType = meta.action_type as string | undefined;

  switch (actionType) {
    case 'blog_submitted':
      return {
        label: 'Se artikkel',
        icon: <FileText className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=innhold&tab=blog${meta.post_id ? `&highlight=${meta.post_id}` : ''}`,
      };
    case 'quote_submitted':
      return {
        label: 'Se tilbud',
        icon: <Briefcase className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=oppdrag${meta.quote_id ? `&highlight=${meta.quote_id}` : ''}`,
      };
    case 'agreement_submitted':
      return {
        label: 'Se avtale',
        icon: <Briefcase className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=oppdrag&tab=agreements${meta.agreement_id ? `&highlight=${meta.agreement_id}` : ''}`,
      };
    case 'review_submitted':
      return {
        label: 'Se anmeldelse',
        icon: <FileText className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=innhold&tab=reviews${meta.review_id ? `&highlight=${meta.review_id}` : ''}`,
      };
    case 'content_approved':
    case 'content_rejected':
    case 'content_submission':
      return {
        label: 'Se innhold',
        icon: <FileText className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=innhold&tab=blog`,
      };
    case 'job_created':
    case 'job_started':
    case 'job_completed':
    case 'job_deleted':
      return {
        label: 'Se oppdrag',
        icon: <Briefcase className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=oppdrag&tab=single-jobs${meta.job_id ? `&highlight=${meta.job_id}` : ''}`,
      };
    case 'invoice_request':
      return {
        label: 'Se faktura',
        icon: <CreditCard className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=okonomi&tab=invoices`,
      };
    case 'role_assigned':
    case 'role_removed':
      return {
        label: 'Se roller',
        icon: <Users className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=brukere&tab=rollestyring`,
      };
    case 'customer_created':
      return {
        label: 'Se kunder',
        icon: <Users className="h-3.5 w-3.5" />,
        url: `/dashboard/admin?category=brukere&tab=kunder`,
      };
    default:
      // Kunde-notifikasjoner (uten action_type i metadata)
      if (notification.type === 'invoice_request') {
        return { label: 'Se faktura', icon: <CreditCard className="h-3.5 w-3.5" />, url: `/dashboard/admin?category=okonomi&tab=invoices` };
      }
      if (notification.type === 'invoice_sent') {
        return { label: 'Se faktura', icon: <CreditCard className="h-3.5 w-3.5" />, url: `/dashboard` };
      }
      if (notification.type === 'job_update') {
        return { label: 'Se oppdrag', icon: <Briefcase className="h-3.5 w-3.5" />, url: `/dashboard` };
      }
      if (notification.type === 'quote_update') {
        return { label: 'Se tilbud', icon: <Briefcase className="h-3.5 w-3.5" />, url: `/dashboard` };
      }
      if (notification.type === 'agreement_update') {
        return { label: 'Se avtale', icon: <Briefcase className="h-3.5 w-3.5" />, url: `/dashboard` };
      }
      if (['content_submission', 'content_approved', 'content_rejected'].includes(notification.type)) {
        return { label: 'Se innhold', icon: <FileText className="h-3.5 w-3.5" />, url: `/dashboard/admin?category=innhold&tab=blog` };
      }
      return null;
  }
};

const DashboardNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data as unknown as Notification[]);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    queryClient.invalidateQueries({ queryKey: ['navigation-badges'] });
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    queryClient.invalidateQueries({ queryKey: ['navigation-badges'] });
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
  };

  if (loading) {
    return <NotificationListSkeleton />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Varsler</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} uleste varsler` : 'Ingen uleste varsler'}
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm" className="w-full sm:w-auto">
            Marker alle som lest
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card-professional p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <p className="font-semibold text-lg mb-1">Ingen varsler</p>
          <p className="text-sm text-muted-foreground">Du er helt oppdatert! Nye varsler dukker opp her.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const { icon, gradient, border, bg } = getIconConfig(notification);
            const actionLink = getActionLink(notification);
            return (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`card-professional p-4 flex items-start gap-4 transition-all duration-200 ${
                  !notification.read
                    ? `border-l-4 ${border} ${bg} cursor-pointer`
                    : ''
                }`}
              >
                <div className={`w-12 h-12 sm:w-11 sm:h-11 rounded-2xl sm:rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm shrink-0 ${gradient}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    {!notification.read && <Badge variant="default" className="text-xs">Ny</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground/70 mb-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: nb })}
                  </p>
                  {actionLink && (
                    <Link to={actionLink.url} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 px-2.5">
                        {actionLink.icon}
                        {actionLink.label}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
                {!notification.read && (
                  <div className="shrink-0 text-xs text-muted-foreground/50 self-center">Trykk</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardNotifications;
