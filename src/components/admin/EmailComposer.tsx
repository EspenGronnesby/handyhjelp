import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Send, 
  Plus, 
  X, 
  User, 
  Globe, 
  Eye,
  Users,
  MessageSquare,
  Loader2 
} from 'lucide-react';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { useSendEmail, EmailRecipient, SendEmailData } from '@/hooks/useSendEmail';
import { EmailConfirmModal } from './EmailConfirmModal';
import { EmailPreviewModal } from './EmailPreviewModal';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

interface EmailComposerProps {
  profiles: Profile[];
}

export function EmailComposer({ profiles }: EmailComposerProps) {
  const { templates, loading: templatesLoading } = useEmailTemplates();
  const { sendEmail, loading: sendLoading, cooldownSeconds } = useSendEmail();
  
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [includeFeedbackButton, setIncludeFeedbackButton] = useState(false);
  
  const [externalEmail, setExternalEmail] = useState('');
  const [externalName, setExternalName] = useState('');
  
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    if (templateId === 'none') {
      setSelectedTemplate(null);
      return;
    }
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSubject(template.subject);
      setContent(template.content);
      setIncludeFeedbackButton(template.include_feedback_button);
    }
  };

  // Add customer recipient
  const addCustomerRecipient = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    // Check if already added
    if (recipients.some(r => r.email === profile.email)) return;
    
    setRecipients([...recipients, {
      email: profile.email,
      name: profile.full_name,
      userId: profile.id,
      type: 'customer',
    }]);
  };

  // Add external recipient
  const addExternalRecipient = () => {
    if (!externalEmail) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(externalEmail)) return;
    
    // Check if already added
    if (recipients.some(r => r.email === externalEmail)) return;
    
    setRecipients([...recipients, {
      email: externalEmail,
      name: externalName || undefined,
      type: 'external',
    }]);
    
    setExternalEmail('');
    setExternalName('');
  };

  // Remove recipient
  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r.email !== email));
  };

  // Handle send
  const handleSend = () => {
    if (recipients.length === 0 || !subject || !content) return;
    setConfirmModalOpen(true);
  };

  const confirmSend = async () => {
    const data: SendEmailData = {
      recipients,
      subject,
      content,
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      includeFeedbackButton,
    };

    const result = await sendEmail(data);
    
    if (result && result.summary.sent > 0) {
      // Reset form on success
      setRecipients([]);
      setSelectedTemplate(null);
      setSubject('');
      setContent('');
      setIncludeFeedbackButton(false);
      setConfirmModalOpen(false);
    }
  };

  // Get available profiles (not already selected)
  const availableProfiles = profiles.filter(
    p => !recipients.some(r => r.email === p.email)
  );

  const canSend = recipients.length > 0 && subject.trim() && content.trim();

  return (
    <div className="space-y-6">
      {/* Recipients Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mottakere
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer selection */}
          <div className="space-y-2">
            <Label>Velg registrert kunde</Label>
            <Select onValueChange={addCustomerRecipient} value="">
              <SelectTrigger>
                <SelectValue placeholder="Søk og velg kunde..." />
              </SelectTrigger>
              <SelectContent>
                {availableProfiles.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Ingen flere kunder tilgjengelig
                  </div>
                ) : (
                  availableProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{profile.full_name}</span>
                        <span className="text-muted-foreground text-xs">({profile.email})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* External email input */}
          <div className="space-y-2">
            <Label>Legg til ekstern mottaker</Label>
            <div className="flex gap-2">
              <Input
                placeholder="E-postadresse *"
                type="email"
                value={externalEmail}
                onChange={(e) => setExternalEmail(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Navn (valgfritt)"
                value={externalName}
                onChange={(e) => setExternalName(e.target.value)}
                className="w-40"
              />
              <Button 
                variant="outline" 
                onClick={addExternalRecipient}
                disabled={!externalEmail}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected recipients */}
          {recipients.length > 0 && (
            <div className="space-y-2">
              <Label>Valgte mottakere ({recipients.length})</Label>
              <ScrollArea className="h-[120px] rounded-md border p-2">
                <div className="space-y-1">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.email}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                    >
                      {recipient.type === 'customer' ? (
                        <User className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">
                          {recipient.name || recipient.email}
                        </span>
                        {recipient.name && (
                          <span className="text-xs text-muted-foreground truncate block">
                            {recipient.email}
                          </span>
                        )}
                      </div>
                      <Badge 
                        variant={recipient.type === 'customer' ? 'secondary' : 'outline'}
                        className="text-xs flex-shrink-0"
                      >
                        {recipient.type === 'customer' ? 'Kunde' : 'Ekstern'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removeRecipient(recipient.email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Innhold
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template selection */}
          <div className="space-y-2">
            <Label>Velg mal (valgfritt)</Label>
            <Select 
              onValueChange={handleTemplateChange} 
              value={selectedTemplate?.id || 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg en mal eller skriv egen tekst" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Ingen mal - skriv egen tekst</span>
                </SelectItem>
                {templatesLoading ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                    Laster...
                  </div>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        {template.include_feedback_button && (
                          <Badge variant="secondary" className="text-[10px] px-1">
                            Tilbakemelding
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Emne</Label>
            <Input
              id="subject"
              placeholder="E-postens emne..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Innhold</Label>
            <Textarea
              id="content"
              placeholder="Skriv e-postens innhold her..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Teksten formateres automatisk med HandyHjelp-branding
            </p>
          </div>

          {/* Feedback button toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="feedback-toggle"
              checked={includeFeedbackButton}
              onCheckedChange={(checked) => setIncludeFeedbackButton(checked === true)}
            />
            <Label htmlFor="feedback-toggle" className="text-sm font-normal cursor-pointer">
              Inkluder tilbakemeldingsknapp
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => setPreviewModalOpen(true)}
          disabled={!content}
        >
          <Eye className="mr-2 h-4 w-4" />
          Forhåndsvisning
        </Button>
        <Button 
          onClick={handleSend}
          disabled={!canSend || sendLoading}
        >
          {sendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2 h-4 w-4" />
          Send e-post ({recipients.length})
        </Button>
      </div>

      {/* Confirm Modal */}
      <EmailConfirmModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        recipients={recipients}
        subject={subject}
        templateName={selectedTemplate?.name}
        includeFeedbackButton={includeFeedbackButton}
        onConfirm={confirmSend}
        loading={sendLoading}
        cooldownSeconds={cooldownSeconds}
      />

      {/* Preview Modal */}
      <EmailPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        subject={subject}
        content={content}
        includeFeedbackButton={includeFeedbackButton}
      />
    </div>
  );
}
