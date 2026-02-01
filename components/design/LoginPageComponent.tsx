'use client';

import React, { useState } from 'react';
import { User, Lock, ArrowLeft, ShieldCheck, Cpu, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import NeonButton from './NeonButton';
import Link from 'next/link';

const LoginPageComponent: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10 bg-transparent">

            {/* Container Principal */}
            <div className="w-full max-w-md relative animate-float">

                {/* Decorative Background Elements behind the card */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/20 rounded-full blur-[50px] animate-pulse-glow"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-blue/20 rounded-full blur-[50px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

                {/* Glass Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">

                    {/* Header Bar */}
                    <div className="h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green"></div>

                    <div className="p-8">
                        <Link href="/">
                            <button
                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-6 font-mono group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                VOLVER AL HOME
                            </button>
                        </Link>

                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-tr from-neon-blue to-neon-purple rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                                <Cpu className="text-white" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter mb-1 uppercase italic">ACCESO <span className="text-neon-cyan not-italic">SEGURO</span></h2>
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">GATEWAY v2.4 // AUTHORIZED_PERSONNEL_ONLY</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold font-mono">
                                [ ERROR ]: {error.toUpperCase()}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-neon-blue flex items-center gap-2 font-black tracking-widest uppercase">
                                    <User size={12} /> USUARIO / ID
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all font-mono text-sm"
                                        placeholder="admin@taller.com"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/10 group-focus-within:bg-neon-green transition-colors"></div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-neon-purple flex items-center gap-2 font-black tracking-widest uppercase">
                                    <Lock size={12} /> CLAVE DE ACCESO
                                </label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all font-mono text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/10 group-focus-within:bg-neon-purple transition-colors"></div>
                                </div>
                                <div className="flex justify-end">
                                    <Link href="/forgot-password" className="text-[9px] text-gray-500 hover:text-neon-cyan transition-colors font-mono font-black uppercase tracking-widest">
                                        ¿OLVIDASTE TU TOKEN?
                                    </Link>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <NeonButton className="w-full justify-center h-14">
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>VERIFICANDO CREDENCIALES...</span>
                                        </div>
                                    ) : 'INICIAR SESIÓN'}
                                </NeonButton>
                            </div>
                        </form>

                        {/* Footer Area */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                            <div className="flex items-center justify-center gap-2 text-[9px] text-gray-600 font-mono font-black uppercase tracking-widest bg-black/30 py-2.5 rounded-lg border border-white/5">
                                <ShieldCheck size={12} className="text-neon-green" />
                                CONEXIÓN ENCRIPTADA (256-BIT SSL)
                            </div>

                            <p className="text-center text-[10px] text-gray-500 font-mono font-black uppercase tracking-widest">
                                ¿Aún no tienes cuenta? <Link href="/register" className="text-white underline hover:text-neon-blue transition-colors">Registrar Local</Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPageComponent;
