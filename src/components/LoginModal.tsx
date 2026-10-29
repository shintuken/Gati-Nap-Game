import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';
import { GATI_LOGO_SRC } from '../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  targetGameName?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetGameName,
}) => {
  const [authTab, setAuthTab] = useState<'portal' | 'social'>('portal');
  const [username, setUsername] = useState('thien_kiem99');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (simulateError) {
        setErrorMessage('Tài khoản Gati ID hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại (Lỗi: GATI_AUTH_401).');
      } else {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess({
            id: 'usr_9527310',
            username: username.trim() || 'thien_kiem99',
            displayName: 'Thiên Kiếm Hiệp',
            email: `${username.trim() || 'thienkiem'}@gati.vn`,
            isLoggedIn: true,
            avatar: (username.trim()[0] || 'G').toUpperCase(),
          });
          setSuccess(false);
          onClose();
        }, 600);
      }
    }, 900);
  };

  const handleSocialLogin = (provider: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (simulateError) {
        setErrorMessage(`Xác thực qua ${provider} không thành công. Vui lòng thử lại.`);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess({
            id: 'usr_social_9527',
            username: `player_${provider.toLowerCase()}`,
            displayName: `Gati Gamer (${provider})`,
            email: `player@${provider.toLowerCase()}.com`,
            isLoggedIn: true,
            avatar: provider[0],
          });
          setSuccess(false);
          onClose();
        }, 600);
      }
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden transform transition-all text-[#fcfcfc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mascot Logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121214]">
          <div className="flex items-center gap-3">
            <img
              src={GATI_LOGO_SRC}
              alt="Gati Games"
              className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(251,85,3,0.35)]"
            />
            <div>
              <h3 id="login-modal-title" className="text-base font-bold tracking-tight text-white">
                Đăng nhập tài khoản Gati ID
              </h3>
              {targetGameName && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  Để tiếp tục nạp cho <strong>{targetGameName}</strong>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="px-6 pt-4 pb-1">
          <div className="p-3 bg-[#221814] border border-[#fb5503]/30 rounded-xl text-xs text-zinc-300">
            <strong className="text-[#fb5503]">Bảo mật Gati Games:</strong> Hệ thống chỉ cho phép nạp vào nhân vật thuộc tài khoản Gati ID đang đăng nhập để tránh nạp nhầm.
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3">
          <div className="flex rounded-xl bg-[#121214] border border-zinc-800 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthTab('portal');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authTab === 'portal'
                  ? 'bg-[#fb5503] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tài khoản Gati ID
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('social');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authTab === 'social'
                  ? 'bg-[#fb5503] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Đăng nhập nhanh
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="px-6 pt-3">
            <div className="p-3 bg-rose-950/40 border border-rose-600/40 rounded-xl text-xs text-rose-200 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="px-6 pt-3">
            <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">Đăng nhập thành công! Đang chuyển tiếp...</span>
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 pt-4 space-y-4">
          {authTab === 'portal' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tài khoản Gati ID hoặc Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading || success}
                    placeholder="Nhập tên tài khoản..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-700 bg-[#121214] text-[#fcfcfc] focus:outline-none focus:border-[#fb5503] focus:ring-1 focus:ring-[#fb5503]/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || success}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-700 bg-[#121214] text-[#fcfcfc] focus:outline-none focus:border-[#fb5503] focus:ring-1 focus:ring-[#fb5503]/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateError}
                    onChange={(e) => setSimulateError(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-[#fb5503] focus:ring-[#fb5503]"
                  />
                  <span>Mô phỏng lỗi đăng nhập</span>
                </label>
                <span className="text-[#fb5503] hover:underline cursor-pointer font-medium">
                  Quên mật khẩu?
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full py-2.5 px-4 rounded-xl bg-[#fb5503] hover:bg-[#e04c02] active:bg-[#c44100] text-white font-bold text-sm shadow-[0_4px_16px_rgba(251,85,3,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực Gati ID...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs text-zinc-400 mb-2">
                Liên kết tài khoản chơi game an toàn một chạm:
              </p>

              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading || success}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-[#121214] hover:bg-zinc-800 font-semibold text-xs text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Tiếp tục với Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                disabled={isLoading || success}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-[#121214] hover:bg-zinc-800 font-semibold text-xs text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Tiếp tục với Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                disabled={isLoading || success}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-[#121214] hover:bg-zinc-800 font-semibold text-xs text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.66 1.37-.56.65-1.06 1.71-.93 2.73 1.03.08 2.06-.5 2.67-1.25z"/>
                </svg>
                <span>Tiếp tục với Apple</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
