'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Clock,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    Star,
    Users,
    ClipboardCheck,
    Smartphone,
    ChevronRight,
    Check,
    Quote,
    MessageCircle,
    X,
    Send,
    Bot,
    Headphones,
    CreditCard,
    Rocket
} from 'lucide-react';
import Link from 'next/link';

const testimonials = [
    {
        name: "Carlos Rodríguez",
        role: "Dueño de ElectroFix",
        content: "Desde que implementamos ServiTech Pro, nuestro tiempo de respuesta bajó un 40%. La IA de diagnóstico es simplemente increíble."
    },
    {
        name: "Marina Silva",
        role: "Técnica Senior",
        content: "El sistema de firmas digitales eliminó por completo el papeleo. Mis clientes aman recibir fotos y estatus en el celular."
    },
    {
        name: "Jorge Méndez",
        role: "Gerente de Servicios",
        content: "La mejor inversión que hemos hecho en 10 años. Es robusto, rápido y se siente como el futuro del servicio técnico."
    }
];

const faqData = [
    {
        question: "¿Para qué sirve ServiTech Pro?",
        answer: "Es una plataforma integral para centros de servicio técnico que automatiza desde la recepción del cliente hasta el diagnóstico con IA y la facturación."
    },
    {
        question: "¿Tienen soporte 24/7?",
        answer: "¡Sí! Todos nuestros planes incluyen acceso a ServiBot y soporte técnico humano para incidentes críticos en cualquier momento."
    },
    {
        question: "¿Cómo funcionan los pagos?",
        answer: "Aceptamos tarjetas de crédito, débito y transferencias. Las suscripciones son mensuales sin contrato forzoso."
    },
    {
        question: "¿Qué es el diagnóstico con IA?",
        answer: "Usamos Gemini AI para analizar los síntomas del aparato y sugerir posibles fallas y repuestos necesarios al instante."
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
};

const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.4,
        },
    },
};

const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    },
};

const cardVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: "easeOut" }
    },
};

