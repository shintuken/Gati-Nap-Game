import React, { useState } from 'react';
import { UserAccount } from '../types';
import { History, Headphones, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { GATI_LOGO_SRC } from '../data/mockData';

interface HeaderProps {
  user: UserAccount;
  onOpenHistory: () => void;
  onOpenSupport: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenHistory,
  onOpenSupport,
  onOpenLogin,
  onLogout,
  onGoHome,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-black/85 backdrop-blur-2xl border-b border-white/10 text-[#fcfcfc] transition-all">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Gati Brand Wordmark with Mascot Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fb5503] rounded-lg group shrink-0 cursor-pointer"
          title="Trang chủ Cổng Nạp Gati Games"
        >
          {/* Gati Official Mascot Logo */}
          <div className="relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center shrink-0">
            <img
              src={GATI_LOGO_SRC}
              alt="Gati Games Logo"
              className="w-10 h-10 md:w-11 md:h-11 object-contain drop-shadow-[0_2px_12px_rgba(251,85,3,0.35)] group-hover:scale-105 transition-transform"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-extrabold text-xl md:text-2xl tracking-tight text-[#fcfcfc] uppercase">
                GATI<span className="text-[#fb5503]">GAMES</span>
              </span>
              <span className="text-[10px] font-bold text-[#fb5503] uppercase tracking-wider bg-[#fb5503]/15 border border-[#fb5503]/30 px-1.5 py-0.5 rounded-full">
                H5
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 tracking-wider block font-medium mt-0.5 uppercase">
              CỔNG NẠP CHÍNH THỨC
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (tham khảo hình gửi: Trang chủ | Nạp game pill) */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-zinc-300">
          <button
            onClick={onGoHome}
            className="text-zinc-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer px-2 py-1"
          >
            Trang chủ
          </button>
          <button
            onClick={onGoHome}
            className="bg-gradient-to-r from-[#0066ff] to-[#0052cc] text-white font-bold px-4 py-1.5 rounded-xl shadow-[0_2px_14px_rgba(0,102,255,0.45)] whitespace-nowrap cursor-pointer transition-all"
          >
            Nạp game
          </button>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-[#fb5503] transition-colors whitespace-nowrap cursor-pointer px-2 py-1"
          >
            <History className="w-4 h-4 text-zinc-400" />
            Lịch sử giao dịch
          </button>
          <button
            onClick={onOpenSupport}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-[#fb5503] transition-colors whitespace-nowrap cursor-pointer px-2 py-1"
          >
            <Headphones className="w-4 h-4 text-zinc-400" />
            Hỗ trợ CSKH
          </button>
        </nav>

        {/* Zone 3: Account & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile history shortcut */}
          <button
            onClick={onOpenHistory}
            className="md:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            title="Lịch sử giao dịch"
            aria-label="Lịch sử giao dịch"
          >
            <History className="w-5 h-5" />
          </button>

          {user.isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-[#18181b] hover:bg-zinc-800 border border-zinc-700/80 transition-all text-xs text-zinc-200 cursor-pointer shadow-sm hover:border-[#fb5503]/50"
                aria-expanded={showUserMenu}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#fb5503] to-[#d84600] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.avatar}
                </div>
                <span className="font-semibold max-w-[110px] truncate text-zinc-100 hidden sm:inline">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-2xl py-2 z-30 text-xs text-zinc-200 divide-y divide-zinc-800">
                    <div className="px-4 py-3">
                      <p className="font-bold text-white text-sm truncate">{user.displayName}</p>
                      <p className="text-zinc-400 truncate mt-0.5">{user.email}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-[#fb5503] bg-[#fb5503]/15 border border-[#fb5503]/30 px-2.5 py-0.5 rounded-full">
                        Tài khoản Gati ID
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenHistory();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 cursor-pointer"
                      >
                        <History className="w-4 h-4 text-zinc-400" />
                        Lịch sử giao dịch
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSupport();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 cursor-pointer"
                      >
                        <Headphones className="w-4 h-4 text-zinc-400" />
                        Trung tâm hỗ trợ CSKH
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#fb5503] hover:bg-[#e04c02] active:bg-[#c44100] rounded-full transition-all whitespace-nowrap shadow-[0_4px_16px_rgba(251,85,3,0.35)] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
