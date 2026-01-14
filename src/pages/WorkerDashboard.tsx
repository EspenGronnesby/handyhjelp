import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, FileText, Home, Plus } from 'lucide-react';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { WorkerProjectForm } from '@/components/worker/WorkerProjectForm';
import { WorkerBlogForm } from '@/components/worker/WorkerBlogForm';
import { WorkerProjectEditForm } from '@/components/worker/WorkerProjectEditForm';
import { WorkerBlogEditForm } from '@/components/worker/WorkerBlogEditForm';
import { SubmissionList, type Project, type BlogPost } from '@/components/worker/SubmissionList';

const WorkerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isWorker, isAdmin, isOwner, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={handyhjelpLogoWhite} alt="HandyHjelp" className="h-8 md:h-10" />
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Mine innleveringer</h1>
          <p className="text-muted-foreground">Send inn prosjekter og blogginnlegg til godkjenning</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 h-auto gap-2 bg-transparent">
              <TabsTrigger 
                value="projects" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Camera className="h-4 w-4" />
                Prosjekter
              </TabsTrigger>
              <TabsTrigger 
                value="blog" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4" />
                Blogginnlegg
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
            />
          </TabsContent>

          <TabsContent value="blog">
            <SubmissionList 
              type="blog" 
              userId={user.id}
              onEditBlog={setEditingBlog}
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
