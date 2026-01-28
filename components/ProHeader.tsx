'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Menu, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AppMenu from './AppMenu';
import NotificationPanel from './NotificationPanel';

interface ProHeaderProps {
    title?: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
}

const ProHeader: React.FC<ProHeaderProps> = ({ title, showBack = false, rightElement }) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-[100] bg-[#0a0c10]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBack ? (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.back()}
                            className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </motion.button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="size-10 bg-[#135bec] rounded-xl flex items-center justify-center shadow-lg shadow-[#135bec]/20">
                                <span className="text-white font-black text-xs italic">S</span>
                            </div>
                            {title && <h1 className="text-xl font-black italic tracking-tighter uppercase">{title}</h1>}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {rightElement}

                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="size-11 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#135bec] transition-all active:scale-90 relative"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 size-2.5 bg-rose-500 rounded-full border-2 border-[#0a0c10]" />
                    </button>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="size-11 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            <AppMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </>
    );
};

export default ProHeader;
