import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageDropZone } from "@/components/ui/ImageDropZone";
import { useToast } from "@/hooks/use-toast";
import { useFormDraft, useImageDraft } from "@/hooks/useFormDraft";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, Upload, X, GripVertical, MapPin, Calendar, Wrench, Hammer, Droplet, CloudRain, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  completed_date: string;
  before_image_url: string;
  after_image_url: string;
  status: "published" | "draft";
  display_order: number;
  created_at: string;
  category: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  location: string;
  completed_date: string;
  status: "published" | "draft";
  category: "vaktmester" | "tomrer" | "blikk" | "takrennerens" | "annet";
}

type CategoryType = "vaktmester" | "tomrer" | "blikk" | "takrennerens" | "annet";

const initialFormData: ProjectFormData = {
  title: "",
  description: "",
  location: "",
  completed_date: new Date().toISOString().split("T")[0],
  status: "published",
  category: "vaktmester",
};

export const ProjectManagement = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form draft persistence
  const {
    data: formData,
    setData: setFormData,
    hasDraft: hasFormDraft,
    clearDraft: clearFormDraft,
  } = useFormDraft<ProjectFormData>({
    key: 'admin-project-form',
    initialData: initialFormData,
    userId: user?.id,
    enabled: isDialogOpen && !editingProject, // Only persist drafts for new projects
  });

  // Image preview draft persistence
  const {
    previews,
    setPreview,
    clearPreview,
    clearAllPreviews,
    hasDraft: hasImageDraft,
  } = useImageDraft({
    key: 'admin-project-images',
    userId: user?.id,
    enabled: isDialogOpen && !editingProject,
  });

  const beforePreview = editingProject ? editingProject.before_image_url : previews.before || "";
  const afterPreview = editingProject ? editingProject.after_image_url : previews.after || "";

  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [editingBeforePreview, setEditingBeforePreview] = useState<string>("");
  const [editingAfterPreview, setEditingAfterPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const hasDraft = (hasFormDraft || hasImageDraft) && !editingProject;

  // Get effective preview (editing preview takes precedence)
  const effectiveBeforePreview = editingProject
    ? (editingBeforePreview || editingProject.before_image_url)
    : (previews.before || "");
  const effectiveAfterPreview = editingProject
    ? (editingAfterPreview || editingProject.after_image_url)
    : (previews.after || "");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("completed_date", { ascending: false });

    if (!error && data) {
      setProjects(data as Project[]);
    }
  };

  // Handle image selection with draft persistence
  const handleImageSelect = (file: File, type: "before" | "after") => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === "before") {
        setBeforeImage(file);
        if (editingProject) {
          setEditingBeforePreview(URL.createObjectURL(file));
        } else {
          setPreview('before', base64);
        }
      } else {
        setAfterImage(file);
        if (editingProject) {
          setEditingAfterPreview(URL.createObjectURL(file));
        } else {
          setPreview('after', base64);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, projectId: string, type: "before" | "after") => {
    const fileExt = file.name.split(".").pop();
    const fileName = `project-${projectId}-${type}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("project-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validation
      if (!editingProject && (!beforeImage || !afterImage)) {
        toast({
          title: "Feil",
          description: "Både før- og etter-bilde er påkrevd",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      if (formData.title.length < 5 || formData.title.length > 100) {
        toast({
          title: "Feil",
          description: "Tittel må være mellom 5 og 100 tegn",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      if (formData.description.length < 10 || formData.description.length > 200) {
        toast({
          title: "Feil",
          description: "Beskrivelse må være mellom 10 og 200 tegn",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      let projectId = editingProject?.id;
      let beforeUrl = editingProject?.before_image_url || "";
      let afterUrl = editingProject?.after_image_url || "";

      if (editingProject) {
        // Update existing project
        const updates: any = { ...formData };

        // Upload new images if provided
        if (beforeImage) {
          setUploadProgress(25);
          beforeUrl = await uploadImage(beforeImage, projectId!, "before");
          updates.before_image_url = beforeUrl;
        }

        if (afterImage) {
          setUploadProgress(50);
          afterUrl = await uploadImage(afterImage, projectId!, "after");
          updates.after_image_url = afterUrl;
        }

        setUploadProgress(75);
        const { error } = await supabase
          .from("projects")
          .update(updates)
          .eq("id", projectId);

        if (error) throw error;

        toast({
          title: "Suksess",
          description: "Prosjekt oppdatert!",
        });
      } else {
        // Create new project
        const { data: newProject, error: insertError } = await supabase
          .from("projects")
          .insert({
            ...formData,
            before_image_url: "temp",
            after_image_url: "temp",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        projectId = newProject.id;

        setUploadProgress(25);
        beforeUrl = await uploadImage(beforeImage!, projectId, "before");

        setUploadProgress(50);
        afterUrl = await uploadImage(afterImage!, projectId, "after");

        setUploadProgress(75);
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            before_image_url: beforeUrl,
            after_image_url: afterUrl,
          })
          .eq("id", projectId);

        if (updateError) throw updateError;

        toast({
          title: "Suksess",
          description: "Prosjekt publisert!",
        });

        // Clear drafts after successful new project creation
        clearFormDraft();
        clearAllPreviews();
      }

      setUploadProgress(100);
      resetForm(false); // Don't clear drafts again, already handled above
      setIsDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke lagre prosjekt",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      location: project.location,
      completed_date: project.completed_date,
      status: project.status,
      category: (project.category || "vaktmester") as CategoryType,
    });
    setEditingBeforePreview(project.before_image_url);
    setEditingAfterPreview(project.after_image_url);
    setIsDialogOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Suksess",
        description: "Prosjekt slettet",
      });

      fetchProjects();
      setDeleteProjectId(null);
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke slette prosjekt",
        variant: "destructive",
      });
    }
  };

  const resetForm = (clearDrafts = false) => {
    setFormData(initialFormData);
    setBeforeImage(null);
    setAfterImage(null);
    setEditingBeforePreview("");
    setEditingAfterPreview("");
    setEditingProject(null);
    if (clearDrafts) {
      clearFormDraft();
      clearAllPreviews();
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Prosjekter</h2>
          <p className="text-muted-foreground">
            Administrer før/etter-bilder av prosjekter
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProject(null);
              setBeforeImage(null);
              setAfterImage(null);
              setEditingBeforePreview("");
              setEditingAfterPreview("");
            }} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Legg til nytt prosjekt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Rediger prosjekt" : "Legg til nytt prosjekt"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Draft indicator */}
              {hasDraft && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-200">Utkast lastet inn automatisk</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => resetForm(true)}
                    className="text-blue-800 dark:text-blue-200 hover:text-blue-900"
                  >
                    Slett utkast
                  </Button>
                </div>
              )}

              {/* Image Upload Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* Before Image */}
                <div className="space-y-2">
                  <Label>FØR-bilde *</Label>
                  <ImageDropZone
                    onFileSelect={(file) => handleImageSelect(file, "before")}
                    preview={effectiveBeforePreview}
                    onRemove={() => {
                      setBeforeImage(null);
                      if (editingProject) {
                        setEditingBeforePreview("");
                      } else {
                        clearPreview('before');
                      }
                    }}
                    onError={(message) => toast({ title: "Feil", description: message, variant: "destructive" })}
                    disabled={isUploading}
                  />
                </div>

                {/* After Image */}
                <div className="space-y-2">
                  <Label>ETTER-bilde *</Label>
                  <ImageDropZone
                    onFileSelect={(file) => handleImageSelect(file, "after")}
                    preview={effectiveAfterPreview}
                    onRemove={() => {
                      setAfterImage(null);
                      if (editingProject) {
                        setEditingAfterPreview("");
                      } else {
                        clearPreview('after');
                      }
                    }}
                    onError={(message) => toast({ title: "Feil", description: message, variant: "destructive" })}
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-2">
                <Label htmlFor="title">Prosjekttittel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="F.eks. Fasaderenovering i Kristiansand"
                  required
                  minLength={5}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 tegn
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Kort beskrivelse av prosjektet"
                  required
                  minLength={10}
                  maxLength={200}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/200 tegn
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasjon *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="F.eks. Kristiansand"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completed_date">Dato fullført *</Label>
                  <Input
                    id="completed_date"
                    type="date"
                    value={formData.completed_date}
                    onChange={(e) =>
                      setFormData({ ...formData, completed_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "vaktmester", label: "Vaktmester", icon: "🔧" },
                    { value: "tomrer", label: "Tømrer", icon: "🔨" },
                    { value: "blikk", label: "Blikk", icon: "💧" },
                    { value: "takrennerens", label: "Takrennerens", icon: "🌧️" },
                    { value: "annet", label: "Annet", icon: "📦" },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value as CategoryType })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.category === cat.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="font-semibold text-sm">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
                <div>
                  <Label htmlFor="status" className="font-semibold">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Publiser prosjektet på nettsiden (anbefalt)
                  </p>
                </div>
                <Switch
                  id="status"
                  checked={formData.status === "published"}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      status: checked ? "published" : "draft",
                    })
                  }
                />
              </div>

              {/* Progress Bar */}
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Laster opp... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isUploading} className="flex-1">
                  {isUploading
                    ? "Laster opp..."
                    : editingProject
                    ? "Oppdater prosjekt"
                    : "Lagre prosjekt"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm(false); // Keep draft when canceling
                    setIsDialogOpen(false);
                  }}
                  disabled={isUploading}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Søk etter prosjekt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="flex flex-col h-[400px] interactive-card">
            {/* Image Section - Fixed Height */}
            <div className="relative h-[160px] flex-shrink-0">
              <img
                src={project.before_image_url}
                alt={project.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <Badge 
                variant={project.status === "published" ? "default" : "secondary"}
                className="absolute top-2 right-2 text-xs"
              >
                {project.status === "published" ? "Publisert" : "Utkast"}
              </Badge>
              {project.category && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 text-xs flex items-center gap-1"
                >
                  {project.category === "vaktmester" ? (
                    <>
                      <Wrench className="w-3 h-3" />
                      Vaktmester
                    </>
                  ) : project.category === "tomrer" ? (
                    <>
                      <Hammer className="w-3 h-3" />
                      Tømrer
                    </>
                  ) : project.category === "blikk" ? (
                    <>
                      <Droplet className="w-3 h-3" />
                      Blikk
                    </>
                  ) : project.category === "takrennerens" ? (
                    <>
                      <CloudRain className="w-3 h-3" />
                      Takrennerens
                    </>
                  ) : (
                    <>
                      <Package className="w-3 h-3" />
                      Annet
                    </>
                  )}
                </Badge>
              )}
            </div>

            {/* Content Section - Flexible */}
            <div className="p-3 flex flex-col flex-1 min-h-0">
              <h3 className="font-semibold text-base mb-1 line-clamp-2 overflow-hidden">{project.title}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-3 overflow-hidden">
                {project.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{new Date(project.completed_date).toLocaleDateString('nb-NO')}</span>
              </div>

              {/* Button Section - Always at Bottom */}
              <div className="flex gap-2 mt-auto pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(project)}
                  className="flex-1 h-9 text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Rediger
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteProjectId(project.id)}
                  className="flex-1 h-9 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Slett
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Ingen prosjekter funnet</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette prosjektet og bildene. Handlingen kan ikke
              angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && handleDelete(deleteProjectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
