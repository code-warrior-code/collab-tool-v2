import api from './axios';

export async function getComments(taskId) {
  const { data } = await api.get(`/tasks/${taskId}/comments`);
  return data.comments;
}

export async function createComment(taskId, content) {
  const { data } = await api.post(`/tasks/${taskId}/comments`, { content });
  return data.comment;
}

export async function deleteComment(id) {
  const { data } = await api.delete(`/comments/${id}`);
  return data;
}
