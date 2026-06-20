import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigationBadges } from '@/hooks/useNavigationBadges';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, FileText, Home, Plus, Hammer } from 'lucide-react';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { WorkerProjectForm } from '@/components/worker/WorkerProjectForm';
import { WorkerBlogForm } from '@/components/worker/WorkerBlogForm';
import { WorkerProjectEditForm } from '@/components/worker/WorkerProjectEditForm';
import { WorkerBlogEditForm } from '@/components/worker/WorkerBlogEditForm';
import { SubmissionList, type Project, type BlogPost } from '@/components/worker/SubmissionList';

const WorkerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isWorker, isAdmin, isOwner, loading: roleLoading } = useRole();
  const { badges } = useNavigationBadges();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // Delete mutations
  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('submitted_by', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      toast({ title: 'Slettet', description: 'Prosjektet ble slettet.' });
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
  });

  const deleteBlog = useMutation({
    mutationFn: async (blogId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId)
        .eq('submitted_by', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-blogs'] });
      toast({ title: 'Slettet', description: 'Blogginnlegget ble slettet.' });
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
  });

  // Workers, admins, and owners can access worker dashboard
  const canAccess = isWorker || isAdmin || isOwner;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !canAccess) {
      navigate('/dashboard');
    }
  }, [canAccess, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !canAccess) {
    return null;
  }

  return (
    <div>
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-sm">
            <Hammer className="h-5 w-5 text-white drop-shadow" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Mine innleveringer
            </h1>
            <p className="text-sm text-muted-foreground">Send inn prosjekter og blogginnlegg til godkjenning</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 h-auto gap-1 bg-muted/60 rounded-xl p-1">
              <TabsTrigger
                value="projects"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Camera className="h-4 w-4" />
                Prosjekter
                {(badges.workerDetails.pendingProjects + badges.workerDetails.rejectedProjects) > 0 && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {badges.workerDetails.pendingProjects + badges.workerDetails.rejectedProjects}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="blog"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4" />
                Blogginnlegg
                {(badges.workerDetails.pendingBlogs + badges.workerDetails.rejectedBlogs) > 0 && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {badges.workerDetails.pendingBlogs + badges.workerDetails.rejectedBlogs}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {activeTab === 'projects' && (
                <Button onClick={() => setShowProjectForm(true)} variant="cta">
                  <Plus className="h-4 w-4 mr-2" />
                  Nytt prosjekt
                </Button>
              )}
              {activeTab === 'blog' && (
                <Button onClick={() => setShowBlogForm(true)} variant="cta">
                  <Plus className="h-4 w-4 mr-2" />
                  Nytt blogginnlegg
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="projects">
            <SubmissionList 
              type="projects" 
              userId={user.id} 
              onEditProject={setEditingProject}
              onDeleteProject={(id) => deleteProject.mutate(id)}
            />
          </TabsContent>

          <TabsContent value="blog">
            <SubmissionList 
              type="blog" 
              userId={user.id}
              onEditBlog={setEditingBlog}
              onDeleteBlog={(id) => deleteBlog.mutate(id)}
            />
          </TabsContent>
        </Tabs>

        {/* Project Form Modal */}
        <WorkerProjectForm 
          open={showProjectForm} 
          onClose={() => setShowProjectForm(false)} 
        />

        {/* Blog Form Modal */}
        <WorkerBlogForm 
          open={showBlogForm} 
          onClose={() => setShowBlogForm(false)} 
        />

        {/* Project Edit Form Modal */}
        <WorkerProjectEditForm 
          project={editingProject}
          open={!!editingProject}
          onClose={() => setEditingProject(null)}
        />

        {/* Blog Edit Form Modal */}
        <WorkerBlogEditForm 
          blog={editingBlog}
          open={!!editingBlog}
          onClose={() => setEditingBlog(null)}
        />
      </div>
    </div>
  );
};

export default WorkerDashboard;
