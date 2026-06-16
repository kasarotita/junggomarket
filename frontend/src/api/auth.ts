import client from './client';

export interface LoginData { username: string; password: string; }
export interface RegisterData {
  email: string; password: string;
  nickname: string; location?: string;
}

// FastAPI OAuth2 형식은 form-data로 보내야 함
export const login = (data: LoginData) => {
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);
  return client.post('/auth/login', formData.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const register = (data: RegisterData) =>
  client.post('/auth/register', data);

export const getMe = () => client.get('/users/me');
