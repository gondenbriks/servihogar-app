'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit,
    Smartphone,
    TrendingUp,
    ShieldCheck,
    Zap,
    CheckCircle,
    ArrowRight,
    Menu,
    X,
    FileX2,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const LandingPageScreen = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Animaciones Variantes
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-gray-200 font-sans overflow-x-hidden selection:bg-[#00d4ff] selection:text-black">

            {/* --- NAVBAR --- */}
            <nav className="fixed w-full z-50 bg-[#0a0c10]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <div className="w-8 h-8 bg-gradient-to-tr from-[#135bec] to-[#00d4ff] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.5)]">
                                <Zap className="text-white w-5 h-5" fill="white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                ServiTech <span className="text-[#00d4ff]">Pro</span>
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-8 items-center">
                            <a href="#features" className="hover:text-[#00d4ff] transition-colors text-sm font-medium">Características</a>
                            <a href="#solution" className="hover:text-[#00d4ff] transition-colors text-sm font-medium">Solución</a>
                            <a href="#testimonials" className="hover:text-[#00d4ff] transition-colors text-sm font-medium">Testimonios</a>
                            <button
                                onClick={() => router.push('/login')}
                                className="text-white hover:text-[#00d4ff] font-medium px-4 py-2 transition-colors"
                            >
                                Acceder
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="bg-[#135bec] hover:bg-[#0f4bc4] text-white px-5 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all hover:scale-105"
                            >
                                Prueba Gratis
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#161b22] border-b border-white/10"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                <a href="#features" className="block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md">Características</a>
                                <button onClick={() => router.push('/login')} className="w-full text-left block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md text-[#00d4ff]">Acceder</button>
                                <button onClick={() => router.push('/register')} className="w-full mt-4 bg-[#135bec] text-white px-3 py-3 rounded-lg font-bold">Comenzar Ahora</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#135bec]/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
                            <span className="text-xs font-medium text-[#00ff9d] tracking-wide uppercase">Nueva Versión 2.0 con IA</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                            Tu Taller, <br className="hidden md:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00d4ff] to-[#135bec]">
                                Sin Papel y Con Inteligencia.
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 font-light">
                            Elimina el caos administrativo, diagnostica en segundos con <span className="text-white font-medium">Gemini AI</span> y deja de perder dinero en reparaciones no cobradas.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => router.push('/register')}
                                className="w-full sm:w-auto px-8 py-4 bg-[#00ff9d] hover:bg-[#00cc7d] text-black font-bold rounded-xl shadow-[0_0_25px_rgba(0,255,157,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                PROBAR GRATIS
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-medium transition-all backdrop-blur-sm">
                                Ver Demo (2 min)
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Abstract Dashboard Visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-20 relative mx-auto max-w-5xl"
                        style={{ perspective: '1000px' }}
                    >
                        <div className="relative rounded-xl bg-[#161b22] border border-white/10 shadow-[0_0_50px_rgba(19,91,236,0.2)] p-2 md:p-4">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/10 to-transparent pointer-events-none rounded-xl" />
                            {/* Mockup Content Image (Placeholder) */}
                            <div className="aspect-video bg-[#0a0c10] rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                                <div className="text-center">
                                    <BrainCircuit className="w-16 h-16 text-[#00d4ff] mx-auto mb-4 opacity-50" />
                                    <p className="text-gray-500 font-mono text-sm">Dashboard Interactivo con IA</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- PROBLEM VS SOLUTION SECTION --- */}
            <section id="solution" className="py-24 bg-[#0d1117] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* The Pain */}
                        <div className="space-y-8 opacity-60 hover:opacity-100 transition-opacity">
                            <h3 className="text-2xl font-bold text-gray-400">❌ El Caos Actual</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <FileX2 className="w-6 h-6 text-red-500 shrink-0" />
                                    <p className="text-gray-400">Cuadernos perdidos y órdenes ilegibles.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Users className="w-6 h-6 text-red-500 shrink-0" />
                                    <p className="text-gray-400">Llamadas constantes de clientes molestos.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <TrendingUp className="w-6 h-6 text-red-500 shrink-0 rotate-180" />
                                    <p className="text-gray-400">Fugas de dinero por repuestos no cobrados.</p>
                                </li>
                            </ul>
                        </div>

                        {/* The Solution */}
                        <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#135bec]/20 to-[#00d4ff]/5 border border-[#135bec]/30 shadow-[0_0_30px_rgba(19,91,236,0.15)]">
                            <div className="absolute -top-3 -right-3 bg-[#00d4ff] text-black text-xs font-bold px-3 py-1 rounded-full">RECOMENDADO</div>
                            <h3 className="text-2xl font-bold text-white mb-6">✅ El Control con ServiTech</h3>
                            <ul className="space-y-5">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-[#00ff9d] shrink-0" />
                                    <div>
                                        <strong className="text-white block">Historial Digital Eterno</strong>
                                        <span className="text-sm text-gray-400">Trazabilidad total por cliente y equipo.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-[#00ff9d] shrink-0" />
                                    <div>
                                        <strong className="text-white block">Notificaciones Automáticas</strong>
                                        <span className="text-sm text-gray-400">WhatsApp/Email al cambiar de estado.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-[#00ff9d] shrink-0" />
                                    <div>
                                        <strong className="text-white block">Control Total de Caja</strong>
                                        <span className="text-sm text-gray-400">Reportes financieros en tiempo real.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID (Strategic Value) --- */}
            <section id="features" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Ventajas Competitivas</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Tecnología diseñada para hacer tu taller más rentable.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<BrainCircuit className="w-10 h-10 text-[#00d4ff]" />}
                            title="Diagnóstico Gemini AI"
                            desc="Nuestra IA sugiere fallas y repuestos basados en síntomas. Reduce el tiempo de diagnóstico en un 40%."
                        />
                        <FeatureCard
                            icon={<Smartphone className="w-10 h-10 text-[#00ff9d]" />}
                            title="Oficina & Campo"
                            desc="Gestiona desde el PC o en la calle con el móvil. Ideal para técnicos con rutas de visita."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-10 h-10 text-[#a855f7]" />}
                            title="Imagen Profesional"
                            desc="Envía cotizaciones PDF y tickets digitales con QR. Eleva tu marca ante el cliente."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-10 h-10 text-[#f59e0b]" />}
                            title="Cero Fugas"
                            desc="Control de inventario y alertas de facturación. No dejes que se escape ni un solo repuesto."
                        />
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="py-24 bg-[#00d4ff]/5 border-t border-white/5 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-6 text-white">¿Listo para modernizar tu taller?</h2>
                    <p className="text-xl text-gray-400 mb-10">Únete a los talleres que ya han dejado el papel atrás.</p>
                    <button
                        onClick={() => router.push('/register')}
                        className="px-10 py-5 bg-[#135bec] hover:bg-[#0f4bc4] text-white text-lg font-bold rounded-xl shadow-[0_0_40px_rgba(19,91,236,0.5)] transition-all hover:scale-105"
                    >
                        Crear Cuenta Gratuita
                    </button>
                    <p className="mt-4 text-sm text-gray-500">Sin tarjeta de crédito requerida para empezar.</p>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-[#050608] py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 mb-4">&copy; 2024 ServiTech Pro. Todos los derechos reservados.</p>
                    <div className="flex justify-center gap-6 text-sm text-gray-600">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Soporte</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Componente Auxiliar para Tarjetas
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-[#161b22] border border-white/5 hover:border-[#00d4ff]/30 transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] group"
    >
        <div className="mb-4 p-3 bg-white/5 rounded-lg inline-block group-hover:bg-white/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

export default LandingPageScreen;
