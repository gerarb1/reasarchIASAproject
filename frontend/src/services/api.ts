export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'DATA_CLEANER';
  createdAt: string;
}

const API_BASE = '/api/v1';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || 'Ocurrió un error en la solicitud';
    const errorDetails = data.details ? JSON.stringify(data.details, null, 2) : '';
    throw new Error(`${errorMsg} ${errorDetails ? `\nDetalles: ${errorDetails}` : ''}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(userData: any): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Users (ADMIN only)
  async listUsers(role?: string): Promise<UserProfile[]> {
    const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Projects
  async listProjects(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getProjectDetails(projectId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createProject(title: string, description: string, studentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, studentId })
    });
    return handleResponse(res);
  },

  // Papers
  async addPaper(projectId: string, paperData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/papers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paperData)
    });
    return handleResponse(res);
  },

  async reviewPaper(paperId: string, reviewData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/papers/${paperId}/review`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(reviewData)
    });
    return handleResponse(res);
  }
};
