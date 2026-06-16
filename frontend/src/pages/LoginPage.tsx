import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, ArrowRight } from 'lucide-react';
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
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login({ username: email, password });
      setToken(res.data.access_token);
      const userRes = await getMe();
      setUser(userRes.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '이메일 또는 비밀번호를 확인해주세요');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200 mb-4">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">중고마켓</h1>
          <p className="text-gray-500 text-sm mt-1">믿을 수 있는 중고 거래</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">로그인</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl mb-5 flex items-center gap-2">
              <span className="text-red-400">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input pl-11" placeholder="이메일" required />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input pl-11" placeholder="비밀번호" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
              {loading ? (
                <span className="animate-pulse">로그인 중...</span>
              ) : (
                <><span>로그인</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              아직 계정이 없으신가요?{' '}
              <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
