import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.56.10/api';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청마다 localStorage에서 토큰 꺼내서 헤더에 붙임
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 응답이면 토큰 삭제하고 로그인 페이지로
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
