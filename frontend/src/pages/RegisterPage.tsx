import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, MapPin, ArrowRight } from 'lucide-react';
import Logo from '../components/common/Logo';
import { register } from '../api/auth';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '', nickname: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); navigate('/login'); }
    catch (err: any) { setError(err.response?.data?.detail || '회원가입에 실패했습니다'); }
    finally { setLoading(false); }
  };

  const fields = [
    { key:'email', type:'email', placeholder:'이메일', icon:Mail, required:true },
    { key:'password', type:'password', placeholder:'비밀번호 (6자 이상)', icon:Lock, required:true },
    { key:'nickname', type:'text', placeholder:'닉네임', icon:User, required:true },
    { key:'location', type:'text', placeholder:'거래 지역 (선택)', icon:MapPin, required:false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-6">회원가입</h2>
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl mb-5">⚠️ {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({key,type,placeholder,icon:Icon,required})=>(
              <div key={key} className="relative"><Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type={type} placeholder={placeholder} required={required}
                  value={form[key as keyof typeof form]}
                  onChange={e=>setForm({...form,[key]:e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all"/></div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <span className="animate-pulse">가입 중...</span> : <><span>회원가입</span><ArrowRight size={18}/></>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">이미 계정이 있으신가요? <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">로그인</Link></p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
