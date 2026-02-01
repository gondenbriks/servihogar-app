'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { diagnoseService, DiagnosisResult } from '../actions/diagnose-service';
import { chatWithGemini } from '../actions/chat-service';
import { ChatMessage } from '../../types/index';
import {
    ChevronLeft,
    Bot,
    Send,
    Mic,
    Sparkles,
    CheckCircle2,
    Clock,
    Package,
    BrainCircuit,
    Save,
    Activity,
    AlertTriangle,
    Camera,
    X,
    Maximize2,
    Zap,
    LayoutTemplate,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from '../../components/design/Background';
import NeonButton from '../../components/design/NeonButton';

interface Template {
    id: string;
    title: string;
    content: string;
    isSystem?: boolean;
}

const PREDEFINED_TEMPLATES: Template[] = [
    {
        id: 'sys-wash',
        title: 'Lavadora: Diagnóstico General',
        content: 'Revisando Lavadora [MARCA] [MODELO]. Síntoma: [NO DRENA / NO CENTRIFUGA]. Necesito causas probables y pasos para Test Mode.',
        isSystem: true
    },
    {
        id: 'sys-fridge',
        title: 'Nevera: No Enfría',
        content: 'Nevera [MARCA] No-Frost no enfría en conservación. Revisar sistema de deshielo y sensores.',
        isSystem: true
    },
    {
        id: 'sys-dryer',
        title: 'Secadora: No Calienta',
        content: 'Secadora [MARCA]. Gira pero no calienta. Revisar termostatos e ignitor.',
        isSystem: true
    }
];

export default function AIAssistantPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'chat' | 'diagnose'>('chat');

    // Template State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [newTemplateTitle, setNewTemplateTitle] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('servitech_templates');
        if (saved) {
            try {
                setTemplates(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading templates", e);
            }
        }
    }, []);

    const handleSaveTemplate = () => {
        if (!newTemplateTitle || !symptoms) return;
        const newTemp: Template = {
            id: Date.now().toString(),
            title: newTemplateTitle,
            content: symptoms
        };
        const updated = [newTemp, ...templates];
        setTemplates(updated);
        localStorage.setItem('servitech_templates', JSON.stringify(updated));
        setIsSavingTemplate(false);
        setNewTemplateTitle('');
    };

    const handleApplyTemplate = (content: string) => {
        setSymptoms(content);
        setShowTemplateModal(false);
    };

    const handleDeleteTemplate = (id: string) => {
        if (confirm('¿Eliminar esta plantilla?')) {
            const updated = templates.filter(t => t.id !== id);
            setTemplates(updated);
            localStorage.setItem('servitech_templates', JSON.stringify(updated));
        }
    };
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: '¡Hola! Soy ServiBot, tu Gerente de Operaciones IA. 🤖\n\nPuedo ayudarte con:\n📦 Consultas de Inventario\n📅 Estado de la Agenda\n🔧 Soporte Técnico\n💰 Resumen Financiero\n\n¿Qué necesitas saber hoy?',
            timestamp: new Date()
        }
    ]);

    const suggestions = [
        { label: "📦 Stock Motores", query: "¿Qué stock tenemos de motores?" },
        { label: "📅 Estado Agenda", query: "¿Cómo va la agenda de hoy?" },
        { label: "🔧 Manual LG", query: "Procedimiento para error LE en LG" },
        { label: "💰 Resumen Semanal", query: "Dame un resumen de las ganancias de esta semana" },
    ];

    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Diagnosis State
    const [applianceData, setApplianceData] = useState({ brand: '', model: '', year: '' });
    const [symptoms, setSymptoms] = useState('');
    const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isFlashOn, setIsFlashOn] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isCameraOpen) {
            startChatCamera();
        } else {
            stopChatCamera();
        }
    }, [isCameraOpen]);

    const startChatCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
            streamRef.current = stream;
        } catch (err) {
            console.error(err);
            alert("No se pudo acceder a la cámara.");
            setIsCameraOpen(false);
        }
    };

    const stopChatCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const capturePhotoForChat = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            setCapturedImage(canvas.toDataURL('image/jpeg'));
            setIsCameraOpen(false);
        }
    };

    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (mode === 'chat') scrollToBottom();
    }, [messages, mode]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: textToSend.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const history = messages.map(m => ({
            role: m.role as "user" | "model",
            parts: [{ text: m.text }]
        }));

        try {
            const responseText = await chatWithGemini(userMessage.text, history, capturedImage || undefined);

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setCapturedImage(null);
        } catch (error: any) {
            console.error(error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: '⚠️ **Falla de conexión**: No he podido conectar con el servidor de IA.\n\nPor favor, verifica que tu conexión a internet sea estable y que las claves de API (GEMINI_API_KEY) estén configuradas correctamente en el panel de control.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiagnose = () => {
        if (!applianceData.brand || !applianceData.model || !symptoms) return;

        startTransition(async () => {
            try {
                const result = await diagnoseService(applianceData, symptoms);
                setDiagnosisResult(result);
            } catch (error) {
                console.error("Error en diagnóstico:", error);
                alert("Ocurrió un error en el diagnóstico. Intenta de nuevo.");
            }
        });
    };

    const handleSaveToOrder = async () => {
        if (!diagnosisResult) return;
        alert("Diagnóstico guardado en el portapapeles. Pronto podrás vincularlo a órdenes específicas.");
    };

    return (
        <div className="bg-background min-h-screen text-white max-w-4xl mx-auto flex flex-col font-outfit relative overflow-hidden">
            <Background />
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-background/80 backdrop-blur-md p-4 border-b border-gray-800 shadow-lg">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#135bec] to-[#00d4ff] flex items-center justify-center shadow-lg shadow-[#135bec]/20">
                            <Bot size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-tight leading-none">ServiBot IA</h2>
                            <p className="text-[10px] text-[#00ff9d] font-bold flex items-center gap-1 mt-1 uppercase tracking-widest">
                                <span className="size-1.5 bg-[#00ff9d] rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mode & Template Toggle */}
                <div className="flex items-center gap-2">
                    {mode === 'diagnose' && (
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="p-2 bg-gray-900/50 border border-white/5 rounded-xl text-gray-400 hover:text-blue-400 transition-colors"
                            title="Plantillas"
                        >
                            <LayoutTemplate size={18} />
                        </button>
                    )}
                    <div className="flex bg-gray-900/50 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => { setMode('chat'); setDiagnosisResult(null); }}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'chat' ? 'bg-[#135bec] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => setMode('diagnose')}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'diagnose' ? 'bg-[#135bec] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            IA-Expert
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
                {mode === 'chat' ? (
                    <>
                        <div className="space-y-6">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="size-8 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                                            <Bot size={14} className="text-[#00d4ff]" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-[1.5rem] p-4 shadow-sm ${msg.role === 'user'
                                            ? 'bg-[#135bec] text-white rounded-tr-none shadow-lg shadow-[#135bec]/20'
                                            : 'bg-gray-900/80 border border-white/5 text-gray-200 rounded-tl-none'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap text-[13px] leading-relaxed">
                                            {msg.text}
                                        </div>
                                        <div className={`text-[9px] mt-2 font-bold opacity-40 text-right uppercase tracking-widest`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="size-8 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                                    <Bot size={14} className="text-[#00d4ff]" />
                                </div>
                                <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 flex gap-1.5 items-center">
                                    <div className="size-1.5 bg-[#135bec] rounded-full animate-bounce"></div>
                                    <div className="size-1.5 bg-[#135bec] rounded-full animate-bounce delay-150"></div>
                                    <div className="size-1.5 bg-[#135bec] rounded-full animate-bounce delay-300"></div>
                                </div>
                            </motion.div>
                        )}

                        {!isLoading && messages.length < 3 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-2 pt-4"
                            >
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-3 ml-1 tracking-widest">Sugerencias Rápidas</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(s.query)}
                                            className="text-[11px] bg-gray-900/50 hover:bg-[#135bec]/10 border border-white/5 rounded-xl px-4 py-2.5 text-gray-300 transition-all text-left font-bold"
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {!diagnosisResult ? (
                            <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-10 rounded-2xl bg-[#135bec]/10 flex items-center justify-center">
                                        <BrainCircuit className="text-[#135bec]" size={24} />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">Diagnóstico Técnico IA</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Marca</label>
                                        <input
                                            type="text"
                                            placeholder="Samsung, LG..."
                                            value={applianceData.brand}
                                            onChange={e => setApplianceData({ ...applianceData, brand: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl px-4 py-3 text-sm focus:border-[#135bec] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Modelo</label>
                                        <input
                                            type="text"
                                            placeholder="WD12V..."
                                            value={applianceData.model}
                                            onChange={e => setApplianceData({ ...applianceData, model: e.target.value })}
                                            className="w-full bg-black/40 border border-gray-800 rounded-2xl px-4 py-3 text-sm focus:border-[#135bec] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Síntomas Reportados</label>
                                        {symptoms.trim() && (
                                            <button
                                                onClick={() => setIsSavingTemplate(true)}
                                                className="text-[10px] text-[#135bec] font-bold uppercase hover:underline"
                                            >
                                                Guardar Plantilla
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        rows={4}
                                        placeholder="No enciende, error OE, ruido fuerte en centrifugado..."
                                        value={symptoms}
                                        onChange={e => setSymptoms(e.target.value)}
                                        className="w-full bg-black/40 border border-gray-800 rounded-[1.5rem] px-4 py-4 text-sm focus:border-[#135bec] outline-none transition-all resize-none"
                                    />
                                </div>

                                <NeonButton
                                    onClick={handleDiagnose}
                                    className="w-full justify-center"
                                >
                                    {isPending ? (
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            <span className="ml-2">Analizar con Gemini</span>
                                        </>
                                    )}
                                </NeonButton>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-20 animate-in slide-in-from-bottom duration-500">
                                <div className="flex items-center justify-between px-2">
                                    <button
                                        onClick={() => setDiagnosisResult(null)}
                                        className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white"
                                    >
                                        <ChevronLeft size={14} />
                                        Nuevo Análisis
                                    </button>
                                    <button
                                        onClick={handleSaveToOrder}
                                        className="bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#00ff9d] hover:text-black transition-all"
                                    >
                                        <Save size={14} />
                                        Guardar
                                    </button>
                                </div>

                                {/* Diagnosis Result Card */}
                                <div className="bg-gray-900/60 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 size-32 bg-[#135bec]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>

                                    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                                        <div>
                                            <p className="text-[#00d4ff] text-[9px] font-black uppercase tracking-[0.3em] mb-1">Informe IA</p>
                                            <h3 className="text-xl font-black">Diagnóstico Generado</h3>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${diagnosisResult.probability === 'Alta' ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'bg-amber-500/10 text-amber-500'
                                            } border border-white/5`}>
                                            <span className="size-1.5 bg-current rounded-full animate-pulse"></span>
                                            Confianza {diagnosisResult.probability}
                                        </div>
                                    </div>

                                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                                        <p className="text-sm text-gray-200 leading-relaxed font-medium italic">
                                            "{diagnosisResult.diagnosis}"
                                        </p>
                                    </div>
                                </div>

                                {/* Security Warning */}
                                {diagnosisResult.safety_warning && (
                                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-[2rem] p-6 shadow-xl">
                                        <div className="flex items-center gap-3 text-rose-500 mb-2">
                                            <AlertTriangle size={20} />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest">Advertencia de Seguridad</h4>
                                        </div>
                                        <p className="text-xs text-rose-100/80 font-bold leading-relaxed">
                                            {diagnosisResult.safety_warning}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-6 pt-4">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-[#00ff9d]/10 border border-[#00ff9d]/30 p-6 rounded-[2.5rem] text-center relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Activity size={40} className="text-[#00ff9d]" />
                                        </div>
                                        <div className="size-16 rounded-full bg-[#00ff9d]/20 flex items-center justify-center mx-auto mb-4 border border-[#00ff9d]/30">
                                            <CheckCircle2 size={32} className="text-[#00ff9d]" />
                                        </div>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Diagnóstico Finalizado</h3>
                                        <p className="text-[10px] text-[#00ff9d] font-black uppercase tracking-[0.2em] mt-2">IA en tiempo real</p>
                                    </motion.div>

                                    <div className="bg-gray-900 border border-white/5 rounded-[2.5rem] p-6">
                                        <h4 className="text-[#135bec] text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={16} />
                                            Protocolo de Reparación
                                        </h4>
                                        <div className="space-y-3">
                                            {diagnosisResult.repair_steps.map((step: string, i: number) => (
                                                <div key={i} className="flex gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-[#135bec]/30 transition-all">
                                                    <div className="size-6 rounded-lg bg-[#135bec]/10 flex items-center justify-center text-[10px] font-black text-[#135bec] shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-xs text-gray-300 leading-relaxed font-medium">{step}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 border border-white/5 rounded-[2.5rem] p-6">
                                        <h4 className="text-[#00d4ff] text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Package size={16} />
                                            Repuestos Recomendados
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {diagnosisResult.suggested_parts.map((part: string, i: number) => (
                                                <div key={i} className="bg-black/40 border border-white/5 px-4 py-2 rounded-full text-[10px] font-black text-gray-300 flex items-center gap-2">
                                                    <div className="size-1.5 bg-[#00d4ff] rounded-full"></div>
                                                    {part}
                                                </div>
                                            ))}
                                        </div>
                                        {diagnosisResult.estimated_labor_time && (
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Tiempo Estimado</span>
                                                <div className="flex items-center gap-2 text-xs font-black text-white bg-gray-800 px-4 py-2 rounded-xl border border-white/5">
                                                    <Clock size={14} className="text-[#00d4ff]" />
                                                    {diagnosisResult.estimated_labor_time}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveToOrder}
                                        className="w-full bg-[#135bec] text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_40px_rgba(19,91,236,0.3)] border border-white/10"
                                    >
                                        Vincular a Orden de Servicio
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer Form (Chat) */}
            {mode === 'chat' && (
                <div className="bg-[#0a0c10]/95 backdrop-blur-xl border-t border-white/5 p-5 fixed bottom-0 w-full max-w-4xl z-[60] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] left-1/2 -translate-x-1/2">
                    {capturedImage && (
                        <div className="mb-4 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                            <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-[#135bec] shadow-lg shadow-[#135bec]/20">
                                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setCapturedImage(null)}
                                    className="absolute top-1 right-1 size-6 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-md"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#135bec] uppercase tracking-widest">Imagen Lista</p>
                                <p className="text-[9px] text-gray-500 font-bold">ServiBot la analizará al enviar</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCameraOpen(true)}
                            className="size-14 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center text-[#135bec] hover:bg-[#135bec]/10 transition-all active:scale-95"
                        >
                            <Camera size={24} />
                        </button>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={capturedImage ? "Describe la falla o el repuesto..." : "Escribe tu consulta técnica..."}
                                className="w-full bg-gray-900 border border-white/5 text-white rounded-2xl pl-5 pr-12 py-4 focus:outline-none focus:border-[#135bec] transition-all placeholder:text-gray-600 text-sm font-medium"
                                disabled={isLoading}
                            />
                            <button
                                onClick={toggleListening}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'text-[#00ff9d] bg-[#00ff9d]/10 animate-pulse' : 'text-gray-500 hover:text-[#00d4ff]'}`}
                                disabled={isLoading}
                                type="button"
                            >
                                <Mic size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || (!inputValue.trim() && !capturedImage)}
                            className="size-14 rounded-2xl bg-[#135bec] flex items-center justify-center text-white shadow-lg shadow-[#135bec]/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Send size={24} />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-600 mt-4 font-bold uppercase tracking-[0.2em]">
                        ServiBot v2.0 • Powered by Gemini 1.5 Pro
                    </p>
                </div>
            )}
            {/* Template Modal Overlay */}
            <AnimatePresence>
                {showTemplateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#0f1115] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <LayoutTemplate className="text-[#135bec]" size={20} />
                                    PLANTILLAS
                                </h3>
                                <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sitema</p>
                                    <div className="grid gap-2">
                                        {PREDEFINED_TEMPLATES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleApplyTemplate(t.content)}
                                                className="text-left p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-[#135bec]/30 transition-all group"
                                            >
                                                <p className="text-xs font-black text-white group-hover:text-[#135bec]">{t.title}</p>
                                                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{t.content}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {templates.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mis Plantillas</p>
                                        <div className="grid gap-2">
                                            {templates.map(t => (
                                                <div key={t.id} className="relative group">
                                                    <button
                                                        onClick={() => handleApplyTemplate(t.content)}
                                                        className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-[#135bec]/30 transition-all"
                                                    >
                                                        <p className="text-xs font-black text-white group-hover:text-[#135bec]">{t.title}</p>
                                                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{t.content}</p>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }}
                                                        className="absolute top-4 right-4 p-1 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Save Template Modal */}
            <AnimatePresence>
                {isSavingTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[210] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0f1115] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
                        >
                            <h3 className="text-xl font-black mb-6">Guardar Plantilla</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título</label>
                                    <input
                                        type="text"
                                        value={newTemplateTitle}
                                        onChange={e => setNewTemplateTitle(e.target.value)}
                                        placeholder="Ej: Lavadora LG no centr..."
                                        className="w-full bg-black/40 border border-gray-800 rounded-2xl px-4 py-3 text-sm focus:border-[#135bec] outline-none transition-all"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsSavingTemplate(false)}
                                        className="flex-1 py-4 bg-gray-900 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveTemplate}
                                        disabled={!newTemplateTitle}
                                        className="flex-1 py-4 bg-[#135bec] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Modal Overlay */}
            <AnimatePresence>
                {isCameraOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6"
                    >
                        <div className="relative w-full max-w-sm aspect-square bg-gray-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Overlay Scanner UI */}
                            <div className="absolute inset-0 border-[2px] border-dashed border-[#00ff9d]/30 m-12 rounded-[2rem] pointer-events-none" />

                            <button
                                onClick={() => setIsCameraOpen(false)}
                                className="absolute top-6 right-6 size-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mt-10 flex flex-col items-center gap-6">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={capturePhotoForChat}
                                className="size-24 bg-white rounded-full border-[8px] border-gray-900 shadow-2xl flex items-center justify-center"
                            >
                                <div className="size-14 bg-[#135bec] rounded-full flex items-center justify-center text-white">
                                    <Maximize2 size={24} />
                                </div>
                            </motion.button>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Centrar objeto para análisis</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