const LandingPage = () => {
    const title = "Control Total para tu Centro de Servicio";
    const words = title.split(" ");
    const [testimonialIdx, setTestimonialIdx] = useState(0);
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([
        { role: 'bot', text: '¡Hola! Soy ServiBot, tu asistente de ServiTech Pro. ¿En qué puedo ayudarte hoy?' }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleFaqClick = (faq: any) => {
        setChatMessages(prev => [
            ...prev,
            { role: 'user', text: faq.question },
            { role: 'bot', text: faq.answer }
        ]);
    };

    return (
        <div className="relative min-h-screen bg-[#0a0c10] text-white font-outfit overflow-x-hidden selection:bg-[#00d4ff]/30 selection:text-[#00d4ff]">

            {/* --- BACKGROUND ELEMENTS --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#135bec]/10 blur-[100px] rounded-full animate-pulse-subtle" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#00ff9d]/5 blur-[100px] rounded-full animate-pulse-subtle" />
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
            </div>

            {/* --- HEADER --- */}
            <header className="relative z-50 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2.5"
                >
                    <div className="size-11 bg-[#135bec] rounded-xl flex items-center justify-center shadow-lg shadow-[#135bec]/30 rotate-3">
                        <Zap className="text-white fill-white" size={22} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic">
                        SERVITECH <span className="text-[#00d4ff] not-italic">PRO</span>
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-8"
                >
                    <Link href="/login" className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors hidden sm:block">
                        Login
                    </Link>
                    <Link href="#pricing" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors hidden md:block">
                        Precios
                    </Link>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsBotOpen(true)}
                        className="px-7 py-3 rounded-xl bg-[#135bec]/10 border border-[#135bec]/20 text-[#135bec] text-[11px] font-black uppercase tracking-widest hover:bg-[#135bec]/20 transition-all backdrop-blur-md flex items-center gap-2"
                    >
                        <div className="size-2 bg-[#00ff9d] rounded-full animate-pulse shadow-[0_0_8px_#00ff9d]" />
                        Soporte 24/7
                    </motion.button>
                </motion.div>
            </header>

            <main className="relative z-10">

                {/* --- HERO SECTION --- */}
                <section className="px-6 pt-24 pb-40 max-w-7xl mx-auto text-center relative">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.25em] text-[#00d4ff] backdrop-blur-md">
                            <Star size={14} className="fill-[#00d4ff]" />
                            <span>Plataforma AI-Ready v2.0</span>
                        </motion.div>

                        <motion.h1
                            variants={titleContainerVariants}
                            className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] max-w-5xl mx-auto uppercase"
                        >
                            {words.map((word, i) => (
                                <motion.span
                                    key={i}
                                    variants={wordVariants}
                                    className={`inline-block mr-[0.2em] last:mr-0 ${word === "Control" || word === "Total"
                                        ? "text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#00ff9d] drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                                        : "text-white"
                                        }`}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium leading-tight"
                        >
                            La herramienta definitiva para automatizar tu taller,
                            optimizar diagnósticos con <span className="text-white">Gemini AI</span> y
                            maximizar la satisfacción de tus clientes.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8"
                        >
                            <Link href="/login" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 0 30px rgba(19, 91, 236, 0.5)",
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-[#135bec] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-[#135bec]/40 group"
                                >
                                    Acceder a la Plataforma
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>

                            <Link href="#pricing" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05, border: "1px solid #00ff9d" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-transparent border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-[#00ff9d]/5 transition-all"
                                >
                                    Ver Planes y Precios
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
                </section>

                {/* --- PROBLEM VS SOLUTION --- */}
                <section className="px-6 py-40 relative">
                    <div className="max-w-7xl mx-auto border-t border-white/5 pt-40">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                            <div className="space-y-16">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic">
                                        <span className="text-gray-700 not-italic block">Tu negocio,</span>
                                        Sin límites tecnológicos.
                                    </h2>
                                    <p className="text-gray-500 text-lg md:text-xl font-medium max-w-lg">
                                        Deja de luchar con procesos lentos y manuales. ServiTech Pro centraliza todo en una interfaz de élite.
                                    </p>
                                </motion.div>

                                <div className="space-y-8">
                                    {[
                                        { icon: <ClipboardCheck className="text-[#00d4ff]" />, title: "Adiós al Papel", desc: "Ordenes de servicio 100% digitales con firmas táctiles integradas." },
                                        { icon: <Users className="text-[#00ff9d]" />, title: "Clientes Felices", desc: "Seguimiento en tiempo real y comunicación fluida por canales digitales." },
                                        { icon: <Zap className="text-yellow-400" />, title: "Diagnósticos Rápidos", desc: "IA avanzada que sugiere repuestos y soluciones basadas en síntomas." },
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={cardVariants}
                                            initial="hidden"
                                            whileInView="visible"
                                            whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
                                            viewport={{ once: true }}
                                            className="flex gap-8 p-8 rounded-3xl border border-white/5 bg-[#0a0c10]/50 backdrop-blur-2xl transition-all cursor-default"
                                        >
                                            <div className="p-4 rounded-2xl bg-white/5 h-fit shadow-xl shadow-black">
                                                {item.icon}
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black tracking-tight uppercase italic">{item.title}</h4>
                                                <p className="text-gray-500 text-base font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative lg:pt-20"
                            >
                                <div className="aspect-[9/16] max-w-[400px] mx-auto rounded-[3rem] bg-[#12141a] border-[8px] border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden">
                                    <div className="p-8 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div className="size-10 bg-[#135bec] rounded-lg" />
                                            <div className="size-8 rounded-full bg-white/10" />
                                        </div>
                                        <div className="h-6 w-3/4 bg-white/5 rounded-full" />
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-20 bg-white/5 rounded-2xl flex items-center px-6 gap-4 border border-white/5">
                                                    <div className="size-10 rounded-xl bg-gradient-to-br from-[#135bec] to-[#00d4ff] opacity-50" />
                                                    <div className="space-y-2 flex-1">
                                                        <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                                                        <div className="h-2 w-1/4 bg-white/5 rounded-full" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        className="absolute top-1/4 -right-10 p-6 rounded-3xl bg-[#00ff9d] text-black font-black uppercase tracking-tighter shadow-2xl shadow-[#00ff9d]/30 rotate-12"
                                    >
                                        <div className="text-3xl">98%</div>
                                        <div className="text-[10px]">Satisfacción</div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* --- PRICING SECTION --- */}
                <section id="pricing" className="px-6 py-40 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-[#00ff9d]"
                            >
                                Suscripciones Flexibles
                            </motion.div>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                                Elige tu <span className="text-[#00d4ff]">Plan.</span>
                            </h2>
                            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                                Desde técnicos independientes hasta centros de servicio a gran escala.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Esencial", price: "0", desc: "Para técnicos que están iniciando su camino digital.", features: ["50 Órdenes/Mes", "Base de Clientes", "Soporte Estándar", "Dashboard Básico"], color: "gray-500", btn: "Empieza Gratis", link: "/register?role=solo" },
                                { name: "Solo Pro", price: "19", popular: true, desc: "Dominio total para el técnico independiente de élite.", features: ["Órdenes Ilimitadas", "Gemini AI (Diagnóstico)", "Finanzas Avanzadas", "Soporte 24/7 VIP"], color: "[#00d4ff]", btn: "Obtener Pro", link: "/register?role=solo" },
                                { name: "Equipo", price: "49", desc: "Escalabilidad absoluta para centros de servicio con staff.", features: ["Gestión de Personal", "Logística Avanzada", "Stock Centralizado", "API de Integración"], color: "[#135bec]", btn: "Plan Equipos", link: "/register?role=team" }
                            ].map((plan, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative p-10 rounded-[3rem] border transition-all duration-500 group ${plan.popular ? 'bg-gradient-to-b from-gray-900 to-black border-[#00d4ff]/30 shadow-[0_30px_60px_-15px_rgba(0,212,255,0.15)] scale-105 z-10' : 'bg-[#0a0c10] border-white/5 hover:border-white/20'}`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#00d4ff] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            Recomendado
                                        </div>
                                    )}
                                    <div className="mb-10">
                                        <h3 className="text-2xl font-black uppercase italic mb-4">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black">$</span>
                                            <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest pl-2">/ Mes</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-6 font-medium leading-relaxed">{plan.desc}</p>
                                    </div>
                                    <ul className="space-y-4 mb-12">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                                <Check size={16} className={`text-${plan.color}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={plan.link}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${plan.popular ? 'bg-[#00d4ff] text-black shadow-xl shadow-[#00d4ff]/20' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                                        >
                                            {plan.btn}
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-0 size-[500px] bg-[#135bec]/5 blur-[120px] rounded-full pointer-events-none" />
                </section>

                {/* --- TESTIMONIALS SECTION --- */}
                <section className="px-6 py-32 bg-white/[0.01]">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Lo que dicen los Expertos</h2>
                            <div className="h-1 w-20 bg-[#00d4ff] mx-auto rounded-full" />
                        </motion.div>

                        <div className="relative h-[300px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={testimonialIdx}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                    className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-8"
                                >
                                    <Quote size={48} className="text-[#00ff9d] opacity-20" />
                                    <p className="text-2xl md:text-3xl font-medium text-gray-300 italic">
                                        "{testimonials[testimonialIdx].content}"
                                    </p>
                                    <div className="space-y-1">
                                        <div className="text-xl font-black uppercase text-white">{testimonials[testimonialIdx].name}</div>
                                        <div className="text-sm font-black uppercase tracking-widest text-[#00d4ff]">{testimonials[testimonialIdx].role}</div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex justify-center gap-3">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTestimonialIdx(i)}
                                    className={`size-2.5 rounded-full transition-all duration-500 ${i === testimonialIdx ? "bg-[#00ff9d] w-8" : "bg-white/10"}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- CALL TO ACTION --- */}
                <section className="px-6 py-40">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-6xl mx-auto rounded-[4rem] bg-gradient-to-br from-[#135bec] to-[#011442] p-16 md:p-32 text-center space-y-12 relative overflow-hidden border border-white/5"
                    >
                        <div className="absolute top-0 right-0 size-96 bg-[#00d4ff]/20 blur-[100px] rounded-full" />
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.85] relative z-10">
                            Transforma tu <br />
                            Taller <span className="text-[#00d4ff]">Hoy.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                            <Link href="/login" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto px-16 py-7 rounded-2xl bg-white text-[#135bec] font-black text-lg uppercase tracking-widest shadow-2xl"
                                >
                                    Probar Gratis
                                </motion.button>
                            </Link>
                            <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2 text-white/80 font-black text-xs uppercase tracking-widest">
                                    <Check size={16} className="text-[#00ff9d]" /> Sin Configuración Compleja
                                </div>
                                <div className="flex items-center gap-2 text-white/80 font-black text-xs uppercase tracking-widest">
                                    <Check size={16} className="text-[#00ff9d]" /> Setup en 5 Minutos
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* --- FOOTER --- */}
            <footer className="px-6 py-20 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 opacity-40 grayscale">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Zap className="text-white fill-white" size={18} />
                    </div>
                    <span className="text-lg font-black tracking-tighter uppercase italic">ServiTech Pro</span>
                </div>
                <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors">GitHub</a>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                    © 2026 Latin America Tech
                </div>
            </footer>

            {/* --- SERVIBOT CHAT INTERFACE --- */}
            <AnimatePresence>
                {isBotOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-28 right-8 z-[210] w-[90vw] max-w-[400px] h-[600px] bg-[#0a0c10] border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
                    >
                        {/* Bot Header */}
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#135bec]/10 to-transparent flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-[#135bec] flex items-center justify-center text-white shadow-lg shadow-[#135bec]/30">
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">ServiBot</h3>
                                    <p className="text-[9px] font-bold text-[#00ff9d] uppercase tracking-tighter">Soporte Inteligente 24/7</p>
                                </div>
                            </div>
                            <button onClick={() => setIsBotOpen(false)} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {chatMessages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === 'bot' ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed ${msg.role === 'bot' ? 'bg-white/5 text-gray-300' : 'bg-[#135bec] text-white'}`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Help / FAQ */}
                        <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Preguntas Frecuentes</p>
                            <div className="flex flex-wrap gap-2">
                                {faqData.map((faq, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleFaqClick(faq)}
                                        className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 hover:border-[#00d4ff]/30 transition-all text-gray-400"
                                    >
                                        {faq.question}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 bg-[#0a0c10]">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Escribe tu duda aquí..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm outline-none focus:border-[#135bec]/50 transition-all"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-[#135bec] flex items-center justify-center text-white">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className="fixed bottom-8 right-8 z-[200]"
            >
                {!isBotOpen && (
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsBotOpen(true)}
                        className="size-16 rounded-[1.5rem] bg-[#135bec] text-white flex items-center justify-center shadow-2xl shadow-[#135bec]/40 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Bot className="text-white" size={28} />
                        <div className="absolute -top-1 -right-1 size-4 bg-[#00ff9d] border-4 border-[#0a0c10] rounded-full" />
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};

export default LandingPage;
