'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, Calendar, Navigation, Wallet, Box, Settings, Home, LogOut, User } from 'lucide-react';

interface AppMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const AppMenu: React.FC<AppMenuProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { id: 'dashboard', icon: <LayoutGrid size={24} />, label: 'Panel', path: '/dashboard' },
        { id: 'agenda', icon: <Calendar size={24} />, label: 'Agenda', path: '/agenda' },
        { id: 'logistics', icon: <Navigation size={24} />, label: 'Logística', path: '/logistics' },
        { id: 'finance', icon: <Wallet size={24} />, label: 'Finanzas', path: '/finance' },
        { id: 'inventory', icon: <Box size={24} />, label: 'Inventario', path: '/inventory' },
        { id: 'settings', icon: <Settings size={24} />, label: 'Configuración', path: '/settings' },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Menu Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-[300px] bg-[#0a0c10] border-l border-white/5 z-[210] shadow-2xl flex flex-col"
                    >
                        <div className="p-8 flex justify-between items-center border-b border-white/5 bg-gray-900/20">
                            <h2 className="text-xl font-black italic tracking-tighter uppercase">Menu <span className="text-[#135bec]">Pro</span></h2>
                            <button
                                onClick={onClose}
                                className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {navItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            router.push(item.path);
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${active ? 'bg-[#135bec] text-white shadow-lg shadow-[#135bec]/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                                    >
                                        <div className={`${active ? 'text-white' : 'text-[#135bec] opacity-60 group-hover:opacity-100'}`}>
                                            {item.icon}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-6 border-t border-white/5 space-y-4">
                            <button
                                onClick={() => {
                                    router.push('/profile');
                                    onClose();
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group"
                            >
                                <User size={20} className="text-gray-500 group-hover:text-white" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Mi Perfil</span>
                            </button>
                            <button
                                onClick={() => {
                                    router.push('/login');
                                    onClose();
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-all"
                            >
                                <LogOut size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Cerrar Sesión</span>
                            </button>
                            <div className="pt-4 text-center">
                                <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.4em]">ServiTech Hub v2.0.4</p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AppMenu;
