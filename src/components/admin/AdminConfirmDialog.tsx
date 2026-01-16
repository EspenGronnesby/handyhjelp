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
import { Quote, Job } from '@/types/admin';

interface ConfirmDialogState {
  open: boolean;
  type: 'start' | 'complete' | 'delete' | 'complete_directly' | null;
  item: Quote | Job | null;
}

interface AdminConfirmDialogProps {
  dialog: ConfirmDialogState;
  onClose: () => void;
  onStartJob: (quote: Quote) => void;
  onCompleteJob: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
  onCompleteJobDirectly?: (quote: Quote) => void;
}

export const AdminConfirmDialog = ({ 
  dialog, 
  onClose, 
  onStartJob, 
  onCompleteJob, 
  onDeleteJob,
  onCompleteJobDirectly
}: AdminConfirmDialogProps) => {
  const handleConfirm = () => {
    if (dialog.type === 'start' && dialog.item) {
      onStartJob(dialog.item as Quote);
    } else if (dialog.type === 'complete' && dialog.item) {
      onCompleteJob(dialog.item as Job);
    } else if (dialog.type === 'delete' && dialog.item) {
      onDeleteJob(dialog.item as Job);
    } else if (dialog.type === 'complete_directly' && dialog.item && onCompleteJobDirectly) {
      onCompleteJobDirectly(dialog.item as Quote);
    }
  };

  return (
    <AlertDialog open={dialog.open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {dialog.type === 'start' && 'Start jobb?'}
            {dialog.type === 'complete' && 'Fullfør jobb?'}
            {dialog.type === 'delete' && 'Slett jobb?'}
            {dialog.type === 'complete_directly' && 'Avslutt oppdrag direkte?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {dialog.type === 'start' && 'Dette vil starte jobben og sende en e-post til kunden om at arbeidet har begynt.'}
            {dialog.type === 'complete' && 'Dette vil markere jobben som fullført og sende en takkemelding til kunden.'}
            {dialog.type === 'delete' && 'Dette vil permanent slette jobben. Denne handlingen kan ikke angres.'}
            {dialog.type === 'complete_directly' && 'Dette vil markere oppdraget som fullført uten å starte det først. Kunden vil kun motta avslutningsbekreftelse på e-post.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {dialog.type === 'start' && 'Start jobb'}
            {dialog.type === 'complete' && 'Fullfør'}
            {dialog.type === 'delete' && 'Slett'}
            {dialog.type === 'complete_directly' && 'Avslutt direkte'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
