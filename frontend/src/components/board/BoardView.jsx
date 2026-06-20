import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import ProjectHeader from '../project/ProjectHeader';
import BoardColumn from './BoardColumn';
import CreateBoardColumn from './CreateBoardColumn';
import TaskModal from './TaskModal';

export default function BoardView() {
  const { user } = useAuth();
  const {
    project,
    boards,
    isLoading,
    error,
    addBoard,
    renameBoard,
    removeBoard,
    moveBoard,
    addTask,
    editTask,
    removeTask,
    moveTask,
    inviteMember
  } = useProject();

  const [activeTask, setActiveTask] = useState(null);

  // ---- Task drag state ----
  const [draggedTask, setDraggedTask] = useState(null); // { id, boardId }
  const [dragOverTask, setDragOverTask] = useState(null); // { boardId, taskId }

  // ---- Board (column) drag state ----
  const [draggedBoardId, setDraggedBoardId] = useState(null);
  const [dragOverBoardId, setDragOverBoardId] = useState(null);

  function handleTaskDragStart(e, task) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTask({ id: task.id, boardId: task.boardId });
  }

  function handleTaskDragEnter(e, task) {
    if (!draggedTask) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverTask({ boardId: task.boardId, taskId: task.id });
  }

  function handleTaskDragEnd() {
    setDraggedTask(null);
    setDragOverTask(null);
  }

  function handleBoardDragStart(e, board) {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBoardId(board.id);
  }

  function handleBoardDragEnter(e, board) {
    if (!draggedBoardId || draggedBoardId === board.id) return;
    setDragOverBoardId(board.id);
  }

  function handleBoardDragEnd() {
    setDraggedBoardId(null);
    setDragOverBoardId(null);
  }

  function handleDropOnBoard(e, board) {
    e.preventDefault();

    if (draggedBoardId) {
      const targetIndex = boards.findIndex((b) => b.id === (dragOverBoardId ?? board.id));
      if (targetIndex !== -1) {
        moveBoard(draggedBoardId, targetIndex);
      }
      setDraggedBoardId(null);
      setDragOverBoardId(null);
      return;
    }

    if (draggedTask) {
      const targetTasks = board.Tasks || [];
      const targetIndex =
        dragOverTask && dragOverTask.boardId === board.id
          ? targetTasks.findIndex((t) => t.id === dragOverTask.taskId)
          : targetTasks.length;

      moveTask(draggedTask.id, draggedTask.boardId, board.id, targetIndex === -1 ? targetTasks.length : targetIndex);
      setDraggedTask(null);
      setDragOverTask(null);
    }
  }

  const dragHandlers = {
    handleTaskDragStart,
    handleTaskDragEnter,
    handleTaskDragEnd,
    handleBoardDragStart,
    handleBoardDragEnter,
    handleBoardDragEnd,
    handleDropOnBoard
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[82vw] max-w-[300px] sm:w-[300px] shrink-0 h-80 rounded-xl bg-surfaceRaised/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      <ProjectHeader project={project} onInvite={inviteMember} />

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory sm:snap-none">
        {boards.map((board) => (
          <BoardColumn
            key={board.id}
            board={board}
            dragHandlers={dragHandlers}
            draggedTask={draggedTask}
            dragOverTask={dragOverTask}
            draggedBoardId={draggedBoardId}
            onOpenTask={setActiveTask}
            onAddTask={(boardId, title) => addTask(boardId, { title })}
            onRenameBoard={renameBoard}
            onDeleteBoard={removeBoard}
          />
        ))}
        <CreateBoardColumn onCreate={addBoard} />
      </div>

      {activeTask && (
        <TaskModal
          task={activeTask}
          members={project.members || []}
          currentUser={user}
          onClose={() => setActiveTask(null)}
          onSave={editTask}
          onDelete={removeTask}
        />
      )}
    </div>
  );
}
