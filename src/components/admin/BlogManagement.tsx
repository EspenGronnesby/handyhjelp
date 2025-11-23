import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string;
  category: string;
  status: string;
  published_at: string | null;
  reading_time: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

const categoryOptions = [
  { value: 'vaktmester', label: 'Vaktmester' },
  { value: 'tomrer', label: 'Tømrer' },
  { value: 'blikk', label: 'Blikk' },
  { value: 'sesongråd', label: 'Sesongråd' },
  { value: 'generelt', label: 'Generelt' },
];

export const BlogManagement = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'vaktmester',
    status: 'published',
    seo_title: '',
    seo_description: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setPosts(data);
    }
    setLoading(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Feil",
          description: "Bildet kan ikke være større enn 5 MB",
          variant: "destructive",
        });
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let coverImageUrl = editingPost?.cover_image_url || '';

      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage);
      }

      const slug = generateSlug(formData.title);
      const readingTime = calculateReadingTime(formData.content);
      const publishedAt = formData.status === 'published' ? new Date().toISOString() : null;

      const postData = {
        title: formData.title,
        slug,
        summary: formData.summary,
        content: formData.content,
        cover_image_url: coverImageUrl,
        category: formData.category,
        status: formData.status,
        reading_time: readingTime,
        published_at: publishedAt,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: "Oppdatert",
          description: "Blogg-artikkelen er oppdatert.",
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;

        toast({
          title: "Opprettet",
          description: "Ny blogg-artikkel er opprettet.",
        });
      }

      await fetchPosts();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke lagre blogg-artikkelen.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      summary: post.summary,
      content: post.content,
      category: post.category,
      status: post.status,
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
    });
    setCoverImagePreview(post.cover_image_url);
    setDialogOpen(true);
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      await fetchPosts();
      toast({
        title: "Slettet",
        description: "Blogg-artikkelen er slettet.",
      });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke slette blogg-artikkelen.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, postId: null });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'vaktmester',
      status: 'published',
      seo_title: '',
      seo_description: '',
    });
    setCoverImage(null);
    setCoverImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blogg-artikler</h2>
          <p className="text-muted-foreground">Administrer alle blogg-artikler</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} variant="cta">
          <Plus className="h-4 w-4 mr-2" />
          Skriv ny artikkel
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Ingen blogg-artikler ennå. Opprett din første artikkel.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img 
                  src={post.cover_image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 left-2">
                  {categoryOptions.find(c => c.value === post.category)?.label}
                </Badge>
                <Badge 
                  className="absolute top-2 right-2"
                  variant={post.status === 'published' ? 'default' : 'secondary'}
                >
                  {post.status === 'published' ? 'Publisert' : 'Utkast'}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {post.summary}
                </p>
                <div className="flex gap-2 mt-auto">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(post)}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rediger
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => setDeleteDialog({ open: true, postId: post.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Rediger artikkel' : 'Skriv ny artikkel'}
            </DialogTitle>
            <DialogDescription>
              Fyll ut alle felt for å opprette eller oppdatere en blogg-artikkel
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grunnleggende info */}
            <div className="space-y-4">
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
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                <Label htmlFor="cover_image">Forsidebilde *</Label>
                <div className="space-y-2">
                  <Input
                    id="cover_image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    required={!editingPost}
                  />
                  {coverImagePreview && (
                    <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                      <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Maks 5 MB. JPG, PNG eller WebP</p>
                </div>
              </div>
            </div>

            {/* Hovedinnhold */}
            <div>
              <Label htmlFor="content">Hovedinnhold *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                minLength={200}
                rows={12}
                placeholder="Skriv artikkelen din her. Du kan bruke HTML-tags for formatering."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 200 tegn. Støtter HTML for formatering.
              </p>
            </div>

            {/* SEO & Publisering */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">SEO & Publisering</h3>
              
              <div>
                <Label htmlFor="seo_title">SEO Tittel</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="Tittel for søkemotorer (valgfritt)"
                />
              </div>

              <div>
                <Label htmlFor="seo_description">SEO Beskrivelse</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  rows={2}
                  placeholder="Beskrivelse for søkemotorer (valgfritt)"
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Utkast</SelectItem>
                    <SelectItem value="published">Publiser nå</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Avbryt
              </Button>
              <Button type="submit" variant="cta" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Lagrer...
                  </>
                ) : editingPost ? (
                  'Oppdater'
                ) : (
                  'Publiser'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, postId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handlingen kan ikke angres. Blogg-artikkelen vil bli permanent slettet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDialog.postId && handleDelete(deleteDialog.postId)}>
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
