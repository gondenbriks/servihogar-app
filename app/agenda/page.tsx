'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    Search,
    X,
    CalendarDays as CalendarIcon,
    Settings2,
    Activity,
    User,
    Wrench,
    Clock,
    MapPin,
    Plus,
    Download,
    Upload,
    FileText,
    RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProHeader from '../../components/ProHeader';
import { exportToExcel } from '../../lib/export-utils';
import * as XLSX from 'xlsx';
import Background from '../../components/design/Background';
import NeonButton from '../../components/design/NeonButton';

type FilterType = 'all' | 'pending' | 'active' | 'completed' | 'new';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AgendaPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [technicianFilter, setTechnicianFilter] = useState('all');
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [techniciansList, setTechniciansList] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [googleEvents, setGoogleEvents] = useState<any[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadServices();
        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (selectedDate) fetchGoogleEvents();
    }, [selectedDate]);

    const fetchGoogleEvents = async () => {
        setIsSyncing(true);
        try {
            const timeMin = `${selectedDate}T00:00:00Z`;
            const timeMax = `${selectedDate}T23:59:59Z`;

            const response = await fetch('/api/google-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'list_calendar_events',
                    timeMin,
                    timeMax
                })
            });

            const data = await response.json();
            if (data.success) {
                setGoogleEvents(data.events || []);
            }
        } catch (error) {
            console.error('Error fetching Google events:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchTechnicians = async () => {
        const { data } = await supabase.from('technicians').select('*').order('full_name');
        setTechniciansList(data || []);
    };

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select('*, clients(full_name, address), technicians(full_name)')
                .order('scheduled_at', { ascending: true });

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                Cedula: '12345678',
                Nombre: 'Cliente Ejemplo',
                Telefono: '3001234567',
                Direccion: 'Calle 10 # 5-20, Cali'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Clientes');
        XLSX.writeFile(wb, 'Plantilla_Clientes_ServiTech.xlsx');
    };

    const handleImportClients = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    alert('El archivo está vacío');
                    return;
                }

                const clientsToInsert = data.map(row => ({
                    national_id: String(row.Cedula || row.Identificacion || row.ID || row.Id || ''),
                    full_name: String(row.Nombre || row['Nombre Completo'] || row.Name || ''),
                    phone: String(row.Telefono || row.Celular || row.Phone || ''),
                    address: String(row.Direccion || row.Address || ''),
                    category: 'REGULAR'
                })).filter(c => c.national_id && c.full_name);

                if (clientsToInsert.length === 0) {
                    alert('No se encontraron clientes válidos. Verifica las columnas (Cedula, Nombre, Telefono).');
                    return;
                }

                const { error } = await supabase
                    .from('clients')
                    .upsert(clientsToInsert, { onConflict: 'national_id' });

                if (error) throw error;

                alert(`¡Éxito! Se han importado/actualizado ${clientsToInsert.length} clientes.`);
                loadServices();
            } catch (error: any) {
                console.error('Error importando:', error);
                alert('Error al procesar el archivo: ' + error.message);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExportExcel = () => {
        if (filteredServices.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const dataToExport = filteredServices.map(s => ({
            'Orden #': s.order_number,
            'Cliente': s.clients?.full_name,
            'Dirección': s.clients?.address,
            'Técnico': s.technicians?.full_name,
            'Estado': getStatusInfo(s.status).label,
            'Falla Reportada': s.reported_issue,
            'Fecha Programada': s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : 'Pendiente',
            'Hora': s.scheduled_at ? new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'
        }));

        exportToExcel(dataToExport, `Agenda_${selectedDate}_ServiHogar`);
    };

    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = -2; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            dates.push({
                day: days[d.getDay()],
                date: d.getDate(),
                fullDate: d.toISOString().split('T')[0]
            });
        }
        return dates;
    };

    const dates = generateDates();

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return { label: 'En Proceso', color: 'text-[#00ff9d]', bg: 'bg-[#00ff9d]/10', border: 'border-[#00ff9d]/20' };
            case 'PENDING': return { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
            case 'COMPLETED': return { label: 'Listo', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
            case 'DELIVERED': return { label: 'Entregado', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' };
            default: return { label: status, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
        }
    };

    const filteredServices = services.filter(s => {
        if (filter !== 'all') {
            const statusMap: Record<string, string> = {
                'active': 'IN_PROGRESS',
                'pending': 'PENDING',
                'completed': 'COMPLETED',
                'new': 'NEW'
            };
            if (s.status !== statusMap[filter]) return false;
        }

        if (selectedDate) {
            const sDate = s.scheduled_at?.split('T')[0];
            if (sDate !== selectedDate) return false;
        }

        if (technicianFilter !== 'all') {
            if (s.technician_id !== technicianFilter) return false;
        }

        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (s.clients?.full_name?.toLowerCase().includes(query)) ||
            (s.reported_issue?.toLowerCase().includes(query)) ||
            (s.clients?.address?.toLowerCase().includes(query));

        return matchesSearch;
    });

    const getCounts = () => {
        const counts = { all: 0, active: 0, pending: 0, completed: 0, new: 0 };
        services.forEach(s => {
            if (s.scheduled_at?.split('T')[0] === selectedDate) {
                counts.all++;
                if (s.status === 'IN_PROGRESS') counts.active++;
                if (s.status === 'PENDING') counts.pending++;
                if (s.status === 'COMPLETED') counts.completed++;
                if (s.status === 'NEW') counts.new++;
            }
        });
        return counts;
    };

    const counts = getCounts();

    return (
        <div className="bg-background min-h-screen text-white font-outfit max-w-5xl mx-auto relative overflow-hidden border-x border-white/5 pb-24">
            <Background />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportClients}
                className="hidden"
                accept=".xlsx, .xls, .csv"
            />
            <ProHeader
                title="Agenda"
                showBack
                rightElement={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchGoogleEvents}
                            disabled={isSyncing}
                            className={`size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95 ${isSyncing ? 'text-[#135bec]' : 'text-gray-400'}`}
                            title="Sincronizar Google Calendar"
                        >
                            <RefreshCcw size={20} className={isSyncing ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={downloadTemplate}
                            className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/20 transition-all active:scale-95"
                            title="Descargar Plantilla"
                        >
                            <FileText size={20} />
                        </button>
                    </div>
                }
            />

            <div className="pt-8 pb-4 px-6 border-b border-white/5 bg-background">
                <div className="space-y-6 relative z-10">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#135bec] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900/40 border border-white/5 rounded-[1.8rem] py-5 pl-14 pr-12 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#135bec]/50 focus:bg-gray-900/80 transition-all shadow-inner"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
                        {dates.map((item: any) => {
                            const isSelected = selectedDate === item.fullDate;
                            return (
                                <motion.button
                                    key={item.fullDate}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(item.fullDate)}
                                    className={`shrink-0 flex flex-col items-center justify-center min-w-[68px] h-[90px] rounded-[1.5rem] transition-all duration-500 relative overflow-hidden group border ${isSelected
                                        ? 'bg-[#135bec] border-[#135bec] text-white shadow-[0_15px_30px_rgba(19,91,236,0.25)]'
                                        : 'bg-gray-900/40 border-white/5 text-gray-500 hover:bg-gray-800/60'
                                        }`}
                                >
                                    {isSelected && (
                                        <motion.div
                                            layoutId="date-glow"
                                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                                        />
                                    )}
                                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>{item.day}</span>
                                    <span className="text-2xl font-black tabular-nums">{item.date}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 mt-2">
                    {[
                        { id: 'all', label: 'Todos', count: counts.all },
                        { id: 'active', label: 'En Ruta', count: counts.active },
                        { id: 'pending', label: 'Pendientes', count: counts.pending },
                        { id: 'completed', label: 'Listos', count: counts.completed }
                    ].map((f: any) => (
                        <NeonButton
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={`!px-5 !py-3 !rounded-2xl !text-[9px] !tracking-[0.2em] transition-all shrink-0 flex items-center gap-3 ${filter === f.id
                                ? '!bg-white !text-black !shadow-lg'
                                : '!bg-gray-900/60 !text-gray-500 !border-white/5'
                                }`}
                        >
                            {f.label}
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] ${filter === f.id ? 'bg-black/10' : 'bg-white/5'}`}>{f.count}</span>
                        </NeonButton>
                    ))}
                </div>
            </div>

            <main className="p-6 space-y-6">
                <div className="bg-gray-900/20 border border-white/5 rounded-[2.5rem] p-4 flex items-center justify-between shadow-inner transition-all">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-2xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] border border-[#135bec]/20">
                            <Settings2 size={18} />
                        </div>
                        <select
                            value={technicianFilter}
                            onChange={(e) => setTechnicianFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#135bec] outline-none cursor-pointer appearance-none"
                        >
                            <option value="all" className="bg-[#0a0c10]">Flota Completa</option>
                            {techniciansList.map(t => (
                                <option key={t.id} value={t.id} className="bg-[#0a0c10]">{t.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <NeonButton
                            onClick={handleExportExcel}
                            className="!p-3 !rounded-xl !text-[8px] !tracking-widest !text-emerald-500 !border-emerald-500 hover:!bg-emerald-500 hover:!text-black"
                        >
                            <Download size={14} />
                            <span className="ml-2">Exportar</span>
                        </NeonButton>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="size-14 border-4 border-[#135bec]/10 border-t-[#135bec] rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#135bec] animate-pulse">Sincronizando...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Google Calendar Section */}
                        {googleEvents.length > 0 && (
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-4 flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-[#135bec]" />
                                    Google Calendar
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {googleEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="bg-indigo-600/5 border border-indigo-500/10 p-5 rounded-[2.5rem] flex flex-col hover:bg-indigo-600/10 transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                                                        <CalendarIcon size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{event.summary || 'Evento Externo'}</h4>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                                                            {event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Todo el día'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                                                    <Plus size={14} />
                                                </a>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin size={10} />
                                                    <span className="text-[8px] font-bold uppercase truncate">{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Supabase Orders Section */}
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-4 flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-[#00ff9d]" />
                                Órdenes de Servicio
                            </h3>
                            {filteredServices.length === 0 ? (
                                <div className="py-20 text-center bg-gray-900/10 border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No hay órdenes para este día</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredServices.map((service, idx) => {
                                        const sInfo = getStatusInfo(service.status);
                                        return (
                                            <motion.div
                                                key={service.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => router.push(`/service-orders/${service.id}`)}
                                                className="group relative bg-gray-900/30 border border-white/5 rounded-[3rem] p-7 shadow-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden hover:bg-gray-900/50 hover:border-[#135bec]/20"
                                            >
                                                <div className={`absolute left-0 top-10 bottom-10 w-1.5 rounded-r-full ${sInfo.color.replace('text-', 'bg-')}`} />

                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={`px-4 py-2 rounded-2xl text-[8px] font-black uppercase tracking-[0.2em] border backdrop-blur-md ${sInfo.bg} ${sInfo.color} ${sInfo.border}`}>
                                                            {sInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                        <User size={12} className="text-[#135bec]" />
                                                        {service.technicians?.full_name?.split(' ')[0] || 'Gral'}
                                                    </div>
                                                </div>

                                                <div className="flex gap-6 items-center mb-8">
                                                    <div className="size-16 rounded-[1.5rem] bg-gray-900 border border-white/10 flex items-center justify-center text-[#135bec] shadow-inner group-hover:bg-[#135bec]/10 transition-colors">
                                                        <Wrench size={32} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xl font-black tracking-tight text-white truncate">{service.clients?.full_name}</h3>
                                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.1em] truncate italic opacity-80 mt-1">{service.reported_issue || 'Servicio Técnico'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/[0.03] rounded-[1.5rem] p-4 border border-white/5 flex items-center gap-4">
                                                        <Clock size={16} className="text-[#135bec]" />
                                                        <span className="text-sm font-black text-gray-200 tabular-nums">
                                                            {service.scheduled_at ? new Date(service.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '24/7'}
                                                        </span>
                                                    </div>
                                                    <div className="bg-white/[0.03] rounded-[1.5rem] p-4 border border-white/5 flex items-center gap-4 overflow-hidden">
                                                        <MapPin size={16} className="text-rose-500" />
                                                        <span className="text-xs font-black text-gray-200 truncate">{service.clients?.address || 'Mendoza'}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>

            {/* Float Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/new-service')}
                className="fixed bottom-8 right-8 size-16 rounded-full bg-[#135bec] text-white shadow-[0_20px_40px_rgba(19,91,236,0.4)] flex items-center justify-center z-[100] border-2 border-white/10"
            >
                <Plus size={32} />
            </motion.button>
        </div>
    );
}
