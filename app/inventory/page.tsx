'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    Search,
    Plus,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ScanLine,
    Thermometer,
    Cpu,
    Zap,
    Droplets,
    Wrench,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProHeader from '../../components/ProHeader';
import Background from '../../components/design/Background';
import NeonButton from '../../components/design/NeonButton';

export default function InventoryPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [inventory, setInventory] = useState<any[]>([]);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
    const [stockAction, setStockAction] = useState({ type: 'add' as 'add' | 'subtract', amount: 1 });
    const [newItemData, setNewItemData] = useState({
        name: '',
        code: '',
        category: 'Repuestos',
        unit_price: 0,
        stock_level: 0,
        min_stock: 5
    });

    useEffect(() => {
        fetchInventory();

        const channel = supabase
            .channel('inventory-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, () => {
                fetchInventory();
                setLastSync(new Date());
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('parts')
                .select('*')
                .order('name');

            if (data) setInventory(data);
            setLastSync(new Date());
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStock = async () => {
        if (!selectedItem) return;
        const newStock = stockAction.type === 'add'
            ? selectedItem.stock_level + stockAction.amount
            : Math.max(0, selectedItem.stock_level - stockAction.amount);

        const { error } = await supabase
            .from('parts')
            .update({ stock_level: newStock })
            .eq('id', selectedItem.id);

        if (!error) {
            setSelectedItem(null);
            fetchInventory();
        } else {
            alert('Error actualizando stock');
        }
    };

    const handleCreateItem = async () => {
        if (!newItemData.name || !newItemData.code) {
            alert('Nombre y SKU son obligatorios');
            return;
        }

        const { error } = await supabase
            .from('parts')
            .insert([newItemData]);

        if (error) {
            alert('Error al crear item: ' + error.message);
        } else {
            setIsNewItemModalOpen(false);
            setNewItemData({
                name: '',
                code: '',
                category: 'Repuestos',
                unit_price: 0,
                stock_level: 0,
                min_stock: 5
            });
            fetchInventory();
        }
    };

    const categories = ['Todos', ...new Set(inventory.filter(i => i.category).map(i => i.category))];

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Todos' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (item: any) => {
        if (item.stock_level === 0) return { label: 'AGOTADO', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: XCircle, sideColor: 'bg-rose-500' };
        if (item.stock_level <= item.min_stock) return { label: 'BAJO STOCK', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle, sideColor: 'bg-orange-500' };
        return { label: 'EN STOCK', color: 'text-[#00ff9d]', bg: 'bg-[#00ff9d]/10', border: 'border-[#00ff9d]/20', icon: CheckCircle2, sideColor: 'bg-[#135bec]' };
    };

    const getCategoryIcon = (category: string) => {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('motor') || cat.includes('bomba')) return Wrench;
        if (cat.includes('sensor') || cat.includes('termo')) return Thermometer;
        if (cat.includes('elec') || cat.includes('capa')) return Cpu;
        if (cat.includes('gas') || cat.includes('refr')) return Zap;
        if (cat.includes('sello') || cat.includes('agua')) return Droplets;
        return Package;
    };

    return (
        <div className="bg-background min-h-screen text-white font-outfit max-w-5xl mx-auto relative overflow-x-hidden border-x border-white/5 pb-24">
            <Background />
            <ProHeader
                title="Stock Pro"
                showBack
                rightElement={
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.push('/scanner')}
                        className="size-11 flex items-center justify-center rounded-2xl bg-white text-[#0a0c10] shadow-lg"
                    >
                        <ScanLine size={22} />
                    </motion.button>
                }
            />

            <div className="p-6 bg-[#0a0c10] border-b border-white/5 space-y-6">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#135bec] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por repuesto o SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-950 border border-white/10 rounded-[1.5rem] py-4.5 pl-14 pr-6 text-[13px] font-medium focus:border-[#135bec]/50 focus:bg-gray-900/50 outline-none transition-all placeholder:text-gray-600 shadow-inner"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {categories.map((cat: any) => (
                        <NeonButton
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 !px-5 !py-2.5 !rounded-xl !text-[10px] !tracking-wider transition-all !border ${activeCategory === cat
                                ? '!bg-white !text-black shadow-lg'
                                : '!bg-gray-900/50 !text-gray-500 !border-white/5'
                                }`}
                        >
                            {cat}
                        </NeonButton>
                    ))}
                </div>
            </div>

            <main className="p-6 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <div className="size-10 border-2 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Almacén...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredInventory.map((item, index) => {
                            const status = getStockStatus(item);
                            const CategoryIcon = getCategoryIcon(item.category);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`group relative bg-gray-900/40 border rounded-[2.5rem] p-6 shadow-2xl transition-all duration-300 overflow-hidden ${item.stock_level === 0
                                        ? 'border-rose-500/20'
                                        : item.stock_level <= item.min_stock
                                            ? 'border-orange-500/20'
                                            : 'border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${status.sideColor}`} />

                                    <div className="flex gap-6 items-center">
                                        <div className={`size-16 rounded-2xl flex items-center justify-center border transition-all ${status.border} ${status.bg}`}>
                                            <CategoryIcon size={24} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-black text-white truncate mb-1">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                                        SKU: {item.code}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                <div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                                        DISP: {item.stock_level}
                                                    </p>
                                                    <p className="text-base font-black text-white mt-1">
                                                        ${item.unit_price?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="size-10 rounded-xl bg-[#135bec] text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Float Summary instead of fixed bottom bar */}
            <div className="fixed bottom-8 left-8 right-8 z-[60]">
                <div className="bg-gray-900/70 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                            <Package size={20} />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{inventory.length} SKUs</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsNewItemModalOpen(true)}
                        className="bg-white text-black px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                        Nuevo Item
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {(selectedItem || isNewItemModalOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-end justify-center p-6"
                    >
                        {selectedItem ? (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="bg-[#0a0c10] w-full max-w-2xl rounded-[3rem] border border-white/10 p-8 shadow-2xl relative"
                            >
                                <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 size-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white">
                                    <XCircle size={20} />
                                </button>

                                <h2 className="text-xl font-black mb-1">Confirmar Stock</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">{selectedItem.name}</p>

                                <div className="flex items-center justify-center gap-8 mb-10">
                                    <button
                                        onClick={() => setStockAction(prev => ({ ...prev, type: 'subtract' }))}
                                        className={`size-14 rounded-2xl border flex items-center justify-center transition-all ${stockAction.type === 'subtract' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-gray-900 border-white/5 text-gray-500'}`}
                                    >
                                        <ArrowUpRight size={24} className="rotate-180" />
                                    </button>
                                    <div className="text-center">
                                        <input
                                            type="number"
                                            value={stockAction.amount}
                                            onChange={(e) => setStockAction(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                                            className="bg-transparent text-5xl font-black text-center w-24 outline-none border-b border-white/10"
                                        />
                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-4">Cantidad</p>
                                    </div>
                                    <button
                                        onClick={() => setStockAction(prev => ({ ...prev, type: 'add' }))}
                                        className={`size-14 rounded-2xl border flex items-center justify-center transition-all ${stockAction.type === 'add' ? 'bg-[#00ff9d] border-[#00ff9d] text-black shadow-lg shadow-[#00ff9d]/20' : 'bg-gray-900 border-white/5 text-gray-500'}`}
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleUpdateStock}
                                    className="w-full h-16 bg-[#135bec] text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-opacity-90 transition-all"
                                >
                                    Confirmar {stockAction.type === 'add' ? 'Ingreso' : 'Salida'}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="bg-[#0a0c10] w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                            >
                                <button onClick={() => setIsNewItemModalOpen(false)} className="absolute top-8 right-8 size-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white">
                                    <XCircle size={20} />
                                </button>

                                <div className="mb-10 text-center">
                                    <h2 className="text-2xl font-black mb-1 uppercase tracking-tight">Nuevo Inventario</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Registro de SKU Pro</p>
                                </div>

                                <div className="space-y-6 mb-10">
                                    <div className="space-y-2 text-center">
                                        <label className="text-[9px] font-black text-[#135bec] uppercase tracking-widest">Nombre del Repuesto</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Compresor LG 1/4HP"
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 text-center text-sm font-bold outline-none focus:border-[#135bec] transition-all"
                                            value={newItemData.name}
                                            onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 text-center">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SKU / Código</label>
                                            <input
                                                type="text"
                                                placeholder="SKU-001"
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 text-center text-sm outline-none focus:border-[#135bec] transition-all"
                                                value={newItemData.code}
                                                onChange={(e) => setNewItemData({ ...newItemData, code: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 text-center">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Categoría</label>
                                            <input
                                                type="text"
                                                placeholder="Repuestos"
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 text-center text-sm outline-none focus:border-[#135bec] transition-all"
                                                value={newItemData.category}
                                                onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 text-center">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Precio Unitario</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 text-center text-sm outline-none focus:border-[#135bec] transition-all"
                                                value={newItemData.unit_price}
                                                onChange={(e) => setNewItemData({ ...newItemData, unit_price: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2 text-center">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stock Mínimo</label>
                                            <input
                                                type="number"
                                                placeholder="5"
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 text-center text-sm outline-none focus:border-[#135bec] transition-all"
                                                value={newItemData.min_stock}
                                                onChange={(e) => setNewItemData({ ...newItemData, min_stock: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-center pt-4">
                                        <label className="text-[9px] font-black text-[#00ff9d] uppercase tracking-widest">Stock Inicial</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full bg-[#00ff9d]/5 border border-[#00ff9d]/20 rounded-2xl py-5 text-center text-2xl font-black outline-none focus:border-[#00ff9d] transition-all"
                                            value={newItemData.stock_level}
                                            onChange={(e) => setNewItemData({ ...newItemData, stock_level: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateItem}
                                    className="w-full h-16 bg-[#135bec] text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-[0_15px_30px_rgba(19,91,236,0.3)] hover:scale-[1.02] active:scale-95 transition-all mb-4"
                                >
                                    Guardar Producto
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
