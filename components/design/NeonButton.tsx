import React from 'react';

interface NeonButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

const NeonButton: React.FC<NeonButtonProps> = ({ children, onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`
        relative px-8 py-4 font-mono font-bold text-[#39ff14] border border-[#39ff14] 
        uppercase tracking-widest transition-all duration-300 ease-out
        hover:bg-[#39ff14] hover:text-black hover:shadow-[0_0_20px_#39ff14]
        active:scale-95 group overflow-hidden
        ${className}
      `}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
            {/* Glitch/Scan effect overlay */}
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
    );
};

export default NeonButton;
