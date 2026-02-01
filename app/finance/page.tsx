'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import FinanceChart from '../../components/FinanceChart';
import {
    TrendingUp,
    TrendingDown,
    Wrench,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    X,
    CalendarDays,
    Info,
    PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProHeader from '../../components/ProHeader';
import Background from '../../components/design/Background';
import NeonButton from '../../components/design/NeonButton';

type FilterType = 'day' | 'week' | 'month' | 'custom';

export default function FinancePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<FilterType>('week');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<'admin' | 'technician'>('admin');

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole') as 'admin' | 'technician';
        if (savedRole) setUserRole(savedRole);
    }, []);

    const chartData = {
        day: {
            data: [45, 120, 80, 160, 90, 140, 110, 180],
            labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
            total: '$825',
            change: '+5%',
            trend: 'up'
        },
        week: {
            data: [150, 230, 420, 380, 290, 450, 520],
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            total: '$2,440',
            change: '+18%',
            trend: 'up'
        },
        month: {
            data: [2100, 1800, 2600, 2400],
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            total: '$8,900',
            change: '+12%',
            trend: 'up'
        },
        custom: {
            data: [300, 450, 320, 500, 480, 600],
            labels: ['D1', 'D5', 'D10', 'D15', 'D20', 'D25'],
            total: '$3,150',
            change: '-2%',
            trend: 'down'
        }
    };

    const currentView = chartData[activeTab];

    useEffect(() => {
        fetchRecentMovements();
    }, []);

    const fetchRecentMovements = async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('service_orders')
                .select('*, client:clients(full_name)')
                .order('created_at', { ascending: false })
                .limit(10);

            setRecentOrders(data || []);
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: FilterType) => {
        setActiveTab(tab);
        if (tab !== 'custom') setCustomRange({ start: '', end: '' });
    };

    const applyCustomFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveTab('custom');
        setShowFilterModal(false);
    };

    return (
        <div className="bg-background min-h-screen text-white font-outfit max-w-5xl mx-auto relative overflow-x-hidden">
            <Background />
            <ProHeader
                title="Finanzas"
                showBack
                rightElement={
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowFilterModal(true)}
                        className={`size-11 flex items-center justify-center rounded-2xl border transition-all ${activeTab === 'custom' ? 'bg-[#135bec] border-[#135bec] text-white shadow-lg' : 'bg-gray-900 border-white/5 text-[#00ff9d] hover:border-[#00ff9d]/30'}`}
                    >
                        <CalendarDays size={20} />
                    </motion.button>
                }
            />

            <main className="p-6 pb-12">
                <div className="flex p-1.5 bg-gray-900/50 border border-white/5 rounded-[2rem] mb-6 shadow-inner relative overflow-hidden">
                    {(['day', 'week', 'month'] as const).map((tab) => (
                        <NeonButton
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`flex-1 !rounded-[1.5rem] !text-[10px] !tracking-widest !py-2 transition-all ${activeTab === tab ? '!bg-white !text-black shadow-lg' : '!bg-transparent !text-gray-500 hover:!text-gray-300 !border-transparent'}`}
                        >
                            {tab === 'day' ? 'Hoy' : tab === 'week' ? 'Semana' : 'Mes'}
                        </NeonButton>
                    ))}
                </div>

                <AnimatePresence>
                    {activeTab === 'custom' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-center mb-6"
                        >
                            <span className="px-4 py-2 rounded-full bg-[#135bec]/10 text-[#135bec] text-[10px] font-black uppercase tracking-widest border border-[#135bec]/20 flex items-center gap-3">
                                <CalendarDays size={14} />
                                {customRange.start || '...'} — {customRange.end || '...'}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => handleTabChange('week')}
                                    className="size-5 rounded-full bg-[#135bec]/20 flex items-center justify-center text-[#135bec] transition-colors"
                                >
                                    <X size={10} />
                                </motion.button>
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-gray-900/60 border border-white/10 rounded-[3rem] p-8 shadow-2xl mb-10 overflow-hidden group"
                >
                    <div className={`absolute -right-16 -top-16 size-80 rounded-full blur-[140px] opacity-10 pointer-events-none transition-colors duration-1000 ${currentView.trend === 'up' ? 'bg-[#00ff9d]' : 'bg-rose-500'}`} />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1 block">Rendimiento</span>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-5xl font-black tracking-tighter text-white">
                                        {currentView.total}
                                    </h2>
                                </div>
                            </div>
                            <div className={`flex flex-col items-end gap-1 px-4 py-2.5 rounded-2xl border ${currentView.trend === 'up' ? 'bg-[#00ff9d]/5 border-[#00ff9d]/20 text-[#00ff9d]' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest">
                                    {currentView.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {currentView.change}
                                </div>
                            </div>
                        </div>

                        <div className="h-[140px] mt-8 -mx-4 transition-transform duration-500">
                            <FinanceChart
                                data={currentView.data}
                                labels={currentView.labels}
                                color={currentView.trend === 'up' ? '#00ff9d' : '#f43f5e'}
                                height={130}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Recent Movements */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Movimientos</h3>
                    <button className="text-[10px] font-black text-[#135bec] uppercase tracking-widest">Exportar</button>
                </div>

                <div className="space-y-3">
                    {isLoading ? (
                        <div className="h-24 bg-gray-900/50 border border-white/5 rounded-[2.2rem] animate-pulse" />
                    ) : (
                        recentOrders.map((order, idx) => {
                            const isExpense = idx % 4 === 3;
                            const Icon = isExpense ? ShoppingCart : idx % 3 === 1 ? PieChart : Wrench;
                            const statusColor = isExpense ? 'text-rose-500' : 'text-[#135bec]';
                            const bgColor = isExpense ? 'bg-rose-500/10' : 'bg-[#135bec]/10';

                            return (
                                <motion.div
                                    key={order.id}
                                    onClick={() => router.push(`/service-orders/${order.id}`)}
                                    className="bg-gray-900/50 border border-white/5 p-5 rounded-[2.2rem] flex items-center justify-between hover:bg-gray-800/80 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`size-14 rounded-2xl ${bgColor} border border-white/10 flex items-center justify-center ${statusColor}`}>
                                            <Icon size={26} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-black text-white truncate max-w-[140px] tracking-tight">{isExpense ? 'Gasto' : order.client?.full_name}</h4>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-base font-black ${isExpense ? 'text-white' : 'text-[#00ff9d]'} tracking-tight`}>
                                            {isExpense ? '-' : '+'}${isExpense ? (order.total_cost * 0.4).toFixed(0) : (order.total_cost || 0)}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Filter Modal */}
            <AnimatePresence>
                {showFilterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center p-6"
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-[#0a0c10] w-full max-w-5xl rounded-[3rem] border border-white/10 p-8 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="absolute top-6 right-6 p-2 bg-gray-900 rounded-full text-gray-500"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-black mb-8">Filtros</h2>

                            <form onSubmit={applyCustomFilter} className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'day', label: 'Hoy' },
                                        { id: 'week', label: 'Semana' },
                                        { id: 'month', label: 'Este Mes' }
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => { setActiveTab(f.id as any); setShowFilterModal(false); }}
                                            className="bg-gray-900 border border-white/5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rango Manual</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="date"
                                            value={customRange.start}
                                            onChange={e => setCustomRange({ ...customRange, start: e.target.value })}
                                            className="w-full bg-gray-900 border border-white/5 rounded-xl p-3 text-xs text-white"
                                        />
                                        <input
                                            type="date"
                                            value={customRange.end}
                                            onChange={e => setCustomRange({ ...customRange, end: e.target.value })}
                                            className="w-full bg-gray-900 border border-white/5 rounded-xl p-3 text-xs text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#135bec] text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl"
                                >
                                    Aplicar Filtros
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
