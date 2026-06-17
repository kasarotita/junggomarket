import { create } from 'zustand';
interface User { id: number; email: string; nickname: string; location?: string; manner_score: number; profile_image?: string; }
interface AuthStore { user: User | null; token: string | null; setUser: (u: User | null) => void; setToken: (t: string | null) => void; logout: () => void; }
export const useAuthStore = create<AuthStore>((set) => ({
  user: null, token: localStorage.getItem('token'),
  setUser: (user) => set({ user }),
  setToken: (token) => { token ? localStorage.setItem('token', token) : localStorage.removeItem('token'); set({ token }); },
  logout: () => { localStorage.removeItem('token'); set({ user: null, token: null }); },
}));
