'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    MapPin,
    Navigation,
    Search,
    Smartphone,
    Layers,
    Compass,
    Activity,
    Target,
    ChevronLeft,
    Maximize,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProHeader from '../../components/ProHeader';
import Background from '../../components/design/Background';
import NeonButton from '../../components/design/NeonButton';

export default function LogisticsPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    useEffect(() => {
        fetchTodayOrders();
    }, []);

    const fetchTodayOrders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select(`
                    *,
                    client:clients(*),
                    equipment:equipment(*)
                `)
                .order('scheduled_at', { ascending: true });

            if (data) setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptimize = () => {
        setIsOptimizing(true);
        setTimeout(() => setIsOptimizing(false), 2000);
    };

    const filteredOrders = orders.filter(o =>
        o.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.order_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openInGoogleMaps = (lat: number, lng: number) => {
        if (!lat || !lng) {
            window.open(`https://www.google.com/maps/search/?api=1&query=Mendoza,Argentina`, '_blank');
            return;
        }
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    };

    return (
        <div className="bg-background min-h-screen text-white font-outfit max-w-5xl mx-auto relative overflow-hidden flex flex-col">
            <Background />
            <ProHeader
                title="Logística"
                showBack
                rightElement={
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className={`size-11 flex items-center justify-center rounded-2xl border transition-all ${isOptimizing ? 'bg-[#00ff9d] text-black border-white' : 'bg-[#00ff9d]/10 border-[#00ff9d]/20 text-[#00ff9d]'
                            } shadow-[0_0_20px_rgba(0,255,157,0.15)]`}
                    >
                        {isOptimizing ? <Activity size={20} className="animate-spin" /> : <Target size={20} />}
                    </motion.button>
                }
            />

            <div className="p-6 bg-background/50 border-b border-white/5 space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#00ff9d]/5 border border-[#00ff9d]/20 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden group"
                >
                    <div className="absolute inset-y-0 left-0 w-1 bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-10 rounded-full bg-[#00ff9d]/10 flex items-center justify-center border border-[#00ff9d]/20">
                            <Activity size={18} className="text-[#00ff9d] animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#00ff9d] uppercase tracking-[0.2em]">IA ServiBot Activa</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Trayectoria en Tiempo Real</p>
                        </div>
                    </div>
                </motion.div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar unidad o cliente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#00ff9d] outline-none transition-all placeholder:text-gray-600 shadow-inner"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>
            </div>

            {/* Tactical Map Simulation */}
            <main className={`relative bg-background overflow-hidden transition-all duration-700 ${isMapExpanded ? 'flex-1 min-h-[60vh]' : 'h-[400px]'}`}>
                {/* Tactical Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #00ff9d 1px, transparent 0)`,
                        backgroundSize: '35px 35px'
                    }}
                />

                {/* Floating Map Controls */}
                <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        className="size-12 rounded-2xl bg-[#050608]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-2xl"
                    >
                        {isMapExpanded ? <Layers size={20} /> : <Maximize size={20} />}
                    </motion.button>
                </div>

                {/* Tactical Pins */}
                <div className="absolute inset-0 p-10">
                    {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                        <motion.button
                            key={order.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1, type: "spring" }}
                            onClick={() => {
                                setSelectedOrder(order);
                                setIsMapExpanded(false);
                            }}
                            className={`absolute flex flex-col items-center gap-2 group transition-all ${selectedOrder?.id === order.id ? 'z-30 scale-125' : 'z-10'}`}
                            style={{
                                left: `${25 + (index * 20) % 60}%`,
                                top: `${30 + (index * 15) % 50}%`
                            }}
                        >
                            <div className="relative">
                                {selectedOrder?.id === order.id && (
                                    <div className="absolute inset-0 animate-ping rounded-full bg-[#00ff9d]/30" />
                                )}

                                <div className={`relative size-12 rounded-[1.4rem] flex items-center justify-center border-2 transition-all shadow-2xl ${selectedOrder?.id === order.id
                                    ? 'bg-[#00ff9d] border-white text-[#050608]'
                                    : 'bg-[#050608]/90 backdrop-blur-md border-[#135bec]/40 text-[#135bec]'
                                    }`}>
                                    <MapPin size={22} strokeWidth={2.5} />
                                </div>
                                <span className="absolute -top-2 -right-2 size-6 bg-[#050608] text-white rounded-lg flex items-center justify-center text-[10px] font-black border border-white/10">
                                    {index + 1}
                                </span>
                            </div>
                        </motion.button>
                    )) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800 opacity-20">
                            <Compass size={100} className="mb-4 animate-spin-slow" />
                            <p className="font-black uppercase tracking-[0.6em] text-xs">Sin Señal GPS</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Tactical Orders List Drawer */}
            <div
                className={`bg-[#050608] border-t border-white/10 rounded-t-[3.5rem] transition-all duration-700 shadow-2xl relative z-40 overflow-hidden ${isMapExpanded ? 'h-24' : selectedOrder ? 'h-[320px]' : 'h-[500px]'
                    }`}
            >
                {/* Drawer Handle Area - Interactive */}
                <button
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                    className="w-full py-6 flex flex-col items-center group active:opacity-50 transition-opacity"
                >
                    <div className={`w-16 h-1.5 rounded-full transition-all border border-white/5 ${isMapExpanded ? 'bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]' : 'bg-white/10'}`} />
                    {isMapExpanded && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-black text-[#00ff9d] uppercase tracking-[0.4em] mt-3"
                        >
                            Ver Detalles
                        </motion.span>
                    )}
                </button>

                <div className="px-6 pb-24 h-full overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 italic">Despacho de Hoy</h3>
                        <span className="text-[10px] font-black text-[#135bec] bg-[#135bec]/10 px-4 py-1.5 rounded-full border border-[#135bec]/20">
                            {filteredOrders.length} Paradas
                        </span>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="h-28 bg-white/[0.02] border border-white/5 rounded-[2.5rem] animate-pulse" />
                        ) : filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className={`group relative p-6 rounded-[3rem] border transition-all cursor-pointer ${selectedOrder?.id === order.id
                                    ? 'bg-[#135bec]/10 border-[#135bec]/40'
                                    : 'bg-white/[0.015] border-white/5'
                                    }`}
                            >
                                <div className="flex gap-6 items-center">
                                    <div className={`size-16 rounded-[2rem] flex items-center justify-center text-xl font-black ${selectedOrder?.id === order.id ? 'bg-[#135bec] text-white' : 'bg-[#050608] text-gray-500 border border-white/5'}`}>
                                        {order.client?.full_name?.substring(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-black text-gray-100 truncate">{order.client?.full_name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">{order.client?.address}</p>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-white/5 px-2 py-1 rounded-full text-gray-400">
                                            {order.equipment?.type}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selection Dynamic Detail */}
            <AnimatePresence>
                {selectedOrder && !isMapExpanded && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed bottom-0 left-0 right-0 max-w-5xl mx-auto p-10 bg-[#050608] border-t border-white/10 z-[100] rounded-t-[4rem] shadow-2xl"
                    >
                        <div className="flex gap-6 mb-10">
                            <div className="size-20 rounded-[2.5rem] bg-gradient-to-br from-[#135bec] to-[#00ff9d] flex items-center justify-center text-2xl font-black text-white">
                                {selectedOrder.client?.full_name?.substring(0, 1)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white mb-1">{selectedOrder.client?.full_name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    <Smartphone size={12} />
                                    {selectedOrder.client?.phone}
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="size-10 bg-white/5 rounded-full flex items-center justify-center">
                                <ChevronLeft className="rotate-[270deg]" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <NeonButton
                                onClick={() => openInGoogleMaps(selectedOrder.client?.latitude, selectedOrder.client?.longitude)}
                                className="w-full justify-center !text-[#00ff9d] !border-[#00ff9d] hover:!bg-[#00ff9d] hover:!text-black"
                            >
                                <Navigation size={18} />
                                <span className="ml-2">Guía GPS</span>
                            </NeonButton>
                            <NeonButton
                                onClick={() => router.push(`/service-orders/${selectedOrder.id}`)}
                                className="w-full justify-center !text-[#135bec] !border-[#135bec] hover:!bg-[#135bec] hover:!text-white"
                            >
                                <ExternalLink size={18} />
                                <span className="ml-2">Abrir Orden</span>
                            </NeonButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
