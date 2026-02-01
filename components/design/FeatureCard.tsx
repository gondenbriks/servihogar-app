import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    borderColor: string;
    iconColor: string;
}

const colorMap: Record<string, string> = {
    'neon-blue': 'border-[#00f3ff] bg-[#00f3ff]',
    'neon-purple': 'border-[#bc13fe] bg-[#bc13fe]',
    'neon-green': 'border-[#39ff14] bg-[#39ff14]',
    'neon-cyan': 'border-[#00e5ff] bg-[#00e5ff]',
};

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, borderColor, iconColor }) => {
    const colorStyles = colorMap[borderColor] || 'border-white/10';
    const glowColor = borderColor.includes('blue') ? 'rgba(0, 243, 255, 0.2)' :
        borderColor.includes('purple') ? 'rgba(188, 19, 254, 0.2)' :
            borderColor.includes('green') ? 'rgba(57, 255, 20, 0.2)' :
                'rgba(0, 229, 255, 0.2)';

    return (
        <div className={`
      group relative p-6 rounded-xl bg-black/40 backdrop-blur-xl
      border border-white/10 
      hover:${colorStyles.split(' ')[0]} transition-colors duration-500
      hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
      flex flex-col items-center text-center gap-4
      cursor-default overflow-hidden
    `}>
            {/* Neon Glow on Hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} style={{ backgroundColor: iconColor }} />

            <div className={`
        p-4 rounded-full bg-black/50 border border-white/10 
        group-hover:scale-110 transition-transform duration-300
      `} style={{ boxShadow: `0 0 15px ${iconColor}` }}>
                <Icon size={32} style={{ color: iconColor }} />
            </div>

            <h3 className="text-xl font-bold font-sans tracking-wide text-white relative z-10">
                {title}
            </h3>

            <p className="text-gray-400 text-sm font-light relative z-10 leading-relaxed">
                {description}
            </p>

            {/* Decorative Corner lines */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl group-hover:border-white/50 transition-colors" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl group-hover:border-white/50 transition-colors" />
        </div>
    );
};

export default FeatureCard;
