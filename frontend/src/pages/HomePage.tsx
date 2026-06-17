import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories, Product } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import { TrendingUp, Shield, Zap, Flame } from 'lucide-react';

const ICONS: Record<string, string> = { '전자기기':'📱','의류/잡화':'👕','가구/인테리어':'🛋️','도서':'📚','스포츠/레저':'⚽','기타':'📦' };

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || undefined;
  const categoryParam = searchParams.get('category');

  useEffect(() => { getCategories().then((r) => setCategories(r.data)); }, []);
  useEffect(() => { if (categoryParam) setSelectedCategory(Number(categoryParam)); }, [categoryParam]);
  useEffect(() => {
    setLoading(true);
    getProducts({ category_id: selectedCategory || undefined, search, limit: 40 })
      .then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!search && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <p className="text-orange-100 text-xs font-semibold tracking-widest uppercase mb-2">Korea's Best Secondhand Market</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">믿을 수 있는<br/>중고 거래의 시작</h1>
            <p className="text-orange-100 mb-6 text-sm">안전하고 투명한 거래로 당신의 물건에 새 생명을</p>
            <Link to="/sell" className="inline-block bg-white text-orange-500 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-sm shadow-md">지금 판매하기</Link>
          </div>
          <div className="border-t border-orange-400/30">
            <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
              {[{icon:Shield,text:'안전한 거래 보장'},{icon:Zap,text:'빠른 응답 판매자'},{icon:Flame,text:'오늘 1,234개 거래'}].map(({icon:Icon,text})=>(
                <div key={text} className="flex items-center gap-2 flex-shrink-0 text-orange-100 text-xs"><Icon size={13}/><span>{text}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          <button onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all \${!selectedCategory ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}>
            전체
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all \${selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}>
              <span>{ICONS[cat.name]||'📦'}</span><span>{cat.name}</span>
            </button>
          ))}
        </div>
        {search && (
          <p className="mb-4 text-sm text-gray-600">
            <span className="font-bold text-gray-900">"{search}"</span> 검색 결과
            <span className="ml-2 text-orange-500 font-semibold">{products.length}개</span>
          </p>
        )}
        {!search && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={20} className="text-orange-500"/>최신 상품</h2>
            <span className="text-sm text-gray-400">{products.length}개</span>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({length:10}).map((_,i)=>(
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-2"/>
                <div className="h-4 bg-gray-200 rounded mb-1"/><div className="h-4 bg-gray-200 rounded w-2/3"/>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 font-medium mb-1">상품이 없습니다</p>
            <p className="text-gray-400 text-sm mb-6">다른 카테고리를 선택하거나 검색어를 바꿔보세요</p>
            <Link to="/sell" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">첫 상품 등록하기</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((p) => <ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;
