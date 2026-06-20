import { useEffect, useRef, useState } from 'react';
import Avatar from '../Avatar';
import { useSocket } from '../../context/SocketContext';
import { timeAgo } from '../../utils/time';
import * as commentsApi from '../../api/comments';

export default function TaskComments({ taskId, currentUser }) {
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    commentsApi
      .getComments(taskId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load comments.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  // Live updates from other members viewing the same project
  // (see backend/controllers/comment.controller.js broadcastToProject calls).
  useEffect(() => {
    if (!socket) return undefined;

    function handleCreated({ taskId: incomingTaskId, comment }) {
      if (incomingTaskId !== taskId) return;
      setComments((prev) => (prev.some((c) => c.id === comment.id) ? prev : [...prev, comment]));
    }

    function handleDeleted({ taskId: incomingTaskId, id }) {
      if (incomingTaskId !== taskId) return;
      setComments((prev) => prev.filter((c) => c.id !== id));
    }

    socket.on('comment:created', handleCreated);
    socket.on('comment:deleted', handleDeleted);
    return () => {
      socket.off('comment:created', handleCreated);
      socket.off('comment:deleted', handleDeleted);
    };
  }, [socket, taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [comments.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    try {
      const comment = await commentsApi.createComment(taskId, content);
      setComments((prev) => (prev.some((c) => c.id === comment.id) ? prev : [...prev, comment]));
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post your comment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    const previous = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await commentsApi.deleteComment(commentId);
    } catch (err) {
      setComments(previous);
      setError('Could not delete that comment.');
    }
  }

  return (
    <div className="border-t border-border pt-4 mt-1">
      <h3 className="label mb-3">
        Comments{comments.length > 0 ? ` (${comments.length})` : ''}
      </h3>

      {isLoading ? (
        <div className="space-y-2 mb-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-surfaceRaised/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto space-y-3 pr-1 mb-3">
          {comments.length === 0 && (
            <p className="text-sm text-inkFaint">No comments yet. Start the discussion.</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5 group">
              <Avatar user={comment.author} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium truncate">
                    {comment.author?.name}
                    {currentUser && comment.author?.id === currentUser.id ? ' (you)' : ''}
                  </span>
                  <span className="text-xs text-inkFaint shrink-0">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-inkMuted whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
              {currentUser && comment.userId === currentUser.id && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-inkFaint hover:text-danger transition-opacity shrink-0"
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {error && <p className="field-error mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <Avatar user={currentUser} size="sm" />
        <textarea
          className="input min-h-[40px] max-h-28 resize-none flex-1"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" className="btn-primary shrink-0" disabled={isSubmitting || !text.trim()}>
          {isSubmitting ? '...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
