'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { generatePersonalizedMessage } from '../actions/personalized-message';
import { Client } from '../../types/index';
import {
    Search,
    UserPlus,
    Filter,
    X,
    Check,
    CheckCircle2,
    AlertTriangle,
    History,
    MessageCircle,
    Sparkles,
    Send,
    User,
    ChevronLeft,
    FileText,
    Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';

type FilterType = 'all' | 'expired' | 'upcoming' | 'ok';

interface PersonalizedMessage {
    clientId: string;
    clientName: string;
    phone: string;
    message: string;
    status: 'pending' | 'generating' | 'ready' | 'sent';
}

export default function ClientsPage() {
    const router = useRouter();
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
    const [clients, setClients] = useState<any[]>([]);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    // Add Client Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ national_id: '', name: '', phone: '', address: '' });

    // Bulk Message State
    const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
    const [personalizedMessages, setPersonalizedMessages] = useState<PersonalizedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [bulkTopic, setBulkTopic] = useState<'maintenance' | 'promo' | 'payment' | 'general'>('maintenance');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadClients();

        // Real-time subscription
        const channel = supabase
            .channel('clients-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
                loadClients();
                setLastSync(new Date());
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadClients = async () => {
        setIsLoading(true);
        try {
            // Fetch clients with their service orders and equipment to determine maintenance status
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    *,
                    service_orders (
                        scheduled_at,
                        equipment (
                            type,
                            brand
                        )
                    )
                `)
                .order('full_name');

            if (error) throw error;

            const mappedClients: any[] = (data || []).map((c: any) => {
                // Find the most recent service order
                const services = c.service_orders || [];
                const sorted = services.sort((a: any, b: any) =>
                    new Date(b.scheduled_at || 0).getTime() - new Date(a.scheduled_at || 0).getTime()
                );
                const lastService = sorted.length > 0 ? sorted[0] : null;

                return {
                    id: c.id,
                    name: c.full_name,
                    nationalId: c.national_id,
                    phone: c.phone,
                    address: c.address,
                    category: c.category,
                    lastServiceDate: lastService?.scheduled_at,
                    lastAppliance: lastService?.equipment ? `${lastService.equipment.type} ${lastService.equipment.brand}` : undefined,
                    initials: c.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
                    color: 'bg-indigo-600'
                };
            });

            setClients(mappedClients);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMaintenanceStatus = (lastDate?: string) => {
        if (!lastDate) return { label: 'Sin Visitas', color: 'text-gray-500', bg: 'bg-gray-500/10', icon: History, status: 'ok' as FilterType };

        const last = new Date(lastDate);
        const now = new Date();
        const diffInMonths = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());

        if (diffInMonths >= 12) {
            return { label: 'Mantenimiento Vencido', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertTriangle, status: 'expired' as FilterType };
        } else if (diffInMonths >= 10) {
            return { label: 'Próximo Vencimiento', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Filter, status: 'upcoming' as FilterType };
        } else {
            return { label: 'Al día', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, status: 'ok' as FilterType };
        }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const queryMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.nationalId && c.nationalId.includes(searchQuery));
            if (!queryMatch) return false;

            if (activeFilter === 'all') return true;
            const maintenance = getMaintenanceStatus(c.lastServiceDate);
            return maintenance.status === activeFilter;
        });
    }, [clients, searchQuery, activeFilter]);

    const stats = useMemo(() => {
        const counts = { all: clients.length, expired: 0, upcoming: 0, ok: 0 };
        clients.forEach(c => {
            const m = getMaintenanceStatus(c.lastServiceDate);
            counts[m.status]++;
        });
        return counts;
    }, [clients]);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedClients(new Set());
        setPersonalizedMessages([]);
    };

    const toggleClientSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelection = new Set(selectedClients);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedClients(newSelection);
    };

    const selectAll = () => {
        if (selectedClients.size === filteredClients.length) {
            setSelectedClients(new Set());
        } else {
            setSelectedClients(new Set(filteredClients.map(c => c.id)));
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data: any[] = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert('El archivo Excel está vacío');
                    return;
                }

                // Map Excel columns to our database schema
                const clientsToInsert = data.map(row => ({
                    national_id: String(row.Cedula || row.Identificacion || row.ID || row['Cedula/DNI'] || ''),
                    full_name: String(row.Nombre || row['Nombre Completo'] || row.Name || ''),
                    phone: String(row.Telefono || row.Celular || row.Phone || ''),
                    address: String(row.Direccion || row.Address || 'Cali, Colombia'),
                    email: String(row.Email || row.Correo || ''),
                    category: 'REGULAR'
                })).filter(c => c.national_id && c.full_name);

                if (clientsToInsert.length === 0) {
                    alert('No se encontraron clientes válidos. El Excel debe tener columnas como "Cedula", "Nombre", "Telefono".');
                    return;
                }

                // Insert into Supabase (using upsert on national_id if possible, or manual check)
                const { error } = await supabase
                    .from('clients')
                    .upsert(clientsToInsert, { onConflict: 'national_id' });

                if (error) throw error;

                alert(`¡Éxito! Se han importado/actualizado ${clientsToInsert.length} clientes.`);
                await loadClients();
            } catch (error: any) {
                console.error('Error importando Excel:', error);
                alert('Error al procesar el archivo: ' + error.message);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('clients')
                .insert({
                    national_id: newClientForm.national_id,
                    full_name: newClientForm.name,
                    phone: newClientForm.phone,
                    address: newClientForm.address,
                    category: 'REGULAR'
                });

            if (error) throw error;

            await loadClients();
            setShowAddModal(false);
            setNewClientForm({ national_id: '', name: '', phone: '', address: '' });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateBulkMessages = async (topic: 'maintenance' | 'promo' | 'payment' | 'general' = 'maintenance') => {
        setIsGenerating(true);
        setBulkTopic(topic);
        setShowBulkMessageModal(true);

        const selectedList = clients.filter(c => selectedClients.has(c.id));

        const initialStates: PersonalizedMessage[] = selectedList.map(c => ({
            clientId: c.id,
            clientName: c.name,
            phone: c.phone,
            message: 'Generando mensaje...',
            status: 'generating'
        }));
        setPersonalizedMessages(initialStates);

        // Get context from topic
        let topicContext = "";
        switch (topic) {
            case 'maintenance': topicContext = "Recordarle que su equipo requiere mantenimiento preventivo."; break;
            case 'promo': topicContext = "Ofrecerle un 20% de descuento en su próxima reparación."; break;
            case 'payment': topicContext = "Aviso cordial sobre un pago pendiente de su último servicio."; break;
            case 'general': topicContext = "Informarle que tenemos disponibilidad inmediata para revisón técnica."; break;
        }

        for (let i = 0; i < selectedList.length; i++) {
            const client = selectedList[i];
            // Update prompt for topic
            const prompt = `Genera un mensaje de WhatsApp amigable y profesional para ${client.name}.
            Contexto: ${topicContext}
            Equipo mencionado: ${client.lastAppliance || 'línea blanca'}.
            Tono: Servicial y directo. Máximo 25 palabras. Incluye emojis. No uses saludos genéricos como [Nombre] (usa su nombre real).`;

            try {
                // We'll use the existing server action but we should ideally pass the prompt
                // For now, let's assume generatePersonalizedMessage can be improved or we call it directly
                const msg = await generatePersonalizedMessage(client.name, client.lastAppliance || 'equipo', topic);

                setPersonalizedMessages(prev => prev.map(p =>
                    p.clientId === client.id
                        ? { ...p, message: msg, status: 'ready' as const }
                        : p
                ));
            } catch (e) {
                console.error(e);
            }
        }

        setIsGenerating(false);
    };

    const sendWhatsApp = (pMsg: PersonalizedMessage) => {
        const url = `https://wa.me/${pMsg.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(pMsg.message)}`;
        window.open(url, '_blank');
        setPersonalizedMessages(prev => prev.map(p =>
            p.clientId === pMsg.clientId ? { ...p, status: 'sent' } : p
        ));
    };

    return (
        <div className="bg-[#0a0c10] min-h-screen text-white pb-32 max-w-md mx-auto relative font-sans">
            <header className="sticky top-0 z-40 bg-[#0a0c10]/95 backdrop-blur-md pt-6 pb-4 px-6 border-b border-white/5 transition-all">
                <div className="flex justify-between items-center mb-6">
                    {isSelectionMode ? (
                        <div className="flex items-center gap-4 w-full">
                            <button onClick={toggleSelectionMode} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                            <h1 className="text-xl font-black flex-1">{selectedClients.size} seleccionados</h1>
                            <button
                                onClick={selectAll}
                                className="text-[10px] font-black uppercase tracking-widest text-[#135bec] bg-[#135bec]/10 px-4 py-2 rounded-xl"
                            >
                                {selectedClients.size === filteredClients.length ? 'Ninguno' : 'Todos'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black tracking-tight">Clientes</h1>
                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">
                                    Sincronizado: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImportExcel}
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 bg-gray-900 border border-white/5 rounded-2xl text-emerald-500 hover:bg-gray-800 transition-all active:scale-95 relative"
                                    disabled={isImporting}
                                >
                                    {isImporting ? (
                                        <div className="size-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                    ) : (
                                        <FileText size={20} />
                                    )}
                                </button>
                                <button onClick={() => setShowAddModal(true)} className="p-3 bg-gray-900 border border-white/5 rounded-2xl text-[#135bec] hover:bg-gray-800 transition-all active:scale-95">
                                    <UserPlus size={20} />
                                </button>
                                <button
                                    onClick={toggleSelectionMode}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isSelectionMode ? 'bg-[#135bec] text-white shadow-lg' : 'bg-gray-900 border border-white/5 text-gray-400'
                                        }`}
                                >
                                    <Filter size={18} />
                                    Gestionar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!isSelectionMode && (
                    <div className="space-y-5">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                className="w-full bg-gray-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#135bec] transition-all text-sm font-medium"
                                placeholder="Nombre o identificación..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: 'Todos', count: stats.all },
                                { id: 'expired', label: 'Vencidos', count: stats.expired, color: 'text-rose-500' },
                                { id: 'upcoming', label: 'Próximos', count: stats.upcoming, color: 'text-amber-500' },
                                { id: 'ok', label: 'Al día', count: stats.ok, color: 'text-emerald-500' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id as any)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${activeFilter === tab.id
                                        ? 'bg-white text-black border-white'
                                        : `bg-gray-900 border-white/5 ${tab.color || 'text-gray-500'}`
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            <main className="p-6 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="size-12 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-600">Sincronizando Base de Datos</p>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-600 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                        <User size={48} className="mb-4 opacity-20" />
                        <p className="font-bold text-sm">Sin coincidencias encontradas</p>
                    </div>
                ) : (
                    filteredClients.map((client) => {
                        const mStatus = getMaintenanceStatus(client.lastServiceDate);
                        const isSelected = selectedClients.has(client.id);
                        const StatusIcon = mStatus.icon;

                        return (
                            <div
                                key={client.id}
                                onClick={() => isSelectionMode ? toggleClientSelection(client.id, { stopPropagation: () => { } } as any) : router.push(`/client-profile/${client.id}`)}
                                className={`relative flex items-center justify-between p-5 rounded-[2.5rem] border transition-all active:scale-[0.98] cursor-pointer group overflow-hidden ${isSelected ? 'bg-[#135bec]/10 border-[#135bec] shadow-[0_10px_40px_rgba(19,91,236,0.1)]' : 'bg-gray-900/40 border-white/5 hover:border-white/10 hover:bg-gray-800/40'
                                    }`}
                            >
                                {/* Selection Indicator */}
                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#135bec] shadow-[0_0_15px_rgba(19,91,236,1)]" />}

                                <div className="flex items-center gap-4">
                                    {isSelectionMode && (
                                        <div className={`shrink-0 size-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-[#135bec] border-[#135bec] scale-110 shadow-lg shadow-[#135bec]/30' : 'border-gray-700'}`}>
                                            {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                        </div>
                                    )}
                                    <div className={`size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-lg text-white shadow-xl transition-all duration-500 ${isSelected ? 'scale-90 rotate-3' : 'shadow-indigo-500/10'}`}>
                                        {client.initials}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-black tracking-tight transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-200'} text-sm truncate max-w-[140px]`}>{client.name}</h3>
                                            {client.category === 'PREMIUM' && <span className="text-[7px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Gold</span>}
                                            {client.category === 'ENTERPRISE' && <span className="text-[7px] font-black bg-[#135bec]/10 text-[#135bec] border border-[#135bec]/20 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Corp</span>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{client.phone}</p>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 transition-all duration-300 ${mStatus.bg} ${mStatus.color}`}>
                                                <StatusIcon size={12} />
                                                {mStatus.label}
                                                {client.lastServiceDate && (
                                                    <span className="opacity-40 ml-1">
                                                        ({new Date(client.lastServiceDate).toLocaleDateString()})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!isSelectionMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const message = `Hola ${client.name}, le contactamos de ServiHogar para agendar un mantenimiento preventivo de su ${client.lastAppliance || 'equipo'}. ¿En qué horario le gustaría agendar?`;
                                            window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="p-3.5 bg-gray-900 border border-white/5 rounded-2xl text-gray-500 hover:text-[#25D366] hover:border-[#25D366]/20 transition-all hover:bg-[#25D366]/5"
                                    >
                                        <MessageCircle size={20} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </main>

            {/* Enhanced Bulk Action Bar */}
            <div className={`fixed bottom-28 left-6 right-6 max-w-md mx-auto z-[60] transition-all duration-500 transform ${isSelectionMode && selectedClients.size > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-95'}`}>
                <div className="bg-[#135bec] rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(19,91,236,0.5)] border border-white/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-black text-lg leading-none">{selectedClients.size} Clientes</p>
                            <p className="text-[9px] text-white/70 uppercase font-black tracking-widest mt-1">Acción Masiva con ServiBot</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleGenerateBulkMessages('maintenance')}
                            className="bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1 transition-all group"
                        >
                            <History size={16} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-white/90">Mantenimiento</span>
                        </button>
                        <button
                            onClick={() => handleGenerateBulkMessages('promo')}
                            className="bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1 transition-all group"
                        >
                            <Sparkles size={16} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-white/90">Promoción</span>
                        </button>
                        <button
                            onClick={() => handleGenerateBulkMessages('payment')}
                            className="bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1 transition-all group"
                        >
                            <FileText size={16} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-white/90">Cobranza</span>
                        </button>
                        <button
                            onClick={() => handleGenerateBulkMessages('general')}
                            className="bg-white text-[#135bec] p-3 rounded-xl flex flex-col items-center gap-1 shadow-lg font-black transition-all hover:scale-[1.02]"
                        >
                            <MessageCircle size={16} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">General</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Message Modal */}
            {showBulkMessageModal && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-[#0a0c10] w-full max-w-md h-[85vh] rounded-t-[3rem] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-500">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xl">ServiBot IA</h3>
                                <p className="text-[10px] text-[#135bec] font-black uppercase tracking-widest mt-1">Generando Mensajes Únicos</p>
                            </div>
                            <button onClick={() => setShowBulkMessageModal(false)} className="p-3 bg-gray-900 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                            {personalizedMessages.map((pm, idx) => (
                                <div key={pm.clientId} className={`p-6 rounded-[2rem] border transition-all ${pm.status === 'sent' ? 'bg-black/40 border-white/5 opacity-50' : 'bg-gray-900 border-white/5 shadow-xl'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-sm">{pm.clientName}</h4>
                                            <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mt-1">{pm.phone}</p>
                                        </div>
                                        {pm.status === 'generating' && <div className="size-4 border-2 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin"></div>}
                                        {pm.status === 'sent' && <CheckCircle2 className="text-[#00ff9d]" size={16} />}
                                    </div>
                                    <textarea
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[13px] text-gray-300 h-28 resize-none focus:outline-none focus:border-[#135bec] transition-all font-medium leading-relaxed"
                                        value={pm.message}
                                        onChange={(e) => {
                                            const newMsgs = [...personalizedMessages];
                                            newMsgs[idx].message = e.target.value;
                                            setPersonalizedMessages(newMsgs);
                                        }}
                                    />
                                    <button
                                        onClick={() => sendWhatsApp(pm)}
                                        disabled={pm.status !== 'ready'}
                                        className={`w-full mt-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${pm.status === 'ready' ? 'bg-[#25D366] text-white' : 'bg-gray-800 text-gray-600'
                                            }`}
                                    >
                                        <Send size={14} />
                                        {pm.status === 'sent' ? 'Enviado' : 'Enviar WhatsApp'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal Placeholder (Simplify for now) */}
            {showAddModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
                    <div className="bg-[#0a0c10] w-full max-w-sm rounded-[3rem] border border-white/10 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Nuevo Cliente</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddClient} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Cédula / DNI</label>
                                <input required className="w-full bg-gray-900 border border-white/5 rounded-2xl p-4 text-sm" value={newClientForm.national_id} onChange={e => setNewClientForm({ ...newClientForm, national_id: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nombre</label>
                                <input required className="w-full bg-gray-900 border border-white/5 rounded-2xl p-4 text-sm" value={newClientForm.name} onChange={e => setNewClientForm({ ...newClientForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Teléfono</label>
                                <input required className="w-full bg-gray-900 border border-white/5 rounded-2xl p-4 text-sm" value={newClientForm.phone} onChange={e => setNewClientForm({ ...newClientForm, phone: e.target.value })} />
                            </div>
                            <button className="w-full py-4 bg-[#135bec] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#135bec]/20">Crear Registro</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
