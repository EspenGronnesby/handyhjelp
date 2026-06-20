import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, FileText, Clock, CheckCircle, XCircle, FileEdit, Edit, Trash2 } from 'lucide-react';

interface SubmissionListProps {
  type: 'projects' | 'blog';
  userId: string;
  onEditProject?: (project: Project) => void;
  onEditBlog?: (blog: BlogPost) => void;
  onDeleteProject?: (projectId: string) => void;
  onDeleteBlog?: (blogId: string) => void;
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

export const SubmissionList = ({ type, userId, onEditProject, onEditBlog, onDeleteProject, onDeleteBlog }: SubmissionListProps) => {
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
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-md">
                <Camera className="h-7 w-7 text-white drop-shadow" />
              </div>
              <p>Du har ikke sendt inn noen prosjekter ennå</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 shadow-md">
                <FileText className="h-7 w-7 text-white drop-shadow" />
              </div>
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
            <div className="relative h-32 md:h-40">
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

              {(item.status === 'rejected' || item.status === 'draft') && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="default"
                    className="flex-1"
                    onClick={() => {
                      if (type === 'projects' && onEditProject) {
                        onEditProject(item as Project);
                      } else if (type === 'blog' && onEditBlog) {
                        onEditBlog(item as BlogPost);
                      }
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Rediger
                  </Button>
                  <Button
                    variant="destructive"
                    size="default"
                    className="flex-1"
                    onClick={() => {
                      if (type === 'projects' && onDeleteProject) {
                        onDeleteProject(item.id);
                      } else if (type === 'blog' && onDeleteBlog) {
                        onDeleteBlog(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Slett
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
