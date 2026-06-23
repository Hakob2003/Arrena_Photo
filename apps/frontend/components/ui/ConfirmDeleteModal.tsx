import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтвердите удаление',
  description = 'Это действие нельзя отменить. Вы уверены, что хотите удалить',
  itemName = 'этот элемент',
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-4">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description} <span className="font-semibold text-slate-900 dark:text-white">{itemName}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5">
            Отмена
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white border-none shadow-sm shadow-red-500/20">
            {isLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
