import { useRef } from 'react';
import Avatar from '../Avatar';
import PriorityBadge from '../PriorityBadge';

function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.setHours(0, 0, 0, 0) - today) / 86400000);

  const label = new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  let tone = 'text-inkMuted';
  if (diffDays < 0) tone = 'text-danger';
  else if (diffDays === 0) tone = 'text-accent';

  return { label, tone };
}

export default function TaskCard({ task, onOpen, onDragStart, onDragEnd, onDragEnter, isDragging, isDropTarget }) {
  const due = formatDueDate(task.dueDate);
  const cardRef = useRef(null);

  // Subtle cursor-driven 3D tilt. Skipped on touch devices and disabled the
  // moment a drag starts so it never fights the native HTML5 drag image.
  function handleMouseMove(e) {
    if (isDragging || window.matchMedia('(pointer: coarse)').matches) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 5;
    const rotateX = (0.5 - py) * 5;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  }

  function handleMouseLeave() {
    const el = cardRef.current;
    if (el) el.style.transform = '';
  }

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => {
        if (cardRef.current) cardRef.current.style.transform = '';
        onDragStart(e, task);
      }}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => onDragEnter(e, task)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen(task)}
      className={`group cursor-pointer rounded-lg border bg-surfaceRaised px-3.5 py-3 transition-[border-color,box-shadow,opacity]
        will-change-transform [transform-style:preserve-3d] hover:shadow-raised hover:border-primary/40
        ${isDragging ? 'opacity-40' : 'opacity-100'}
        ${isDropTarget ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
    >
      <p className="text-sm font-medium leading-snug line-clamp-3">{task.title}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {due && (
            <span className={`text-[11px] font-medium ${due.tone}`}>{due.label}</span>
          )}
        </div>
        <Avatar user={task.assignee} size="xs" />
      </div>
    </div>
  );
}
