'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Store,
    Edit3,
    Save,
    Users,
    Wrench,
    TrendingUp,
    MapPin,
    Phone,
    Mail,
    Plus,
    X,
    Trash2,
    CreditCard,
    BadgeCheck,
    Smartphone,
    Building2,
    Check,
    Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ProHeader from '../../components/ProHeader';

export default function BusinessProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [stats, setStats] = useState({
        employees: 0,
        services: 0,
        earnings: '0'
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [newPayment, setNewPayment] = useState({ type: '', account_number: '', bank_name: '', holder_name: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: profiles, error: profileError } = await supabase
                .from('business_profiles')
                .select('*')
                .limit(1);

            if (profileError) throw profileError;

            if (profiles && profiles.length > 0) {
                const currentProfile = profiles[0];
                setProfile(currentProfile);

                const { data: payments } = await supabase
                    .from('payment_methods')
                    .select('*')
                    .eq('business_id', currentProfile.id);

                setPaymentMethods(payments || []);
            }
            fetchRealStats();
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRealStats = async () => {
        try {
            const { count: techCount } = await supabase
                .from('technicians')
                .select('*', { count: 'exact', head: true });

            const { data: orders, count: orderCount } = await supabase
                .from('service_orders')
                .select('total_cost', { count: 'exact' });

            const totalEarnings = orders?.reduce((acc, order) => acc + (Number(order.total_cost) || 0), 0) || 0;

            setStats({
                employees: techCount || 0,
                services: orderCount || 0,
                earnings: totalEarnings > 1000 ? `${(totalEarnings / 1000).toFixed(1)}k` : `${totalEarnings}`
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSaveProfile = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('business_profiles')
                .update({
                    name: profile.name,
                    tax_id: profile.tax_id,
                    address: profile.address,
                    phone: profile.phone,
                    email: profile.email
                })
                .eq('id', profile.id);

            if (error) throw error;
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al guardar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    const togglePaymentMethod = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('payment_methods')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setPaymentMethods(prev => prev.map(pm =>
                pm.id === id ? { ...pm, is_active: !currentStatus } : pm
            ));
        } catch (error) {
            console.error('Error toggling payment method:', error);
        }
    };

    const handleAddPaymentMethod = async () => {
        if (!newPayment.type || !profile) return;
        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .insert([{
                    business_id: profile.id,
                    type: newPayment.type,
                    bank_name: newPayment.bank_name,
                    account_number: newPayment.account_number,
                    holder_name: newPayment.holder_name,
                    is_active: true
                }])
                .select();

            if (error) throw error;

            if (data) {
                setPaymentMethods(prev => [...prev, data[0]]);
            }

            setShowPaymentModal(false);
            setNewPayment({ type: '', account_number: '', bank_name: '', holder_name: '' });
        } catch (error) {
            console.error('Error adding payment method:', error);
            alert('Error al agregar el método de pago');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePaymentMethod = async (id: string) => {
        if (!window.confirm("¿Eliminar este método de pago?")) return;
        try {
            const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
        } catch (error) {
            console.error('Error deleting payment method:', error);
        }
    };

    if (isLoading) return (
        <div className="bg-[#050608] min-h-screen flex flex-col items-center justify-center text-white font-sans">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Sincronizando...</p>
        </div>
    );

    return (
        <div className="bg-[#050608] min-h-screen text-white pb-24 max-w-5xl mx-auto font-sans overflow-x-hidden relative border-x border-white/5">
            <ProHeader
                title="Corporativo"
                showBack
                rightElement={
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.push('/settings')}
                        className="size-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10"
                    >
                        <Settings size={20} />
                    </motion.button>
                }
            />

            <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-[#135bec]/20 to-transparent z-0" />
                <div className="absolute -bottom-12 left-0 w-full px-6 z-10">
                    <div className="flex items-end gap-5">
                        <div className="size-24 rounded-[2rem] bg-[#0a0c12] border-4 border-[#050608] shadow-2xl flex items-center justify-center">
                            <Store size={40} className="text-[#135bec]" />
                        </div>
                        <div className="flex-1 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#135bec]">EMPRESA VERIFICADA</span>
                            <h1 className="text-xl font-black text-white leading-none mt-1">{profile.name}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mt-16 px-6 space-y-8">
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-5 rounded-3xl">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID FISCAL</p>
                        <p className="text-xs text-gray-400 font-mono mt-1">{profile.tax_id || 'N/A'}</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isEditing ? 'bg-emerald-500 text-white' : 'bg-[#135bec] text-white'}`}
                    >
                        {isSaving ? '...' : isEditing ? 'Guardar' : 'Editar'}
                    </motion.button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Técnicos', val: stats.employees, icon: <Users size={20} />, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                        { label: 'Servicios', val: stats.services, icon: <Wrench size={20} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                        { label: 'Ingresos', val: `$${stats.earnings}`, icon: <TrendingUp size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/[0.02] p-5 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center">
                            <div className={`size-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                                {stat.icon}
                            </div>
                            <span className="text-lg font-black text-white">{stat.val}</span>
                            <span className="text-[9px] text-gray-500 uppercase font-black">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Información de Contacto</h3>
                    <div className="bg-white/[0.02] rounded-[2.5rem] p-6 border border-white/5 space-y-6">
                        {[
                            { label: 'Dirección', val: profile.address, icon: <MapPin size={18} />, key: 'address' },
                            { label: 'Teléfono', val: profile.phone, icon: <Phone size={18} />, key: 'phone' },
                            { label: 'Email', val: profile.email, icon: <Mail size={18} />, key: 'email' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="size-10 rounded-2xl bg-[#0a0c12] border border-white/5 flex items-center justify-center text-gray-500">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.label}</p>
                                    {isEditing ? (
                                        <input
                                            value={item.val || ''}
                                            onChange={(e) => setProfile({ ...profile, [item.key]: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white mt-1"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-200 font-medium mt-1">{item.val || '---'}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0a0c12] w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 relative z-10">
                            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-6">Nuevo Método de Pago</h3>
                            <div className="space-y-4">
                                <input placeholder="Tipo (Zelle, Nequi...)" value={newPayment.type} onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })} className="w-full bg-[#050608] border border-white/5 rounded-2xl p-4 text-xs text-white" />
                                <input placeholder="Banco" value={newPayment.bank_name} onChange={(e) => setNewPayment({ ...newPayment, bank_name: e.target.value })} className="w-full bg-[#050608] border border-white/5 rounded-2xl p-4 text-xs text-white" />
                                <input placeholder="Número de cuenta" value={newPayment.account_number} onChange={(e) => setNewPayment({ ...newPayment, account_number: e.target.value })} className="w-full bg-[#050608] border border-white/5 rounded-2xl p-4 text-xs text-white" />
                                <input placeholder="Titular" value={newPayment.holder_name} onChange={(e) => setNewPayment({ ...newPayment, holder_name: e.target.value })} className="w-full bg-[#050608] border border-white/5 rounded-2xl p-4 text-xs text-white" />
                                <button onClick={handleAddPaymentMethod} className="w-full py-4 bg-[#135bec] rounded-2xl font-black text-white uppercase tracking-widest text-[10px] mt-4">Vincular Método</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
