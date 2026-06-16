import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories, Product } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import { TrendingUp, Zap, Shield } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  '전자기기': '📱', '의류/잡화': '👕', '가구/인테리어': '🛋️',
  '도서': '📚', '스포츠/레저': '⚽', '기타': '📦',
};

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || undefined;

  useEffect(() => { getCategories().then((r) => setCategories(r.data)); }, []);
  useEffect(() => {
    setLoading(true);
    getProducts({ category_id: selectedCategory || undefined, search })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 배너 */}
      {!search && (
        <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
            <div className="max-w-2xl">
              <p className="text-orange-100 text-sm font-medium mb-2 tracking-wide uppercase">
                Korea's Best Secondhand Market
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                믿을 수 있는<br />중고 거래의 시작
              </h1>
              <p className="text-orange-100 mb-6 text-sm sm:text-base">
                안전하고 투명한 거래로 당신의 물건에 새 생명을
              </p>
              <div className="flex gap-3">
                <Link to="/sell" className="bg-white text-orange-500 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors duration-200 text-sm shadow-md">
                  지금 판매하기
                </Link>
                <button className="bg-orange-600/40 backdrop-blur text-white font-medium px-6 py-2.5 rounded-xl hover:bg-orange-600/60 transition-colors duration-200 text-sm border border-white/20">
                  인기 상품 보기
                </button>
              </div>
            </div>
          </div>

          {/* 신뢰 지표 */}
          <div className="border-t border-orange-400/30">
            <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto scrollbar-hide">
              {[
                { icon: Shield, text: '안전한 거래 보장' },
                { icon: Zap, text: '빠른 응답 판매자' },
                { icon: TrendingUp, text: '오늘 1,234개 거래 완료' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 flex-shrink-0 text-orange-100 text-xs">
                  <Icon size={14} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              !selectedCategory
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
            }`}>
            전체
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
              }`}>
              <span>{CATEGORY_ICONS[cat.name] || '📦'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 검색 결과 헤더 */}
        {search && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              <span className="font-bold text-gray-900">"{search}"</span> 검색 결과
              <span className="ml-2 text-orange-500 font-semibold">{products.length}개</span>
            </p>
          </div>
        )}

        {/* 섹션 타이틀 */}
        {!search && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" />
              최신 상품
            </h2>
            <span className="text-sm text-gray-400">{products.length}개</span>
          </div>
        )}

        {/* 상품 그리드 */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500 font-medium">상품이 없습니다</p>
            <p className="text-gray-400 text-sm mt-1">다른 카테고리를 선택하거나 검색어를 바꿔보세요</p>
            <Link to="/sell" className="btn-primary inline-flex mt-6 text-sm">
              첫 상품 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
