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
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, X, GripVertical } from "lucide-react";
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
}

interface ProjectFormData {
  title: string;
  description: string;
  location: string;
  completed_date: string;
  status: "published" | "draft";
}

export const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    location: "",
    completed_date: new Date().toISOString().split("T")[0],
    status: "draft",
  });
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>("");
  const [afterPreview, setAfterPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Feil",
        description: "Bildet kan ikke være større enn 5 MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        title: "Feil",
        description: "Kun JPG, PNG og WebP er tillatt",
        variant: "destructive",
      });
      return;
    }

    if (type === "before") {
      setBeforeImage(file);
      setBeforePreview(URL.createObjectURL(file));
    } else {
      setAfterImage(file);
      setAfterPreview(URL.createObjectURL(file));
    }
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
      }

      setUploadProgress(100);
      resetForm();
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
    });
    setBeforePreview(project.before_image_url);
    setAfterPreview(project.after_image_url);
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      completed_date: new Date().toISOString().split("T")[0],
      status: "draft",
    });
    setBeforeImage(null);
    setAfterImage(null);
    setBeforePreview("");
    setAfterPreview("");
    setEditingProject(null);
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
            <Button onClick={resetForm} size="lg">
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
              {/* Image Upload Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* Before Image */}
                <div className="space-y-2">
                  <Label>FØR-bilde *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                    {beforePreview ? (
                      <div className="relative">
                        <img
                          src={beforePreview}
                          alt="Før forhåndsvisning"
                          className="w-full h-48 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setBeforeImage(null);
                            setBeforePreview("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Klikk for å laste opp
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, "before")}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* After Image */}
                <div className="space-y-2">
                  <Label>ETTER-bilde *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                    {afterPreview ? (
                      <div className="relative">
                        <img
                          src={afterPreview}
                          alt="Etter forhåndsvisning"
                          className="w-full h-48 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setAfterImage(null);
                            setAfterPreview("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Klikk for å laste opp
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, "after")}
                        />
                      </label>
                    )}
                  </div>
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

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Publiser prosjektet på nettsiden
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
                    resetForm();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="p-0">
              <div className="relative aspect-video">
                <img
                  src={project.before_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <Badge
                  variant={project.status === "published" ? "default" : "secondary"}
                  className="absolute top-2 right-2"
                >
                  {project.status === "published" ? "Publisert" : "Utkast"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {project.description}
              </p>
              <div className="text-xs text-muted-foreground">
                <p>{project.location}</p>
                <p>
                  {new Date(project.completed_date).toLocaleDateString("nb-NO")}
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(project)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Rediger
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteProjectId(project.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
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
