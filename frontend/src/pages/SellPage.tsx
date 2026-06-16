import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories } from '../api/products';
import { useAuthStore } from '../store/authStore';
import { Tag, Type, DollarSign, FileText, MapPin, ChevronRight } from 'lucide-react';

const SellPage: React.FC = () => {
  const [form, setForm] = useState({ title: '', description: '', price: '', category_id: '', location: '' });
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    getCategories().then((r) => setCategories(r.data));
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await createProduct({
        ...form, price: parseInt(form.price), category_id: parseInt(form.category_id),
      });
      navigate(`/products/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || '등록에 실패했습니다');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">중고 물건 팔기</h1>
          <p className="text-gray-500 text-sm mt-1">정확한 정보를 입력할수록 빠르게 판매돼요</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl mb-5">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 카테고리 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Tag size={15} className="text-orange-500" />카테고리
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button type="button" key={cat.id}
                    onClick={() => setForm({ ...form, category_id: String(cat.id) })}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                      form.category_id === String(cat.id)
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-orange-300'
                    }`}>
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Type size={15} className="text-orange-500" />제목
              </label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input" placeholder="상품명을 입력하세요" required />
            </div>

            {/* 가격 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign size={15} className="text-orange-500" />가격
              </label>
              <div className="relative">
                <input type="number" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input pr-10" placeholder="0" required />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
              </div>
              {form.price && (
                <p className="text-orange-500 text-sm mt-1 font-medium">
                  {parseInt(form.price).toLocaleString()}원
                </p>
              )}
            </div>

            {/* 설명 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText size={15} className="text-orange-500" />상품 설명
              </label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input h-36 resize-none leading-relaxed"
                placeholder="상품 상태, 구매 시기, 사용감 등을 자세히 적어주세요" />
            </div>

            {/* 지역 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={15} className="text-orange-500" />거래 지역
              </label>
              <input type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input" placeholder="서울 강남구" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 mt-2">
              {loading ? <span className="animate-pulse">등록 중...</span>
                : <><span>등록하기</span><ChevronRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellPage;
