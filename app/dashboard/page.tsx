'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    BarChart3,
    Clock,
    CheckCircle2,
    Wallet,
    ArrowUpRight,
    Plus,
    Wrench,
    MapPin,
    Navigation,
    Route,
    Grid,
    Bell,
    Smartphone,
    UserCircle,
    ChevronDown,
    Lock,
    LogOut,
    Search,
    Bot,
    ScanBarcode,
    BookOpen,
    Users,
    PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProHeader from '../../components/ProHeader';
import Background from '../../components/design/Background';
import NeonButton from '../../components/design/NeonButton';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalBilled: 0,
        pendingOrders: 0,
        completedOrders: 0,
        activeTechnicians: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'technician'>('admin');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchRecentOrders();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch Total Billed
            const { data: billingData } = await supabase
                .from('service_orders')
                .select('total_cost')
                .eq('status', 'DELIVERED');

            const total = billingData?.reduce((acc: number, curr: any) => acc + (Number(curr.total_cost) || 0), 0) || 0;

            // Fetch Pending Orders
            const { count: pendingCount } = await supabase
                .from('service_orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['PENDING', 'DIAGNOSIS', 'IN_PROGRESS']);

            // Fetch Completed Orders
            const { count: completedCount } = await supabase
                .from('service_orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'COMPLETED');

            // Fetch Active Technicians
            const { count: activeTechsCount } = await supabase
                .from('technicians')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            setStats({
                totalBilled: total,
                pendingOrders: pendingCount || 0,
                completedOrders: completedCount || 0,
                activeTechnicians: activeTechsCount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentOrders = async () => {
        const { data } = await supabase
            .from('service_orders')
            .select('*, client:clients(full_name), equipment:equipment(type, brand)')
            .order('created_at', { ascending: false })
            .limit(5);
        setRecentOrders(data || []);
    };

    const StatCard = ({ title, value, icon: Icon, color, restricted = false, href }: any) => {
        const CardContent = (
            <div className={`h-full bg-gray-900/40 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group transition-all hover:border-white/10 ${restricted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer active:scale-[0.98]'}`}>
                <div className={`absolute -right-4 -top-4 size-32 ${color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-')}/10 border border-white/5`}>
                        <Icon size={24} className={color.replace('bg-', 'text-')} />
                    </div>
                    {!restricted ? <ArrowUpRight size={18} className="text-gray-600 group-hover:text-white transition-colors" /> : <Lock size={16} className="text-gray-700" />}
                </div>

                <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</p>
                    {restricted ? (
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-24 bg-gray-800 rounded-lg animate-pulse" />
                        </div>
                    ) : (
                        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
                    )}
                </div>

                {restricted && (
                    <div className="absolute inset-0 bg-[#0a0c10]/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 bg-black/80 px-3 py-1.5 rounded-full border border-white/10">Solo Admin</p>
                    </div>
                )}
            </div>
        );

        if (restricted || !href) return CardContent;
        return <Link href={href} className="block h-full">{CardContent}</Link>;
    };

    const QuickAction = ({ icon: Icon, label, color, onClick }: any) => (
        <NeonButton
            onClick={onClick}
            className={`!p-0 !rounded-2xl border border-white/10 ${color} !bg-transparent active:scale-95 transition-all group-hover:scale-105 flex items-center gap-4`}
        >
            <div className={`w-full h-full flex items-center gap-4 p-1 pr-4`}>
                <div className={`size-14 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest min-w-[120px] text-right">
                    {label}
                </span>
            </div>
        </NeonButton>
    );

    return (
        <div className="min-h-screen bg-background text-white font-outfit relative overflow-x-hidden">
            <Background />
            <ProHeader
                title="ServiTech Pro"
                rightElement={
                    <div
                        className="flex items-center gap-2 cursor-pointer bg-gray-900/50 hover:bg-gray-800/80 border border-white/5 rounded-full p-1 pr-3 transition-all group relative mr-2"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="relative">
                            <div className="size-8 rounded-full bg-gradient-to-br from-[#135bec] to-purple-600 flex items-center justify-center font-black text-xs border-background-dark shadow-xl">
                                CR
                            </div>
                        </div>
                        <ChevronDown size={12} className={`text-gray-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-12 right-0 w-48 bg-[#0a0c10] border border-white/10 rounded-3xl shadow-2xl p-2 z-[110]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => { setUserRole(userRole === 'admin' ? 'technician' : 'admin'); setShowProfileMenu(false); }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-900 rounded-2xl transition-colors"
                                    >
                                        <div className="size-8 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400">
                                            {userRole === 'admin' ? <Smartphone size={16} /> : <UserCircle size={16} />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Cambiar Rol</span>
                                    </button>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button className="w-full flex items-center gap-3 p-3 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-colors">
                                        <div className="size-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                            <LogOut size={16} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Cerrar Sesión</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                }
            />

            <main className="max-w-7xl mx-auto px-6 pt-8 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Stats & Finance Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Resumen Ejecutivo</h2>
                            {userRole === 'admin' ? (
                                <Link href="/finance" className="text-[9px] font-black uppercase text-[#135bec] flex items-center gap-1">Auditoría <ArrowUpRight size={10} /></Link>
                            ) : (
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-700"><Lock size={10} /> Privado</div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <StatCard
                                title="Ingresos Netos"
                                value={`$${stats.totalBilled.toLocaleString()}`}
                                icon={Wallet}
                                color="bg-[#00ff9d]"
                                restricted={userRole !== 'admin'}
                                href="/finance"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    title="Pendientes"
                                    value={stats.pendingOrders}
                                    icon={Clock}
                                    color="bg-[#135bec]"
                                    href="/agenda"
                                />
                                <StatCard
                                    title="Completados"
                                    value={stats.completedOrders}
                                    icon={CheckCircle2}
                                    color="bg-[#00d4ff]"
                                    href="/agenda"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    title="IA Predictiva"
                                    value="94.2%"
                                    icon={BarChart3}
                                    color="bg-purple-600"
                                />
                                <StatCard
                                    title="Equipo Staff"
                                    value={stats.activeTechnicians}
                                    icon={Users}
                                    color="bg-emerald-500"
                                    href="/users"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {/* Logistics Center Card */}
                        <section>
                            <div className="flex justify-between items-center mb-5 px-2">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Logística de Hoy</h2>
                                <Link href="/logistics" className="text-[10px] font-black text-[#00ff9d] uppercase tracking-widest flex items-center gap-2 bg-[#00ff9d]/5 px-3 py-1.5 rounded-full border border-[#00ff9d]/10 transition-colors hover:bg-[#00ff9d]/10">
                                    Optimizar <Navigation size={12} />
                                </Link>
                            </div>

                            <Link href="/logistics">
                                <div className="bg-gradient-to-br from-[#135bec]/20 to-purple-600/10 border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group active:scale-[0.99] transition-all shadow-2xl">
                                    <div className={`absolute top-0 right-0 w-64 h-full bg-[#135bec] opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity`} />

                                    <div className="relative z-10 flex items-center gap-8">
                                        <div className="size-20 rounded-3xl bg-white text-[#135bec] flex items-center justify-center shadow-[0_20px_40px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform duration-500">
                                            <Route size={40} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black tracking-tighter">Centro de Rutas</h3>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-2 flex items-center gap-2">
                                                <MapPin size={12} className="text-[#00ff9d]" /> {stats.pendingOrders} paradas inteligentes calculadas
                                            </p>
                                        </div>
                                        <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-[#135bec] group-hover:border-[#135bec] transition-all">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                                        <div className="animate-pulse">
                                            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 100C10 50.2944 50.2944 10 100 10C149.706 10 190 50.2944 190 100C190 149.706 149.706 190 100 190" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 10" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </section>

                        {/* Recent Services List */}
                        <section>
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Últimas Intervenciones</h2>
                                <Link href="/agenda" className="text-[10px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-2 hover:bg-[#135bec]/5 px-3 py-1.5 rounded-full transition-colors">
                                    Historial Completo <ArrowUpRight size={12} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentOrders.map((order, idx) => {
                                    const isWarrantyActive = order.warranty_expiration && new Date(order.warranty_expiration) > new Date();
                                    return (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Link href={`/service-orders/${order.id}`}>
                                                <div className="bg-gray-900/40 border border-white/5 p-5 rounded-[2.5rem] flex flex-col hover:bg-gray-800/80 hover:border-white/10 transition-all group relative overflow-hidden">
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'COMPLETED' ? 'bg-[#00ff9d]' : 'bg-[#135bec]'} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-14 rounded-2xl bg-gray-950 flex items-center justify-center text-[#135bec] group-hover:scale-110 transition-transform shadow-xl">
                                                                <Wrench size={24} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <h4 className="text-sm font-black text-white truncate max-w-[120px]">{order.equipment?.brand || 'Genérico'} {order.equipment?.type}</h4>
                                                                    {isWarrantyActive && (
                                                                        <span className="bg-[#00ff9d]/10 text-[#00ff9d] text-[7px] px-1.5 py-0.5 rounded-md font-black uppercase border border-[#00ff9d]/20">Garantía</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.client?.full_name}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[8px] px-2.5 py-1.5 rounded-xl font-black uppercase tracking-widest border transition-colors ${order.status === 'COMPLETED' ? 'bg-[#00ff9d]/5 text-[#00ff9d] border-[#00ff9d]/20' : 'bg-[#135bec]/5 text-[#135bec] border-[#135bec]/20'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Clock size={12} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Hace 2 horas</span>
                                                        </div>
                                                        <ArrowUpRight size={16} className="text-gray-700 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Expandable FAB Quick Actions */}
            <div className="fixed bottom-28 md:bottom-12 right-6 md:right-12 z-[100] flex flex-col items-end gap-6 pointer-events-none">
                <AnimatePresence>
                    {isFabOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1] pointer-events-auto"
                                onClick={() => setIsFabOpen(false)}
                            />
                            <div className="flex flex-col items-end gap-6 h-auto">
                                <QuickAction
                                    icon={BookOpen}
                                    label="Biblioteca"
                                    color="bg-gray-900 border border-white/10"
                                    onClick={() => { router.push('/library'); setIsFabOpen(false); }}
                                />
                                <QuickAction
                                    icon={Smartphone}
                                    label="Escanear Equipo"
                                    color="bg-gray-900 border border-white/10"
                                    onClick={() => { router.push('/scanner'); setIsFabOpen(false); }}
                                />
                                <QuickAction
                                    icon={Bot}
                                    label="Asistente IA"
                                    color="bg-purple-600 shadow-purple-600/20"
                                    onClick={() => { router.push('/ai-assistant'); setIsFabOpen(false); }}
                                />
                                <QuickAction
                                    icon={Plus}
                                    label="Nuevo Servicio"
                                    color="bg-[#135bec] shadow-[#135bec]/20"
                                    onClick={() => { router.push('/new-service'); setIsFabOpen(false); }}
                                />
                            </div>
                        </>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`pointer-events-auto size-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 z-[110] relative overflow-hidden group ${isFabOpen ? 'bg-gray-900 border border-white/20 rotate-[135deg]' : 'bg-[#135bec] hover:scale-110 active:scale-90'}`}
                >
                    {!isFabOpen && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#135bec] to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <Plus size={32} className={`relative z-10 text-white transition-opacity ${isFabOpen ? 'opacity-60' : 'opacity-100'}`} />
                </button>
            </div>

        </div>
    );
}
