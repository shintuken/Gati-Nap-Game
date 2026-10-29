import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Zap, ShieldCheck, Gift } from 'lucide-react';
import { GATI_LOGO_SRC } from '../data/mockData';

interface PromoSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  highlightText: string;
  description: string;
  ctaText: string;
  bgGradient: string;
  accentColor: string;
  icon: React.ReactNode;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'promo-1',
    badge: 'SIÊU ƯU ĐÃI NẠP ĐẦU',
    badgeColor: 'bg-[#fb5503] text-white',
    title: 'TẶNG +100% GATI XU',
    highlightText: 'CHO LẦN NẠP ĐẦU TIÊN',
    description: 'Áp dụng cho tất cả tựa game chính thức Gati Games khi thanh toán qua VietQR, MoMo hoặc ZaloPay.',
    ctaText: 'Nạp ngay',
    bgGradient: 'from-[#2a1205] via-[#1c0d05] to-[#0e0703]',
    accentColor: '#fb5503',
    icon: <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />,
  },
  {
    id: 'promo-2',
    badge: 'HOÀN TIỀN CUỐI TUẦN',
    badgeColor: 'bg-emerald-600 text-white',
    title: 'CASHBACK 10% KHÔNG GIỚI HẠN',
    highlightText: 'MỖI THỨ 7 & CHỦ NHẬT',
    description: 'Hoàn tiền trực tiếp vào tài khoản Gati ID cho mọi giao dịch nạp game từ 50.000đ trở lên.',
    ctaText: 'Xem chi tiết',
    bgGradient: 'from-[#06241b] via-[#081813] to-[#040d0a]',
    accentColor: '#10b981',
    icon: <Gift className="w-8 h-8 text-emerald-400" />,
  },
  {
    id: 'promo-3',
    badge: 'SỰ KIỆN LIÊN SERVER',
    badgeColor: 'bg-indigo-600 text-white',
    title: 'CHIẾN GIỚI 4D: ĐUA TOP NẠP',
    highlightText: 'NHẬN THẦN KHÍ HOÀNG KIM',
    description: 'Mở máy chủ mới Vũ Trụ 04. Đua top nạp tích lũy nhận Cánh Thần Ma và Danh hiệu Độc Tôn vĩnh viễn.',
    ctaText: 'Tham gia ngay',
    bgGradient: 'from-[#190d33] via-[#110924] to-[#090514]',
    accentColor: '#8b5cf6',
    icon: <Zap className="w-8 h-8 text-indigo-400" />,
  },
];

export const PromoBannerCarousel: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = PROMO_SLIDES[currentSlideIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  return (
    <div
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 shadow-xl group select-none transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Graphic & Glow */}
      <div className={`w-full bg-gradient-to-r ${slide.bgGradient} p-6 sm:p-8 md:p-10 relative overflow-hidden transition-all duration-700 min-h-[180px] md:min-h-[220px] flex items-center`}>
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: slide.accentColor }}
        />

        {/* Faint Background Gati Logo Watermark */}
        <div className="absolute right-4 md:right-16 -bottom-8 pointer-events-none opacity-10">
          <img
            src={GATI_LOGO_SRC}
            alt="Gati Watermark"
            className="w-64 h-64 md:w-80 md:h-80 object-contain filter grayscale"
          />
        </div>

        {/* Content Block */}
        <div className="relative z-10 max-w-2xl space-y-3">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${slide.badgeColor}`}>
              {slide.badge}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bảo chứng giao dịch chính thức</span>
            </span>
          </div>

          {/* Title & Highlight */}
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {slide.title}
            </h2>
            <p
              className="text-lg sm:text-xl md:text-2xl font-black tracking-tight drop-shadow-sm"
              style={{ color: slide.accentColor }}
            >
              {slide.highlightText}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
            {slide.description}
          </p>
        </div>

        {/* Mascot / Icon Badge on Right */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 z-10 items-center justify-center">
          <div className="relative w-28 h-28 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl">
            <img
              src={GATI_LOGO_SRC}
              alt="Gati"
              className="w-16 h-16 object-contain drop-shadow-[0_4px_16px_rgba(251,85,3,0.5)] transform hover:scale-110 transition-transform"
            />
            <div className="absolute -top-2 -right-2">
              {slide.icon}
            </div>
          </div>
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer z-20"
          aria-label="Slide trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer z-20"
          aria-label="Slide kế tiếp"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Pagination Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {PROMO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              type="button"
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-7 bg-[#fb5503]'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Chuyển tới slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
