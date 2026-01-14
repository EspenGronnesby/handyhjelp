import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, FileText, Clock, CheckCircle, XCircle, FileEdit, Edit } from 'lucide-react';

interface SubmissionListProps {
  type: 'projects' | 'blog';
  userId: string;
  onEditProject?: (project: Project) => void;
  onEditBlog?: (blog: BlogPost) => void;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  completed_date: string;
  before_image_url: string;
  after_image_url: string;
  status: string;
  submitted_at: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string;
  category: string;
  status: string;
  submitted_at: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  draft: { label: 'Utkast', icon: FileEdit, color: 'bg-gray-500' },
  pending_approval: { label: 'Venter', icon: Clock, color: 'bg-yellow-500' },
  approved: { label: 'Godkjent', icon: CheckCircle, color: 'bg-green-500' },
  published: { label: 'Publisert', icon: CheckCircle, color: 'bg-emerald-500' },
  rejected: { label: 'Avslått', icon: XCircle, color: 'bg-red-500' },
};

export const SubmissionList = ({ type, userId, onEditProject, onEditBlog }: SubmissionListProps) => {
  const { data: submissions, isLoading } = useQuery({
    queryKey: [type === 'projects' ? 'worker-projects' : 'worker-blogs', userId],
    queryFn: async () => {
      const table = type === 'projects' ? 'projects' : 'blog_posts';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('submitted_by', userId)
        .order('submitted_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as (Project | BlogPost)[];
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ikke innsendt';
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submissions?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {type === 'projects' ? (
            <>
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Du har ikke sendt inn noen prosjekter ennå</p>
            </>
          ) : (
            <>
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Du har ikke sendt inn noen blogginnlegg ennå</p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {submissions.map((item) => {
        const status = statusConfig[item.status] || statusConfig.draft;
        const StatusIcon = status.icon;
        const imageUrl = type === 'projects' 
          ? (item as Project).after_image_url 
          : (item as BlogPost).cover_image_url;

        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-40">
              <img 
                src={imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-2 left-2 ${status.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold line-clamp-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {type === 'projects' 
                  ? (item as Project).description 
                  : (item as BlogPost).summary}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>Innsendt: {formatDate(item.submitted_at)}</span>
                <Badge variant="outline">{item.category}</Badge>
              </div>
              
              {item.status === 'rejected' && item.rejection_reason && (
                <div className="mt-2 p-2 bg-destructive/10 rounded-lg">
                  <p className="text-xs text-destructive font-medium">Avslåingsgrunn:</p>
                  <p className="text-xs text-destructive">{item.rejection_reason}</p>
                </div>
              )}

              {item.status === 'rejected' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    if (type === 'projects' && onEditProject) {
                      onEditProject(item as Project);
                    } else if (type === 'blog' && onEditBlog) {
                      onEditBlog(item as BlogPost);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Rediger og send på nytt
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
