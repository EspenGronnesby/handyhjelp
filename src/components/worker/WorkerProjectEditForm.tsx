import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  completed_date: string;
  before_image_url: string;
  after_image_url: string;
}

interface WorkerProjectEditFormProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

const categoryOptions = [
  { value: 'vaktmester', label: 'Vaktmester' },
  { value: 'tomrer', label: 'Tømrer' },
  { value: 'blikk', label: 'Blikk' },
  { value: 'takrennerens', label: 'Takrennerens' },
  { value: 'annet', label: 'Annet' },
];

export const WorkerProjectEditForm = ({ project, open, onClose }: WorkerProjectEditFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'vaktmester',
    location: '',
    completed_date: new Date().toISOString().split('T')[0],
  });
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState('');
  const [afterPreview, setAfterPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // Pre-fill form when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        category: project.category,
        location: project.location,
        completed_date: project.completed_date.split('T')[0],
      });
      setBeforePreview(project.before_image_url);
      setAfterPreview(project.after_image_url);
    }
  }, [project]);

  const handleImageChange = (type: 'before' | 'after', file: File | null) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Feil', description: 'Bildet kan ikke være større enn 10 MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') {
        setBeforeImage(file);
        setBeforePreview(reader.result as string);
      } else {
        setAfterImage(file);
        setAfterPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, prefix: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const updateProject = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('No project to update');

      setUploading(true);
      
      // Only upload new images if they were changed
      let beforeUrl = project.before_image_url;
      let afterUrl = project.after_image_url;
      
      if (beforeImage) {
        beforeUrl = await uploadImage(beforeImage, 'before');
      }
      if (afterImage) {
        afterUrl = await uploadImage(afterImage, 'after');
      }

      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          completed_date: formData.completed_date,
          before_image_url: beforeUrl,
          after_image_url: afterUrl,
          status: 'pending_approval',
          submitted_at: new Date().toISOString(),
          rejection_reason: null,
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq('id', project.id);

      if (error) throw error;

      // Send notification to all admins and owners
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'platform_owner']);

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          user_id: admin.user_id,
          title: 'Redigert prosjekt til godkjenning',
          message: `${user?.email || 'En worker'} har sendt inn prosjektet "${formData.title}" på nytt`,
          type: 'content_submission',
        }));

        await supabase.from('notifications').insert(notifications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      queryClient.invalidateQueries({ queryKey: ['pending-projects'] });
      toast({ title: 'Innsendt', description: 'Prosjektet er sendt til godkjenning på nytt.' });
      handleClose();
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'vaktmester',
      location: '',
      completed_date: new Date().toISOString().split('T')[0],
    });
    setBeforeImage(null);
    setAfterImage(null);
    setBeforePreview('');
    setAfterPreview('');
    onClose();
  };

  const isTitleValid = formData.title.length >= 5 && formData.title.length <= 100;
  const isDescriptionValid = formData.description.length >= 10 && formData.description.length <= 200;
  const isFormValid = isTitleValid && isDescriptionValid && beforePreview;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTitleValid) {
      toast({ title: 'Feil', description: 'Tittel må være mellom 5 og 100 tegn', variant: 'destructive' });
      return;
    }
    if (!isDescriptionValid) {
      toast({ title: 'Feil', description: 'Beskrivelse må være mellom 10 og 200 tegn', variant: 'destructive' });
      return;
    }
    updateProject.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger prosjekt</DialogTitle>
          <DialogDescription>
            Gjør endringer og send inn på nytt til godkjenning
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Tittel (5-100 tegn)"
              maxLength={100}
            />
            <p className={`text-xs mt-1 ${isTitleValid ? 'text-muted-foreground' : 'text-destructive'}`}>
              {formData.title.length}/100 tegn (minimum 5)
            </p>
          </div>

          <div>
            <Label htmlFor="description">Beskrivelse *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Beskriv arbeidet som ble utført (10-200 tegn)"
              maxLength={200}
            />
            <p className={`text-xs mt-1 ${isDescriptionValid ? 'text-muted-foreground' : 'text-destructive'}`}>
              {formData.description.length}/200 tegn (minimum 10)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Sted *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="F.eks. Oslo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="completed_date">Fullført dato *</Label>
            <Input
              id="completed_date"
              type="date"
              value={formData.completed_date}
              onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Før-bilde *</Label>
              <div className="mt-2">
                {beforePreview ? (
                  <div className="relative">
                    <img src={beforePreview} alt="Før" className="w-full h-40 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setBeforeImage(null);
                        setBeforePreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Last opp før-bilde</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange('before', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Etter-bilde *</Label>
              <div className="mt-2">
                {afterPreview ? (
                  <div className="relative">
                    <img src={afterPreview} alt="Etter" className="w-full h-40 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setAfterImage(null);
                        setAfterPreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Last opp etter-bilde</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange('after', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Avbryt
            </Button>
            <Button 
              type="submit" 
              variant="cta"
              disabled={uploading || !isFormValid || !afterPreview || updateProject.isPending}
            >
              {(uploading || updateProject.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send inn på nytt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
