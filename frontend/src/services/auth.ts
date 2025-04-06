import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);

  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }

  return response.data;
};

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', credentials);

  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }

  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};
