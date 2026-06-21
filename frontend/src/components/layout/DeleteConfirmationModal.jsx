import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      // On success, the parent will close the modal by setting isOpen to false
    } catch (err) {
      setError("Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
      setError(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent dark overlay - click to close */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-2xl w-full max-w-[420px] mx-4 shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 ${isDeleting ? 'opacity-90 pointer-events-none' : ''}`}>
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 text-[var(--error)]">
            <div className="p-2 bg-[var(--error)]/10 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Delete conversation?</h2>
          </div>
          <button 
            onClick={handleClose}
            disabled={isDeleting}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Text */}
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
          This will permanently delete this conversation and all its branches. This action cannot be undone.
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-[var(--error)] text-sm">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-2 pointer-events-auto">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-medium)] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl font-medium text-white bg-[var(--error)] hover:bg-[var(--error)]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
            style={{ backgroundColor: 'var(--error, #ef4444)' }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
        
      </div>
    </div>,
    document.body
  );
}
