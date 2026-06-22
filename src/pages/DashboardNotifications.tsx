import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2, Bell, CheckCircle, AlertCircle, Info,
  FileText, Briefcase, Star, CreditCard, Receipt,
  Activity, XCircle, Users, Mail, ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

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
        icon: <Star className="h-3.5 w-3.5" />,
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
      // Fallback based on notification type for older notifications without metadata
      if (notification.type === 'invoice_request') {
        return {
          label: 'Se faktura',
          icon: <CreditCard className="h-3.5 w-3.5" />,
          url: `/dashboard/admin?category=okonomi&tab=invoices`,
        };
      }
      if (notification.type === 'content_submission' || notification.type === 'content_approved' || notification.type === 'content_rejected') {
        return {
          label: 'Se innhold',
          icon: <FileText className="h-3.5 w-3.5" />,
          url: `/dashboard/admin?category=innhold&tab=blog`,
        };
      }
      return null;
  }
};

const getNotificationIcon = (notification: Notification) => {
  const actionType = notification.metadata?.action_type as string | undefined;

  switch (actionType) {
    case 'blog_submitted':
    case 'content_submission':
      return <FileText className="h-5 w-5 text-purple-500" />;
    case 'content_approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'content_rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'quote_submitted':
    case 'job_created':
    case 'job_started':
    case 'job_completed':
    case 'job_deleted':
    case 'agreement_submitted':
    case 'agreement_approved':
    case 'agreement_rejected':
    case 'agreement_updated':
      return <Briefcase className="h-5 w-5 text-blue-500" />;
    case 'review_submitted':
      return <Star className="h-5 w-5 text-amber-500" />;
    case 'invoice_request':
      return <CreditCard className="h-5 w-5 text-amber-500" />;
    case 'role_assigned':
    case 'role_removed':
    case 'customer_created':
      return <Users className="h-5 w-5 text-indigo-500" />;
    default:
      // Fallback based on notification type
      switch (notification.type) {
        case 'content_approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'content_rejected': return <XCircle className="h-5 w-5 text-red-500" />;
        case 'content_submission': return <FileText className="h-5 w-5 text-purple-500" />;
        case 'job_update': return <Briefcase className="h-5 w-5 text-blue-500" />;
        case 'invoice_request': return <CreditCard className="h-5 w-5 text-amber-500" />;
        case 'loyalty': return <Star className="h-5 w-5 text-yellow-500" />;
        case 'review_request': return <Star className="h-5 w-5 text-amber-500" />;
        case 'activity_update': return <Activity className="h-5 w-5 text-primary" />;
        default: return <Info className="h-5 w-5 text-primary" />;
      }
  }
};

const getIconBg = (notification: Notification) => {
  const actionType = notification.metadata?.action_type as string | undefined;

  switch (actionType) {
    case 'blog_submitted':
    case 'content_submission': return 'bg-purple-500/10';
    case 'content_approved': return 'bg-green-500/10';
    case 'content_rejected': return 'bg-red-500/10';
    case 'quote_submitted':
    case 'job_created':
    case 'job_started':
    case 'job_completed':
    case 'job_deleted':
    case 'agreement_submitted':
    case 'agreement_approved':
    case 'agreement_rejected':
    case 'agreement_updated': return 'bg-blue-500/10';
    case 'review_submitted': return 'bg-amber-500/10';
    case 'invoice_request': return 'bg-amber-500/10';
    case 'role_assigned':
    case 'role_removed':
    case 'customer_created': return 'bg-indigo-500/10';
    default: return 'bg-primary/10';
  }
};

const DashboardNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
            <h1 className="text-3xl font-bold text-foreground">
              Varsler
            </h1>
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
            const actionLink = getActionLink(notification);
            return (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`card-professional p-4 flex items-start gap-4 transition-all duration-200 ${
                  !notification.read
                    ? 'border-l-4 border-l-primary bg-primary/5 cursor-pointer active:bg-primary/10'
                    : ''
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${getIconBg(notification)}`}>
                  {getNotificationIcon(notification)}
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
                    <Link
                      to={actionLink.url}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 px-2.5">
                        {actionLink.icon}
                        {actionLink.label}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
                {!notification.read && (
                  <div className="shrink-0 text-xs text-muted-foreground/50 self-center">
                    Trykk
                  </div>
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
