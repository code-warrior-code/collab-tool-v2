import api from './axios';

export async function getProjects() {
  const { data } = await api.get('/projects');
  return data.projects;
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data.project;
}

export async function createProject({ title, description, color }) {
  const { data } = await api.post('/projects', { title, description, color });
  return data.project;
}

export async function updateProject(id, payload) {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data.project;
}

export async function deleteProject(id) {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
}

export async function addProjectMember(projectId, email) {
  const { data } = await api.post(`/projects/${projectId}/members`, { email });
  return data.member;
}

export async function removeProjectMember(projectId, userId) {
  const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
  return data;
}
