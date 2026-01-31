import DOMPurify from 'dompurify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  content: string;
  includeFeedbackButton: boolean;
}

// Convert plain text to HTML paragraphs
function textToHtml(text: string): string {
  return text
    .split('\n\n')
    .map(paragraph => `<p style="margin: 0 0 16px 0;">${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function EmailPreviewModal({
  open,
  onOpenChange,
  subject,
  content,
  includeFeedbackButton,
}: EmailPreviewModalProps) {
  const contentHtml = textToHtml(content);

  const feedbackButtonHtml = includeFeedbackButton ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" 
         style="display: inline-block; background: linear-gradient(135deg, #0891B2 0%, #06B6D4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Gi oss din tilbakemelding
      </a>
    </div>
  ` : '';

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 100%; background: #f5f5f5; padding: 20px;">
      <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #0891B2 0%, #06B6D4 100%); color: white; padding: 30px 20px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">HandyHjelp</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 500;">${subject || 'Emne mangler'}</h1>
        </div>
        
        <div style="padding: 30px 25px;">
          <p style="font-size: 18px; margin-bottom: 20px;"><strong>Hei [Mottakernavn],</strong></p>
          
          ${contentHtml || '<p style="color: #999; font-style: italic;">Innhold mangler...</p>'}
          
          ${feedbackButtonHtml}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0;">Med vennlig hilsen,<br><strong>HandyHjelp-teamet</strong></p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 25px 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; background: #fafafa;">
          <p style="margin: 0 0 10px 0;"><strong>Levert med kvalitet</strong></p>
          <p style="margin: 0;">
            <a href="https://handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
            Telefon: +47 412 50 553 | E-post: team@handyhjelp.no
          </p>
        </div>
      </div>
    </div>
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Forhåndsvisning av e-post</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div 
            className="rounded-md overflow-hidden border"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emailHtml) }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
