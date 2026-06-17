import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, MessageCircle, LogOut, Star, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getMyProducts, getMyLikes, Product } from '../api/products';
import ProductCard from '../components/product/ProductCard';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'selling'|'likes'>('selling');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [myLikes, setMyLikes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([getMyProducts(), getMyLikes()])
      .then(([p,l])=>{ setMyProducts(p.data); setMyLikes(l.data); })
      .finally(()=>setLoading(false));
  }, [user, navigate]);

  const currentItems = tab==='selling' ? myProducts : myLikes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white px-4 pt-6 pb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.profile_image
                ? <img src={user.profile_image} alt="" className="w-full h-full object-cover rounded-full"/>
                : <span className="text-orange-600 font-bold text-2xl">{user?.nickname[0]}</span>}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user?.nickname}</h2>
              <div className="flex items-center gap-3 mt-1">
                {user?.location && <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12}/>{user.location}</span>}
                <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-full">
                  <Star size={13} className="text-orange-500 fill-orange-500"/>
                  <span className="text-sm font-semibold text-orange-600">{user?.manner_score?.toFixed(1)}</span>
                  <span className="text-xs text-orange-400">매너온도</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {icon:Package,label:'판매',count:myProducts.length,action:()=>setTab('selling')},
              {icon:Heart,label:'찜',count:myLikes.length,action:()=>setTab('likes')},
              {icon:MessageCircle,label:'채팅',count:0,link:'/chat'},
            ].map(({icon:Icon,label,count,action,link})=>(
              <button key={label} onClick={action||(()=>navigate(link||'/'))}
                className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors">
                <Icon size={22} className="text-orange-500"/>
                <span className="text-xs text-gray-600 font-medium">{label}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>{ logout(); navigate('/'); }}
            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-600 text-sm transition-colors">
            <LogOut size={18}/><span>로그아웃</span>
          </button>
        </div>
        <div className="flex bg-white border-b border-gray-100 sticky top-14 z-30">
          {[{key:'selling',label:'판매 상품'},{key:'likes',label:'찜한 상품'}].map(({key,label})=>(
            <button key={key} onClick={()=>setTab(key as any)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2 \${tab===key?'border-orange-500 text-orange-500':'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({length:4}).map((_,i)=><div key={i} className="animate-pulse"><div className="bg-gray-200 aspect-square rounded-2xl"/></div>)}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">{tab==='selling'?'📦':'💝'}</p>
              <p>{tab==='selling'?'판매 상품이 없습니다':'찜한 상품이 없습니다'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {currentItems.map(p=><ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
