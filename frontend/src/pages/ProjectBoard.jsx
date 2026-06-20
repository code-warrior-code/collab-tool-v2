import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { ProjectProvider } from '../context/ProjectContext';
import BoardView from '../components/board/BoardView';

export default function ProjectBoard() {
  const { projectId } = useParams();

  return (
    <AppShell>
      <ProjectProvider projectId={projectId} key={projectId}>
        <BoardView />
      </ProjectProvider>
    </AppShell>
  );
}
