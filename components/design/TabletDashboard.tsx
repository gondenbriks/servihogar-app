'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Battery, Wifi, Cpu } from 'lucide-react';

const data = [
    { name: 'Mon', uv: 4000, pv: 2400 },
    { name: 'Tue', uv: 3000, pv: 1398 },
    { name: 'Wed', uv: 2000, pv: 9800 },
    { name: 'Thu', uv: 2780, pv: 3908 },
    { name: 'Fri', uv: 1890, pv: 4800 },
    { name: 'Sat', uv: 2390, pv: 3800 },
    { name: 'Sun', uv: 3490, pv: 4300 },
];

const TabletDashboard: React.FC = () => {
    return (
        <div className="relative w-full max-w-2xl animate-float">
            {/* Holographic Projection Base/Glow */}
            <div className="absolute -inset-4 bg-[#00f3ff]/20 blur-2xl rounded-[3rem] opacity-50 pointer-events-none" />

            {/* Tablet Frame */}
            <div className="relative bg-black/60 backdrop-blur-2xl rounded-2xl border-2 border-slate-700/50 p-1 shadow-2xl overflow-hidden transform perspective-[1000px] rotate-y-12 rotate-x-6">

                {/* Screen Content */}
                <div className="bg-[#050505] rounded-xl p-6 h-[400px] flex flex-col gap-4 relative overflow-hidden">
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none z-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-full w-full animate-scanline pointer-events-none z-20"></div>

                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2 z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#39ff14] animate-pulse"></div>
                            <span className="text-[#00e5ff] font-mono text-[10px] tracking-wider uppercase font-black">SERVITECH_OS v2.4</span>
                        </div>
                        <div className="flex gap-4 text-gray-400">
                            <Wifi size={14} />
                            <Battery size={14} />
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="grid grid-cols-3 gap-4 h-full z-10">
                        {/* Main Chart Area */}
                        <div className="col-span-2 flex flex-col gap-4">
                            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 flex-1 relative">
                                <h4 className="text-[10px] text-gray-400 font-mono mb-2 uppercase flex items-center gap-2 font-black">
                                    <Activity size={12} className="text-[#00f3ff]" /> Rendimiento Taller
                                </h4>
                                <div className="h-[120px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs>
                                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                            <XAxis dataKey="name" hide />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
                                                itemStyle={{ color: '#00f3ff' }}
                                            />
                                            <Area type="monotone" dataKey="uv" stroke="#00f3ff" fillOpacity={1} fill="url(#colorUv)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 flex-1">
                                <h4 className="text-[10px] text-gray-400 font-mono mb-2 uppercase font-black">Órdenes Activas</h4>
                                <div className="h-[80px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.slice(0, 5)}>
                                            <Bar dataKey="pv" fill="#39ff14" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="col-span-1 flex flex-col gap-3">
                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                <Cpu size={16} className="text-[#bc13fe] mb-2" />
                                <div className="text-2xl font-black text-white italic">98%</div>
                                <div className="text-[9px] text-gray-400 font-black uppercase">EFICIENCIA AI</div>
                            </div>
                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex-1 overflow-hidden">
                                <div className="text-[9px] text-gray-400 font-black uppercase mb-2">SISTEMA LOGS</div>
                                <div className="space-y-2 opacity-60">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex gap-2 items-center text-[8px] font-mono whitespace-nowrap">
                                            <span className="text-[#39ff14]">{" >> "}</span>
                                            <span className="text-gray-300">DIAG_ID: #{2040 + i}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Particles emanating from tablet */}
            <div className="absolute -right-10 top-10 w-2 h-2 bg-[#00e5ff] rounded-full animate-ping opacity-75"></div>
            <div className="absolute -left-4 bottom-20 w-1 h-1 bg-[#39ff14] rounded-full animate-ping opacity-50 delay-300"></div>
        </div>
    );
};

export default TabletDashboard;
