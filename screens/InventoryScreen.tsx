'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import {
    Search,
    ArrowLeft,
    ScanLine,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Package,
    Plus,
    Tag,
    ArrowUpRight,
    Wrench,
    Thermometer,
    Droplets,
    Cpu,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InventoryItem {
    id: string;
    name: string;
    code: string;
    stock_level: number;
    min_stock: number;
    category: string;
    unit_price: number;
}

const InventoryScreen: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('parts')
                .select('*')
                .order('name');
            if (data) setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStockStatus = (item: InventoryItem) => {
        if (item.stock_level === 0) return { label: 'AGOTADO', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle };
        if (item.stock_level <= item.min_stock) return { label: 'BAJO STOCK', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: AlertTriangle };
        return { label: 'EN STOCK', color: 'text-[#00ff9d]', bg: 'bg-[#00ff9d]/10', icon: CheckCircle2 };
    };

    const getCategoryIcon = (category: string) => {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('motor')) return Wrench;
        if (cat.includes('sensor')) return Thermometer;
        if (cat.includes('elec')) return Cpu;
        if (cat.includes('gas')) return Zap;
        if (cat.includes('sello')) return Droplets;
        return Package;
    };

    return (
        <div className="bg-[#0a0c10] min-h-screen pb-24 max-w-md mx-auto font-sans text-white relative">
            <header className="sticky top-0 z-50 bg-[#0a0c10]/90 backdrop-blur-2xl p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="size-10 flex items-center justify-center rounded-xl bg-gray-900 border border-white/5"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em]">Inventario Real-Time</h1>
                    <button
                        onClick={() => router.push('/scanner')}
                        className="size-10 flex items-center justify-center rounded-xl bg-white text-black"
                    >
                        <ScanLine size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar repuesto o SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-950 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs outline-none focus:border-[#135bec] transition-all"
                    />
                </div>
            </header>

            <main className="p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="size-8 border-2 border-[#135bec] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredInventory.map((item) => {
                    const status = getStockStatus(item);
                    const StatusIcon = status.icon;
                    const CategoryIcon = getCategoryIcon(item.category);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900/40 border border-white/5 rounded-3xl p-4 flex gap-4 items-center"
                        >
                            <div className={`size-16 rounded-2xl ${status.bg} flex items-center justify-center border border-white/5`}>
                                <CategoryIcon size={28} className={status.color} />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-[13px] font-black tracking-tight truncate max-w-[150px]">{item.name}</h3>
                                    <StatusIcon size={14} className={status.color} />
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.code}</p>
                                        <p className={`text-[10px] font-black mt-1 ${status.color}`}>{status.label}: {item.stock_level}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">${item.unit_price?.toLocaleString()}</p>
                                        <button className="text-[8px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-1 mt-1">
                                            Detalles <ArrowUpRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </main>

            <div className="fixed bottom-24 left-4 right-4 z-40">
                <button className="w-full h-14 bg-[#135bec] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#135bec]/20 flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Agregar Nuevo Repuesto
                </button>
            </div>
        </div>
    );
};

export default InventoryScreen;
