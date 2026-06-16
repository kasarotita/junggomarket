import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Search, User, PlusCircle, LogOut, ShoppingBag, Bell, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">중고마켓</span>
          </Link>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="어떤 물건을 찾고 있나요?"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 hover:bg-gray-200 focus:bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200"
              />
            </div>
          </form>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <Link to="/sell"
                  className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
                  <PlusCircle size={15} />
                  <span className="hidden sm:block">판매하기</span>
                </Link>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl relative">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-xl cursor-pointer"
                  onClick={() => { logout(); navigate('/'); }}>
                  <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-xs font-bold">{user.nickname[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.nickname}</span>
                  <LogOut size={15} className="text-gray-400" />
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">로그인</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">회원가입</Link>
              </>
            )}
          </div>
        </div>

        {/* 카테고리 바 */}
        <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {['전체', '전자기기', '의류/잡화', '가구/인테리어', '도서', '스포츠/레저', '기타'].map((cat) => (
            <Link key={cat} to={cat === '전체' ? '/' : `/?category=${cat}`}
              className="flex-shrink-0 px-4 py-1.5 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-200 font-medium">
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
