import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock } from 'lucide-react';
import { Product } from '../../api/products';

const CATEGORY_COLORS: Record<string, string> = {
  '전자기기': 'bg-blue-100 text-blue-700',
  '의류/잡화': 'bg-pink-100 text-pink-700',
  '가구/인테리어': 'bg-amber-100 text-amber-700',
  '도서': 'bg-green-100 text-green-700',
  '스포츠/레저': 'bg-purple-100 text-purple-700',
  '기타': 'bg-gray-100 text-gray-600',
};

const PLACEHOLDER_EMOJIS = ['📱', '👕', '🛋️', '📚', '⚽', '📦', '💻', '🎮', '👜', '🚲'];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [liked, setLiked] = useState(false);
  const emoji = PLACEHOLDER_EMOJIS[product.id % PLACEHOLDER_EMOJIS.length];

  const formatPrice = (p: number) => p.toLocaleString('ko-KR');
  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return '방금 전';
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  };

  return (
    <Link to={`/products/${product.id}`}>
      <div className="card group cursor-pointer bg-white">
        {/* 이미지 영역 */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
            {emoji}
          </div>
          {/* 찜 버튼 */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200">
            <Heart size={15} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
          {/* 상태 배지 */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${product.status === 'selling' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {product.status === 'selling' ? '판매중' : '거래완료'}
            </span>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 leading-snug group-hover:text-orange-500 transition-colors duration-200">
            {product.title}
          </h3>
          <p className="font-bold text-base text-gray-900 mb-2">
            {formatPrice(product.price)}<span className="text-sm font-normal text-gray-500">원</span>
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1 truncate">
              {product.location && (
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin size={10} />{product.location}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Clock size={10} />{formatDate(product.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-0.5 hover:text-red-400 transition-colors">
                <Heart size={11} />{product.like_count}
              </span>
              <span className="flex items-center gap-0.5">
                <Eye size={11} />{product.view_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
