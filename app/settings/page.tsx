'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Settings,
    MessageCircle,
    Mail,
    Shield,
    Smartphone,
    LogOut,
    ChevronRight,
    Globe,
    Zap,
    Lock,
    Eye,
    Users
} from 'lucide-react';
import ProHeader from '../../components/ProHeader';

export default function SettingsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState({
        whatsapp: true,
        email: false,
        push: true,
        smart_bot: true
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    type SectionItem = {
        id: string;
        label: string;
        icon: React.ReactNode;
        active?: boolean;
        type?: 'link';
        path?: string;
    };

    const sections: Array<{
        title: string;
        icon: React.ReactNode;
        items: SectionItem[];
    }> = [
            {
                title: 'Canales de Notificación',
                icon: <Bell size={14} className="text-[#135bec]" />,
                items: [
                    { id: 'whatsapp', label: 'WhatsApp ServiBot', icon: <MessageCircle size={18} className="text-[#00ff9d]" />, active: notifications.whatsapp },
                    { id: 'email', label: 'Informes por Correo', icon: <Mail size={18} className="text-[#00d4ff]" />, active: notifications.email },
                    { id: 'smart_bot', label: 'IA Predictive Alerts', icon: <Zap size={18} className="text-amber-400" />, active: notifications.smart_bot },
                ]
            },
            {
                title: 'Configuración de Empresa',
                icon: <Shield size={14} className="text-[#135bec]" />,
                items: [
                    { id: 'team', label: 'Gestión de Equipo', icon: <Users size={18} className="text-[#135bec]" />, type: 'link', path: '/team' },
                    { id: 'profile', label: 'Perfil de Negocio', icon: <Globe size={18} className="text-[#00ff9d]" />, type: 'link', path: '/profile' },
                    { id: 'password', label: 'Seguridad de Cuenta', icon: <Lock size={18} className="text-gray-400" />, type: 'link', path: '/settings/security' },
                    { id: 'privacy', label: 'Cumplimiento Legal', icon: <Eye size={18} className="text-gray-400" />, type: 'link', path: '/settings/privacy' },
                ]
            },
            {
                title: 'Preferencias de Sistema',
                icon: <Smartphone size={14} className="text-[#135bec]" />,
                items: [
                    { id: 'offline', label: 'Modo Offline (Beta)', icon: <Globe size={18} className="text-gray-400" />, active: false },
                ]
            }
        ];

    return (
        <div className="bg-[#050608] min-h-screen text-white pb-32 max-w-5xl mx-auto font-sans relative overflow-x-hidden border-x border-white/5">
            <ProHeader
                title="Ajustes"
                showBack
                rightElement={
                    <div className="size-11 rounded-2xl bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                        <Settings size={20} />
                    </div>
                }
            />

            <main className="p-6 space-y-10 relative z-10">
                {sections.map((section, idx) => (
                    <motion.section
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 px-2">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{section.title}</h3>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                            {section.items.map((item, i) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-5 ${i !== section.items.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.01] transition-colors`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-11 rounded-[1.2rem] bg-gray-900 border border-white/5 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <span className="text-sm font-bold text-gray-200">{item.label}</span>
                                    </div>

                                    {item.type === 'link' ? (
                                        <button
                                            onClick={() => router.push(item.path || '/')}
                                            className="size-9 flex items-center justify-center rounded-xl bg-gray-900 border border-white/5 text-gray-500"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <div
                                            onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 relative ${item.active ? 'bg-[#135bec]' : 'bg-gray-800'}`}
                                        >
                                            <motion.div
                                                animate={{ x: item.active ? 24 : 0 }}
                                                className="size-4 bg-white rounded-full shadow-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ))}

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/login')}
                    className="w-full bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2.5rem] flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-11 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                            <LogOut size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Cerrar Sesión</p>
                        </div>
                    </div>
                </motion.button>
            </main>
        </div>
    );
}
