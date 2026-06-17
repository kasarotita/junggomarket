import client from './client';
export const login = (data: { username: string; password: string }) => {
  const fd = new URLSearchParams();
  fd.append('username', data.username); fd.append('password', data.password);
  return client.post('/auth/login', fd.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
};
export const register = (data: any) => client.post('/auth/register', data);
export const getMe = () => client.get('/users/me');
export const updateMe = (data: any) => client.put('/users/me', null, { params: data });
export const getUser = (id: number) => client.get(`/users/${id}`);
