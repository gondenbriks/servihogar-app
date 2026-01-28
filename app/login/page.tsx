'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Error al conectar con Google');
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 font-sans text-white relative overflow-hidden">
            {/* Decorative Glows */}
            <div className="absolute top-[-10%] left-[-10%] size-[400px] bg-[#135bec] opacity-10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] size-[400px] bg-[#00d4ff] opacity-10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center size-16 bg-[#135bec]/10 rounded-3xl border border-[#135bec]/20 mb-4 neon-shadow-primary">
                        <Sparkles className="text-[#135bec]" size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">
                        ServiTech <span className="text-[#135bec]">Pro</span>
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                        Professional Field Service
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 bg-gray-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tecnico@servitech.pro"
                                className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#135bec] hover:bg-[#1e66ff] text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(19,91,236,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span className="uppercase tracking-widest text-sm">Entrar al Sistema</span>
                                <LogIn size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-[#135bec] hover:underline flex items-center justify-center gap-1 mt-1">
                            Crear una cuenta <Sparkles size={14} />
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
