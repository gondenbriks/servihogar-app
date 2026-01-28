'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    BookOpen,
    Wrench,
    Wind,
    Sparkles,
    Smartphone,
    Cpu,
    Layout,
    Bot,
    ChevronUp,
    FileText,
    Library,
    Zap,
    History,
    Star,
    ArrowRight,
    Search as SearchIcon,
    Flame,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LibraryPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = React.useState('Todos');
    const categories = ['Todos', 'Frío', 'Lavado', 'Clima', 'Placas'];

    const repairGuides = [
        {
            id: 'diag-gen',
            title: 'Diagnóstico General',
            desc: 'Pasos básicos para identificar fallas.',
            icon: Wrench,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
            category: 'Todos'
        },
        {
            id: 'refrig',
            title: 'Refrigeración Pro',
            desc: 'Carga de gas y vacíos.',
            icon: Wind,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            category: 'Frío'
        },
        {
            id: 'lav-sec',
            title: 'Lavado Digital',
            desc: 'Calibración de tarjetas LG/Whirlpool.',
            icon: Sparkles,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            category: 'Lavado'
        }
    ];

    const manuales = [
        { title: 'Bosch Serie 6', type: 'Lavadora', brand: 'Bosch', color: 'border-blue-500/30' },
        { title: 'Samsung Inverter', type: 'Refrigerador', brand: 'Samsung', color: 'border-[#1428a0]/30' },
        { title: 'LG ThinQ V4', type: 'Lavadora', brand: 'LG', color: 'border-[#a50034]/30' },
        { title: 'Whirlpool Xpert', type: 'Aires', brand: 'Whirlpool', color: 'border-orange-500/30' },
        { title: 'Mabe Aqua Saver', type: 'Lavado', brand: 'Mabe', color: 'border-emerald-500/30' },
        { title: 'Panasonic EcoNavi', type: 'Frío', brand: 'Panasonic', color: 'border-blue-400/30' }
    ];

    return (
        <div className="bg-[#0a0c10] min-h-screen text-white font-sans max-w-md mx-auto relative overflow-hidden flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-xl p-6 border-b border-white/5 flex items-center justify-between">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className="size-10 flex items-center justify-center rounded-2xl bg-gray-900 border border-white/5"
                >
                    <ChevronLeft size={20} className="text-gray-400" />
                </motion.button>
                <div className="text-center">
                    <h1 className="text-sm font-black uppercase tracking-[0.3em] text-[#00d4ff]">Biblioteca</h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manuales Técnicos</p>
                </div>
                <div className="size-10" /> {/* Spacer */}
            </header>

            <main className="flex-1 overflow-y-auto p-6 pb-44 space-y-10 no-scrollbar">
                {/* Search & Tabs */}
                <div className="space-y-6">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Buscar guías o modelos..."
                            className="w-full bg-gray-900/40 border border-white/10 rounded-[1.8rem] py-4.5 pl-14 pr-6 text-sm focus:border-[#00d4ff] focus:bg-gray-900/80 outline-none transition-all placeholder:text-gray-600 shadow-inner h-14"
                        />
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d4ff] transition-colors" size={20} />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === cat
                                    ? 'bg-[#00d4ff] text-[#0a0c10] border-[#00d4ff] shadow-lg shadow-[#00d4ff]/20'
                                    : 'bg-gray-900/50 text-gray-500 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Guide */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-gradient-to-br from-[#135bec] to-blue-700 rounded-[2.5rem] p-6 overflow-hidden group cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                        <BookOpen size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-end min-h-[140px]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                                <Flame size={10} className="text-orange-400" /> TOP GUÍA
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-white leading-tight">Esquemas Inverter 2024</h2>
                        <p className="text-xs text-white/70 mt-2 font-medium">Procedimientos de testeo para placas controladoras de última generación.</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest">
                            Ver Ahora <ArrowRight size={12} />
                        </div>
                    </div>
                </motion.div>

                {/* Repair Guides */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Procedimientos</h3>
                        <span className="text-[9px] text-[#00ff9d] font-bold">PRO</span>
                    </div>
                    <div className="space-y-3">
                        {repairGuides.filter(g => activeTab === 'Todos' || g.category === activeTab).map((guide, idx) => (
                            <motion.div
                                key={guide.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900/30 border border-white/5 p-4 rounded-[2rem] flex items-center gap-4 hover:bg-gray-800/50 hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className={`size-14 rounded-2xl ${guide.bg} flex items-center justify-center ${guide.color} group-hover:scale-110 transition-transform relative z-10 shadow-lg`}>
                                    <guide.icon size={26} />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black text-white">{guide.title}</h4>
                                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">5 min read</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{guide.desc}</p>
                                </div>
                                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={16} className="text-gray-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Technical Manuals Grid */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Modelos Disponibles</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Grid</span>
                            <div className="size-1 rounded-full bg-[#00d4ff]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {manuales.map((manual, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.05 }}
                                className={`bg-gray-900/30 border ${manual.color} p-4 rounded-[2.2rem] hover:bg-gray-800/40 transition-all cursor-pointer group h-full flex flex-col`}
                            >
                                <div className="aspect-[3/4] bg-black/40 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <FileText size={40} className="text-gray-700 group-hover:text-[#00d4ff] transition-all group-hover:scale-110" />
                                    <div className="absolute top-3 left-3 bg-red-500 text-[8px] font-black px-2 py-1 rounded-lg shadow-lg">PDF</div>
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                                        <div className="size-6 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                            <Star size={12} className="text-amber-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[13px] font-black text-white tracking-tight">{manual.brand}</h4>
                                    <p className="text-[11px] font-bold text-gray-500 truncate mt-0.5">{manual.title}</p>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{manual.type}</span>
                                    <ArrowRight size={10} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            {/* AI Assistant Teaser - Floating Version */}
            <AnimatePresence>
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={() => router.push('/ai-assistant')}
                    className="fixed bottom-28 left-6 right-6 z-40"
                >
                    <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-[#135bec]/20 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-1 shadow-2xl cursor-pointer group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d4ff]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="bg-[#0a0c10]/60 rounded-[2.3rem] p-4 flex items-center gap-4 border border-white/5">
                            <div className="relative">
                                <div className="size-12 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] shadow-inner">
                                    <Bot size={26} className="group-hover:rotate-12 transition-transform" />
                                </div>
                                <div className="absolute -top-1 -right-1 size-3 bg-[#00ff9d] rounded-full border-2 border-[#0a0c10] animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-black text-white group-hover:text-[#00d4ff] transition-colors uppercase tracking-widest">¿Necesitas ayuda técnica?</h4>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Consulta asistida con ServiBot IA</p>
                            </div>
                            <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                                <ChevronUp size={18} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
