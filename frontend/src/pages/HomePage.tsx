import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories, Product } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import { TrendingUp, Cloud, Sun, CloudRain, Wind, Snowflake, CloudLightning } from 'lucide-react';

const ICONS: Record<string, string> = { '전자기기':'📱','의류/잡화':'👕','가구/인테리어':'🛋️','도서':'📚','스포츠/레저':'⚽','기타':'📦' };

interface Weather { temp: number; desc: string; icon: string; wind: number; humidity: number; }

const getWeatherIcon = (desc: string) => {
  if (desc.includes('비') || desc.includes('rain')) return <CloudRain size={20} className="text-blue-400"/>;
  if (desc.includes('눈') || desc.includes('snow')) return <Snowflake size={20} className="text-blue-200"/>;
  if (desc.includes('구름') || desc.includes('cloud')) return <Cloud size={20} className="text-gray-400"/>;
  if (desc.includes('번개') || desc.includes('thunder')) return <CloudLightning size={20} className="text-yellow-400"/>;
  return <Sun size={20} className="text-yellow-400"/>;
};

const getTradeMessage = (desc: string, temp: number) => {
  if (desc.includes('비') || desc.includes('rain')) return { msg: '오늘 비가 와요 ☔ 실내 직거래를 추천해요!', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' };
  if (desc.includes('눈') || desc.includes('snow')) return { msg: '눈이 내려요 ❄️ 안전한 거래 장소를 선택하세요', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' };
  if (temp >= 30) return { msg: '폭염 주의 🌡️ 빠른 거래로 더위를 피하세요!', color: 'text-red-600', bg: 'bg-red-50 border-red-100' };
  if (temp <= 0) return { msg: '한파 주의 🥶 따뜻한 실내에서 거래하세요', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' };
  return { msg: '날씨가 좋아요 ☀️ 오늘 직거래 최적의 날이에요!', color: 'text-green-600', bg: 'bg-green-50 border-green-100' };
};

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<Weather | null>(null);
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

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m&timezone=Asia%2FSeoul')
          .then(r => r.json())
          .then(data => {
            const code = data.current.weather_code;
            const temp = Math.round(data.current.temperature_2m);
            const wind = Math.round(data.current.wind_speed_10m);
            const humidity = data.current.relative_humidity_2m;
            let desc = '맑음';
            if (code >= 95) desc = '번개';
            else if (code >= 71) desc = '눈';
            else if (code >= 51) desc = '비';
            else if (code >= 45) desc = '안개';
            else if (code >= 3) desc = '구름';
            setWeather({ temp, desc, icon: '', wind, humidity });
          }).catch(() => {});
      },
      () => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m&timezone=Asia%2FSeoul')
          .then(r => r.json())
          .then(data => {
            const code = data.current.weather_code;
            const temp = Math.round(data.current.temperature_2m);
            const wind = Math.round(data.current.wind_speed_10m);
            const humidity = data.current.relative_humidity_2m;
            let desc = '맑음';
            if (code >= 95) desc = '번개';
            else if (code >= 71) desc = '눈';
            else if (code >= 51) desc = '비';
            else if (code >= 45) desc = '안개';
            else if (code >= 3) desc = '구름';
            setWeather({ temp, desc, icon: '', wind, humidity });
          }).catch(() => {});
      }
    );
  }, []);

  const tradeMsg = weather ? getTradeMessage(weather.desc, weather.temp) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {!search && (
        <>
          {/* 히어로 배너 */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-white/20 blur-3xl"/>
              <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full bg-purple-400/30 blur-2xl"/>
            </div>
            <div className="max-w-6xl mx-auto px-4 py-12 relative">
              <div className="flex items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border border-white/20">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                    실시간 거래 중 · 1,234개
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">
                    믿을 수 있는<br/>
                    <span className="text-indigo-200">중고 거래</span>의 시작
                  </h1>
                  <p className="text-indigo-200 mb-8 text-base leading-relaxed">
                    안전하고 투명한 거래로<br/>당신의 물건에 새 생명을
                  </p>
                  <div className="flex gap-3">
                    <Link to="/sell" className="bg-white text-indigo-700 font-black px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-sm shadow-lg">
                      지금 판매하기
                    </Link>
                    <Link to="/?category=1" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm">
                      상품 둘러보기
                    </Link>
                  </div>
                </div>
                {/* 히어로 일러스트 */}
                <div className="hidden md:flex flex-col items-center justify-center gap-3 flex-shrink-0">
                  <div className="grid grid-cols-3 gap-2">
                    {['📱','👕','🛋️','📚','⚽','💻','🎮','👜','🚲'].map((e,i)=>(
                      <div key={i} className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* 통계 바 */}
            <div className="border-t border-white/10 bg-black/10">
              <div className="max-w-6xl mx-auto px-4 py-3 flex gap-8 overflow-x-auto scrollbar-hide">
                {[{label:'누적 거래',value:'120만+'},{label:'판매자',value:'45만+'},{label:'오늘 등록',value:'3,421개'},{label:'평균 응답',value:'12분'}].map(({label,value})=>(
                  <div key={label} className="flex-shrink-0 text-center">
                    <p className="text-white font-black text-lg">{value}</p>
                    <p className="text-indigo-200 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 날씨 거래 추천 */}
          {weather && tradeMsg && (
            <div className="max-w-6xl mx-auto px-4 pt-5">
              <div className={'flex items-center gap-3 p-4 rounded-2xl border ' + tradeMsg.bg}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getWeatherIcon(weather.desc)}
                  <div>
                    <p className="font-black text-lg text-gray-900">{weather.temp}°C</p>
                    <p className="text-xs text-gray-500">{weather.desc}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200"/>
                <p className={'font-semibold text-sm ' + tradeMsg.color}>{tradeMsg.msg}</p>
                <div className="ml-auto flex items-center gap-4 text-xs text-gray-500 flex-shrink-0 hidden sm:flex">
                  <span>💨 {weather.wind}m/s</span>
                  <span>💧 {weather.humidity}%</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 카테고리 */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
          <button onClick={() => setSelectedCategory(null)}
            className={'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ' + (!selectedCategory ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50')}>
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-semibold">전체</span>
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ' + (selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50')}>
              <span className="text-2xl">{ICONS[cat.name]||'📦'}</span>
              <span className="text-xs font-semibold">{cat.name}</span>
            </button>
          ))}
        </div>

        {search && (
          <p className="mb-4 text-sm text-gray-600">
            <span className="font-black text-gray-900">"{search}"</span> 검색 결과
            <span className="ml-2 text-indigo-600 font-bold">{products.length}개</span>
          </p>
        )}

        {!search && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <TrendingUp size={22} className="text-indigo-600"/>최신 상품
            </h2>
            <span className="text-sm text-gray-400 font-medium">{products.length}개</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({length:10}).map((_,i)=>(
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-3"/>
                <div className="h-4 bg-gray-200 rounded-lg mb-2"/>
                <div className="h-4 bg-gray-200 rounded-lg w-2/3"/>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500 font-bold text-lg mb-1">상품이 없습니다</p>
            <p className="text-gray-400 text-sm mb-6">다른 카테고리를 선택하거나 검색어를 바꿔보세요</p>
            <Link to="/sell" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-md">첫 상품 등록하기</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;
