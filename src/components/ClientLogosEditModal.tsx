import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageDropZone } from "@/components/ui/ImageDropZone";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, GripVertical, Plus, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface ClientLogosEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm = { name: "", website_url: "" };

export const ClientLogosEditModal = ({
  isOpen,
  onClose,
  onSaved,
}: ClientLogosEditModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [newLogo, setNewLogo] = useState(emptyForm);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch ALL logos for admin (active + inactive)
  const { data: logos = [], refetch } = useQuery({
    queryKey: ["client-logos-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as ClientLogo[];
    },
    enabled: isOpen,
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_logos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      onSaved();
      toast({ title: "Logo slettet" });
    },
    onError: () => {
      toast({ title: "Feil ved sletting", variant: "destructive" });
    },
  });

  // Toggle active
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("client_logos")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      onSaved();
    },
    onError: () => {
      toast({ title: "Feil ved oppdatering", variant: "destructive" });
    },
  });

  // Move order up/down
  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = logos.findIndex((l) => l.id === id);
      if (idx === -1) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= logos.length) return;

      const current = logos[idx];
      const target = logos[targetIdx];

      const { error: e1 } = await supabase
        .from("client_logos")
        .update({ display_order: target.display_order })
        .eq("id", current.id);
      const { error: e2 } = await supabase
        .from("client_logos")
        .update({ display_order: current.display_order })
        .eq("id", target.id);

      if (e1 || e2) throw e1 || e2;
    },
    onSuccess: () => {
      refetch();
      onSaved();
    },
  });

  const handleFileSelect = (file: File) => {
    setNewFile(file);
    setNewPreview(URL.createObjectURL(file));
    setUploadError(null);
  };

  const handleAddLogo = async () => {
    if (!newFile) {
      setUploadError("Du må velge en logo");
      return;
    }
    if (!newLogo.name.trim()) {
      setUploadError("Bedriftsnavn er påkrevd");
      return;
    }

    setUploading(true);
    try {
      // Upload file
      const ext = newFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("client-logos")
        .upload(fileName, newFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("client-logos")
        .getPublicUrl(fileName);

      const maxOrder = logos.length > 0 ? Math.max(...logos.map((l) => l.display_order)) + 1 : 0;

      const { error: insertError } = await supabase.from("client_logos").insert({
        name: newLogo.name.trim(),
        logo_url: urlData.publicUrl,
        website_url: newLogo.website_url.trim() || null,
        display_order: maxOrder,
        is_active: true,
      });

      if (insertError) throw insertError;

      toast({ title: "Logo lagt til!" });
      setNewLogo(emptyForm);
      setNewFile(null);
      setNewPreview(null);
      setAddingNew(false);
      refetch();
      onSaved();
    } catch (err) {
      console.error(err);
      toast({ title: "Feil ved opplasting", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setAddingNew(false);
    setNewLogo(emptyForm);
    setNewFile(null);
    setNewPreview(null);
    setUploadError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Administrer kundelogoer</DialogTitle>
        </DialogHeader>

        {/* Existing logos */}
        <div className="space-y-3">
          {logos.length === 0 && !addingNew && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Ingen logoer lagt til ennå.
            </p>
          )}

          {logos.map((logo, idx) => (
            <div
              key={logo.id}
              className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => reorderMutation.mutate({ id: logo.id, direction: "up" })}
                  disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                  title="Flytt opp"
                >
                  ▲
                </button>
                <button
                  onClick={() => reorderMutation.mutate({ id: logo.id, direction: "down" })}
                  disabled={idx === logos.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                  title="Flytt ned"
                >
                  ▼
                </button>
              </div>

              {/* Logo thumbnail */}
              <img
                src={logo.logo_url}
                alt={logo.name}
                className="h-10 w-16 object-contain rounded bg-muted/50 p-1 flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{logo.name}</p>
                {logo.website_url && (
                  <a
                    href={logo.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary truncate"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    {logo.website_url}
                  </a>
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Label className="text-xs text-muted-foreground">Aktiv</Label>
                <Switch
                  checked={logo.is_active}
                  onCheckedChange={(val) =>
                    toggleMutation.mutate({ id: logo.id, is_active: val })
                  }
                />
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive flex-shrink-0"
                onClick={() => deleteMutation.mutate(logo.id)}
                title="Slett logo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new form */}
        {addingNew && (
          <div className="border border-primary/30 rounded-lg p-4 space-y-4 bg-primary/5 mt-2">
            <h3 className="font-semibold text-sm">Legg til ny logo</h3>

            <ImageDropZone
              onFileSelect={handleFileSelect}
              preview={newPreview || undefined}
              onRemove={() => { setNewFile(null); setNewPreview(null); }}
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              maxSizeMB={5}
              label="Klikk eller dra logo hit"
              hint="JPG, PNG, WebP eller SVG — maks 5 MB"
              onError={(msg) => setUploadError(msg)}
            />

            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="logo-name">Bedriftsnavn *</Label>
                <Input
                  id="logo-name"
                  value={newLogo.name}
                  onChange={(e) => setNewLogo((p) => ({ ...p, name: e.target.value }))}
                  placeholder="f.eks. Acme AS"
                />
              </div>
              <div>
                <Label htmlFor="logo-url">Nettside-URL (valgfritt)</Label>
                <Input
                  id="logo-url"
                  value={newLogo.website_url}
                  onChange={(e) => setNewLogo((p) => ({ ...p, website_url: e.target.value }))}
                  placeholder="https://eksempel.no"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => { setAddingNew(false); setNewLogo(emptyForm); setNewFile(null); setNewPreview(null); setUploadError(null); }}
                disabled={uploading}
              >
                Avbryt
              </Button>
              <Button onClick={handleAddLogo} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Laster opp...
                  </>
                ) : (
                  "Legg til logo"
                )}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 flex-row justify-between">
          <Button
            variant="outline"
            onClick={() => setAddingNew(true)}
            disabled={addingNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Legg til logo
          </Button>
          <Button onClick={handleClose}>Lukk</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
