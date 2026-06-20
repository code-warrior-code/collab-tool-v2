import api from './axios';

export async function createTask(boardId, payload) {
  const { data } = await api.post(`/boards/${boardId}/tasks`, payload);
  return data.task;
}

export async function getTask(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data.task;
}

export async function updateTask(id, payload) {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data.task;
}

export async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
}
