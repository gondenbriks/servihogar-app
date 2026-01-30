'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Bell,
    Wrench,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Calendar,
    ChevronRight,
    LucideIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
    id: string;
    type: 'maintenance' | 'system' | 'alert';
    title: string;
    description: string;
    date: Date;
    read: boolean;
    data?: any;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // 1. Fetch maintenance alerts
            const { data: serviceOrders, error: orderError } = await supabase
                .from('service_orders')
                .select(`
                    id,
                    completed_at,
                    next_maintenance_date,
                    equipment_id,
                    equipment (
                        id,
                        type,
                        brand,
                        model
                    ),
                    clients (
                        full_name
                    )
                `)
                .or(`status.eq.DELIVERED,status.eq.COMPLETED`)
                .order('completed_at', { ascending: false });

            if (orderError) throw orderError;

            const maintenanceAlerts: Notification[] = [];
            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);

            // Group by equipment to get the LATEST service for each
            const latestServicesMap = new Map<string, any>();

            serviceOrders?.forEach(order => {
                const equipmentId = (order as any).equipment_id;
                if (equipmentId && !latestServicesMap.has(equipmentId)) {
                    latestServicesMap.set(equipmentId, order);
                }
            });

            latestServicesMap.forEach((order) => {
                let isAlert = false;
                let alertDate = new Date();

                if (order.next_maintenance_date) {
                    const maintenanceDate = new Date(order.next_maintenance_date);
                    // Alert if date is past OR within next 30 days
                    if (maintenanceDate <= thirtyDaysFromNow) {
                        isAlert = true;
                        alertDate = maintenanceDate;
                    }
                } else if (order.completed_at) {
                    // Fallback for old orders: 6 months after completion
                    const completedDate = new Date(order.completed_at);
                    const sixMonthsLater = new Date(completedDate);
                    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

                    if (sixMonthsLater <= thirtyDaysFromNow) {
                        isAlert = true;
                        alertDate = sixMonthsLater;
                    }
                }

                if (isAlert) {
                    const equipmentBrand = order.equipment?.brand || 'Equipo';
                    const clientName = order.clients?.full_name || 'Cliente';

                    maintenanceAlerts.push({
                        id: `maint-${order.id}`,
                        type: 'maintenance',
                        title: 'Mantenimiento Preventivo',
                        description: `El equipo ${equipmentBrand} (${clientName}) tiene programado su mantenimiento para el ${alertDate.toLocaleDateString()}.`,
                        date: alertDate,
                        read: false,
                        data: order
                    });
                }
            });

            // 2. Add some "system" notifications for realism
            const systemNotifications: Notification[] = [
                {
                    id: 'sys-1',
                    type: 'system',
                    title: 'Corte de Facturación',
                    description: 'Se ha generado el resumen mensual de servicios completados.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                    read: false
                },
                {
                    id: 'sys-2',
                    type: 'alert',
                    title: 'Stock Bajo',
                    description: 'Quedan menos de 5 unidades de "Filtro de Agua Universal".',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                    read: true
                }
            ];

            setNotifications([...maintenanceAlerts, ...systemNotifications].sort((a, b) => b.date.getTime() - a.date.getTime()));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string): LucideIcon => {
        switch (type) {
            case 'maintenance': return Wrench;
            case 'alert': return AlertTriangle;
            default: return Bell;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'maintenance': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'alert': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-[#135bec] bg-[#135bec]/10 border-[#135bec]/20';
        }
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0c10] border-l border-white/5 z-[120] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec]">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-white">Notificaciones</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Alertas y Sistema</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                                    <div className="size-8 border-2 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando alertas...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                                    <CheckCircle2 size={48} className="mb-4 opacity-10" />
                                    <p className="font-bold text-sm">No tienes notificaciones pendientes</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.map((notif) => {
                                        const Icon = getIcon(notif.type);
                                        const colors = getColor(notif.type);

                                        return (
                                            <div
                                                key={notif.id}
                                                className={`group bg-gray-900/40 border border-white/5 rounded-[2rem] p-5 hover:bg-gray-800/60 transition-all cursor-pointer relative overflow-hidden ${!notif.read ? 'ring-1 ring-[#135bec]/30' : ''}`}
                                            >
                                                {!notif.read && (
                                                    <div className="absolute top-4 right-4 size-2 bg-[#135bec] rounded-full animate-pulse" />
                                                )}

                                                <div className="flex gap-4">
                                                    <div className={`shrink-0 size-12 rounded-2xl flex items-center justify-center border ${colors}`}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="text-sm font-black text-white truncate pr-4">{notif.title}</h3>
                                                            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase tracking-tighter whitespace-nowrap">
                                                                <Clock size={10} />
                                                                {formatDistanceToNow(notif.date, { addSuffix: true, locale: es })}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                                            {notif.description}
                                                        </p>

                                                        {notif.type === 'maintenance' && (
                                                            <div className="mt-4 flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="size-6 rounded-lg bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                                        <Calendar size={12} />
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-500 font-bold">Último: {notif.date.toLocaleDateString()}</span>
                                                                </div>
                                                                <button className="text-[10px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                                                    Agendar <ChevronRight size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5">
                            <button className="w-full py-4 bg-gray-900/50 border border-white/5 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white hover:border-white/10 transition-all">
                                Marcar todas como leídas
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
