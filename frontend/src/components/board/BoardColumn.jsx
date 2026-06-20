import { useState } from 'react';
import TaskCard from './TaskCard';

export default function BoardColumn({
  board,
  dragHandlers,
  draggedTask,
  dragOverTask,
  draggedBoardId,
  onOpenTask,
  onAddTask,
  onRenameBoard,
  onDeleteBoard
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(board.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const tasks = board.Tasks || [];

  async function commitTitle() {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== board.title) {
      await onRenameBoard(board.id, trimmed);
    } else {
      setTitleDraft(board.title);
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) {
      setIsAddingTask(false);
      return;
    }
    await onAddTask(board.id, trimmed);
    setNewTaskTitle('');
  }

  return (
    <div
      className={`flex w-[82vw] max-w-[300px] sm:w-[300px] shrink-0 snap-start flex-col rounded-xl border bg-surface/60 transition-colors
        ${draggedBoardId && draggedBoardId !== board.id ? 'border-dashed border-inkFaint/40' : 'border-border'}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => dragHandlers.handleDropOnBoard(e, board)}
    >
      <div
        draggable
        onDragStart={(e) => dragHandlers.handleBoardDragStart(e, board)}
        onDragEnd={dragHandlers.handleBoardDragEnd}
        onDragEnter={(e) => dragHandlers.handleBoardDragEnter(e, board)}
        className="flex items-center justify-between gap-2 px-3.5 py-3 cursor-grab active:cursor-grabbing"
      >
        {isEditingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setTitleDraft(board.title);
                setIsEditingTitle(false);
              }
            }}
            className="bg-transparent border-b border-primary text-sm font-semibold outline-none w-full"
          />
        ) : (
          <h3
            className="text-sm font-semibold truncate"
            onDoubleClick={() => setIsEditingTitle(true)}
            title="Double-click to rename"
          >
            {board.title}
            <span className="ml-2 text-xs font-normal text-inkFaint">{tasks.length}</span>
          </h3>
        )}

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="h-6 w-6 flex items-center justify-center rounded-md text-inkMuted hover:text-ink hover:bg-surfaceRaised"
            aria-label="Board options"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-lg border border-border bg-surfaceRaised shadow-raised py-1 z-10">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsEditingTitle(true);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-bg"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (window.confirm(`Delete "${board.title}" and all of its tasks?`)) {
                    onDeleteBoard(board.id);
                  }
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-danger hover:bg-bg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-2.5 pb-2.5 space-y-2 min-h-[60px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={onOpenTask}
            onDragStart={dragHandlers.handleTaskDragStart}
            onDragEnd={dragHandlers.handleTaskDragEnd}
            onDragEnter={dragHandlers.handleTaskDragEnter}
            isDragging={draggedTask?.id === task.id}
            isDropTarget={dragOverTask?.taskId === task.id && draggedTask?.id !== task.id}
          />
        ))}
      </div>

      <div className="px-2.5 pb-3">
        {isAddingTask ? (
          <form onSubmit={handleAddTask} className="space-y-2">
            <textarea
              autoFocus
              className="input min-h-[60px] resize-none text-sm"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask(e);
                }
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button type="submit" className="btn-primary py-1.5 px-3 text-xs">Add task</button>
              <button
                type="button"
                className="btn-ghost py-1.5 px-3 text-xs"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-inkMuted hover:text-ink hover:bg-surfaceRaised transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add task
          </button>
        )}
      </div>
    </div>
  );
}
