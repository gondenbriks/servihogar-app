'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Users,
    UserPlus,
    Search,
    Shield,
    Settings,
    Mail,
    Smartphone,
    Wrench,
    X,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Copy,
    Share2,
    Crown
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import ProHeader from '../../components/ProHeader';
import InviteMemberModal from '../../components/InviteMemberModal';

// Force dynamic rendering to avoid build-time errors with Supabase client
export const dynamic = 'force-dynamic';

export default function TeamPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [team, setTeam] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        setCurrentUser(user);

        // Fetch user profile and team
        const { data: profile } = await supabase
            .from('profiles')
            .select('*, teams(*)')
            .eq('id', user.id)
            .single();

        if (profile?.teams) {
            setTeam(profile.teams);

            // Fetch team members
            const { data: membersData } = await supabase
                .from('profiles')
                .select('*')
                .eq('team_id', profile.teams.id);

            setMembers(membersData || []);
        }
        setIsLoading(false);
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar a este miembro del equipo?')) return;

        const { error } = await supabase
            .from('profiles')
            .update({ team_id: null, role: 'solo_technician' })
            .eq('id', memberId);

        if (error) {
            alert('Error al eliminar miembro');
        } else {
            fetchData();
        }
    };

    const filteredMembers = members.filter(member =>
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050608] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="size-10 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full"
                />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="bg-[#050608] min-h-screen text-white font-sans max-w-5xl mx-auto flex flex-col p-6 items-center justify-center text-center">
                <div className="size-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                    <Shield size={32} />
                </div>
                <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">Acceso No Autorizado</h1>
                <p className="text-gray-500 text-sm max-w-xs uppercase tracking-widest leading-loose">
                    Parece que no tienes un equipo activo. Si tienes el Plan Equipos, asegúrate de haber inicializado tu equipo en el registro.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-8 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#050608] min-h-screen text-white font-sans max-w-5xl mx-auto relative overflow-x-hidden flex flex-col border-x border-white/5">
            <ProHeader
                title="Gestión de Equipo"
                showBack
                rightElement={
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="size-11 rounded-2xl bg-[#135bec] flex items-center justify-center text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] hover:scale-105 transition-all"
                    >
                        <UserPlus size={20} />
                    </button>
                }
            />

            <main className="p-6 space-y-10 pb-32 relative z-10">
                {/* Team Info Header */}
                <section className="bg-gradient-to-br from-[#135bec]/10 to-[#00ff9d]/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="size-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-2xl">
                            <Crown size={32} className="text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{team.name}</h2>
                            <p className="text-[10px] font-black text-[#135bec] uppercase tracking-[0.3em] mt-1">Administrador: {members.find(m => m.id === team.owner_id)?.full_name || 'Tú'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Miembros Totales</p>
                            <p className="text-2xl font-black">{members.length}</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Plan</p>
                            <p className="text-2xl font-black text-[#00ff9d]">EQUIPOS</p>
                        </div>
                    </div>
                </section>

                {/* Search and Filters */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar miembros por nombre o rol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] outline-none transition-all placeholder:text-gray-600 shadow-inner"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>

                {/* Members List */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Integrantes del Equipo</h3>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredMembers.map((member, idx) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-white/[0.02] border border-white/5 p-5 rounded-[2.5rem] flex items-center justify-between hover:bg-white/[0.04] transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center text-xl font-black text-white shadow-xl relative">
                                            {member.full_name?.[0]?.toUpperCase() || 'U'}
                                            {member.role === 'admin' && (
                                                <div className="absolute -top-1 -right-1 size-5 bg-amber-400 rounded-full flex items-center justify-center text-[#050608] border-2 border-[#050608]">
                                                    <Crown size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-100">{member.full_name || 'Sin Nombre'}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${member.role === 'admin' ? 'bg-[#135bec]/20 text-[#135bec]' : 'bg-gray-800 text-gray-500'}`}>
                                                    {member.role === 'admin' ? 'Administrador' : 'Técnico'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {member.id !== currentUser.id && member.role !== 'admin' && (
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="size-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        )}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-xl"
                                        >
                                            <Smartphone size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            </main>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                teamId={team.id}
            />
        </div>
    );
}
