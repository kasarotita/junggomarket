import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  white?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', white = false }) => {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const s = sizes[size];
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };

  return (
    <div className="flex items-center gap-2">
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="url(#grad1)"/>
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
        </defs>
        {/* 순환 화살표 (중고 순환 의미) */}
        <path d="M11 14C11 12.3431 12.3431 11 14 11H22C23.6569 11 25 12.3431 25 14V18" 
              stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M22 21L25 18L28 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M25 22C25 23.6569 23.6569 25 22 25H14C12.3431 25 11 23.6569 11 22V18" 
              stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M14 15L11 18L8 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* 중앙 점 */}
        <circle cx="18" cy="18" r="2.5" fill="white" opacity="0.9"/>
      </svg>
      <div className="flex flex-col leading-none">
        <span className={'font-black tracking-tight ' + textSizes[size] + ' ' + (white ? 'text-white' : 'text-gray-900')}>
          중고마켓
        </span>
        {size !== 'sm' && (
          <span className={'text-xs font-medium tracking-widest ' + (white ? 'text-white/60' : 'text-indigo-500')}>
            JUNGGO MARKET
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
