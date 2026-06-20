const STYLES = {
  low: 'bg-success/15 text-success',
  medium: 'bg-warning/15 text-warning',
  high: 'bg-danger/15 text-danger'
};

const LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export default function PriorityBadge({ priority = 'medium', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STYLES[priority] || STYLES.medium} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[priority] || 'Medium'}
    </span>
  );
}
