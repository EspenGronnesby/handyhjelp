import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { useEmailTemplates, EmailTemplate, CreateTemplateData } from '@/hooks/useEmailTemplates';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export function EmailTemplateManager() {
  const { templates, loading, actionLoading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    subject: '',
    content: '',
    include_feedback_button: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      include_feedback_button: false,
    });
    setSelectedTemplate(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      include_feedback_button: template.include_feedback_button,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.subject || !formData.content) return;

    let success: boolean;
    if (selectedTemplate) {
      success = await updateTemplate({ ...formData, id: selectedTemplate.id });
    } else {
      success = await createTemplate(formData);
    }

    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    const success = await deleteTemplate(templateToDelete.id, templateToDelete.name);
    if (success) {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const confirmDelete = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">E-postmaler</h3>
          <p className="text-sm text-muted-foreground">
            Opprett og administrer gjenbrukbare e-postmaler
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Ny mal
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ingen maler opprettet ennå</p>
            <Button onClick={openCreateDialog} className="mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Opprett din første mal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(template)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {template.content}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {template.include_feedback_button && (
                    <Badge variant="secondary" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Tilbakemelding
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    Oppdatert {format(new Date(template.updated_at), 'dd. MMM yyyy', { locale: nb })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Rediger mal' : 'Opprett ny mal'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Malnavn</Label>
              <Input
                id="name"
                placeholder="F.eks. Tilbakemeldingsforespørsel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">E-postens emne</Label>
              <Input
                id="subject"
                placeholder="F.eks. Vi ønsker din tilbakemelding"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Innhold (ren tekst)</Label>
              <Textarea
                id="content"
                placeholder="Skriv e-postens innhold her. Bruk linjeskift for avsnitt."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Innholdet blir automatisk formatert med HandyHjelp-branding ved sending
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="feedback"
                checked={formData.include_feedback_button}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, include_feedback_button: checked === true })
                }
              />
              <Label htmlFor="feedback" className="text-sm font-normal cursor-pointer">
                Inkluder tilbakemeldingsknapp i e-posten
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.name || !formData.subject || !formData.content || actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedTemplate ? 'Lagre endringer' : 'Opprett mal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett mal</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette malen "{templateToDelete?.name}"? 
              Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Slett mal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
