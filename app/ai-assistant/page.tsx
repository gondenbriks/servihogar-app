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
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistantPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'chat' | 'diagnose'>('chat');
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
            const responseText = await chatWithGemini(userMessage.text, history);

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
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
        <div className="bg-[#0a0c10] min-h-screen text-white max-w-4xl mx-auto flex flex-col font-sans relative">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-[#0a0c10]/95 backdrop-blur-md p-4 border-b border-gray-800 shadow-lg">
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

                {/* Mode Toggle */}
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
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Síntomas Reportados</label>
                                    <textarea
                                        rows={4}
                                        placeholder="No enciende, error OE, ruido fuerte en centrifugado..."
                                        value={symptoms}
                                        onChange={e => setSymptoms(e.target.value)}
                                        className="w-full bg-black/40 border border-gray-800 rounded-[1.5rem] px-4 py-4 text-sm focus:border-[#135bec] outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleDiagnose}
                                    disabled={isPending || !applianceData.brand || !symptoms}
                                    className="w-full py-4 bg-[#135bec] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#135bec]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isPending ? (
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            Analizar con Gemini
                                        </>
                                    )}
                                </button>
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
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu consulta técnica..."
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
                            disabled={!inputValue.trim() || isLoading}
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
        </div>
    );
}
