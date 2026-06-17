import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, MessageCircle, User, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = [
  {name:'전체',path:'/',icon:'🏠'},
  {name:'전자기기',path:'/?category=1',icon:'📱'},
  {name:'의류/잡화',path:'/?category=2',icon:'👕'},
  {name:'가구/인테리어',path:'/?category=3',icon:'🛋️'},
  {name:'도서',path:'/?category=4',icon:'📚'},
  {name:'스포츠/레저',path:'/?category=5',icon:'⚽'},
  {name:'기타',path:'/?category=6',icon:'📦'},
];

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate('/?search=' + encodeURIComponent(search)); setMenuOpen(false); }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          <Link to="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="어떤 물건을 찾고 있나요?"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 hover:bg-gray-200 focus:bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:border-indigo-300" />
            </div>
          </form>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {user ? (
              <>
                <Link to="/sell" className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                  <PlusCircle size={15} /><span>판매하기</span>
                </Link>
                <Link to="/chat" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors">
                  <MessageCircle size={21} className="text-gray-600" />
                </Link>
                <button onClick={() => navigate('/profile')} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors">
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 text-xs font-black">{user.nickname[0]}</span>
                  </div>
                </button>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="hidden sm:flex w-10 h-10 items-center justify-center hover:bg-gray-100 rounded-xl transition-colors">
                  <LogOut size={18} className="text-gray-500" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-medium hidden sm:block">로그인</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm hidden sm:block">회원가입</Link>
              </>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-0.5 pb-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={c.path}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all font-medium whitespace-nowrap">
              <span className="text-base">{c.icon}</span><span>{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {user ? (
            <>
              <Link to="/sell" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl font-medium"><PlusCircle size={18} className="text-indigo-600" /><span>판매하기</span></Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl font-medium"><MessageCircle size={18} className="text-gray-500" /><span>채팅</span></Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl font-medium"><User size={18} className="text-gray-500" /><span>마이페이지</span></Link>
              <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl w-full font-medium"><LogOut size={18} className="text-gray-500" /><span>로그아웃</span></button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 hover:bg-gray-50 rounded-xl font-medium">로그인</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 bg-indigo-600 text-white rounded-xl text-center font-bold">회원가입</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
export default Header;
