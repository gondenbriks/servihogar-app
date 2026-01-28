'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { generatePersonalizedMessage } from '../../actions/personalized-message';
import {
    ChevronLeft,
    Settings,
    MapPin,
    Phone,
    Mail,
    MessageCircle,
    Plus,
    Wrench,
    History,
    CheckCircle2,
    AlertTriangle,
    Smartphone,
    Bot,
    Sparkles,
    Send,
    RefreshCw,
    PlusCircle,
    Package,
    ArrowUpRight,
    Bell,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientProfilePage() {
    const router = useRouter();
    const params = useParams();
    const clientId = params.id as string;

    const [client, setClient] = useState<any | null>(null);
    const [equipment, setEquipment] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiMessage, setAiMessage] = useState('');

    useEffect(() => {
        if (clientId) {
            loadClientData();
        }
    }, [clientId]);

    const loadClientData = async () => {
        setIsLoading(true);
        try {
            // Fetch Client
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();

            if (clientError) throw clientError;
            setClient(clientData);

            // Fetch Equipment
            const { data: equipmentData } = await supabase
                .from('equipment')
                .select('*')
                .eq('client_id', clientId);

            setEquipment(equipmentData || []);

            // Fetch Service History
            const { data: historyData } = await supabase
                .from('service_orders')
                .select(`
                    *,
                    equipment (*),
                    technicians (full_name)
                `)
                .eq('client_id', clientId)
                .order('scheduled_at', { ascending: false });

            setHistory(historyData || []);

        } catch (error) {
            console.error('Error loading client profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateReminder = async (equipmentName: string) => {
        if (!client) return;
        setIsGenerating(true);
        try {
            const message = await generatePersonalizedMessage(client.full_name, equipmentName);
            setAiMessage(message);
        } catch (error) {
            console.error('Error generating reminder:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const sendWhatsApp = (msg: string) => {
        const url = `https://wa.me/${client?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const getMaintenanceStatus = (lastDate?: string) => {
        if (!lastDate) return { label: 'Sin Visitas', color: 'text-gray-500', bg: 'bg-gray-500/10', icon: History };
        const last = new Date(lastDate);
        const now = new Date();
        const diffInMonths = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());

        if (diffInMonths >= 12) {
            return { label: 'Vencido', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertTriangle, urgent: true };
        } else if (diffInMonths >= 10) {
            return { label: 'Próximo', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle, urgent: false };
        } else {
            return { label: 'Al día', color: 'text-[#00ff9d]', bg: 'bg-[#00ff9d]/10', icon: CheckCircle2, urgent: false };
        }
    };

    const initials = client?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'CL';
    const mStatus = getMaintenanceStatus(history[0]?.completed_at || history[0]?.scheduled_at);

    if (isLoading) return (
        <div className="bg-[#050608] min-h-screen flex flex-col items-center justify-center text-white font-sans">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Abriendo Expediente v2.0</p>
        </div>
    );

    if (!client) return (
        <div className="bg-[#050608] min-h-screen flex flex-col items-center justify-center p-8 text-center text-white font-sans">
            <AlertTriangle className="text-rose-500 size-16 mb-4 opacity-50" />
            <h3 className="text-xl font-black mb-2">Cliente no encontrado</h3>
            <button onClick={() => router.push('/clients')} className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest">
                Volver a Clientes
            </button>
        </div>
    );

    return (
        <div className="bg-[#050608] min-h-screen text-white pb-32 max-w-md mx-auto font-sans relative overflow-x-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/10 via-[#050608]/5 to-transparent pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-[60] flex items-center justify-between px-6 py-4 bg-[#050608]/80 backdrop-blur-xl border-b border-white/5">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className="size-11 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 active:bg-white/10"
                >
                    <ChevronLeft className="text-gray-300" size={24} />
                </motion.button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">Gestionar</span>
                    <h2 className="text-sm font-black uppercase tracking-[0.1em] text-white">
                        Expediente Digital
                    </h2>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.push('/settings')}
                    className="size-11 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white"
                >
                    <Settings size={20} />
                </motion.button>
            </header>

            <main className="relative z-10 px-6 mt-8">
                {/* Profile Hero */}
                <section className="flex flex-col items-center pb-8 border-b border-white/5">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="size-32 rounded-[3.5rem] bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-5xl font-black text-white shadow-[0_20px_60px_rgba(19,91,236,0.4)] border-4 border-white/10 overflow-hidden relative group">
                            <span className="relative z-10">{initials}</span>
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {mStatus.urgent && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute -top-1 -right-1 size-10 rounded-2xl bg-rose-500 border-4 border-[#050608] flex items-center justify-center shadow-lg z-20"
                            >
                                <Bell className="text-white" size={18} />
                            </motion.div>
                        )}
                        {!mStatus.urgent && mStatus.label === 'Al día' && (
                            <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-emerald-400 border-4 border-[#050608] flex items-center justify-center shadow-lg z-20">
                                <CheckCircle2 className="text-[#050608]" size={18} />
                            </div>
                        )}
                    </motion.div>

                    <div className="mt-6 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-black tracking-tight"
                        >
                            {client.full_name}
                        </motion.h1>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${mStatus.bg} ${mStatus.color}`}>
                                {mStatus.urgent && <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />}
                                {mStatus.label}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">
                                {client.category || 'REGULAR'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                        <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                            <div className="size-10 shrink-0 rounded-2xl bg-[#0a0c10] flex items-center justify-center text-primary">
                                <MapPin size={18} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Residencia</p>
                                <p className="text-xs font-bold text-gray-400 truncate">{client.address || 'Sin dirección'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                            <div className="size-10 shrink-0 rounded-2xl bg-[#0a0c10] flex items-center justify-center text-emerald-400">
                                <Smartphone size={18} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Documento</p>
                                <p className="text-xs font-bold text-gray-400 truncate">{client.national_id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- QUICK CONTACT ACTIONS (Refined Grid) --- */}
                <section className="py-8 grid grid-cols-4 gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendWhatsApp(`Hola ${client.full_name}, le contactamos de ServiHogar...`)}
                        className="col-span-2 flex items-center justify-center gap-3 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/5"
                    >
                        <MessageCircle size={20} />
                        WhatsApp
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-2xl text-primary active:bg-white/10"
                    >
                        <Phone size={20} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-2xl text-primary active:bg-white/10"
                    >
                        <Mail size={20} />
                    </motion.button>
                </section>

                {/* --- EQUIPMENT SHOWCASE --- */}
                <section className="mt-4">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Package size={14} className="text-cyan-400" />
                            Equipos Registrados
                        </h3>
                        {mStatus.urgent && (
                            <span className="bg-rose-500/20 text-rose-500 text-[8px] font-black px-2 py-0.5 rounded-lg animate-pulse border border-rose-500/30">
                                ATENCIÓN REQUERIDA
                            </span>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
                        {equipment.length > 0 ? (
                            equipment.map((eq, i) => (
                                <motion.div
                                    key={eq.id}
                                    initial={{ x: 30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="shrink-0 w-[260px] rounded-[3rem] bg-white/[0.02] border border-white/5 p-6 shadow-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                                        <Wrench size={100} />
                                    </div>

                                    <div className="size-16 rounded-[1.75rem] bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                                        <Wrench className="text-primary" size={32} />
                                    </div>

                                    <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tight">
                                        {eq.brand} <span className="text-primary">{eq.model}</span>
                                    </h4>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mt-2 tracking-widest flex items-center gap-2">
                                        <div className="size-1 rounded-full bg-gray-700" />
                                        {eq.type}
                                    </p>

                                    <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-600 font-mono">S/N: {eq.serial_number?.substring(0, 8) || '---'}</span>
                                        <div className="flex items-center gap-2 py-1 px-3 bg-emerald-500/10 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-tighter">
                                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            ÓPTIMO
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="w-full h-40 rounded-[3rem] bg-white/[0.01] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 opacity-50">
                                <Package className="text-gray-700" size={40} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">Explorar sin equipos</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* AI Retention Assistant */}
                {equipment.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-6"
                    >
                        <div className="bg-gradient-to-br from-primary via-[#041e62] to-[#041e62] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group border border-white/10">
                            {/* Glow effects */}
                            <div className="absolute -top-10 -left-10 size-40 bg-cyan-400/20 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-10 -right-10 size-40 bg-primary/20 rounded-full blur-[80px]" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-12 rounded-[1.25rem] bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                                        <Bot size={24} className="text-white drop-shadow-lg" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/60 font-black text-[9px] uppercase tracking-[0.3em]">IA Predictiva v2.0</span>
                                            <Sparkles size={10} className="text-cyan-400 animate-pulse" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white tracking-tight">Asistente de Retención ServiBot</h4>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-white mb-4 leading-tight">
                                    ¿Vender mantenimiento para el <span className="text-cyan-400">{equipment[0].brand}</span>?
                                </h3>
                                <p className="text-xs text-white/50 mb-8 leading-relaxed font-medium">
                                    El sistema detecta que han pasado más de <span className="text-white font-bold">10 meses</span> desde el último servicio. Genera un mensaje persuasivo para asegurar la visita.
                                </p>

                                <AnimatePresence mode="wait">
                                    {!aiMessage && !isGenerating ? (
                                        <motion.button
                                            key="btn-gen"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => handleGenerateReminder(equipment[0].brand)}
                                            className="w-full bg-white text-primary text-[10px] font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl hover:bg-cyan-50 transition-colors uppercase tracking-[0.1em]"
                                        >
                                            <Sparkles size={18} />
                                            Redactar Invitación con IA
                                        </motion.button>
                                    ) : isGenerating ? (
                                        <motion.div
                                            key="load"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="w-full bg-black/20 backdrop-blur-xl rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-4 border border-white/10"
                                        >
                                            <RefreshCw className="text-white animate-spin" size={24} />
                                            <span className="text-[10px] text-white font-black uppercase tracking-[0.2em] animate-pulse">ServiBot está pensando...</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="msg"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6"
                                        >
                                            <textarea
                                                className="w-full bg-transparent text-white text-sm focus:outline-none resize-none leading-relaxed font-medium mb-6 h-28 italic opacity-90"
                                                value={aiMessage}
                                                onChange={(e) => setAiMessage(e.target.value)}
                                            />
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => sendWhatsApp(aiMessage)}
                                                    className="flex-1 bg-emerald-500 text-white font-black py-5 rounded-[1.25rem] text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                                >
                                                    <Send size={18} />
                                                    Enviar
                                                </button>
                                                <button
                                                    onClick={() => setAiMessage('')}
                                                    className="size-16 bg-white/10 text-white rounded-[1.25rem] flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                                                >
                                                    <RefreshCw size={24} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* --- SERVICE HISTORY (Refined Aesthetics) --- */}
                <section className="mt-12 mb-32">
                    <div className="flex items-center gap-3 mb-8 px-1">
                        <div className="size-8 rounded-[0.75rem] bg-white/5 flex items-center justify-center text-primary border border-white/5">
                            <History size={16} />
                        </div>
                        <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em]">
                            Cronología de Soporte
                        </h3>
                    </div>

                    <div className="space-y-6 relative ml-4">
                        {/* Timeline Line */}
                        <div className="absolute left-[-17px] top-4 bottom-4 w-px bg-gradient-to-b from-primary via-white/5 to-transparent" />

                        {history.length > 0 ? (
                            history.map((order, i) => {
                                const isRepair = order.service_type === 'REPARACIÓN' || order.reported_issue?.toLowerCase().includes('falla');
                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ x: 20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.05 * i }}
                                        viewport={{ once: true }}
                                        onClick={() => router.push(`/service-orders/${order.id}`)}
                                        className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 hover:border-primary/20 transition-all active:scale-[0.98] cursor-pointer group relative"
                                    >
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-[-21px] top-8 size-2 rounded-full border-2 border-[#050608] shadow-[0_0_10px_rgba(19,91,236,0.5)] ${isRepair ? 'bg-orange-500' : 'bg-primary'}`} />

                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner ${isRepair
                                                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                    : 'bg-primary/10 text-primary border border-primary/20'
                                                    }`}>
                                                    {isRepair ? <Wrench size={24} /> : <CheckCircle2 size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-white uppercase tracking-tight line-clamp-1">
                                                        {order.equipment?.brand || 'MARCA'} {order.equipment?.model}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest italic">
                                                            {new Date(order.scheduled_at).toLocaleDateString()}
                                                        </p>
                                                        <div className="size-1 rounded-full bg-gray-800" />
                                                        <p className="text-[9px] text-gray-500 font-black uppercase">{order.equipment?.type || 'SOPORTE'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className="text-[8px] font-black text-emerald-400">$</span>
                                                    <span className="text-base font-black text-white">{Number(order.total_cost || 0).toLocaleString()}</span>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border mt-1.5 ${isRepair
                                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                    : 'bg-primary/10 text-primary border-primary/20'
                                                    }`}>
                                                    {isRepair ? 'REPARACIÓN' : 'MANTENIMIENTO'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-[#0a0c10]/50 rounded-2xl p-4 border border-white/5 space-y-3 group-hover:bg-[#0a0c10]/80 transition-colors">
                                            <div className="relative">
                                                <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.2em] block mb-1">Resumen Operativo:</span>
                                                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                                    "{order.reported_issue || 'Servicio de mantenimiento general solicitado por el cliente.'}"
                                                </p>
                                            </div>
                                            {order.technical_diagnosis && (
                                                <div className="pt-3 border-t border-white/5">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Check size={10} className="text-emerald-500" />
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Resolución Técnica</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{order.technical_diagnosis}</p>
                                                </div>
                                            )}
                                        </div>
                                        <ArrowUpRight className="absolute bottom-6 right-6 text-white/5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" size={24} />
                                    </motion.div>
                                )
                            })
                        ) : (
                            <div className="py-20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-4 opacity-30 text-center">
                                <History size={48} className="text-gray-700" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Sin registros históricos</p>
                                    <p className="text-[8px] font-bold text-gray-800 uppercase mt-1">Inicia la primera orden para este cliente</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Bottom Primary Action */}
            <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-6 z-[80]">
                <motion.button
                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(19,91,236,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/new-service?clientId=${clientId}`)}
                    className="w-full h-[70px] rounded-[2.5rem] bg-primary text-white font-black text-sm flex items-center justify-center gap-4 shadow-[0_15px_35px_rgba(19,91,236,0.4)] group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                        <Plus size={24} />
                    </div>
                    <span className="uppercase tracking-[0.2em] text-xs">Aperturar Orden de Servicio</span>
                </motion.button>
            </div>
        </div>
    );
}
