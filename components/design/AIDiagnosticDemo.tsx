'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Zap, Activity, Search, AlertTriangle, FileText, Cpu, ChevronRight } from 'lucide-react';
import NeonButton from './NeonButton';

const AIDiagnosticDemo: React.FC = () => {
    const [activeScenario, setActiveScenario] = useState<number | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [step, setStep] = useState(0);

    const scenarios = [
        {
            id: 1,
            title: "Lavadora Samsung",
            problem: "Código de Error 4E / No llena agua",
            icon: Activity,
            analysis: [
                "Analizando código de error 4E...",
                "Consultando manual de servicio Samsung Serie WF...",
                "Verificando impedancia de electroválvulas...",
                "Generando protocolo de reparación..."
            ],
            result: {
                causa: "Falla en suministro de agua o Electroválvula abierta.",
                solucion: "Limpieza de filtros de malla y medición de bobinas.",
                valores: "Resistencia esperada: 2.5 kΩ - 4.5 kΩ",
                herramientas: "Multímetro, Pinzas de punta, Destornillador Phillips."
            }
        },
        {
            id: 2,
            title: "Nevera LG Inverter",
            problem: "El compresor arranca pero se detiene (3 blinks)",
            icon: Zap,
            analysis: [
                "Decodificando señal LED de la PCB Inverter...",
                "3 Parpadeos = Falla de arranque / OLP...",
                "Revisando tabla de termistores...",
                "Calculando consumo de amperaje..."
            ],
            result: {
                causa: "Bloqueo mecánico del compresor o falla en IPM.",
                solucion: "Medir continuidad en bornes UVW y voltaje DC en capacitores.",
                valores: "Resistencia bobinas: 12-15 Ω (Equilibradas)",
                herramientas: "Multímetro (Escala Ohm), Pinza Amperimétrica."
            }
        },
        {
            id: 3,
            title: "Aire Acondicionado",
            problem: "Gotea agua hacia adentro (Split)",
            icon: AlertTriangle,
            analysis: [
                "Analizando flujo de condensación...",
                "Verificando nivelación de unidad evaporadora...",
                "Revisando obstrucción en manguera de drenaje...",
                "Detectando congelamiento por falta de gas..."
            ],
            result: {
                causa: "Obstrucción en bandeja de drenaje por biopelícula.",
                solucion: "Mantenimiento preventivo y sondeo de ducto.",
                valores: "Nivelación: Inclinación 2° hacia drenaje.",
                herramientas: "Hidrolavadora, Sonda pasacables, Nivel."
            }
        }
    ];

    const handleSimulate = (id: number) => {
        setActiveScenario(id);
        setAnalyzing(true);
        setStep(0);
    };

    useEffect(() => {
        if (analyzing && activeScenario !== null) {
            const scenario = scenarios.find(s => s.id === activeScenario);
            if (!scenario) return;

            if (step < scenario.analysis.length) {
                const timeout = setTimeout(() => {
                    setStep(prev => prev + 1);
                }, 800);
                return () => clearTimeout(timeout);
            } else {
                setAnalyzing(false);
            }
        }
    }, [analyzing, step, activeScenario]);

    const currentScenario = scenarios.find(s => s.id === activeScenario);

    return (
        <section id="ia" className="py-20 px-6 relative z-10 border-t border-white/5 bg-black/40">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00f3ff]/30 bg-[#00f3ff]/10 text-[#00f3ff] text-[9px] font-black uppercase tracking-[0.25em] mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" />
                        ASISTENTE TÉCNICO V2.4
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">
                        TU COPILOTO DE <span className="text-[#00f3ff] not-italic">DIAGNÓSTICO</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto font-medium">
                        No adivines. ServiTech Pro usa <strong>Inteligencia Artificial</strong> para analizar síntomas, códigos de error y manuales técnicos en segundos. Obtén soluciones precisas y profesionaliza tu servicio.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch">

                    {/* Left Column: Input Simulation */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black font-mono text-gray-500 uppercase mb-2 tracking-widest">1. SELECCIONA UN PROBLEMA COMÚN</h3>
                        {scenarios.map((scenario) => (
                            <div
                                key={scenario.id}
                                onClick={() => handleSimulate(scenario.id)}
                                className={`
                                    p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center gap-4 group
                                    ${activeScenario === scenario.id
                                        ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                `}
                            >
                                <div className={`p-3 rounded-xl ${activeScenario === scenario.id ? 'bg-[#00f3ff] text-black' : 'bg-gray-800 text-gray-400 group-hover:text-white'}`}>
                                    <scenario.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-black uppercase text-xs tracking-wider ${activeScenario === scenario.id ? 'text-white' : 'text-gray-300'}`}>{scenario.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{scenario.problem}</p>
                                </div>
                                <ChevronRight size={16} className={`transition-transform ${activeScenario === scenario.id ? 'text-[#00f3ff] translate-x-1' : 'text-gray-600'}`} />
                            </div>
                        ))}

                        <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-dashed border-white/10 text-center">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                                * En la app real, puedes subir fotos de la placa electrónica o describir el problema con tu voz.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: AI Output Simulation */}
                    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[450px] relative shadow-2xl">
                        {/* Header Terminal */}
                        <div className="bg-black/80 p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500"></div>
                            </div>
                            <div className="text-[10px] font-black font-mono text-gray-500 flex items-center gap-2 tracking-[0.2em] uppercase">
                                <Cpu size={12} className="text-[#00f3ff]" /> SERVITECH_CORE_AI
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 bg-black/40 font-mono text-xs relative overflow-hidden">

                            {!activeScenario && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-30">
                                    <Bot size={64} className="mb-6 animate-float" />
                                    <p className="font-black tracking-[0.4em] uppercase">ESPERANDO DATOS...</p>
                                </div>
                            )}

                            {activeScenario && currentScenario && (
                                <div className="space-y-6 relative z-10">
                                    <div className="text-[#00f3ff] border-b border-[#00f3ff]/20 pb-4 mb-6 font-black tracking-widest">
                                        {'>'} DIAGNOSTICANDO: {currentScenario.title.toUpperCase()}
                                    </div>

                                    {/* Analysis Steps */}
                                    <div className="space-y-3">
                                        {currentScenario.analysis.map((line, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${step > idx ? 'opacity-100' : 'opacity-0'}`}>
                                                <span className="text-[#39ff14] font-black">✔</span>
                                                <span className="text-gray-300 font-medium uppercase tracking-tight">{line}</span>
                                            </div>
                                        ))}
                                        {analyzing && (
                                            <div className="flex items-center gap-3 text-[#00f3ff] animate-pulse">
                                                <div className="w-4 h-4 border-2 border-[#00f3ff]/30 border-t-[#00f3ff] rounded-full animate-spin"></div>
                                                <span className="uppercase font-black text-[10px] tracking-widest">Procesando lógica...</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Final Result */}
                                    {!analyzing && step >= currentScenario.analysis.length && (
                                        <div className="mt-8 animate-in slide-in-from-bottom-5 duration-700">
                                            <div className="bg-[#39ff14]/5 border border-[#39ff14]/30 rounded-2xl p-6 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle size={18} className="text-[#39ff14] shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="text-[9px] text-[#39ff14] font-black block uppercase tracking-[0.2em] mb-1">CAUSA PROBABLE (98% Confianza)</span>
                                                        <p className="text-white font-black uppercase text-sm tracking-tight">{currentScenario.result.causa}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                    <div>
                                                        <span className="text-[9px] text-gray-500 block mb-2 uppercase font-black tracking-widest">SOLUCIÓN SUGERIDA</span>
                                                        <p className="text-gray-200 text-[11px] font-medium leading-relaxed">{currentScenario.result.solucion}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] text-gray-500 block mb-2 uppercase font-black tracking-widest">VALORES REFERENCIA</span>
                                                        <p className="text-[#00f3ff] text-[11px] font-black uppercase tracking-tight">{currentScenario.result.valores}</p>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/10">
                                                    <span className="text-[9px] text-gray-500 block mb-2 uppercase font-black tracking-widest">HERRAMIENTAS REQUERIDAS</span>
                                                    <div className="text-gray-400 text-[11px] flex items-center gap-2 font-medium">
                                                        <FileText size={14} className="text-[#00f3ff]" /> {currentScenario.result.herramientas}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 text-right flex items-center justify-end gap-2 opacity-50">
                                                <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></div>
                                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">_ REPORTE FINALIZADO</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Scanline Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f3ff]/5 to-transparent h-[20%] w-full animate-scanline pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIDiagnosticDemo;
