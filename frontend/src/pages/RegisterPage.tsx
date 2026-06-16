import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, User, MapPin, ArrowRight } from 'lucide-react';
import { register } from '../api/auth';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '', nickname: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || '회원가입에 실패했습니다');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'email', type: 'email', placeholder: '이메일', icon: Mail, required: true },
    { key: 'password', type: 'password', placeholder: '비밀번호 (6자 이상)', icon: Lock, required: true },
    { key: 'nickname', type: 'text', placeholder: '닉네임', icon: User, required: true },
    { key: 'location', type: 'text', placeholder: '거래 지역 (선택)', icon: MapPin, required: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200 mb-4">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">중고마켓</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">회원가입</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl mb-5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, type, placeholder, icon: Icon, required }) => (
              <div key={key} className="relative">
                <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={type} placeholder={placeholder} required={required}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="input pl-11" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
              {loading ? <span className="animate-pulse">가입 중...</span>
                : <><span>회원가입</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
