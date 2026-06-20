function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const SIZES = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-6 w-6 text-[11px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm'
};

export default function Avatar({ user, size = 'sm', className = '', ring = false }) {
  if (!user) {
    return (
      <div
        className={`${SIZES[size]} rounded-full border border-dashed border-inkFaint flex items-center justify-center text-inkFaint ${className}`}
        title="Unassigned"
      >
        <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${
        ring ? 'ring-2 ring-surface' : ''
      } ${className}`}
      style={{ backgroundColor: user.avatarColor || '#6c63ff' }}
      title={user.name}
    >
      {initials(user.name) || '?'}
    </div>
  );
}
