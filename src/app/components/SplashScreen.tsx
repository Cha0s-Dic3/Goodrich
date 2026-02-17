import logoImage from '../../Goodrich logo.png';
import { useI18n } from '../hooks/useI18n';

export function SplashScreen() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D2817] via-[#8B4513] to-[#C41E3A] flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#FFD700]/60 bg-[#FFFDD0]/10 backdrop-blur-md p-8 sm:p-12 text-center shadow-2xl">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-[#FFD700] bg-white/90 p-2 animate-pulse">
          <img
            src={logoImage}
            alt="Goodrich Farm"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <p className="text-[#FFD700] text-xs sm:text-sm tracking-[0.2em] uppercase mb-3">{t('splash.farmName')}</p>
        <h1 className="text-[#FFFDD0] text-2xl sm:text-4xl font-bold leading-tight mb-3">
          {t('splash.title')}
        </h1>
        <p className="text-[#FAF3E0] text-sm sm:text-base mb-6">
          {t('splash.subtitle')}
        </p>
        <div className="h-2 w-full rounded-full bg-[#FFFDD0]/20 overflow-hidden">
          <div className="h-full w-2/3 bg-[#FFD700] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
