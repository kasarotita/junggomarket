import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Logo from '../components/common/Logo';
import { login, getMe } from '../api/auth';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await login({ username: email, password });
      setToken(res.data.access_token);
      const u = await getMe(); setUser(u.data);
      navigate('/');
    } catch (err: any) { setError(err.response?.data?.detail || '로그인에 실패했습니다'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-400 text-sm mt-2">믿을 수 있는 중고 거래 플랫폼</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-6">로그인</h2>
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl mb-5">⚠️ {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative"><Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all"
                placeholder="이메일" required/></div>
            <div className="relative"><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all"
                placeholder="비밀번호" required/></div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <span className="animate-pulse">로그인 중...</span> : <><span>로그인</span><ArrowRight size={18}/></>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">계정이 없으신가요? <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600">회원가입</Link></p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
