import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock } from 'lucide-react';
import { Product, toggleLike } from '../../api/products';
import { useAuthStore } from '../../store/authStore';

const EMOJIS = ['📱','👕','🛋️','📚','⚽','📦','💻','🎮','👜','🚲','🎸','📷'];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [liked, setLiked] = useState(product.is_liked || false);
  const [likeCount, setLikeCount] = useState(product.like_count);
  const { user } = useAuthStore();
  const emoji = EMOJIS[product.id % EMOJIS.length];
  const firstImage = product.images?.split(',').filter(Boolean)[0];

  const formatPrice = (p: number) => p.toLocaleString('ko-KR');
  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return '방금 전';
    if (m < 60) return `\${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `\${h}시간 전`;
    return `\${Math.floor(h / 24)}일 전`;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    try {
      const res = await toggleLike(product.id);
      setLiked(res.data.liked);
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch {}
  };

  return (
    <Link to={`/products/\${product.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-0.5 cursor-pointer group">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {firstImage ? (
            <img src={firstImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">{emoji}</div>
          )}
          <button onClick={handleLike} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10">
            <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
          {product.status !== 'selling' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                {product.status === 'reserved' ? '예약중' : '거래완료'}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-500 transition-colors">{product.title}</h3>
          <p className="font-bold text-base text-gray-900 mb-1.5">{formatPrice(product.price)}<span className="text-sm font-normal text-gray-500">원</span></p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1 truncate">
              {product.location && <><MapPin size={10} /><span className="truncate">{product.location}</span><span>·</span></>}
              <Clock size={10} /><span>{formatDate(product.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-0.5"><Heart size={10} />{likeCount}</span>
              <span className="flex items-center gap-0.5"><Eye size={10} />{product.view_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;
