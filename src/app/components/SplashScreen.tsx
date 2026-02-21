import logoImage from '../../Goodrich logo.png';
export function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D2817] via-[#8B4513] to-[#C41E3A] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-[#FFD700] bg-white/90 p-2 animate-pulse">
          <img
            src={logoImage}
            alt="Goodrich Farm"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <p className="text-[#FAF3E0] text-sm sm:text-base">Layering</p>
      </div>
    </div>
  );
}
