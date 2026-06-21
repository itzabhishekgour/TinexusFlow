import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || "You're on the list — we'll be in touch.");
      } else {
        setStatus('error');
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus('error');
      setMessage("Connection error. Please check your network and try again.");
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center p-4 bg-[var(--bg-secondary)] border border-[var(--success)] rounded-xl max-w-md w-full mx-auto">
        <CheckCircle2 className="text-[var(--success)] mr-3" size={24} />
        <span className="text-[var(--text-primary)] font-medium">{message}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="developer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="flex-1 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === 'loading' ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Join Waitlist
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      {status === 'error' && (
        <div className="mt-3 flex items-center text-[var(--error)] text-sm font-medium justify-center sm:justify-start">
          <AlertCircle size={16} className="mr-2" />
          {message}
        </div>
      )}
    </div>
  );
}
