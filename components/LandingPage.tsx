'use client';

import React from 'react';
import { Menu, ChevronRight, FileText, MapPin, MessageSquare, Bot, Database, PieChart, Zap } from 'lucide-react';
import Link from 'next/link';

// New Design Components
import Background from './design/Background';
import NeonButton from './design/NeonButton';
import TabletDashboard from './design/TabletDashboard';
import FeatureCard from './design/FeatureCard';
import AIDiagnosticDemo from './design/AIDiagnosticDemo';
import PricingSection from './design/PricingSection';
import TestimonialsSection from './design/TestimonialsSection';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen relative font-sans text-white selection:bg-[#39ff14] selection:text-black bg-[#020202] overflow-x-hidden">
            {/* Dynamic Background */}
            <Background />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#135bec] rounded-xl flex items-center justify-center shadow-lg shadow-[#135bec]/30 rotate-3 transition-transform hover:rotate-0">
                            <Zap className="text-white fill-white" size={22} />
                        </div>
                        <span className="font-black text-2xl tracking-tighter uppercase italic">
                            ServiTech<span className="text-[#00e5ff] not-italic">Pro</span>
                        </span>
                    </div>

                    <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <a href="#funciones" className="hover:text-[#00e5ff] transition-colors">FUNCIONES</a>
                        <a href="#ia" className="hover:text-[#00e5ff] transition-colors">INTELIGENCIA AI</a>
                        <a href="#pricing" className="hover:text-[#00e5ff] transition-colors">PLANES</a>
                    </div>

                    <div className="hidden md:block">
                        <Link href="/login">
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f3ff] border border-[#00f3ff]/30 px-6 py-2.5 hover:bg-[#00f3ff]/10 transition-all rounded-lg backdrop-blur-sm">
                                ACCESO CLIENTES
                            </button>
                        </Link>
                    </div>

                    <Menu className="md:hidden text-white" />
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Copy */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#39ff14]/30 bg-[#39ff14]/10 text-[#39ff14] text-[9px] font-black uppercase tracking-[0.25em] backdrop-blur-xl">
                            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
                            OFERTA ESPECIAL LATAM: MIGRACIÓN GRATIS
                        </div>

                        <h1 className="text-6xl md:text-[5.5rem] font-black leading-[0.85] tracking-tighter uppercase italic">
                            EL SISTEMA <br />
                            OPERATIVO <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#00e5ff] to-white drop-shadow-[0_0_20px_rgba(0,243,255,0.4)] not-italic">
                                QUE TU TALLER <br /> MERECÍA
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 font-medium max-w-lg leading-tight border-l-2 border-[#00f3ff]/30 pl-6">
                            ServiTech Pro integra <strong>Inteligencia Artificial</strong> y logística avanzada. Diagnostica en segundos, factura en sitio y fideliza clientes automáticamente. Transforma el caos en rentabilidad.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <Link href="/login">
                                <NeonButton className="w-full sm:w-auto h-16 flex items-center justify-center">
                                    [ PROBAR 30 DÍAS GRATIS ]
                                </NeonButton>
                            </Link>
                            <button className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors group px-6 py-4 font-black uppercase tracking-widest text-xs">
                                <span>VER DEMO EN VIVO</span>
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.1em]">
                            * Implementación en 5 minutos. Sin tarjetas de crédito.
                        </p>
                    </div>

                    {/* Right Column: Visual */}
                    <div className="flex justify-center lg:justify-end relative">
                        <TabletDashboard />
                    </div>
                </div>

                {/* Feature Cards Section */}
                <div id="funciones" className="max-w-7xl mx-auto mt-40 mb-20 scroll-mt-32">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">POTENCIA TU <span className="text-[#00e5ff]">PRODUCTIVIDAD</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg">
                            Olvídate de las hojas de cálculo y los diagnósticos empíricos. Profesionaliza tu operación.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            title="Cierre Digital & Firma"
                            description="Genera facturas en sitio, descuenta inventario y captura la firma biométrica del cliente en pantalla. Evita disputas y elimina el papel."
                            icon={FileText}
                            borderColor="neon-blue"
                            iconColor="#00f3ff"
                        />
                        <FeatureCard
                            title="Diagnóstico IA (Gemini)"
                            description="Sube una foto de la placa o describe el error. Nuestra IA analiza manuales técnicos globales para reducir tiempos de diagnóstico en un 40%."
                            icon={Bot}
                            borderColor="neon-purple"
                            iconColor="#bc13fe"
                        />
                        <FeatureCard
                            title="Logística en Tiempo Real"
                            description="Visualización oscura de técnicos en mapa y optimización de rutas. Ahorra combustible y permite atender más servicios por día."
                            icon={MapPin}
                            borderColor="neon-green"
                            iconColor="#39ff14"
                        />
                        <FeatureCard
                            title="Fidelización Automática"
                            description="Cada reparación finalizada programa automáticamente recordatorios de mantenimiento futuro. Garantiza ingresos recurrentes sin esfuerzo."
                            icon={MessageSquare}
                            borderColor="neon-cyan"
                            iconColor="#00e5ff"
                        />
                        <FeatureCard
                            title="Control Financiero Total"
                            description="Finanzas, inventario crítico y rendimiento de técnicos en tiempo real. Toma decisiones basadas en datos, no en intuiciones."
                            icon={PieChart}
                            borderColor="neon-blue"
                            iconColor="#00f3ff"
                        />
                        <FeatureCard
                            title="Migración Asistida"
                            description="Importamos tu base de datos de Excel gratis. Nuestro equipo te ayuda a pasar del caos al orden digital en menos de 24 horas."
                            icon={Database}
                            borderColor="neon-purple"
                            iconColor="#bc13fe"
                        />
                    </div>
                </div>

                {/* AI Diagnostic Demo Section */}
                <AIDiagnosticDemo />

                {/* Testimonials Section */}
                <TestimonialsSection />

                {/* Pricing Section */}
                <PricingSection />

            </main>

            {/* Footer Decoration */}
            <footer className="relative z-10 border-t border-white/5 bg-black py-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                    <div className="flex flex-col md:flex-row justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                        <div className="flex items-center gap-2">ESTADO: <span className="text-[#39ff14] animate-pulse">OPERATIVO V5.1</span></div>
                        <div className="flex items-center gap-2">SOPORTE: <span className="text-[#bc13fe]">24/7 WHATSAPP VIP</span></div>
                        <div className="flex items-center gap-2">SEGURIDAD: <span className="text-[#39ff14]">BANCARIA INTEGRADA</span></div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                            <Zap className="text-white fill-white" size={16} />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase italic text-white/50">
                            ServiTech Pro
                        </span>
                    </div>

                    <p className="text-[10px] text-gray-600 font-black tracking-[0.5em] uppercase text-center">
                        &copy; 2026 SERVITECH PRO INC. HECHO PARA LÍDERES EN LATINOAMÉRICA.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
