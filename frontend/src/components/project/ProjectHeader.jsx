import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../Avatar';
import InviteMemberModal from './InviteMemberModal';

export default function ProjectHeader({ project, onInvite }) {
  const [showInvite, setShowInvite] = useState(false);
  const members = project.members || [];

  return (
    <div className="mb-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-inkMuted hover:text-ink mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All projects
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-3">
          <div
            className="h-11 w-11 rounded-lg flex items-center justify-center font-display font-bold text-white shrink-0"
            style={{ backgroundColor: project.color || '#6c63ff' }}
          >
            {project.title?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{project.title}</h1>
            {project.description && (
              <p className="mt-0.5 text-sm text-inkMuted max-w-xl">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {members.map((m) => (
              <Avatar key={m.id} user={m} size="md" ring />
            ))}
          </div>
          <button className="btn-secondary" onClick={() => setShowInvite(true)}>
            Invite
          </button>
        </div>
      </div>

      {showInvite && (
        <InviteMemberModal
          onClose={() => setShowInvite(false)}
          onInvite={onInvite}
        />
      )}
    </div>
  );
}
