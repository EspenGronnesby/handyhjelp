import { useState } from 'react';
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

interface WorkerBlogFormProps {
  open: boolean;
  onClose: () => void;
}

const categoryOptions = [
  { value: 'vaktmester', label: 'Vaktmester' },
  { value: 'tomrer', label: 'Tømrer' },
  { value: 'blikk', label: 'Blikk' },
  { value: 'sesongråd', label: 'Sesongråd' },
  { value: 'generelt', label: 'Generelt' },
];

export const WorkerBlogForm = ({ open, onClose }: WorkerBlogFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'vaktmester',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Feil', description: 'Bildet kan ikke være større enn 10 MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(file);
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `blog-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const submitBlog = useMutation({
    mutationFn: async () => {
      if (!coverImage) {
        throw new Error('Forsidebilde må lastes opp');
      }

      setUploading(true);
      
      const coverUrl = await uploadImage(coverImage);
      const slug = generateSlug(formData.title);
      const readingTime = calculateReadingTime(formData.content);

      const { data: blog, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: formData.title,
          slug: `${slug}-${Date.now()}`,
          summary: formData.summary,
          content: formData.content,
          category: formData.category,
          cover_image_url: coverUrl,
          reading_time: readingTime,
          status: 'pending_approval',
          submitted_by: user?.id,
          submitted_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notification to all admins and owners
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'platform_owner']);

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          user_id: admin.user_id,
          title: 'Nytt blogginnlegg til godkjenning',
          message: `${user?.email || 'En worker'} har sendt inn blogginnlegget "${formData.title}"`,
          type: 'content_submission',
        }));

        await supabase.from('notifications').insert(notifications);
      }

      return blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['pending-blogs'] });
      toast({ title: 'Innsendt', description: 'Blogginnlegget er sendt til godkjenning.' });
      handleClose();
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const hasUnsavedChanges = () => {
    return formData.title !== '' || 
           formData.summary !== '' || 
           formData.content !== '' ||
           coverImage !== null;
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'vaktmester',
    });
    setCoverImage(null);
    setCoverPreview('');
  };

  // Called only on successful submission
  const handleClose = () => {
    resetFormData();
    onClose();
  };

  // Called when user explicitly clicks "Avbryt"
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      if (!confirm('Du har ulagrede endringer. Er du sikker på at du vil avbryte?')) {
        return;
      }
    }
    resetFormData();
    onClose();
  };

  // Called on dialog backdrop click or escape - preserve data
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose(); // Just close, don't reset data
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBlog.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nytt blogginnlegg</DialogTitle>
          <DialogDescription>
            Skriv et blogginnlegg som vil bli sendt til godkjenning
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
              minLength={10}
              maxLength={100}
              placeholder="Skriv en fengande tittel (10-100 tegn)"
            />
          </div>

          <div>
            <Label htmlFor="summary">Sammendrag *</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
              minLength={50}
              maxLength={200}
              rows={3}
              placeholder="Kort sammendrag av artikkelen (50-200 tegn)"
            />
          </div>

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
            <Label>Forsidebilde *</Label>
            <div className="mt-2">
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Last opp forsidebilde</span>
                  <span className="text-xs text-muted-foreground mt-1">Maks 10 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="content">Innhold *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              minLength={200}
              rows={12}
              placeholder="Skriv artikkelen din her. Du kan bruke HTML for formatering."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 200 tegn. Støtter HTML for formatering.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Avbryt
            </Button>
            <Button 
              type="submit" 
              variant="cta"
              disabled={uploading || !coverImage || submitBlog.isPending}
            >
              {(uploading || submitBlog.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send til godkjenning
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
