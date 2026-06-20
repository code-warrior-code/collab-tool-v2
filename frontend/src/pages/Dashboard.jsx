import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import ProjectCard from '../components/project/ProjectCard';
import CreateProjectModal from '../components/project/CreateProjectModal';
import * as projectsApi from '../api/projects';

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0];

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError('Could not load your projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleCreate(payload) {
    const project = await projectsApi.createProject(payload);
    setProjects((prev) => [project, ...prev]);
  }

  return (
    <AppShell>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back{firstName ? `, ${firstName}` : ''}</h1>
          <p className="mt-1 text-sm text-inkMuted">Pick a project or start a new one.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New project
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-surfaceRaised/40" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 9h18M9 4v16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="mt-2 max-w-sm text-sm text-inkMuted">
            Create your first project to set up boards, add tasks, and bring in your team.
          </p>
          <button className="btn-primary mt-5" onClick={() => setShowCreateModal(true)}>
            Create a project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <div key={project.id} className="animate-fadeInUp" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
    </AppShell>
  );
}
