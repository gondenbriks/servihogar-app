'use client';

import { useState, useEffect, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Mail, Lock, Loader2, Sparkles, LogIn } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#135bec]" size={40} />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterContent() {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountType, setAccountType] = useState<'solo' | 'team'>('solo');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [invitation, setInvitation] = useState<any>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );

    useEffect(() => {
        const plan = searchParams.get('plan');
        const token = searchParams.get('invitation');

        if (token) {
            checkInvitation(token);
        } else if (plan === 'team') {
            setAccountType('team');
        } else if (plan === 'pro' || plan === 'free') {
            setAccountType('solo');
        }
    }, [searchParams]);

    const checkInvitation = async (token: string) => {
        const { data, error } = await supabase
            .from('team_invitations')
            .select('*, teams(name)')
            .eq('token', token)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single();

        if (data) {
            setInvitation(data);
            setEmail(data.email || '');
            setAccountType('solo'); // Members are technicians
        } else {
            setError('La invitación no es válida o ha expirado');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: fullName,
                        account_type: accountType,
                        business_name: businessName,
                        role: invitation ? 'technician' : (accountType === 'team' ? 'admin' : 'solo_technician'),
                        invitation_token: invitation?.token || null
                    }
                },
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 font-sans text-white relative overflow-hidden">
            {/* Decorative Glows */}
            <div className="absolute top-[-10%] left-[-10%] size-[400px] bg-[#135bec] opacity-10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] size-[400px] bg-[#00ff9d] opacity-10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center size-16 bg-[#135bec]/10 rounded-3xl border border-[#135bec]/20 mb-4 shadow-[0_0_20px_rgba(19,91,236,0.2)]">
                        <UserPlus className="text-[#135bec]" size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">
                        {invitation ? 'Unirse al' : 'Crear'} <span className="text-[#135bec]">{invitation ? 'Equipo' : 'Cuenta'}</span>
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                        {invitation ? `Únete a ${invitation.teams?.name}` : 'Únete a la plataforma ServiTech'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleRegister} className="space-y-5 bg-gray-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                        {!invitation && (
                            <div className="p-1.5 bg-black/40 rounded-2xl border border-gray-800 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAccountType('solo')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accountType === 'solo' ? 'bg-[#135bec] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Independiente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAccountType('team')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accountType === 'team' ? 'bg-[#135bec] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Empresa / Equipo
                                </button>
                            </div>
                        )}

                        {invitation && (
                            <div className="p-4 bg-[#135bec]/10 border border-[#135bec]/20 rounded-2xl mb-4">
                                <p className="text-[10px] font-black text-[#135bec] uppercase tracking-widest mb-1">Has sido invitado a:</p>
                                <p className="text-sm font-bold text-white">{invitation.teams?.name}</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 text-xs font-bold text-center">
                                ¡Cuenta creada con éxito!<br />Revisa tu correo para confirmar. Re-dirigiendo...
                            </div>
                        )}

                        {!success && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Juan Pérez"
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {accountType === 'team' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre de la Empresa</label>
                                        <div className="relative">
                                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                placeholder="ServiTech Solutions"
                                                className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email {accountType === 'team' ? 'Corporativo' : ''}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            disabled={!!invitation}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tecnico@servitech.pro"
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#135bec] hover:bg-[#1e66ff] text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(19,91,236,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-widest text-sm">
                                                {invitation ? 'Unirse al Equipo' : `Registrar mi ${accountType === 'solo' ? 'Cuenta Solo' : 'Equipo'}`}
                                            </span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </form>
                </motion.div>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-[#135bec] hover:underline flex items-center justify-center gap-1 mt-1">
                            <LogIn size={14} /> Iniciar Sesión
                        </Link>
                    </p>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest opacity-50">
                        &copy; 2026 ServiTech Hub • v2.0.4
                    </p>
                </div>
            </div>
        </div>
    );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    )
}
