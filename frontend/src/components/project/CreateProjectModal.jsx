import { useState } from 'react';
import Modal from '../Modal';

const COLORS = ['#6c63ff', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#8b5cf6'];

export default function CreateProjectModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project name is required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onCreate({ title: title.trim(), description: description.trim(), color });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the project.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="New project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="project-title" className="label">Project name</label>
          <input
            id="project-title"
            className="input"
            placeholder="Website redesign"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="project-description" className="label">Description</label>
          <textarea
            id="project-description"
            className="input min-h-[88px] resize-none"
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Color</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full flex items-center justify-center transition-transform"
                style={{ backgroundColor: c, transform: color === c ? 'scale(1.15)' : 'scale(1)' }}
                aria-label={`Choose color ${c}`}
              >
                {color === c && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
