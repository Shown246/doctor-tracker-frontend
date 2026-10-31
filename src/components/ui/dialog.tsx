'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <Dialog.Title className="pr-10 text-xl font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mb-6 mt-2 text-sm text-slate-600">
            {description}
          </Dialog.Description>
          {children}
          <Dialog.Close
            className="absolute right-4 top-4 rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X size={18} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
