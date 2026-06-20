import api from './axios';

export async function createBoard(projectId, title) {
  const { data } = await api.post(`/projects/${projectId}/boards`, { title });
  return data.board;
}

export async function updateBoard(id, payload) {
  const { data } = await api.put(`/boards/${id}`, payload);
  return data.board;
}

export async function deleteBoard(id) {
  const { data } = await api.delete(`/boards/${id}`);
  return data;
}

export async function reorderBoards(boards) {
  // boards: [{ id, order }]
  const { data } = await api.put('/boards/reorder', { boards });
  return data;
}
