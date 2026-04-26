import React from "react";

export const DashboardLoading = ({ isExiting = false }: { isExiting?: boolean }) => {
  return (
    <div className={`fixed inset-0 bg-[#0B1525] flex flex-col items-center justify-center z-[9999] transition-opacity duration-1000 ease-in-out ${isExiting ? "opacity-0 pointer-events-none scale-110" : "opacity-100 scale-100"}`}>
      <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
        {/* The rotating and zooming logo */}
        <div className="relative z-10 animate-spin-slow-zoom">
          <img 
            src="/logos/ONECONNEXION-04.png" 
            alt="One Connexion Loading" 
            className="w-24 h-24 object-contain"
          />
        </div>
        
        {/* Premium subtle loader around it */}
        <div className="absolute inset-[-10px] border-[1px] border-[#ed5518]/20 rounded-full border-t-[#ed5518] animate-spin duration-[3000ms] linear" />
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white/80 font-bold text-[10px] tracking-[0.5em] uppercase animate-pulse">
            One Connexion
          </h2>
          <span className="text-white/40 text-[9px] tracking-[0.2em] uppercase">
            Initialisation sécurisée du Dashboard
          </span>
        </div>
        <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-[#ed5518] to-transparent animate-progress-loading" />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow-zoom {
          0% { transform: rotate(0deg) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1.2); }
        }
        .animate-spin-slow-zoom {
          animation: spin-slow-zoom 6s ease-in-out forwards;
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.4; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        @keyframes progress-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-loading {
          animation: progress-loading 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardLoading;
