import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, MessageCircle, Heart, User, LogOut, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-3">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">중고마켓</span>
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="어떤 물건을 찾고 있나요?"
                className="w-full pl-9 pr-4 py-2 bg-gray-100 hover:bg-gray-200 focus:bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
            </div>
          </form>
          <div className="flex items-center gap-1 flex-shrink-0">
            {user ? (
              <>
                <Link to="/sell" className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <PlusCircle size={15} /><span>판매하기</span>
                </Link>
                <Link to="/chat" className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl">
                  <MessageCircle size={20} className="text-gray-600" />
                </Link>
                <Link to="/profile" className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl">
                  <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-xs font-bold">{user.nickname[0]}</span>
                  </div>
                </Link>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="hidden sm:flex w-9 h-9 items-center justify-center hover:bg-gray-100 rounded-xl">
                  <LogOut size={18} className="text-gray-500" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors hidden sm:block">로그인</Link>
                <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors hidden sm:block">회원가입</Link>
              </>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <div className="flex gap-1 pb-2 overflow-x-auto text-sm">
          {[{name:'전체',path:'/'},{name:'전자기기',path:'/?category=1'},{name:'의류/잡화',path:'/?category=2'},
            {name:'가구/인테리어',path:'/?category=3'},{name:'도서',path:'/?category=4'},
            {name:'스포츠/레저',path:'/?category=5'},{name:'기타',path:'/?category=6'}].map((c) => (
            <Link key={c.name} to={c.path}
              className="flex-shrink-0 px-3 py-1 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all font-medium whitespace-nowrap">
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {user ? (
            <>
              <Link to="/sell" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl"><PlusCircle size={18} className="text-orange-500" /><span>판매하기</span></Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl"><MessageCircle size={18} className="text-gray-500" /><span>채팅</span></Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl"><User size={18} className="text-gray-500" /><span>마이페이지</span></Link>
              <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl w-full"><LogOut size={18} className="text-gray-500" /><span>로그아웃</span></button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 hover:bg-gray-50 rounded-xl">로그인</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 bg-orange-500 text-white rounded-xl text-center font-semibold">회원가입</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
export default Header;
