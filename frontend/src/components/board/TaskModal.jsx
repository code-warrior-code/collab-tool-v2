import { useState } from 'react';
import Modal from '../Modal';
import Avatar from '../Avatar';
import TaskComments from './TaskComments';

function toDateInputValue(dueDate) {
  if (!dueDate) return '';
  return new Date(dueDate).toISOString().slice(0, 10);
}

export default function TaskModal({ task, members, currentUser, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        assigneeId: assigneeId === '' ? null : Number(assigneeId)
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this task.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id, task.boardId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this task.');
      setIsDeleting(false);
    }
  }

  const selectedAssignee = members.find((m) => m.id === Number(assigneeId));

  return (
    <Modal title="Task details" onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="task-title" className="label">Title</label>
          <input
            id="task-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="task-description" className="label">Description</label>
          <textarea
            id="task-description"
            className="input min-h-[100px] resize-none"
            placeholder="Add more detail for whoever picks this up..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-priority" className="label">Priority</label>
            <select
              id="task-priority"
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-due" className="label">Due date</label>
            <input
              id="task-due"
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-assignee" className="label">Assignee</label>
          <div className="flex items-center gap-2">
            <Avatar user={selectedAssignee} size="sm" />
            <select
              id="task-assignee"
              className="input"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {currentUser && m.id === currentUser.id ? ' (you)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete task'}
          </button>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>

      <TaskComments taskId={task.id} currentUser={currentUser} />
    </Modal>
  );
}
