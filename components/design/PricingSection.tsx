'use client';

import React, { useState } from 'react';
import { Check, Zap, Users, Shield, Plus, Minus } from 'lucide-react';
import NeonButton from './NeonButton';

const PricingSection: React.FC = () => {
    const [isAnnual, setIsAnnual] = useState(true);
    const [teamSize, setTeamSize] = useState(3);

    const basePrice = isAnnual ? 79 : 99;
    const extraTechPrice = 15;
    const baseUsers = 3;

    const extraUsers = Math.max(0, teamSize - baseUsers);
    const totalCost = basePrice + (extraUsers * extraTechPrice);

    const handleTeamChange = (increment: boolean) => {
        setTeamSize(prev => {
            const next = increment ? prev + 1 : prev - 1;
            return next < 3 ? 3 : next;
        });
    };

    return (
        <section id="pricing" className="py-20 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                        INVIERTE EN TU <span className="text-[#39ff14]">TRANQUILIDAD</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto font-medium">
                        Cuesta menos que invitar a almorzar a tu equipo. Recupera tu inversión en la primera semana evitando pérdidas.
                    </p>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm font-mono transition-colors ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>PAGO MENSUAL</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative w-16 h-8 bg-gray-800 rounded-full border border-gray-600 p-1 transition-colors hover:border-[#00f3ff] focus:outline-none"
                        >
                            <div
                                className={`w-6 h-6 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}
                            />
                        </button>
                        <span className={`text-sm font-mono transition-colors ${isAnnual ? 'text-[#00f3ff]' : 'text-gray-500'}`}>
                            ANUAL <span className="text-xs text-[#39ff14] ml-1 border border-39ff14/30 px-1 rounded">AHORRA 20%</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 items-start mb-16">

                    {/* Card 1: Solo Tech */}
                    <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 hover:border-[#00e5ff]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)] group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={100} />
                        </div>

                        <h3 className="text-xl font-mono text-[#00e5ff] mb-2 uppercase font-black">EMPRENDEDOR</h3>
                        <p className="text-gray-400 text-sm mb-6 h-10">¿Trabajas solo? Organízate y luce profesional ante tus clientes.</p>

                        <div className="mb-8">
                            <span className="text-4xl font-bold text-white">{isAnnual ? '$29' : '$39'}</span>
                            <span className="text-gray-500 text-sm">/mes</span>
                        </div>

                        <ul className="space-y-4 mb-8 text-sm text-gray-300">
                            <li className="flex gap-3 items-center"><Check size={16} className="text-[#00e5ff]" /> 1 Usuario (Dueño)</li>
                            <li className="flex gap-3 items-center"><Check size={16} className="text-[#00e5ff]" /> Órdenes Digitales Ilimitadas</li>
                            <li className="flex gap-3 items-center"><Check size={16} className="text-[#00e5ff]" /> Base de Datos de Clientes</li>
                            <li className="flex gap-3 items-center"><Check size={16} className="text-[#00e5ff]" /> Notificaciones Básicas</li>
                        </ul>

                        <button className="w-full py-3 border border-white/20 rounded hover:bg-white/5 transition-colors text-sm font-mono tracking-wider font-bold">
                            EMPEZAR PRUEBA
                        </button>
                    </div>

                    {/* Card 2: Workshop Team (Featured) */}
                    <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-2xl border-2 border-[#bc13fe]/50 shadow-[0_0_30px_rgba(188,19,254,0.15)] relative transform md:-translate-y-4">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#00f3ff] via-[#bc13fe] to-[#00f3ff]"></div>
                        <div className="absolute top-4 right-4 bg-[#bc13fe]/20 text-[#bc13fe] text-xs font-bold px-3 py-1 rounded-full font-mono border border-[#bc13fe]/30">
                            EL MÁS VENDIDO
                        </div>

                        <h3 className="text-xl font-mono text-[#bc13fe] mb-2 uppercase font-black">TALLER PRO</h3>
                        <p className="text-gray-400 text-sm mb-6 h-10">Automatiza tu negocio y controla a tu equipo de calle.</p>

                        <div className="mb-8">
                            <span className="text-5xl font-bold text-white">{isAnnual ? '$79' : '$99'}</span>
                            <span className="text-gray-500 text-sm">/mes</span>
                            <div className="text-xs text-[#39ff14] mt-1 font-mono uppercase font-black">
                                Incluye 3 usuarios
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 text-sm text-gray-200 font-medium">
                            <li className="flex gap-3 items-center"><div className="bg-[#bc13fe]/20 p-1 rounded-full"><Check size={12} className="text-[#bc13fe]" /></div> <span className="text-white">Para 3 Personas</span></li>
                            <li className="flex gap-3 items-center"><div className="bg-[#bc13fe]/20 p-1 rounded-full"><Check size={12} className="text-[#bc13fe]" /></div> Rutas GPS Inteligentes</li>
                            <li className="flex gap-3 items-center"><div className="bg-[#bc13fe]/20 p-1 rounded-full"><Check size={12} className="text-[#bc13fe]" /></div> <strong>IA ServiBot (WhatsApp)</strong></li>
                            <li className="flex gap-3 items-center"><div className="bg-[#bc13fe]/20 p-1 rounded-full"><Check size={12} className="text-[#bc13fe]" /></div> Reportes de Ganancias</li>
                            <li className="flex gap-3 items-center"><div className="bg-[#bc13fe]/20 p-1 rounded-full"><Check size={12} className="text-[#bc13fe]" /></div> Control de Inventario</li>
                        </ul>

                        <NeonButton className="w-full justify-center">
                            QUIERO ESTE PLAN
                        </NeonButton>
                    </div>

                    {/* Card 3: Enterprise */}
                    <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 hover:border-[#39ff14]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)] group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={100} />
                        </div>

                        <h3 className="text-xl font-mono text-white mb-2 uppercase font-black">EMPRESARIAL</h3>
                        <p className="text-gray-400 text-sm mb-6 h-10">Para cadenas o franquicias con múltiples sedes.</p>

                        <div className="mb-8 flex items-end h-[60px]">
                            <span className="text-3xl font-bold text-white">A MEDIDA</span>
                        </div>

                        <ul className="space-y-4 mb-8 text-sm text-gray-300">
                            <li className="flex gap-3 items-center"><Check size={16} className="text-gray-500" /> Usuarios Ilimitados</li>
                            <li className="flex gap-3 items-center"><Check size={16} className="text-gray-500" /> API para conectar ERP</li>
                            <li className="flex gap-3 items-center"><Check size={16} className="text-gray-500" /> Gestor de Cuenta VIP</li>
                            <li className="flex gap-3 items-center"><Check size={16} className="text-gray-500" /> Capacitación Presencial</li>
                        </ul>

                        <button className="w-full py-3 border border-white/20 rounded hover:bg-white/5 transition-colors text-sm font-mono tracking-wider font-bold">
                            HABLAR CON ASESOR
                        </button>
                    </div>

                </div>

                {/* Team Configurator Section */}
                <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-[#bc13fe]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#bc13fe] to-transparent opacity-50" />

                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <h3 className="text-2xl font-mono text-white flex items-center justify-center md:justify-start gap-3 uppercase font-black">
                                <Users className="text-[#bc13fe]" />
                                ARMA TU EQUIPO
                            </h3>
                            <p className="text-gray-400 text-sm font-medium">
                                ¿Tu taller es grande? Agrega técnicos adicionales al plan <strong>Taller Pro</strong>.
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-6 bg-black/40 p-4 rounded-xl border border-white/5 w-fit mx-auto md:mx-0">
                                <button
                                    onClick={() => handleTeamChange(false)}
                                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 hover:text-[#bc13fe] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    disabled={teamSize <= 3}
                                >
                                    <Minus size={20} />
                                </button>
                                <div className="text-center w-20">
                                    <span className="text-3xl font-bold text-white font-mono">{teamSize}</span>
                                    <div className="text-[10px] text-gray-500 uppercase mt-1 font-black">Personas</div>
                                </div>
                                <button
                                    onClick={() => handleTeamChange(true)}
                                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 hover:text-[#39ff14] text-white transition-colors flex items-center justify-center"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="flex-1 w-full md:border-l border-white/10 md:pl-8 space-y-4 bg-black/20 p-4 rounded-xl md:bg-transparent md:p-0">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Plan Base (3 personas)</span>
                                <span>${basePrice}/mes</span>
                            </div>
                            {extraUsers > 0 && (
                                <div className="flex justify-between text-sm text-gray-300">
                                    <span>{extraUsers} x Técnico Extra ($15)</span>
                                    <span className="text-[#39ff14] font-mono font-bold">+ ${extraUsers * extraTechPrice}/mes</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-400 border-b border-white/5 pb-2">
                                <span>Ahorro Anual</span>
                                <span className={isAnnual ? "text-[#00f3ff]" : "text-gray-600"}>{isAnnual ? "ACTIVADO (20%)" : "NO APLICADO"}</span>
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                                <div className="text-center sm:text-left">
                                    <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Inversión Total</div>
                                    <div className="text-4xl font-bold text-white tracking-tight leading-none">
                                        ${totalCost}
                                        <span className="text-lg text-gray-500 font-normal">/mes</span>
                                    </div>
                                    {isAnnual && <div className="text-[10px] text-[#39ff14] mt-1 uppercase font-black">Facturado anualmente</div>}
                                </div>
                                <NeonButton className="px-6 py-2 text-sm w-full sm:w-auto">
                                    LO QUIERO
                                </NeonButton>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PricingSection;
