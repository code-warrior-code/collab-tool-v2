import { Link } from 'react-router-dom';
import Avatar from '../Avatar';
import Tilt from '../Tilt';

export default function ProjectCard({ project }) {
  const boardCount = project.Boards?.length ?? 0;
  const taskCount = project.Boards?.reduce((sum, b) => sum + (b.Tasks?.length || 0), 0) ?? 0;
  const members = project.members || [];

  return (
    <Tilt className="h-full rounded-xl" max={6} scale={1.02}>
    <Link
      to={`/projects/${project.id}`}
      className="card group flex h-full flex-col p-5 hover:border-primary/50 hover:shadow-raised transition-[border-color,box-shadow]"
    >
      <div className="flex items-start justify-between">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-display font-bold text-white"
          style={{ backgroundColor: project.color || '#6c63ff' }}
        >
          {project.title?.[0]?.toUpperCase() || 'P'}
        </div>
      </div>

      <h3 className="mt-4 font-display text-base font-semibold group-hover:text-primary-bright transition-colors line-clamp-1">
        {project.title}
      </h3>
      <p className="mt-1 text-sm text-inkMuted line-clamp-2 min-h-[2.5rem]">
        {project.description || 'No description yet.'}
      </p>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m) => (
            <Avatar key={m.id} user={m} size="sm" ring />
          ))}
          {members.length > 4 && (
            <div className="h-6 w-6 rounded-full bg-surfaceRaised border-2 border-surface flex items-center justify-center text-[10px] font-semibold text-inkMuted">
              +{members.length - 4}
            </div>
          )}
        </div>
        <div className="text-xs text-inkFaint">
          {boardCount} board{boardCount === 1 ? '' : 's'} &middot; {taskCount} task{taskCount === 1 ? '' : 's'}
        </div>
      </div>
    </Link>
    </Tilt>
  );
}
