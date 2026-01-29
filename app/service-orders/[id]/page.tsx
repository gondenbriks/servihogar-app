'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import {
    ChevronLeft,
    Wrench,
    Microscope,
    Mic,
    Box,
    PlusCircle,
    Bot,
    Check,
    Search as SearchIcon,
    AlertCircle,
    XCircle,
    Wallet,
    MessageCircle,
    Phone,
    Map as MapIcon,
    Navigation,
    User,
    Calendar,
    Clock,
    Hash,
    MoreVertical,
    CheckCircle,
    PenTool,
    CreditCard,
    QrCode,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SignatureCanvas from '../../../components/SignatureCanvas';


// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function ServiceOrderPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;

    const [order, setOrder] = useState<any | null>(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [signature, setSignature] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [waMessage, setWaMessage] = useState('');
    const [isWaGenerating, setIsWaGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [laborCost, setLaborCost] = useState('0');
    const [selectedParts, setSelectedParts] = useState<any[]>([]);
    const [availableParts, setAvailableParts] = useState<any[]>([]);
    const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
    const [partsSearch, setPartsSearch] = useState('');

    useEffect(() => {
        if (serviceId) {
            loadOrder();
        }
    }, [serviceId]);

    // Listener for Scanned Parts
    useEffect(() => {
        const handleReturnFromScanner = () => {
            const data = localStorage.getItem('scanned_part_data');
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.serviceId === serviceId) {
                        addPartToOrder(parsed);
                    }
                    localStorage.removeItem('scanned_part_data');
                } catch (e) {
                    console.error("Error parsing scanned part:", e);
                }
            }
        };

        // Check on mount and when order changes (to ensure we have the state ready)
        handleReturnFromScanner();
    }, [serviceId, order]);

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select(`
                    *,
                    client:clients(*),
                    equipment:equipment(*),
                    order_items(
                        id,
                        quantity,
                        price_at_time,
                        part:parts(id, name, code)
                    )
                `)
                .eq('id', serviceId)
                .single();

            if (error) throw error;
            if (data) {
                setOrder(data);
                setDiagnosis(data.technical_diagnosis || '');
                setLaborCost(data.labor_cost?.toString() || '0');
                if (data.order_items) {
                    setSelectedParts(data.order_items.map((item: any) => ({
                        ...item.part,
                        quantity: item.quantity,
                        unit_price: item.price_at_time
                    })));
                }
            }

            const { data: partsData } = await supabase.from('parts').select('*').gt('stock_level', 0);
            setAvailableParts(partsData || []);

        } catch (error) {
            console.error('Error loading order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!serviceId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('service_orders')
                .update({ status: newStatus })
                .eq('id', serviceId);

            if (error) throw error;
            setOrder({ ...order, status: newStatus });

            // If changing to WAITING_PARTS, trigger WhatsApp alert
            if (newStatus === 'WAITING_PARTS') {
                const prompt = `Redacta un mensaje profesional de WhatsApp para el cliente "${order.client?.full_name}" informando que su equipo (${order.equipment?.brand} ${order.equipment?.type}) requiere un repuesto que no tenemos en stock actualmente.
                - Estado: Esperando Repuesto
                - Instrucciones: Corto, profesional, menciona que le avisaremos en cuanto llegue el repuesto. Usa emojis 📦, 🔧, ✅.`;

                setIsWaGenerating(true);
                setShowConfirmModal(true);
                try {
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    setWaMessage(response.text());
                } catch (e) {
                    setWaMessage(`Hola ${order.client?.full_name}, le informamos que para proceder con la reparación de su ${order.equipment?.brand} ${order.equipment?.type} necesitamos pedir un repuesto. Le avisaremos en cuanto esté disponible. 📦🔧`);
                } finally {
                    setIsWaGenerating(false);
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar el estado");
        } finally {
            setIsSaving(false);
        }
    };

    const handleActivateService = async () => {
        handleStatusChange('IN_PROGRESS');
    };

    const generateWhatsAppMessage = async () => {
        if (!order) return;
        setShowConfirmModal(true);
        setIsWaGenerating(true);

        try {
            const prompt = `Redacta un mensaje profesional de WhatsApp para el cliente "${order.client?.full_name}" confirmando su servicio técnico de hoy.
            - Equipo: ${order.equipment?.brand} ${order.equipment?.type}
            - Problema: ${order.reported_issue}
            - Hora programada: ${new Date(order.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            Instrucciones: Corto (máximo 40 palabras), usa emojis (🔧, 📍, ✅), menciona que el técnico ya tiene asignada la ruta. Sin etiquetas extra.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setWaMessage(response.text());
        } catch (error) {
            setWaMessage(`Hola ${order.client?.full_name}, le confirmamos su visita técnica para hoy. El técnico se encuentra en ruta. ¡Nos vemos pronto! 🔧`);
        } finally {
            setIsWaGenerating(false);
        }
    };

    const sendWhatsApp = () => {
        const text = encodeURIComponent(waMessage);
        const phone = order.client?.phone?.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
        handleActivateService();
        setShowConfirmModal(false);
    };

    const handleAiRecommendations = async () => {
        if (!order) return;
        setIsGenerating(true);

        const applianceContext = order.equipment?.type + " " + order.equipment?.brand;
        const issueContext = order.reported_issue;

        const prompt = `Actúa como un técnico experto. Escribe una lista corta (máximo 3 puntos) de recomendaciones de cuidado para el cliente sobre su ${applianceContext}, considerando que la falla fue: ${issueContext}. 
    Usa un tono profesional pero amable. Formato: Viñetas con emojis.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setRecommendations(response.text());
        } catch (error) {
            console.error("Error generating recommendations:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFinishOrder = async () => {
        if (!serviceId) return;
        setIsSaving(true);

        try {
            const totalPartsCost = selectedParts.reduce((acc, part) => acc + (part.unit_price * part.quantity), 0);
            const finalTotal = Number(laborCost) + totalPartsCost;

            // Calculate next maintenance date (6 months from now)
            const maintenanceDate = new Date();
            maintenanceDate.setMonth(maintenanceDate.getMonth() + 6);

            // 1. Update Service Order
            const { error: orderError } = await supabase
                .from('service_orders')
                .update({
                    technical_diagnosis: diagnosis,
                    labor_cost: Number(laborCost),
                    status: 'COMPLETED',
                    completed_at: new Date().toISOString(),
                    total_cost: finalTotal,
                    next_maintenance_date: maintenanceDate.toISOString()
                })
                .eq('id', serviceId);

            if (orderError) throw orderError;

            // 2. Handle Order Items
            if (selectedParts.length > 0) {
                const orderItems = selectedParts.map(part => ({
                    order_id: serviceId,
                    part_id: part.id,
                    quantity: part.quantity,
                    price_at_time: part.unit_price
                }));

                const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
                if (itemsError) throw itemsError;

                // 3. Update Inventory Stock
                for (const part of selectedParts) {
                    const { data: currentPart } = await supabase.from('parts').select('stock_level').eq('id', part.id).single();
                    if (currentPart) {
                        await supabase.from('parts')
                            .update({ stock_level: currentPart.stock_level - part.quantity })
                            .eq('id', part.id);
                    }
                }
            }

            router.push(`/invoice-preview/${serviceId}`);
        } catch (error: any) {
            alert('Error al finalizar la orden: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const addPartToOrder = (part: any) => {
        const existing = selectedParts.find(p => p.id === part.id);
        if (existing) {
            setSelectedParts(selectedParts.map(p =>
                p.id === part.id ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            setSelectedParts([...selectedParts, { ...part, quantity: 1 }]);
        }
        setIsPartsModalOpen(false);
    };

    const removePart = (partId: string) => {
        setSelectedParts(selectedParts.filter(p => p.id !== partId));
    };

    if (isLoading) return (
        <div className="bg-[#0a0c10] min-h-screen flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold opacity-50">Cargando detalles del servicio...</p>
        </div>
    );

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden bg-[#0a0c10] font-sans text-white border-x border-white/5">
            {/* Phase-based Header */}
            <header className="sticky top-0 z-[60] flex items-center justify-between bg-[#0a0c10]/95 backdrop-blur-md p-4 border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="flex size-10 items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="text-gray-300" size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#135bec]">Orden de Servicio</h2>
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{order?.order_number || 'ORD-SYNC'}</p>
                </div>
                <button
                    onClick={() => router.push('/agenda')}
                    className="flex h-10 px-3 items-center justify-center rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 transition-colors text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/10"
                >
                    Cancelar
                </button>
            </header>

            <AnimatePresence mode="wait">
                {order?.status === 'PENDING' ? (
                    <motion.div
                        key="pre-visit"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex-1 overflow-y-auto"
                    >
                        <div className="relative h-48 w-full group overflow-hidden">
                            {/* Fake Map Section */}
                            <div className="absolute inset-0 bg-[url('https://www.google.com/maps/d/u/0/thumbnail?mid=1S95_X_M0Hk4q9C7E5N_W5J9t-s0&msa=0')] bg-cover bg-center grayscale opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] to-transparent" />

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="absolute bottom-6 right-6 bg-[#135bec] hover:bg-blue-600 text-white px-6 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-[#135bec]/40 transition-all"
                            >
                                <Navigation size={16} />
                                Abrir Navegador GPS
                            </motion.button>
                        </div>

                        <main className="px-6 -mt-6 relative z-10 space-y-6 pb-20">
                            {/* Status Banner */}
                            <div className="bg-gray-900/40 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-5 flex items-center justify-between shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec]">
                                        <Hash size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado Actual</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                                            <p className="text-sm font-black text-white">Pendiente de Activación</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Summary Card */}
                            <div className="bg-gray-900/20 border border-white/5 rounded-[3rem] p-8 space-y-8 animate-fade-in shadow-inner">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <span className="px-3 py-1 rounded-full bg-[#135bec]/10 text-[#135bec] text-[9px] font-black uppercase tracking-widest border border-[#135bec]/20">Propietario</span>
                                        <h1 className="text-2xl font-black text-white tracking-tight leading-tight">{order.client?.full_name}</h1>
                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                            <MapIcon size={14} className="text-rose-500" />
                                            <p className="font-bold">{order.client?.address}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-4 text-center min-w-[90px] shadow-2xl">
                                        <p className="text-[9px] font-black text-[#135bec] uppercase tracking-[0.2em] mb-1">Cita</p>
                                        <p className="text-xl font-black text-white font-mono">
                                            {new Date(order.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex gap-4">
                                        <div className="size-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Motivo de Visita</p>
                                            <p className="text-sm font-bold text-gray-300 leading-relaxed italic">"{order.reported_issue}"</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] shrink-0">
                                            <Wrench size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Hardware</p>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{order.equipment?.brand} {order.equipment?.type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Actions Area */}
                            <div className="space-y-4 pt-6 pb-10">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={generateWhatsAppMessage}
                                    className="w-full py-5 bg-[#135bec] hover:bg-blue-600 rounded-[1.8rem] text-white font-black flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(19,91,236,0.3)] transition-all group"
                                >
                                    <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <CheckCircle size={20} />
                                    </div>
                                    <span className="uppercase tracking-[0.2em] text-sm">Validar y Confirmar</span>
                                </motion.button>

                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.open(`tel:${order.client?.phone}`, '_self')}
                                        className="py-4 bg-gray-900 hover:bg-gray-800 border border-white/5 rounded-[1.5rem] flex items-center justify-center gap-3 text-gray-400 font-black transition-all"
                                    >
                                        <Phone size={18} />
                                        <span className="text-[10px] uppercase tracking-widest">Llamar</span>
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push('/ai-assistant')}
                                        className="py-4 bg-gray-900 hover:bg-gray-800 border border-white/5 rounded-[1.5rem] flex items-center justify-center gap-3 text-[#00ff9d] font-black transition-all"
                                    >
                                        <Bot size={18} />
                                        <span className="text-[10px] uppercase tracking-widest">Asistente</span>
                                    </motion.button>
                                </div>

                                <button
                                    onClick={handleActivateService}
                                    className="w-full py-2 text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-[0.4em] transition-colors"
                                >
                                    Omitir Confirmación e Iniciar
                                </button>
                            </div>
                        </main>
                    </motion.div>
                ) : (
                    <motion.div
                        key="execution"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 overflow-y-auto"
                    >
                        {/* Status Execution Banner */}
                        <div className="px-6 py-4 bg-[#135bec]/10 border-b border-[#135bec]/20 flex items-center justify-center gap-3 shadow-inner">
                            <div className="size-2 rounded-full bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]" />
                            <span className="text-[10px] font-black text-[#135bec] uppercase tracking-[0.3em]">Servicio en Ejecución</span>
                        </div>

                        <div className="flex-1 flex flex-col w-full space-y-10 py-10 overflow-y-auto pb-44">
                            {/* Order Info Summary */}
                            {order && (
                                <section className="px-6 space-y-4">
                                    <div className="bg-gray-900/60 border border-white/10 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#135bec]/30" />
                                        <div className="size-16 rounded-[1.5rem] bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center text-[#135bec] shadow-inner">
                                            <Wrench size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-xl leading-tight text-white">
                                                    {order.equipment?.brand} {order.equipment?.type}
                                                </h3>
                                                {order.is_warranty && (
                                                    <span className="bg-amber-500/10 text-amber-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase border border-amber-500/20">Garantía</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User size={10} className="text-[#135bec]" />
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.client?.full_name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Switcher Component */}
                                    <div className="p-1 px-1.5 bg-black/40 rounded-2xl border border-gray-800 flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange('IN_PROGRESS')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${order.status === 'IN_PROGRESS' ? 'bg-[#135bec] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            En Proceso
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('WAITING_PARTS')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${order.status === 'WAITING_PARTS' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            En Repuestos
                                        </button>
                                    </div>

                                    {order.status === 'WAITING_PARTS' && (
                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-pulse">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center">
                                                Alerta de WhatsApp Activada para Repuestos
                                            </p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Diagnosis Section */}
                            <section className="px-6 space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">
                                    <Microscope className="text-[#135bec]" size={18} />
                                    <span>Informe Técnico Profesional</span>
                                </label>
                                <div className="relative group">
                                    <textarea
                                        className="w-full rounded-[2.5rem] border border-white/5 bg-gray-900/30 focus:border-[#135bec] focus:bg-gray-900/50 text-base min-h-[180px] p-6 text-white placeholder:text-gray-700 resize-none transition-all shadow-inner outline-none leading-relaxed"
                                        placeholder="Describa el hallazgo técnico, pruebas realizadas y resolución..."
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    ></textarea>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute bottom-5 right-5 p-4 bg-gray-900/80 backdrop-blur-md text-[#135bec] hover:text-white hover:bg-[#135bec] rounded-2xl transition-all shadow-xl border border-white/5"
                                    >
                                        <Mic size={24} />
                                    </motion.button>
                                </div>
                            </section>

                            {/* Costs Section */}
                            <section className="px-6 space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">
                                    <Wallet className="text-[#00ff9d]" size={18} />
                                    Liquidación de Mano de Obra
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 font-black text-xl">$</span>
                                    <input
                                        type="number"
                                        value={laborCost}
                                        onChange={(e) => setLaborCost(e.target.value)}
                                        className="w-full bg-gray-900/30 rounded-[1.8rem] py-6 pl-12 pr-6 text-2xl font-black border border-white/5 focus:border-[#00ff9d] focus:bg-gray-900/50 outline-none transition-all placeholder:text-gray-800"
                                        placeholder="0"
                                    />
                                </div>
                            </section>

                            {/* AI Recommendations Section (New from blueprint) */}
                            <section className="px-6 space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">
                                    <Bot className="text-[#00ff9d]" size={18} />
                                    Recomendaciones IA para Cliente
                                </label>
                                <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-5 shadow-inner">
                                    <div className="relative min-h-[100px] bg-black/20 rounded-2xl border border-white/5 p-4">
                                        {isGenerating ? (
                                            <div className="flex flex-col items-center justify-center h-20 gap-3">
                                                <div className="size-5 border-2 border-[#00ff9d]/30 border-t-[#00ff9d] rounded-full animate-spin"></div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest animate-pulse">ServiBot IA está redactando...</p>
                                            </div>
                                        ) : (
                                            <textarea
                                                className="w-full h-full bg-transparent text-sm text-gray-300 placeholder:text-gray-700 resize-none outline-none leading-relaxed font-medium no-scrollbar"
                                                placeholder="Genera sugerencias personalizadas de mantenimiento post-reparación..."
                                                value={recommendations}
                                                onChange={(e) => setRecommendations(e.target.value)}
                                            />
                                        )}
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAiRecommendations}
                                        disabled={isGenerating}
                                        className="w-full bg-gradient-to-r from-[#135bec] to-indigo-600 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#135bec]/20 disabled:opacity-50"
                                    >
                                        <Sparkles size={18} className="text-[#00ff9d]" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Sugerir Cuidado del Equipo</span>
                                    </motion.button>
                                </div>
                            </section>

                            {/* Spare Parts Section */}
                            <section className="px-6 space-y-6">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">
                                    <Box className="text-[#135bec]" size={18} />
                                    Componentes Remplazados
                                </label>
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {selectedParts.map((part) => (
                                            <motion.div
                                                key={part.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex items-center justify-between p-5 bg-gray-900/40 rounded-[2rem] border border-white/5 shadow-inner"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center text-gray-500">
                                                        <Box size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white">{part.name}</h4>
                                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
                                                            {part.quantity} UND • ${part.unit_price?.toLocaleString()} C/U
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-sm font-black text-[#00ff9d]">${(part.unit_price * part.quantity).toLocaleString()}</p>
                                                    <button
                                                        onClick={() => removePart(part.id)}
                                                        className="size-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setIsPartsModalOpen(true)}
                                            className="flex items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-gray-800 py-6 text-gray-500 hover:border-[#135bec] hover:text-[#135bec] transition-all group bg-gray-900/10"
                                        >
                                            <PlusCircle className="group-hover:rotate-90 transition-transform" size={24} />
                                            <span className="font-black text-[10px] uppercase tracking-[0.3em]">Stock</span>
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push(`/scanner?context=service_order&id=${serviceId}`)}
                                            className="flex items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-rose-500/20 py-6 text-gray-500 hover:border-rose-500 hover:text-rose-500 transition-all group bg-rose-500/[0.02]"
                                        >
                                            <QrCode className="group-hover:scale-110 transition-transform text-rose-500" size={24} />
                                            <span className="font-black text-[10px] uppercase tracking-[0.3em]">IA Scan</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </section>

                            {/* Invoicing Preview Section (Blueprint idea) */}
                            <section className="px-6 space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">
                                    <CreditCard className="text-[#135bec]" size={18} />
                                    Facturación y Cobro
                                </label>
                                <div className="bg-gray-900/40 border border-dashed border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between group hover:border-[#135bec]/40 transition-all cursor-pointer shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-gray-800/80 flex items-center justify-center text-gray-500 group-hover:text-[#135bec] transition-colors shadow-lg">
                                            <Box size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">Factura de Servicio</p>
                                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">Pendiente de Generación</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => router.push(`/invoice-preview/${serviceId}`)}
                                        className="h-10 px-5 rounded-xl bg-gray-900 border border-white/5 text-[#00ff9d] text-[10px] font-black uppercase tracking-widest hover:bg-[#00ff9d] hover:text-black transition-all shadow-xl"
                                    >
                                        Pre-visualizar
                                    </motion.button>
                                </div>
                            </section>

                            {/* Client Signature Area */}
                            <section className="px-6 pb-20 space-y-6">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">
                                    <PenTool className="text-[#135bec]" size={18} />
                                    Conformidad y Firma Digital
                                </label>
                                <div className="bg-gray-900/40 border border-white/5 rounded-[3rem] p-2 shadow-inner overflow-hidden">
                                    <SignatureCanvas
                                        onSave={(dataUrl: string) => setSignature(dataUrl)}
                                        onClear={() => setSignature(null)}
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Summary Footer Area */}
                        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[70] bg-[#0a0c10]/80 backdrop-blur-2xl border-t border-white/5 p-8 animate-in slide-in-from-bottom duration-500 pt-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between items-end px-2">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Liquidación Estimada</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm text-[#135bec] font-black">TOTAL</span>
                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                ${(Number(laborCost || 0) + selectedParts.reduce((acc, p) => acc + (p.unit_price * p.quantity), 0)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-[#00ff9d] uppercase tracking-widest block mb-1">Stock Aplicado</span>
                                        <p className="text-xs font-bold text-gray-400">${selectedParts.reduce((acc, p) => acc + (p.unit_price * p.quantity), 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleFinishOrder}
                                    disabled={isSaving}
                                    className="w-full bg-[#135bec] text-white font-black py-5 px-8 rounded-[2rem] shadow-[0_20px_40px_rgba(19,91,236,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
                                >
                                    {isSaving ? (
                                        <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="text-sm uppercase tracking-[0.3em]">Cerrar y Facturar</span>
                                            <CreditCard size={20} />
                                            <motion.div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WhatsApp AI Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-[#0f1115] w-full max-w-sm rounded-[3.5rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 bg-[#135bec]/5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-[#00ff9d]/10 flex items-center justify-center text-[#00ff9d] shadow-inner">
                                        <MessageCircle size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-white leading-tight">ServiBot IA</h3>
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-0.5">WhatsApp Predictivo</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="size-10 flex items-center justify-center rounded-2xl bg-gray-900 border border-white/5 text-gray-600 hover:text-white"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Message Bubble */}
                                <div className="relative group">
                                    <div className={`bg-[#0b141a] rounded-[2rem] rounded-tl-none border border-white/10 p-6 shadow-2xl transition-all ${isWaGenerating ? 'blur-[4px] opacity-40' : ''}`}>
                                        <textarea
                                            value={waMessage}
                                            onChange={(e) => setWaMessage(e.target.value)}
                                            className="w-full h-40 bg-transparent text-gray-200 text-sm leading-relaxed resize-none outline-none no-scrollbar font-bold"
                                            placeholder="Redactando mensaje..."
                                        />
                                        <div className="flex justify-end items-center gap-2 mt-4">
                                            <Sparkles size={12} className="text-[#135bec]" />
                                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">IA Engine Optimized</span>
                                        </div>
                                    </div>
                                    {/* Tail */}
                                    <div className="absolute -top-[1px] -left-3 w-4 h-4 bg-[#0b141a] border-l border-t border-white/10" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                                </div>

                                <div className="space-y-4">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={sendWhatsApp}
                                        disabled={isWaGenerating || !waMessage}
                                        className="w-full h-16 bg-[#00ff9d] hover:bg-[#00e08b] text-black font-black rounded-2xl shadow-[0_15px_30px_rgba(0,255,157,0.2)] flex items-center justify-center gap-4 transition-all disabled:opacity-50"
                                    >
                                        <Check size={24} />
                                        <span className="text-sm uppercase tracking-widest">Enviar y Activar</span>
                                    </motion.button>

                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="w-full py-2 text-gray-500 hover:text-white font-black text-[9px] uppercase tracking-[0.4em] transition-colors"
                                    >
                                        Corregir Manualmente
                                    </button>
                                </div>
                            </div>

                            {isWaGenerating && (
                                <div className="h-1.5 w-full bg-gray-900 absolute bottom-0">
                                    <motion.div
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="h-full w-1/2 bg-[#135bec] shadow-[0_0_15px_#135bec]"
                                    />
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Part Picker Modal - Styled Premium */}
            <AnimatePresence>
                {isPartsModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-end justify-center p-6"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-md bg-[#0d0f14] border-t border-white/10 rounded-t-[4rem] p-10 max-h-[85vh] flex flex-col shadow-[0_-50px_100px_rgba(0,0,0,0.5)]"
                        >
                            {/* Handle */}
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-gray-800 rounded-full" />

                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Seleccionar Repuestos</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Inventario Central Pro</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsPartsModalOpen(false)}
                                    className="size-12 flex items-center justify-center rounded-2xl bg-gray-900 border border-white/10 text-gray-500"
                                >
                                    <XCircle size={24} />
                                </motion.button>
                            </div>

                            <div className="relative mb-10 group">
                                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#135bec] transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Nombre o código de pieza..."
                                    className="w-full bg-gray-900/50 border border-white/5 rounded-[1.8rem] py-6 pl-14 pr-6 text-sm focus:border-[#135bec] focus:bg-gray-900 outline-none transition-all placeholder:text-gray-700"
                                    value={partsSearch}
                                    onChange={(e) => setPartsSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-10">
                                {availableParts.filter(p => p.name.toLowerCase().includes(partsSearch.toLowerCase())).map((part, idx) => (
                                    <motion.button
                                        key={part.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => addPartToOrder(part)}
                                        className="w-full flex items-center justify-between p-6 bg-gray-900/30 border border-white/5 rounded-[2.5rem] hover:bg-gray-900 hover:border-white/10 transition-all text-left group overflow-hidden relative"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#135bec] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-5">
                                            <div className="size-14 rounded-[1.3rem] bg-gray-900 border border-white/5 flex items-center justify-center text-[#135bec] font-black text-base shadow-inner">
                                                {part.code.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-white">{part.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-[#00ff9d] font-black uppercase tracking-widest">
                                                        STOCK {part.stock_level}
                                                    </span>
                                                    <div className="size-1 rounded-full bg-gray-700" />
                                                    <span className="text-[10px] text-gray-600 font-bold uppercase">{part.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white tracking-tight">${part.unit_price.toLocaleString()}</p>
                                            <div className="size-8 rounded-full bg-gray-900 border border-white/5 flex items-center justify-center text-[#135bec] ml-auto mt-2 pointer-events-none">
                                                <PlusCircle size={18} />
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
