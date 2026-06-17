import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock, ChevronLeft, MessageCircle, Share2, Star, Trash2, Edit } from 'lucide-react';
import { getProduct, toggleLike, deleteProduct, updateStatus, Product } from '../api/products';
import { createRoom } from '../api/chat';
import { useAuthStore } from '../store/authStore';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    getProduct(Number(id)).then(r => {
      setProduct(r.data); setLiked(r.data.is_liked || false); setLikeCount(r.data.like_count);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    const res = await toggleLike(Number(id));
    setLiked(res.data.liked); setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
  };

  const handleChat = async () => {
    if (!user) { navigate('/login'); return; }
    const res = await createRoom(Number(id));
    navigate(`/chat/\${res.data.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('상품을 삭제하시겠습니까?')) return;
    await deleteProduct(Number(id)); navigate('/');
  };

  const handleStatus = async (status: string) => {
    await updateStatus(Number(id), status);
    setProduct(prev => prev ? { ...prev, status } : null);
  };

  const formatPrice = (p: number) => p.toLocaleString('ko-KR');
  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return '방금 전';
    if (h < 24) return `\${h}시간 전`;
    return `\${Math.floor(h / 24)}일 전`;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"/></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">상품을 찾을 수 없습니다</div>;

  const images = product.images?.split(',').filter(Boolean) || [];
  const isOwner = user?.id === product.seller_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        <div className="relative bg-gray-100 aspect-square">
          {images.length > 0 ? (
            <>
              <img src={images[imgIdx]} alt={product.title} className="w-full h-full object-cover"/>
              {images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_,i)=>(
                    <button key={i} onClick={()=>setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all \${i===imgIdx?'bg-white scale-125':'bg-white/60'}`}/>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
          )}
          <button onClick={()=>navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <ChevronLeft size={20}/>
          </button>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <Share2 size={18} className="text-gray-600"/>
          </button>
          {product.status !== 'selling' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-lg font-bold px-6 py-2 rounded-full">
                {product.status === 'reserved' ? '예약중' : '거래완료'}
              </span>
            </div>
          )}
        </div>
        <div className="px-4 py-5">
          <Link to={`/users/\${product.seller_id}`} className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
            <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 font-bold text-lg">{(product.seller_nickname||'?')[0]}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{product.seller_nickname}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12}/>{product.seller_location||'지역 미설정'}</p>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full">
              <Star size={14} className="text-orange-500 fill-orange-500"/>
              <span className="text-sm font-semibold text-orange-600">{product.seller_manner_score?.toFixed(1)}</span>
            </div>
          </Link>
          <div className="mb-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.title}</h1>
              {isOwner && (
                <div className="flex gap-1 flex-shrink-0">
                  <Link to={`/sell?edit=\${product.id}`} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg">
                    <Edit size={16} className="text-gray-500"/>
                  </Link>
                  <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg">
                    <Trash2 size={16} className="text-red-400"/>
                  </button>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-3">{formatPrice(product.price)}<span className="text-base font-normal text-gray-500">원</span></p>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              {product.location && <span className="flex items-center gap-1"><MapPin size={13}/>{product.location}</span>}
              <span className="flex items-center gap-1"><Clock size={13}/>{formatDate(product.created_at)}</span>
              <span className="flex items-center gap-1"><Eye size={13}/>{product.view_count}</span>
            </div>
            {product.description && <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{product.description}</p>}
          </div>
          {isOwner && (
            <div className="flex gap-2 mb-5 p-4 bg-gray-50 rounded-2xl flex-wrap">
              <p className="text-sm font-medium text-gray-600 self-center">상태 변경:</p>
              {['selling','reserved','sold'].map(s=>(
                <button key={s} onClick={()=>handleStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors \${product.status===s?'bg-orange-500 text-white':'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}>
                  {s==='selling'?'판매중':s==='reserved'?'예약중':'거래완료'}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={handleLike}
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:border-red-300 transition-colors flex-shrink-0">
            <Heart size={20} className={liked?'fill-red-500 text-red-500':'text-gray-400'}/>
          </button>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}<span className="text-sm font-normal text-gray-500">원</span></p>
          </div>
          {!isOwner ? (
            <button onClick={handleChat} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <MessageCircle size={18}/><span>채팅하기</span>
            </button>
          ) : (
            <Link to="/profile" className="flex items-center gap-2 bg-gray-800 text-white font-bold px-6 py-3 rounded-xl">내 상품 관리</Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductDetailPage;
