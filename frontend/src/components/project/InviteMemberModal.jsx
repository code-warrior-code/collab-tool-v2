import { useState } from 'react';
import Modal from '../Modal';

export default function InviteMemberModal({ onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onInvite(email.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add this member.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Invite a teammate" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="invite-email" className="label">Email address</label>
          <input
            id="invite-email"
            type="email"
            className="input"
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <p className="mt-1.5 text-xs text-inkFaint">They need an existing Stackline account with this email.</p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add to project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
