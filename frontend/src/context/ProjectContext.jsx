import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import * as projectsApi from '../api/projects';
import * as boardsApi from '../api/boards';
import * as tasksApi from '../api/tasks';
import { useSocket } from './SocketContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ projectId, children }) {
  const { socket } = useSocket();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]); // each board carries its own `Tasks` array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getProject(projectId);
      setProject(data);
      setBoards(sortBoards(data.Boards || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this project.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------- Real-time room membership ----------
  // Join the project's socket room so we receive board/task/comment/member
  // broadcasts for this project (see backend/sockets/index.js).
  useEffect(() => {
    if (!socket || !projectId) return undefined;
    socket.emit('project:join', projectId);
    return () => socket.emit('project:leave', projectId);
  }, [socket, projectId]);

  // ---------- Real-time board/task/member updates ----------
  // These mirror the broadcasts emitted by board.controller.js,
  // task.controller.js and project.controller.js. Handlers are written to be
  // idempotent (dedupe by id) since the action that originated a change is
  // also applied locally via its own API call, and will also receive its own
  // broadcast back from the server.
  useEffect(() => {
    if (!socket) return undefined;

    function handleTaskCreated(task) {
      setBoards((prev) =>
        prev.map((b) => {
          if (b.id !== task.boardId) return b;
          const exists = (b.Tasks || []).some((t) => t.id === task.id);
          return exists ? b : { ...b, Tasks: sortTasks([...(b.Tasks || []), task]) };
        })
      );
    }

    function handleTaskUpdated(task) {
      setBoards((prev) =>
        prev.map((b) => {
          const remaining = (b.Tasks || []).filter((t) => t.id !== task.id);
          if (b.id === task.boardId) {
            return { ...b, Tasks: sortTasks([...remaining, task]) };
          }
          return { ...b, Tasks: remaining };
        })
      );
    }

    function handleTaskDeleted({ id }) {
      setBoards((prev) =>
        prev.map((b) => ({ ...b, Tasks: (b.Tasks || []).filter((t) => t.id !== id) }))
      );
    }

    function handleBoardCreated(board) {
      setBoards((prev) =>
        prev.some((b) => b.id === board.id) ? prev : sortBoards([...prev, { ...board, Tasks: [] }])
      );
    }

    function handleBoardUpdated(board) {
      setBoards((prev) => prev.map((b) => (b.id === board.id ? { ...b, title: board.title } : b)));
    }

    function handleBoardDeleted({ id }) {
      setBoards((prev) => prev.filter((b) => b.id !== id));
    }

    function handleBoardReordered(orderList) {
      setBoards((prev) => {
        const orderMap = new Map(orderList.map((b) => [b.id, b.order]));
        const next = prev.map((b) => (orderMap.has(b.id) ? { ...b, order: orderMap.get(b.id) } : b));
        return sortBoards(next);
      });
    }

    function handleMemberAdded(member) {
      setProject((prev) => {
        if (!prev) return prev;
        const exists = (prev.members || []).some((m) => m.id === member.id);
        return exists ? prev : { ...prev, members: [...(prev.members || []), member] };
      });
    }

    function handleMemberRemoved({ userId }) {
      setProject((prev) =>
        prev ? { ...prev, members: (prev.members || []).filter((m) => m.id !== userId) } : prev
      );
    }

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('board:created', handleBoardCreated);
    socket.on('board:updated', handleBoardUpdated);
    socket.on('board:deleted', handleBoardDeleted);
    socket.on('board:reordered', handleBoardReordered);
    socket.on('project:member_added', handleMemberAdded);
    socket.on('project:member_removed', handleMemberRemoved);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('board:created', handleBoardCreated);
      socket.off('board:updated', handleBoardUpdated);
      socket.off('board:deleted', handleBoardDeleted);
      socket.off('board:reordered', handleBoardReordered);
      socket.off('project:member_added', handleMemberAdded);
      socket.off('project:member_removed', handleMemberRemoved);
    };
  }, [socket]);

  // ---------- Boards ----------

  const addBoard = useCallback(
    async (title) => {
      const board = await boardsApi.createBoard(projectId, title);
      setBoards((prev) => sortBoards([...prev, { ...board, Tasks: [] }]));
      return board;
    },
    [projectId]
  );

  const renameBoard = useCallback(async (boardId, title) => {
    const updated = await boardsApi.updateBoard(boardId, { title });
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, title: updated.title } : b)));
  }, []);

  const removeBoard = useCallback(async (boardId) => {
    await boardsApi.deleteBoard(boardId);
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  }, []);

  // Reorders the board columns themselves (drag a column header to a new slot).
  const moveBoard = useCallback(async (draggedBoardId, targetIndex) => {
    setBoards((prev) => {
      const current = sortBoards(prev);
      const fromIndex = current.findIndex((b) => b.id === draggedBoardId);
      if (fromIndex === -1) return prev;

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      const clampedIndex = Math.max(0, Math.min(targetIndex, next.length));
      next.splice(clampedIndex, 0, moved);

      const reindexed = next.map((b, idx) => ({ ...b, order: idx }));

      boardsApi
        .reorderBoards(reindexed.map((b) => ({ id: b.id, order: b.order })))
        .catch(() => setError('Could not save the new board order.'));

      return reindexed;
    });
  }, []);

  // ---------- Tasks ----------

  const addTask = useCallback(async (boardId, payload) => {
    const task = await tasksApi.createTask(boardId, payload);
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, Tasks: [...(b.Tasks || []), task] } : b))
    );
    return task;
  }, []);

  const editTask = useCallback(async (taskId, payload) => {
    const updated = await tasksApi.updateTask(taskId, payload);
    setBoards((prev) =>
      prev.map((b) => ({
        ...b,
        Tasks: (b.Tasks || []).map((t) => (t.id === taskId ? updated : t))
      }))
    );
    return updated;
  }, []);

  const removeTask = useCallback(async (taskId, boardId) => {
    await tasksApi.deleteTask(taskId);
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, Tasks: (b.Tasks || []).filter((t) => t.id !== taskId) } : b))
    );
  }, []);

  // Moves a task to `targetBoardId` at `targetIndex`, updating order locally for a
  // smooth drag experience, then persisting the moved task and any task whose
  // order actually shifted as a result.
  const moveTask = useCallback(async (taskId, sourceBoardId, targetBoardId, targetIndex) => {
    let persistJobs = [];

    setBoards((prev) => {
      const next = prev.map((b) => ({ ...b, Tasks: [...(b.Tasks || [])] }));
      const sourceBoard = next.find((b) => b.id === sourceBoardId);
      const targetBoard = next.find((b) => b.id === targetBoardId);
      if (!sourceBoard || !targetBoard) return prev;

      const fromIndex = sourceBoard.Tasks.findIndex((t) => t.id === taskId);
      if (fromIndex === -1) return prev;

      const [movedTask] = sourceBoard.Tasks.splice(fromIndex, 1);
      const clampedIndex = Math.max(0, Math.min(targetIndex, targetBoard.Tasks.length));
      const updatedTask = { ...movedTask, boardId: targetBoardId };
      targetBoard.Tasks.splice(clampedIndex, 0, updatedTask);

      sourceBoard.Tasks = sourceBoard.Tasks.map((t, idx) => ({ ...t, order: idx }));
      targetBoard.Tasks = targetBoard.Tasks.map((t, idx) => ({ ...t, order: idx }));

      const jobs = [];
      jobs.push(
        tasksApi.updateTask(taskId, { boardId: targetBoardId, order: clampedIndex })
      );
      const boardsToSync = sourceBoardId === targetBoardId ? [targetBoard] : [sourceBoard, targetBoard];
      boardsToSync.forEach((b) => {
        b.Tasks.forEach((t) => {
          if (t.id !== taskId) {
            jobs.push(tasksApi.updateTask(t.id, { order: t.order }));
          }
        });
      });
      persistJobs = jobs;

      return next;
    });

    if (persistJobs.length) {
      Promise.all(persistJobs).catch(() => setError('Could not save the task order.'));
    }
  }, []);

  // ---------- Members ----------

  const inviteMember = useCallback(
    async (email) => {
      const member = await projectsApi.addProjectMember(projectId, email);
      setProject((prev) => (prev ? { ...prev, members: [...(prev.members || []), member] } : prev));
      return member;
    },
    [projectId]
  );

  const removeMember = useCallback(
    async (userId) => {
      await projectsApi.removeProjectMember(projectId, userId);
      setProject((prev) =>
        prev ? { ...prev, members: (prev.members || []).filter((m) => m.id !== userId) } : prev
      );
    },
    [projectId]
  );

  const value = {
    project,
    boards,
    isLoading,
    error,
    reload: load,
    addBoard,
    renameBoard,
    removeBoard,
    moveBoard,
    addTask,
    editTask,
    removeTask,
    moveTask,
    inviteMember,
    removeMember
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

function sortBoards(list) {
  return [...list].sort((a, b) => a.order - b.order);
}

function sortTasks(list) {
  return [...list].sort((a, b) => a.order - b.order);
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
