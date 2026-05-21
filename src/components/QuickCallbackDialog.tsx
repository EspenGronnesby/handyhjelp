import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { QuickCallbackForm } from './QuickCallbackForm';

export const QuickCallbackDialog = ({ children }: { children: ReactNode }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-md p-0 bg-transparent border-0 shadow-none">
      <DialogTitle className="sr-only">La oss ringe deg</DialogTitle>
      <QuickCallbackForm />
    </DialogContent>
  </Dialog>
);
