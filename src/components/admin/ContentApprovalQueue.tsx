import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Eye, Camera, FileText, Clock, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubmitterProfile {
  full_name: string;
  email: string;
}

interface PendingProject {
  id: string;
  title: string;
  description: string;
  before_image_url: string;
  after_image_url: string;
  category: string;
  location: string;
  submitted_at: string;
  submitted_by: string;
  status: string;
  submitter?: SubmitterProfile | null;
}

interface PendingBlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string;
  category: string;
  submitted_at: string;
  submitted_by: string;
  status: string;
  submitter?: SubmitterProfile | null;
}

export const ContentApprovalQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('projects');
  const [previewDialog, setPreviewDialog] = useState<{ 
    open: boolean; 
    type: 'project' | 'blog'; 
    item: PendingProject | PendingBlogPost | null 
  }>({ open: false, type: 'project', item: null });
  const [rejectDialog, setRejectDialog] = useState<{ 
    open: boolean; 
    type: 'project' | 'blog'; 
    id: string | null;
    title: string;
    submittedBy: string | null;
  }>({ open: false, type: 'project', id: null, title: '', submittedBy: null });
  const [rejectReason, setRejectReason] = useState('');

  const { data: pendingProjects, isLoading: loadingProjects } = useQuery({
    queryKey: ['pending-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'pending_approval')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Fetch submitter profiles separately
      const projectsWithSubmitters = await Promise.all(
        (data || []).map(async (project) => {
          if (project.submitted_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', project.submitted_by)
              .single();
            return { ...project, submitter: profile };
          }
          return { ...project, submitter: null };
        })
      );

      return projectsWithSubmitters as PendingProject[];
    },
  });

  const { data: pendingBlogs, isLoading: loadingBlogs } = useQuery({
    queryKey: ['pending-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'pending_approval')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Fetch submitter profiles separately
      const blogsWithSubmitters = await Promise.all(
        (data || []).map(async (blog) => {
          if (blog.submitted_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', blog.submitted_by)
              .single();
            return { ...blog, submitter: profile };
          }
          return { ...blog, submitter: null };
        })
      );

      return blogsWithSubmitters as PendingBlogPost[];
    },
  });

  const approveProject = useMutation({
    mutationFn: async (project: PendingProject) => {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: 'published',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', project.id);
      if (error) throw error;

      // Send notification to worker
      if (project.submitted_by) {
        await supabase.from('notifications').insert({
          user_id: project.submitted_by,
          title: 'Prosjektet ditt er godkjent! 🎉',
          message: `"${project.title}" er nå publisert på nettsiden.`,
          type: 'content_approved',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-projects'] });
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      toast({ title: 'Godkjent', description: 'Prosjektet er publisert.' });
      setPreviewDialog({ open: false, type: 'project', item: null });
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
  });

  const approveBlog = useMutation({
    mutationFn: async (blog: PendingBlogPost) => {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', blog.id);
      if (error) throw error;

      // Send notification to worker
      if (blog.submitted_by) {
        await supabase.from('notifications').insert({
          user_id: blog.submitted_by,
          title: 'Blogginnlegget ditt er godkjent! 🎉',
          message: `"${blog.title}" er nå publisert på nettsiden.`,
          type: 'content_approved',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['worker-blogs'] });
      toast({ title: 'Godkjent', description: 'Blogginnlegget er publisert.' });
      setPreviewDialog({ open: false, type: 'blog', item: null });
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
  });

  const rejectContent = useMutation({
    mutationFn: async ({ type, id, reason, title, submittedBy }: { type: 'project' | 'blog'; id: string; reason: string; title: string; submittedBy: string | null }) => {
      const table = type === 'project' ? 'projects' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;

      // Send notification to worker
      if (submittedBy) {
        const contentType = type === 'project' ? 'Prosjektet' : 'Blogginnlegget';
        await supabase.from('notifications').insert({
          user_id: submittedBy,
          title: `${contentType} ditt ble avslått`,
          message: `"${title}" ble avslått. Grunn: ${reason}. Du kan redigere og sende inn på nytt.`,
          type: 'content_rejected',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-projects'] });
      queryClient.invalidateQueries({ queryKey: ['pending-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      queryClient.invalidateQueries({ queryKey: ['worker-blogs'] });
      toast({ title: 'Avslått', description: 'Innholdet er avslått og worker har fått varsel.' });
      setRejectDialog({ open: false, type: 'project', id: null, title: '', submittedBy: null });
      setRejectReason('');
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ukjent';
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLoading = loadingProjects || loadingBlogs;
  const projectCount = pendingProjects?.length || 0;
  const blogCount = pendingBlogs?.length || 0;
  const totalCount = projectCount + blogCount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Godkjenningskø
          {totalCount > 0 && (
            <Badge variant="destructive">{totalCount}</Badge>
          )}
        </h2>
        <p className="text-muted-foreground">Gjennomgå og godkjenn innhold fra workers</p>
      </div>

      {totalCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Ingen innhold venter på godkjenning</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Prosjekter
              {projectCount > 0 && <Badge variant="secondary">{projectCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blogginnlegg
              {blogCount > 0 && <Badge variant="secondary">{blogCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            {projectCount === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen prosjekter venter på godkjenning
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingProjects?.map((project) => (
                  <Card key={project.id} className="interactive-card">
                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                      <img 
                        src={project.after_image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Venter
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold line-clamp-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Sendt inn av: {project.submitter?.full_name || 'Ukjent'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Innsendt: {formatDate(project.submitted_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPreviewDialog({ open: true, type: 'project', item: project })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setRejectDialog({ 
                            open: true, 
                            type: 'project', 
                            id: project.id,
                            title: project.title,
                            submittedBy: project.submitted_by,
                          })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Avslå
                        </Button>
                        <Button 
                          variant="cta" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => approveProject.mutate(project)}
                          disabled={approveProject.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Publiser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            {blogCount === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen blogginnlegg venter på godkjenning
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingBlogs?.map((blog) => (
                  <Card key={blog.id} className="interactive-card">
                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                      <img 
                        src={blog.cover_image_url} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Venter
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold line-clamp-1">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{blog.summary}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Sendt inn av: {blog.submitter?.full_name || 'Ukjent'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Innsendt: {formatDate(blog.submitted_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPreviewDialog({ open: true, type: 'blog', item: blog })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setRejectDialog({ 
                            open: true, 
                            type: 'blog', 
                            id: blog.id,
                            title: blog.title,
                            submittedBy: blog.submitted_by,
                          })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Avslå
                        </Button>
                        <Button 
                          variant="cta" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => approveBlog.mutate(blog)}
                          disabled={approveBlog.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Publiser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog({ ...previewDialog, open })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewDialog.type === 'project' ? 'Prosjekt-forhåndsvisning' : 'Blogg-forhåndsvisning'}
            </DialogTitle>
          </DialogHeader>
          
          {previewDialog.type === 'project' && previewDialog.item && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Før</p>
                  <img 
                    src={(previewDialog.item as PendingProject).before_image_url} 
                    alt="Før" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Etter</p>
                  <img 
                    src={(previewDialog.item as PendingProject).after_image_url} 
                    alt="Etter" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{previewDialog.item.title}</h3>
                <p className="text-muted-foreground">{(previewDialog.item as PendingProject).description}</p>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Kategori: {(previewDialog.item as PendingProject).category}</span>
                <span>Sted: {(previewDialog.item as PendingProject).location}</span>
              </div>
            </div>
          )}

          {previewDialog.type === 'blog' && previewDialog.item && (
            <div className="space-y-4">
              <img 
                src={(previewDialog.item as PendingBlogPost).cover_image_url} 
                alt="Cover" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-lg">{previewDialog.item.title}</h3>
                <p className="text-muted-foreground">{(previewDialog.item as PendingBlogPost).summary}</p>
              </div>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: (previewDialog.item as PendingBlogPost).content }} />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={() => {
                const item = previewDialog.item;
                setPreviewDialog({ ...previewDialog, open: false });
                setRejectDialog({ 
                  open: true, 
                  type: previewDialog.type, 
                  id: item?.id || null,
                  title: item?.title || '',
                  submittedBy: item?.submitted_by || null,
                });
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Avslå
            </Button>
            <Button 
              variant="cta"
              onClick={() => {
                if (previewDialog.type === 'project' && previewDialog.item) {
                  approveProject.mutate(previewDialog.item as PendingProject);
                } else if (previewDialog.type === 'blog' && previewDialog.item) {
                  approveBlog.mutate(previewDialog.item as PendingBlogPost);
                }
              }}
              disabled={approveProject.isPending || approveBlog.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Godkjenn & Publiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avslå innhold</DialogTitle>
            <DialogDescription>
              Gi en begrunnelse for hvorfor innholdet avslås
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reason">Begrunnelse *</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="F.eks: Mangler etter-bilde, kvalitet for lav..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, type: 'project', id: null, title: '', submittedBy: null })}>
              Avbryt
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (rejectDialog.id && rejectReason) {
                  rejectContent.mutate({ 
                    type: rejectDialog.type, 
                    id: rejectDialog.id, 
                    reason: rejectReason,
                    title: rejectDialog.title,
                    submittedBy: rejectDialog.submittedBy,
                  });
                }
              }}
              disabled={!rejectReason || rejectContent.isPending}
            >
              {rejectContent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Avslå
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
