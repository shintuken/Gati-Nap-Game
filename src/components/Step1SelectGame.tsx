import React, { useState, useMemo } from 'react';
import { Game, UserAccount } from '../types';
import { Search, AlertCircle, X, Clock } from 'lucide-react';
import { PromoBannerCarousel } from './PromoBannerCarousel';

interface Step1SelectGameProps {
  games: Game[];
  user: UserAccount;
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
  onSelectPartnerGame: (game: Game) => void;
  onRequireLogin: (game: Game) => void;
}

type GameTagFilter = 'all' | 'card' | 'hot' | 'h5' | 'mmo';

export const Step1SelectGame: React.FC<Step1SelectGameProps> = ({
  games,
  user,
  selectedGame,
  onSelectGame,
  onSelectPartnerGame,
  onRequireLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<GameTagFilter>('all');
  const [maintenanceAlert, setMaintenanceAlert] = useState<string | null>(null);

  const TAG_OPTIONS: { id: GameTagFilter; label: string }[] = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'card', label: 'Card' },
    { id: 'hot', label: 'Game Hot' },
    { id: 'h5', label: 'H5' },
    { id: 'mmo', label: 'MMO' },
  ];

  // 3 game đã chơi gần đây
  const recentGames = useMemo(() => {
    const explicitRecent = games.filter((g) => g.isRecent);
    if (explicitRecent.length >= 3) {
      return explicitRecent.slice(0, 3);
    }
    return games.slice(0, 3);
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // 1. Search text filter
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      if (!matchesSearch) return false;

      // 2. Tag filter
      if (activeTag === 'all') return true;
      if (activeTag === 'card') return game.categoryTag === 'strategy';
      if (activeTag === 'hot') {
        return (
          game.isRecent ||
          game.id === 'game_chien_gioi_4d' ||
          game.id === 'game_kiem_vu' ||
          game.id === 'game_dau_la_vo_song'
        );
      }
      if (activeTag === 'h5') return game.categoryTag === 'tien_hiep';
      if (activeTag === 'mmo') return game.categoryTag === 'rpg';
      return true;
    });
  }, [games, searchTerm, activeTag]);

  const handleGameClick = (game: Game) => {
    setMaintenanceAlert(null);

    if (game.status === 'maintenance') {
      setMaintenanceAlert(
        `Tựa game "${game.name}" hiện đang bảo trì cổng thanh toán để nâng cấp định kỳ. Vui lòng quay lại sau ít phút.`
      );
      return;
    }

    if (game.status === 'partner') {
      onSelectPartnerGame(game);
      return;
    }

    // Portal game: check login
    if (!user.isLoggedIn) {
      onRequireLogin(game);
      return;
    }

    onSelectGame(game);
  };

  // Reusable game card component: chỉ gồm Icon (với tag nạp tại Gati góc phải trên) + Tên game
  const renderGameCard = (game: Game, keyPrefix: string = 'grid') => {
    const isSelected = selectedGame?.id === game.id;
    const isMaintenance = game.status === 'maintenance';
    const isPartner = game.status === 'partner';
    const isPortal = game.status === 'portal';

    return (
      <div
        key={`${keyPrefix}-${game.id}`}
        onClick={() => handleGameClick(game)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleGameClick(game);
          }
        }}
        className="group flex flex-col cursor-pointer focus:outline-none"
      >
        {/* Game Icon Box (Vuông bo góc lớn, có tag nạp tại Gati ở góc phải trên) */}
        <div
          className={`relative aspect-square w-full rounded-2xl md:rounded-3xl overflow-hidden border transition-all duration-300 p-4 flex flex-col items-center justify-center bg-gradient-to-br ${game.iconBg} shadow-md group-hover:scale-[1.03] ${
            isSelected
              ? 'border-[#fb5503] ring-2 ring-[#fb5503]/50 shadow-[0_12px_28px_rgba(251,85,3,0.35)]'
              : isMaintenance
              ? 'border-zinc-800 opacity-60'
              : 'border-zinc-800/80 group-hover:border-[#fb5503] group-hover:shadow-[0_12px_28px_rgba(251,85,3,0.25)]'
          }`}
        >
          {/* Inner subtle overlay */}
          <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />

          {/* Center Icon Symbol / Art */}
          <span className="relative z-10 text-4xl sm:text-5xl md:text-6xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300 select-none">
            {game.iconSymbol}
          </span>

          {/* Tag nạp tại Gati hiển thị góc phải trên trong icon game */}
          {isPortal && (
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 text-[10px] sm:text-[11px] font-bold text-white bg-[#fb5503] px-2 py-0.5 rounded-md shadow-md uppercase tracking-tight select-none">
              Nạp tại Gati
            </span>
          )}

          {isPartner && (
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-950/85 border border-amber-500/40 px-2 py-0.5 rounded-md shadow-md uppercase tracking-tight select-none">
              Đối tác
            </span>
          )}

          {isMaintenance && (
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 text-[10px] sm:text-[11px] font-bold text-zinc-300 bg-zinc-900/90 border border-zinc-700 px-2 py-0.5 rounded-md shadow-md uppercase tracking-tight select-none">
              Bảo trì
            </span>
          )}
        </div>

        {/* Tên game (chỉ gồm Icon + Tên game) */}
        <h3 className="mt-2.5 font-bold text-xs sm:text-sm text-[#fcfcfc] text-center group-hover:text-[#fb5503] transition-colors truncate px-1">
          {game.name}
        </h3>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Phía trên cùng: Banner hiển thị thông tin khuyến mãi nạp */}
      <PromoBannerCarousel />

      {/* Maintenance alert if user clicked maintenance game */}
      {maintenanceAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-300">Thông báo bảo trì</p>
            <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5">{maintenanceAlert}</p>
          </div>
          <button
            onClick={() => setMaintenanceAlert(null)}
            className="text-amber-400 hover:text-amber-200 font-semibold text-xs cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      )}

      {/* 2. Mục Game đã chơi gần đây (Trên mục Danh sách Game, hiển thị 3 game với layout tương tự) */}
      {!searchTerm && activeTag === 'all' && recentGames.length > 0 && (
        <div className="space-y-3.5 pb-2 border-b border-zinc-800/60">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#fcfcfc] tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#fb5503]" />
              <span>Game đã chơi gần đây</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
              Truy cập nhanh tựa game bạn vừa nạp
            </span>
          </div>

          {/* Grid 3 games with same column sizing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 pt-1">
            {recentGames.map((game) => renderGameCard(game, 'recent'))}
          </div>
        </div>
      )}

      {/* 3. Phần Danh Sách Game: Tiêu đề, Filter tag và Ô tìm kiếm (tham khảo hình gửi) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* Cụm Tiêu Đề & Filter Tag Game (bên trái) */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#fcfcfc] tracking-tight">
              Danh sách Game
            </h1>

            {/* Filter Tags */}
            <div className="flex items-center flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const isActive = activeTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveTag(tag.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0066ff] text-white shadow-[0_2px_12px_rgba(0,102,255,0.45)]'
                        : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ô Tìm Kiếm Game (bên phải - icon kính lúp nằm bên phải như hình) */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm game"
              className="w-full pl-4 pr-10 py-2.5 text-sm bg-[#10141d] rounded-xl border border-[#232b3e] focus:outline-none focus:border-[#fb5503] focus:ring-1 focus:ring-[#fb5503]/30 transition-all text-[#fcfcfc] placeholder-zinc-500 shadow-inner"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>
        </div>

        {/* 4. Layout Game Grid (chỉ gồm Icon + Tên game, Tag nạp tại Gati hiển thị góc phải trên icon) */}
        {filteredGames.length === 0 ? (
          <div className="p-12 text-center bg-[#18181b] rounded-2xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">
              Không tìm thấy tựa game phù hợp với &ldquo;{searchTerm}&rdquo;
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTag('all');
              }}
              className="mt-3 text-xs font-semibold text-[#fb5503] hover:underline cursor-pointer"
            >
              Xem tất cả tựa game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 pt-2">
            {filteredGames.map((game) => renderGameCard(game, 'all'))}
          </div>
        )}
      </div>
    </div>
  );
};
