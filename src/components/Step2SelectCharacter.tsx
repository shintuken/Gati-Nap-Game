import React, { useState } from 'react';
import { Game, GameServer, Character, DemoEdgeCase } from '../types';
import { Server, User, ShieldAlert, CheckCircle2, RefreshCw, AlertTriangle, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface Step2SelectCharacterProps {
  game: Game;
  servers: GameServer[];
  charactersMap: Record<string, Character[]>;
  selectedServer: GameServer | null;
  selectedCharacter: Character | null;
  isCharacterConfirmed: boolean;
  edgeCase: DemoEdgeCase;
  onSelectServer: (server: GameServer | null) => void;
  onSelectCharacter: (char: Character | null) => void;
  onConfirmCharacter: () => void;
  onResetCharacterConfirmation: () => void;
  onProceedToPackages: () => void;
  onChangeGame: () => void;
  onSessionExpired: () => void;
}

export const Step2SelectCharacter: React.FC<Step2SelectCharacterProps> = ({
  game,
  servers,
  charactersMap,
  selectedServer,
  selectedCharacter,
  isCharacterConfirmed,
  edgeCase,
  onSelectServer,
  onSelectCharacter,
  onConfirmCharacter,
  onResetCharacterConfirmation,
  onProceedToPackages,
  onChangeGame,
  onSessionExpired,
}) => {
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [syncNotice, setSyncNotice] = useState(false);

  const handleServerChange = (serverId: string) => {
    onResetCharacterConfirmation();
    onSelectCharacter(null);

    const foundServer = servers.find((s) => s.id === serverId) || null;
    onSelectServer(foundServer);

    if (foundServer) {
      setLoadingCharacters(true);
      setTimeout(() => {
        setLoadingCharacters(false);
        // Do not auto-select character! User will pick character from loaded list.
      }, 400);
    }
  };

  const handleCharacterChange = (charId: string) => {
    onResetCharacterConfirmation();
    if (!selectedServer) return;
    const list = charactersMap[selectedServer.id] || [];
    const found = list.find((c) => c.id === charId) || null;
    onSelectCharacter(found);
  };

  const availableCharacters = selectedServer ? charactersMap[selectedServer.id] || [] : [];

  const isServerMaintenanceSimulated = edgeCase === 'server_maintenance' || selectedServer?.isMaintenance;
  const isNoCharacterSimulated = false;
  const isLoadCharErrorSimulated = false;
  const isCharNotSyncedSimulated = syncNotice;

  return (
    <div className="space-y-6">
      {/* Game info bar with change game button */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.iconBg} text-white flex items-center justify-center text-xl shrink-0 shadow-xs`}>
            {game.iconSymbol}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
              Tựa game đang chọn
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {game.name}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeGame}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Đổi game</span>
        </button>
      </div>

      {/* Session Expired Simulated Edge Case Alert */}
      {edgeCase === 'session_expired' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-950">Phiên đăng nhập đã hết hạn</p>
            <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
              Hệ thống Gati phát hiện phiên làm việc quá hạn. Vui lòng đăng nhập lại tài khoản Gati ID để tiếp tục nạp.
            </p>
          </div>
          <button
            onClick={onSessionExpired}
            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs cursor-pointer shrink-0"
          >
            Đăng nhập lại
          </button>
        </div>
      )}

      {/* Selection Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Chọn máy chủ và nhân vật
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhân vật phải thuộc tài khoản Gati đang đăng nhập để nạp đúng hòm thư
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dropdown: Máy chủ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>1. Máy chủ (Server) <span className="text-orange-600">*</span></span>
              {selectedServer && !isCharacterConfirmed && (
                <span className="text-[11px] text-emerald-600 font-semibold">Đã chọn máy chủ</span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedServer?.id || ''}
                onChange={(e) => handleServerChange(e.target.value)}
                disabled={isCharacterConfirmed}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer disabled:cursor-not-allowed appearance-none"
              >
                <option value="">-- Chọn máy chủ --</option>
                {servers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name} {server.isMaintenance ? '(Đang bảo trì)' : ''}
                  </option>
                ))}
              </select>
              <Server className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {selectedServer ? (
              <p className="text-[11px] text-slate-500 mt-1">
                Khu vực: Máy chủ Gati chính thức · Kết nối ổn định 100%
              </p>
            ) : (
              <p className="text-[11px] text-orange-600 font-medium mt-1">
                * Vui lòng chọn máy chủ để tải danh sách nhân vật
              </p>
            )}
          </div>

          {/* Dropdown: Nhân vật */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>2. Nhân vật <span className="text-orange-600">*</span></span>
              {loadingCharacters && (
                <span className="text-[11px] text-orange-600 font-medium flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang tải dữ liệu...
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedCharacter?.id || ''}
                onChange={(e) => handleCharacterChange(e.target.value)}
                disabled={!selectedServer || loadingCharacters || isCharacterConfirmed || isServerMaintenanceSimulated}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed appearance-none"
              >
                {!selectedServer ? (
                  <option value="">-- Vui lòng chọn máy chủ trước --</option>
                ) : loadingCharacters ? (
                  <option value="">Đang tải danh sách nhân vật từ máy chủ...</option>
                ) : isNoCharacterSimulated || availableCharacters.length === 0 ? (
                  <option value="">-- Không tìm thấy nhân vật nào trên máy chủ này --</option>
                ) : (
                  <>
                    <option value="">-- Chọn nhân vật ({availableCharacters.length} nhân vật tìm thấy) --</option>
                    {availableCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name} (Role ID: {char.roleId} - Lv.{char.level})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {loadingCharacters ? (
                <Loader2 className="w-4 h-4 text-orange-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              ) : (
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>

            {!selectedServer ? (
              <p className="text-[11px] text-slate-400 mt-1">
                Ô nhân vật sẽ mở sau khi bạn chọn máy chủ
              </p>
            ) : selectedServer && !selectedCharacter && !loadingCharacters ? (
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                ✓ Đã tìm thấy {availableCharacters.length} nhân vật. Vui lòng bấm chọn nhân vật.
              </p>
            ) : selectedServer && !isCharacterConfirmed && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Vừa tạo nhân vật?</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoadingCharacters(true);
                    setTimeout(() => {
                      setLoadingCharacters(false);
                      setSyncNotice(true);
                    }, 600);
                  }}
                  className="text-orange-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  Đồng bộ lại
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edge Case: Server Maintenance Alert */}
        {isServerMaintenanceSimulated && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Máy chủ đang bảo trì nâng cấp</p>
              <p className="text-amber-800 mt-0.5">
                Máy chủ {selectedServer?.name || 'này'} đang tạm ngưng nhận nạp để bảo trì hệ thống. Vui lòng thử lại sau hoặc chọn máy chủ khác.
              </p>
            </div>
          </div>
        )}

        {/* Edge Case: Load Char Error Alert */}
        {isLoadCharErrorSimulated && selectedServer && !isServerMaintenanceSimulated && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-950">Không tải được danh sách nhân vật</p>
              <p className="text-rose-800 mt-0.5">
                Không thể kết nối đến máy chủ game để lấy thông tin nhân vật (Mã lỗi: GATI_GATEWAY_504).
              </p>
            </div>
            <button
              onClick={() => {
                setLoadingCharacters(true);
                setTimeout(() => setLoadingCharacters(false), 500);
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs cursor-pointer shrink-0"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Edge Case: No Character Alert */}
        {isNoCharacterSimulated && selectedServer && !isServerMaintenanceSimulated && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm flex items-start gap-3">
            <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Không tìm thấy nhân vật</p>
              <p className="text-slate-600 mt-0.5">
                Tài khoản Gati của bạn chưa tạo nhân vật trên {selectedServer?.name}. Vui lòng đăng nhập vào game để tạo nhân vật trước khi nạp.
              </p>
            </div>
          </div>
        )}

        {/* Notice: New Character not synced yet */}
        {isCharNotSyncedSimulated && !isServerMaintenanceSimulated && (
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p>
              <strong>Thông tin đồng bộ:</strong> Nhân vật mới tạo cần từ 1–3 phút để máy chủ game đồng bộ về cổng nạp Gati. Nếu chưa thấy tên nhân vật, bạn có thể bấm &ldquo;Đồng bộ lại&rdquo;.
            </p>
          </div>
        )}

        {/* Character Confirmation Card */}
        {selectedCharacter && selectedServer && !isServerMaintenanceSimulated && !isNoCharacterSimulated && !isLoadCharErrorSimulated && (
          <div
            className={`p-5 rounded-xl border transition-all ${
              isCharacterConfirmed
                ? 'bg-orange-50/40 border-orange-300 ring-2 ring-orange-500/20'
                : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl ${
                    selectedCharacter.avatarBg || 'bg-orange-600'
                  } text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0`}
                >
                  {selectedCharacter.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900">
                      {selectedCharacter.name}
                    </h4>
                    {isCharacterConfirmed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                        Đã xác nhận
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                    <span>
                      Máy chủ: <strong>{selectedServer.name}</strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>
                      Role ID: <strong className="font-mono text-slate-800">{selectedCharacter.roleId}</strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>
                      Cấp độ: <strong className="text-orange-600 font-bold">{selectedCharacter.level}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Confirm or Change */}
              <div className="shrink-0">
                {isCharacterConfirmed ? (
                  <button
                    type="button"
                    onClick={onResetCharacterConfirmation}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Thay đổi
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onConfirmCharacter}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-400 hover:to-red-500 active:from-orange-600 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận nhân vật</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA to proceed to step 3 */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={onChangeGame}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ← Chọn game khác
          </button>

          <button
            type="button"
            onClick={onProceedToPackages}
            disabled={!isCharacterConfirmed}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-400 hover:to-red-500 active:from-orange-600 text-white font-bold text-sm shadow-md shadow-orange-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Tiếp tục chọn gói nạp</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
