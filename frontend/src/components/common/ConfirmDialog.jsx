import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isSubmitting = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Warning Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-500 p-3 rounded-xl border border-rose-100 dark:border-rose-800/30 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1.5 min-w-0">
            <h3 className="font-display text-lg font-bold text-slate-850 dark:text-white truncate">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold text-sm cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm cursor-pointer shadow-md shadow-rose-500/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
