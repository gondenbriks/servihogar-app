'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Panel', path: '/dashboard' },
    { id: 'agenda', icon: 'calendar_today', label: 'Agenda', path: '/agenda' },
    { id: 'logistics', icon: 'navigation', label: 'Logística', path: '/logistics' },
    { id: 'finance', icon: 'payments', label: 'Finanzas', path: '/finance' },
    { id: 'inventory', icon: 'inventory_2', label: 'Stock', path: '/inventory' },
    { id: 'settings', icon: 'settings', label: 'Config', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Bottom Bar - Fixed at bottom */}
      <nav className="fixed bottom-0 w-full z-[100] md:hidden">
        <div className="bg-background/95 backdrop-blur-3xl border-t border-white/10 pb-6 pt-2 px-4 flex justify-around items-center">
          {navItems.slice(0, 4).map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center gap-1 p-2 transition-all relative ${active ? 'text-[#00d4ff]' : 'text-gray-500'}`}
              >
                <span className={`material-symbols-outlined text-[24px] ${active ? 'fill-[1] drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
                {active && (
                  <motion.div layoutId="activeTabMobile" className="absolute -bottom-1 w-6 h-[2px] bg-[#00d4ff] rounded-full" />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col items-center gap-1 p-2 text-gray-500"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">Más</span>
          </button>
        </div>
      </nav>

      {/* Desktop Side/Floating Nav */}
      <nav className="hidden md:flex fixed top-1/2 -translate-y-1/2 left-6 z-[100] flex-col gap-4">
        <div className="bg-background/80 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] shadow-2xl flex flex-col gap-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`group relative size-12 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-[#00d4ff] text-[#0a0c10] shadow-[0_0_20px_rgba(0,212,255,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {item.icon}
                </span>
                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all -translate-x-2 group-hover:translate-x-0">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Hamburger Full Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[110] bg-background md:max-w-md md:left-auto"
          >
            <div className="p-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-xl font-black italic tracking-tighter">Menú <span className="text-[#00d4ff]">Pro</span></h2>
                <button onClick={() => setIsOpen(false)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <X />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { router.push(item.path); setIsOpen(false); }}
                    className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 transition-all hover:border-[#00d4ff]/20"
                  >
                    <span className="material-symbols-outlined text-[32px] text-[#00d4ff]">
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-8 border-t border-white/5">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-center">Iniciado como Administrador</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;