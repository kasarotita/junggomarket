import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createProduct, getCategories, getProduct, updateProduct, uploadImage } from '../api/products';
import { useAuthStore } from '../store/authStore';
import { Camera, X, ChevronLeft } from 'lucide-react';

const SellPage: React.FC = () => {
  const [form, setForm] = useState({ title:'', description:'', price:'', category_id:'', location:'' });
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) navigate('/login');
    getCategories().then(r => setCategories(r.data));
    if (editId) {
      getProduct(Number(editId)).then(r => {
        const p = r.data;
        setForm({ title:p.title, description:p.description||'', price:String(p.price), category_id:String(p.category_id), location:p.location||'' });
      });
    }
  }, [user, navigate, editId]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files||[]).slice(0, 10-images.length);
    setImages(prev=>[...prev,...files]);
    files.forEach(f=>{ const r=new FileReader(); r.onload=e=>setPreviews(prev=>[...prev,e.target?.result as string]); r.readAsDataURL(f); });
  };

  const removeImage = (i: number) => {
    setImages(prev=>prev.filter((_,idx)=>idx!==i));
    setPreviews(prev=>prev.filter((_,idx)=>idx!==i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = { ...form, price:parseInt(form.price), category_id:parseInt(form.category_id) };
      let product;
      if (editId) { const r=await updateProduct(Number(editId),data); product=r.data; }
      else { const r=await createProduct(data); product=r.data; }
      for (const img of images) { await uploadImage(product.id, img); }
      navigate(`/products/\${product.id}`);
    } catch (err:any) { setError(err.response?.data?.detail||'등록에 실패했습니다'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-14 z-40">
          <button onClick={()=>navigate(-1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl"><ChevronLeft size={20}/></button>
          <h1 className="text-lg font-bold">{editId?'상품 수정':'중고 물건 팔기'}</h1>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl">⚠️ {error}</div>}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">사진 ({previews.length}/10)</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button type="button" onClick={()=>fileRef.current?.click()}
                className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all">
                <Camera size={24} className="text-gray-400 mb-1"/>
                <span className="text-xs text-gray-400">사진 추가</span>
              </button>
              {previews.map((p,i)=>(
                <div key={i} className="flex-shrink-0 relative w-24 h-24">
                  <img src={p} alt="" className="w-full h-full object-cover rounded-xl"/>
                  <button type="button" onClick={()=>removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center"><X size={10}/></button>
                  {i===0 && <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-md">대표</span>}
                </div>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리 <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat=>(
                <button type="button" key={cat.id} onClick={()=>setForm({...form,category_id:String(cat.id)})}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 \${form.category_id===String(cat.id)?'border-orange-500 bg-orange-50 text-orange-600':'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                  <span className="text-xl">{cat.icon}</span><span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">제목 <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all"
              placeholder="상품명을 입력하세요" required/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">가격 <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all pr-10"
                placeholder="0" required/>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
            {form.price && <p className="mt-1 text-orange-500 text-sm font-medium">{parseInt(form.price||'0').toLocaleString()}원</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all h-36 resize-none"
              placeholder="상품 상태, 구매 시기, 사용감 등 자세히 입력해주세요"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">거래 지역</label>
            <input type="text" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all"
              placeholder="서울 강남구"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors text-base">
            {loading?'등록 중...':(editId?'수정 완료':'등록하기')}
          </button>
        </form>
      </div>
    </div>
  );
};
export default SellPage;
