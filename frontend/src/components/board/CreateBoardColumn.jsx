import { useState } from 'react';

export default function CreateBoardColumn({ onCreate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setIsAdding(false);
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate(trimmed);
      setTitle('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex w-[82vw] max-w-[300px] sm:w-[300px] shrink-0 snap-start items-center justify-center gap-2 rounded-xl border border-dashed border-border text-inkMuted hover:text-ink hover:border-primary/50 transition-colors min-h-[64px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add board
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[82vw] max-w-[300px] sm:w-[300px] shrink-0 snap-start flex-col gap-2 rounded-xl border border-border bg-surface/60 p-3"
    >
      <input
        autoFocus
        className="input text-sm"
        placeholder="Board name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsAdding(false);
            setTitle('');
          }
        }}
      />
      <div className="flex items-center gap-2">
        <button type="submit" className="btn-primary py-1.5 px-3 text-xs" disabled={isSubmitting}>
          Add board
        </button>
        <button
          type="button"
          className="btn-ghost py-1.5 px-3 text-xs"
          onClick={() => {
            setIsAdding(false);
            setTitle('');
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
