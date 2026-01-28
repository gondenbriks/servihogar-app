'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    ChevronLeft,
    UserPlus,
    Search,
    Shield,
    Settings,
    Mail,
    Phone,
    Wrench,
    X,
    Trash2,
    Check,
    AlertCircle,
    Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATAR_COLORS = [
    'bg-blue-600', 'bg-purple-600', 'bg-emerald-600',
    'bg-amber-500', 'bg-rose-500', 'bg-indigo-600',
    'bg-cyan-500'
];

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        specialty: 'Refrigeración',
        commission_rate: 10,
        is_active: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('technicians')
            .select('*')
            .order('full_name');

        if (data) setUsers(data);
        setIsLoading(false);
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getColorForName = (name: string) => {
        const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
    };

    const handleOpenAdd = () => {
        setFormData({
            full_name: '',
            specialty: 'Refrigeración',
            commission_rate: 10,
            is_active: true
        });
        setShowModal('add');
    };

    const handleOpenEdit = (user: any) => {
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name,
            specialty: user.specialty || 'Generalista',
            commission_rate: user.commission_rate || 10,
            is_active: user.is_active
        });
        setShowModal('edit');
    };

    const handleSave = async () => {
        if (!formData.full_name.trim()) return;
        setIsSaving(true);

        try {
            if (showModal === 'add') {
                const { error } = await supabase
                    .from('technicians')
                    .insert([formData]);
                if (error) throw error;
            } else if (showModal === 'edit' && selectedUser) {
                const { error } = await supabase
                    .from('technicians')
                    .update(formData)
                    .eq('id', selectedUser.id);
                if (error) throw error;
            }
            await fetchUsers();
            setShowModal(null);
        } catch (error) {
            console.error('Error saving technician:', error);
            alert('Error al guardar el técnico');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('technicians')
                .delete()
                .eq('id', selectedUser.id);
            if (error) throw error;
            await fetchUsers();
            setShowModal(null);
        } catch (error) {
            console.error('Error deleting technician:', error);
            alert('No se pudo eliminar el técnico. Puede tener servicios asociados.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.specialty && user.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="bg-[#050608] min-h-screen text-white font-sans max-w-5xl mx-auto relative overflow-x-hidden flex flex-col">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050608]/80 backdrop-blur-xl p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.back()}
                        className="size-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white shadow-xl"
                    >
                        <ChevronLeft size={20} />
                    </motion.button>
                    <div className="text-center">
                        <h1 className="text-sm font-black uppercase tracking-[0.4em] text-[#00ff9d]">Staff</h1>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Gestión Técnica</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenAdd}
                        className="h-11 px-6 flex items-center justify-center gap-2 rounded-2xl bg-[#00ff9d] text-[#050608] shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <UserPlus size={18} strokeWidth={3} />
                        <span className="hidden sm:inline">Nuevo Técnico</span>
                    </motion.button>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o especialidad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#00ff9d] outline-none transition-all placeholder:text-gray-600 shadow-inner"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 pb-40 relative z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="size-10 border-4 border-[#00ff9d]/20 border-t-[#00ff9d] rounded-full"
                        />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-700">
                        <Shield size={64} className="mb-4 opacity-10" />
                        <p className="font-black text-xs uppercase tracking-[0.3em]">Sin integrantes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white/[0.02] border border-white/5 p-5 rounded-[2.5rem] relative overflow-hidden transition-all shadow-2xl hover:bg-white/[0.04]"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#00ff9d]/5 to-transparent pointer-events-none ${!user.is_active && 'from-rose-500/10'}`} />

                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`size-16 rounded-[1.5rem] ${getColorForName(user.full_name)} border border-white/20 flex items-center justify-center text-xl font-black text-white shadow-xl transition-transform group-hover:scale-105`}>
                                        {getUserInitials(user.full_name)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-base font-black tracking-tight text-gray-100">{user.full_name}</h3>
                                            {!user.is_active && (
                                                <span className="bg-rose-500/20 text-rose-500 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-rose-500/30">Inactivo</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="size-4 rounded-md bg-white/5 flex items-center justify-center border border-white/5">
                                                <Wrench size={10} className="text-[#00ff9d]/70" />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                {user.specialty || 'Generalista'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
                                    <div className="flex gap-2">
                                        <motion.button whileTap={{ scale: 0.9 }} className="size-10 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                            <Phone size={16} />
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.9 }} className="size-10 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                            <Mail size={16} />
                                        </motion.button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right px-4">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Comisión</p>
                                            <p className="text-sm font-black text-[#00ff9d]">{user.commission_rate}%</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleOpenEdit(user)}
                                                className="size-10 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-emerald-400/80 hover:text-emerald-400 transition-colors"
                                            >
                                                <Edit3 size={18} />
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => { setSelectedUser(user); setShowModal('delete'); }}
                                                className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500/80 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Quick Stats Banner */}
            <div className="fixed bottom-28 left-6 right-6 z-40 bg-[#050608]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 flex justify-between shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff9d]/30 to-transparent" />
                <div className="text-center flex-1 border-r border-white/5">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black">{users.length}</p>
                </div>
                <div className="text-center flex-1 border-r border-white/5">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Activos</p>
                    <p className="text-xl font-black text-[#00ff9d]">{users.filter(u => u.is_active).length}</p>
                </div>
                <div className="text-center flex-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Eficacia</p>
                    <p className="text-xl font-black text-[#00d4ff]">92%</p>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end justify-center p-6"
                    >
                        {showModal === 'delete' ? (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="bg-[#050608] w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 shadow-2xl relative"
                            >
                                <div className="size-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 mx-auto">
                                    <AlertCircle size={32} />
                                </div>
                                <h2 className="text-xl font-black text-center mb-2 uppercase tracking-tight">¿Eliminar Técnico?</h2>
                                <p className="text-gray-500 text-xs text-center mb-10 leading-relaxed uppercase tracking-widest">
                                    Esta acción es irreversible. Se eliminará el perfil de <span className="text-white">{selectedUser?.full_name}</span>.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowModal(null)}
                                        className="flex-1 bg-white/5 text-gray-400 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isSaving}
                                        className="flex-1 bg-rose-500 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? '...' : 'Eliminar'}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="bg-[#050608] w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 shadow-2xl relative"
                            >
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowModal(null)}
                                    className="absolute top-6 right-6 size-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white"
                                >
                                    <X size={20} />
                                </motion.button>

                                <h2 className="text-2xl font-black mb-1 flex items-center gap-3 uppercase tracking-tighter italic">
                                    {showModal === 'add' ? <UserPlus className="text-[#00ff9d]" /> : <Edit3 className="text-[#00d4ff]" />}
                                    <span className={showModal === 'add' ? 'text-[#00ff9d]' : 'text-[#00d4ff]'}>
                                        {showModal === 'add' ? 'Nuevo Perfil' : 'Editar Perfil'}
                                    </span>
                                </h2>
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Configuración de credenciales de equipo</p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Ej: Roberto Sánchez"
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#00ff9d] outline-none shadow-inner"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Especialidad</label>
                                            <select
                                                value={formData.specialty}
                                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#135bec] outline-none appearance-none"
                                            >
                                                <option className="bg-gray-900">Refrigeración</option>
                                                <option className="bg-gray-900">Lavado</option>
                                                <option className="bg-gray-900">Climatización</option>
                                                <option className="bg-gray-900">Electrónica</option>
                                                <option className="bg-gray-900">Generalista</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Comisión (%)</label>
                                            <input
                                                type="number"
                                                value={formData.commission_rate}
                                                onChange={(e) => setFormData({ ...formData, commission_rate: parseInt(e.target.value) })}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#135bec] outline-none shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded-lg flex items-center justify-center ${formData.is_active ? 'bg-[#00ff9d]/20 text-[#00ff9d]' : 'bg-gray-800 text-gray-500'}`}>
                                                <Check size={18} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Perfil Activo</span>
                                        </div>
                                        <div
                                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.is_active ? 'bg-[#00ff9d]' : 'bg-gray-800'}`}
                                        >
                                            <motion.div animate={{ x: formData.is_active ? 24 : 0 }} className="size-4 bg-white rounded-full" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !formData.full_name.trim()}
                                        className={`w-full ${showModal === 'add' ? 'bg-[#00ff9d]' : 'bg-[#135bec]'} text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4 disabled:opacity-50`}
                                    >
                                        {isSaving ? 'Procesando...' : (showModal === 'add' ? 'Crear Perfil' : 'Actualizar Cambios')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
