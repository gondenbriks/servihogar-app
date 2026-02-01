'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Link as LinkIcon, Copy, Loader2, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
}

export default function InviteMemberModal({ isOpen, onClose, teamId }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const generateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Check current member count
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', teamId);

        if (countError) {
            console.error('Error checking team limit:', countError);
            setLoading(false);
            return;
        }

        // Enforce Standard Plan limit (3 members)
        const PLAN_LIMIT = 3;
        if (count !== null && count >= PLAN_LIMIT) {
            alert(`Has alcanzado el límite de ${PLAN_LIMIT} miembros de tu Plan Estándar. Actualiza tu plan para agregar más miembros.`);
            setLoading(false);
            return;
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        const { error } = await supabase.from('team_invitations').insert({
            team_id: teamId,
            email: email || null,
            token: token,
            expires_at: expiresAt.toISOString()
        });

        if (error) {
            console.error('Error generating invite:', error);
            setLoading(false);
            return;
        }

        const fullLink = `${window.location.origin}/register?invitation=${token}`;
        setInviteLink(fullLink);
        setLoading(false);
    };

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-[#0a0c10] border border-white/10 rounded-[2.5rem] p-8 relative z-10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8">
                            <div className="size-14 rounded-3xl bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center text-[#135bec] mb-4">
                                <LinkIcon size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-white">Invitar <span className="text-[#135bec]">Miembro</span></h2>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Expanda su equipo de trabajo</p>
                        </div>

                        {!inviteLink ? (
                            <form onSubmit={generateInvite} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email del Técnico (Opcional)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#135bec] hover:bg-[#1e66ff] text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(19,91,236,0.3)] transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generar Link de Invitación'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2 text-green-500 mb-2">
                                        <CheckCircle2 size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest">Link Generado Exitosamente</span>
                                    </div>
                                    <p className="text-xs text-gray-400">Comparte este link con la persona que deseas invitar. Expira en 7 días.</p>
                                </div>

                                <div className="relative">
                                    <input
                                        readOnly
                                        value={inviteLink}
                                        className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-4 pr-14 text-xs text-gray-400 font-mono outline-none"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-[#135bec] flex items-center justify-center text-white hover:bg-[#1e66ff] transition-all"
                                    >
                                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setInviteLink(null)}
                                    className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Crear Otra Invitación
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
