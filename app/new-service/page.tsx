'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    ChevronLeft,
    X,
    Search,
    User,
    Smartphone,
    MapPin,
    Calendar,
    Clock,
    Wrench,
    FileText,
    Upload,
    Camera,
    Image as ImageIcon,
    RefreshCcw,
    Zap,
    Lock,
    Snowflake,
    Tv,
    Waves,
    Wind,
    PlusCircle,
    Info,
    CheckCircle2,
    StickyNote,
    Mic,
    UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

import { Suspense } from 'react';

function NewServiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialClientId = searchParams.get('clientId');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [clientEquipment, setClientEquipment] = useState<any[]>([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
    const [technicians, setTechnicians] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        national_id: '',
        full_name: '',
        phone: '',
        address: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        reported_issue: '',
        technician_id: '',
        is_warranty: false
    });

    const [photos, setPhotos] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'technician'>('admin');
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = React.useRef<any>(null);

    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz.');
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
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
            setFormData(prev => ({ ...prev, reported_issue: (prev.reported_issue ? prev.reported_issue + ' ' : '') + transcript }));
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole') as 'admin' | 'technician';
        if (savedRole) setUserRole(savedRole);
    }, []);

    const resetForm = () => {
        setFormData({
            national_id: '',
            full_name: '',
            phone: '',
            address: '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            reported_issue: '',
            technician_id: '',
            is_warranty: false
        });
        setSelectedClient(null);
        setSelectedEquipmentId(null);
        setSelectedApplianceType(null);
        setPhotos([]);
    };

    const handlePhotoUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            const newPhoto = `https://picsum.photos/400/400?random=${Date.now()}`;
            setPhotos(prev => [...prev, newPhoto]);
            setIsUploading(false);
        }, 800);
    };

    const removePhoto = (idx: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== idx));
    };

    const appliances = [
        { id: 'fridge', label: 'Refrig.', icon: Snowflake },
        { id: 'ac', label: 'A/C', icon: Wind },
        { id: 'washer', label: 'Lavadora', icon: Waves },
        { id: 'tv', label: 'TV', icon: Tv },
        { id: 'other', label: 'Otro', icon: Wrench },
    ];

    const [selectedApplianceType, setSelectedApplianceType] = useState<string | null>(null);

    useEffect(() => {
        fetchTechnicians();
        if (initialClientId) {
            fetchClientById(initialClientId);
        }
    }, [initialClientId]);

    const fetchTechnicians = async () => {
        const { data } = await supabase.from('technicians').select('*').order('full_name');
        setTechnicians(data || []);
    };

    const fetchClientById = async (id: string) => {
        setIsLoading(true);
        const { data } = await supabase.from('clients').select('*').eq('id', id).single();
        if (data) {
            selectClient(data);
        }
        setIsLoading(false);
    };

    const handleSearchClients = async (query: string) => {
        setClientSearch(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const { data } = await supabase
            .from('clients')
            .select('*')
            .or(`full_name.ilike.%${query}%,national_id.ilike.%${query}%`)
            .limit(5);

        setSearchResults(data || []);
        setIsSearching(false);
    };

    const selectClient = async (client: any) => {
        setSelectedClient(client);
        setFormData(prev => ({
            ...prev,
            national_id: client.national_id || '',
            full_name: client.full_name || '',
            phone: client.phone || '',
            address: client.address || ''
        }));

        // Fetch equipment
        const { data: equ } = await supabase.from('equipment').select('*').eq('client_id', client.id);
        setClientEquipment(equ || []);
        setSearchResults([]);
        setClientSearch('');
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                Cedula: '12345678',
                Nombre: 'Cliente Ejemplo',
                Telefono: '3001234567',
                Direccion: 'Calle 10 # 5-20, Cali',
                Tipo: 'Nevera',
                Marca: 'Samsung',
                Serial: 'SN-SAMS-9988',
                Falla: 'No enfría',
                Fecha: new Date().toISOString().split('T')[0],
                Hora: '10:00',
                Prioridad: 'NORMAL',
                'Tipo Servicio': 'REPAIR'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Ordenes');
        XLSX.writeFile(wb, 'Plantilla_Ordenes_ServiHogar.xlsx');
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

                let successCount = 0;

                for (const row of data) {
                    try {
                        // 1. Client Handling
                        const national_id = String(row.Cedula || row.Identificacion || row.ID || '');
                        const full_name = String(row.Nombre || row['Nombre Completo'] || '');

                        if (!national_id || !full_name) continue;

                        const { data: client, error: cErr } = await supabase
                            .from('clients')
                            .upsert({
                                national_id,
                                full_name,
                                phone: String(row.Telefono || ''),
                                address: String(row.Direccion || 'Cali, Colombia'),
                                category: 'REGULAR'
                            }, { onConflict: 'national_id' })
                            .select()
                            .single();

                        if (cErr) throw cErr;

                        // 2. Equipment Handling
                        const serial_number = String(row.Serial || row['Serial Number'] || `SN-AUTO-${Math.random().toString(36).substring(7)}`);
                        const { data: equip, error: eErr } = await supabase
                            .from('equipment')
                            .upsert({
                                client_id: client.id,
                                type: String(row.Tipo || row.Type || 'Otros'),
                                brand: String(row.Marca || row.Brand || 'Genérica'),
                                model: String(row.Modelo || row.Model || 'Estandar'),
                                serial_number
                            }, { onConflict: 'serial_number' })
                            .select()
                            .single();

                        if (eErr) throw eErr;

                        // 3. Order Handling
                        const date = row.Fecha || new Date().toISOString().split('T')[0];
                        const time = row.Hora || '09:00';
                        const scheduledAt = `${date}T${time}:00`;

                        const { error: oErr } = await supabase
                            .from('service_orders')
                            .insert({
                                client_id: client.id,
                                equipment_id: equip.id,
                                status: 'PENDING',
                                reported_issue: String(row.Falla || row['Reported Issue'] || 'Importado desde Excel'),
                                is_warranty: !!row.Garantia,
                                scheduled_at: scheduledAt,
                                order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}-IMP`
                            });

                        if (!oErr) successCount++;
                    } catch (err) {
                        console.error('Error procesando fila:', row, err);
                    }
                }

                alert(`¡Éxito! Se han importado ${successCount} órdenes de servicio satisfactoriamente.`);
                router.push('/agenda');
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

    const handleCreateService = async () => {
        if (!formData.full_name || !formData.reported_issue) {
            alert("Por favor completa los campos obligatorios (Nombre y Falla Reportada).");
            return;
        }

        setIsSaving(true);
        try {
            let clientId = selectedClient?.id;

            // 1. Create client if not exists
            if (!clientId) {
                const { data: newClient, error: cErr } = await supabase
                    .from('clients')
                    .insert({
                        full_name: formData.full_name,
                        national_id: formData.national_id,
                        phone: formData.phone,
                        address: formData.address,
                        category: 'REGULAR'
                    })
                    .select()
                    .single();

                if (cErr) throw cErr;
                clientId = newClient.id;
            }

            // 2. Handle Equipment
            let equipmentId = selectedEquipmentId;
            if (!equipmentId) {
                const { data: newEq, error: eErr } = await supabase
                    .from('equipment')
                    .insert({
                        client_id: clientId,
                        type: selectedApplianceType || 'Otros',
                        brand: 'Genérica',
                        model: 'Estandar'
                    })
                    .select()
                    .single();

                if (eErr) throw eErr;
                equipmentId = newEq.id;
            }

            // 3. Create Service Order
            const scheduledAt = `${formData.date}T${formData.time}:00`;
            const { data: newOrder, error: oErr } = await supabase
                .from('service_orders')
                .insert({
                    client_id: clientId,
                    equipment_id: equipmentId,
                    technician_id: formData.technician_id || null,
                    status: 'PENDING',
                    reported_issue: formData.reported_issue,
                    is_warranty: formData.is_warranty,
                    scheduled_at: scheduledAt,
                    order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`
                })
                .select()
                .single();

            if (oErr) throw oErr;

            router.push('/agenda');

        } catch (error: any) {
            alert("Error al crear el servicio: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#0a0c10] min-h-screen text-white font-sans max-w-4xl mx-auto relative overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-[#0a0c10]/90 backdrop-blur-2xl p-4 border-b border-white/5">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className="flex size-10 items-center justify-center rounded-xl bg-gray-900 border border-white/5 group hover:border-white/20 transition-all font-bold"
                >
                    <X className="text-gray-400 group-hover:text-white" size={18} />
                </motion.button>

                <div className="text-center px-2">
                    <h1 className="text-[12px] font-black uppercase tracking-[0.3em] text-white">Nuevo Servicio</h1>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <div className={`size-1.5 rounded-full ${userRole === 'admin' ? 'bg-[#00ff9d]' : 'bg-orange-500'} animate-pulse`} />
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{userRole === 'admin' ? 'Modo Admin' : 'Registro Técnico'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportExcel}
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={downloadTemplate}
                        className="flex size-10 items-center justify-center rounded-xl bg-gray-900/50 text-emerald-500 hover:bg-emerald-500/10 transition-colors border border-white/5"
                        title="Descargar Plantilla"
                    >
                        <FileText size={16} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="flex size-10 items-center justify-center rounded-xl bg-gray-900/50 text-[#135bec] hover:bg-[#135bec]/10 transition-colors border border-white/5"
                        title="Subir Archivo"
                    >
                        {isImporting ? <div className="size-4 border-2 border-[#135bec] border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={resetForm}
                        className="flex size-10 items-center justify-center rounded-xl bg-gray-900/50 text-gray-500 hover:text-rose-500 transition-colors border border-white/5"
                    >
                        <RefreshCcw size={16} />
                    </motion.button>
                </div>
            </header>

            <main className="p-6 space-y-8 pb-32">
                {/* Client Search Section */}
                <section className="animate-fade-in relative">
                    <div className="flex flex-col items-center justify-center mb-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 text-center">
                        <div className="flex items-center gap-2 mb-2">
                            <Search size={16} className="text-[#135bec]" />
                            <span>Información del Cliente</span>
                        </div>
                        {selectedClient && (
                            <span className="text-[#00ff9d] bg-[#00ff9d]/5 px-4 py-1.5 rounded-full border border-[#00ff9d]/20 text-[9px] animate-pulse">✓ Cliente Vinculado</span>
                        )}
                    </div>

                    <div className="relative group mb-8">
                        <input
                            type="text"
                            placeholder="Buscar por Nombre o Cédula..."
                            value={clientSearch}
                            onChange={(e) => handleSearchClients(e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#135bec] focus:bg-gray-900/80 outline-none transition-all placeholder:text-gray-600 shadow-inner h-14"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#135bec] transition-colors" size={18} />

                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <RefreshCcw size={14} className="text-[#135bec] animate-spin" />
                            </div>
                        )}

                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-[#0d0f14] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden p-2 backdrop-blur-3xl"
                                >
                                    {searchResults.map((c) => (
                                        <motion.button
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                            key={c.id}
                                            onClick={() => selectClient(c)}
                                            className="w-full h-18 px-4 flex items-center gap-4 rounded-xl transition-colors border-b border-white/5 last:border-0 mb-1"
                                        >
                                            <div className="size-11 rounded-2xl bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center font-black text-[#135bec] text-xs">
                                                {c.full_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-sm font-black text-white truncate">{c.full_name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold tracking-widest">{c.national_id}</p>
                                            </div>
                                            <div className="size-8 rounded-full bg-[#135bec] flex items-center justify-center text-white shadow-lg shadow-[#135bec]/20">
                                                <PlusCircle size={18} />
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre Completo *</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#135bec] transition-all duration-300">
                                    <User size={18} />
                                </div>
                                <input
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-sm focus:border-[#135bec] focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(19,91,236,0.1)] outline-none transition-all font-bold placeholder:text-gray-600 h-16"
                                    placeholder="Nombre del Cliente"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identificación</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#135bec] transition-colors">
                                        <Info size={16} />
                                    </div>
                                    <input
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4.5 pl-11 pr-4 text-sm outline-none focus:border-[#135bec] focus:bg-white/[0.04] transition-all font-bold h-14"
                                        placeholder="ID / Cédula"
                                        value={formData.national_id}
                                        onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Teléfono</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#135bec] transition-colors">
                                        <Smartphone size={16} />
                                    </div>
                                    <input
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4.5 pl-11 pr-4 text-sm outline-none focus:border-[#135bec] focus:bg-white/[0.04] transition-all font-bold h-14"
                                        placeholder="WhatsApp / Celular"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Dirección de Servicio</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#135bec] transition-colors">
                                    <MapPin size={18} />
                                </div>
                                <input
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-sm outline-none focus:border-[#135bec] focus:bg-white/[0.05] transition-all font-bold placeholder:text-gray-600 h-16"
                                    placeholder="Ubicación Detallada"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visual Evidence Section */}
                <section className="animate-slide-up">
                    <div className="flex flex-col items-center justify-center mb-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <Camera size={16} className="text-[#135bec]" />
                            <span>Evidencia Visual</span>
                        </div>
                        <span className="text-[8px] text-gray-600 font-bold tracking-[0.1em]">(OPCIONAL)</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {/* Action Buttons */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePhotoUpload}
                            disabled={isUploading}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-1 bg-gray-900/30 hover:border-[#135bec] hover:bg-[#135bec]/5 transition-all group"
                        >
                            <Camera size={20} className="text-gray-600 group-hover:text-[#135bec]" />
                            <span className="text-[8px] font-black uppercase text-gray-700 group-hover:text-[#135bec]">Cámara</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePhotoUpload}
                            disabled={isUploading}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-1 bg-gray-900/30 hover:border-[#135bec] hover:bg-[#135bec]/5 transition-all group"
                        >
                            <ImageIcon size={20} className="text-gray-600 group-hover:text-[#135bec]" />
                            <span className="text-[8px] font-black uppercase text-gray-700 group-hover:text-[#135bec]">Galería</span>
                        </motion.button>

                        {/* Previews */}
                        {photos.map((photo, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                                <img src={photo} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removePhoto(i)}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} className="text-white" />
                                </button>
                            </div>
                        ))}

                        {/* Loading State */}
                        {isUploading && (
                            <div className="aspect-square rounded-2xl bg-gray-900/50 border border-white/5 flex items-center justify-center">
                                <RefreshCcw size={14} className="text-[#135bec] animate-spin" />
                            </div>
                        )}
                    </div>
                </section>

                {/* Date & Time */}
                <section>
                    <div className="flex flex-col items-center justify-center mb-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#00ff9d]" />
                            <span>Programación de Visita</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Fecha</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="date"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4.5 pl-11 pr-4 text-sm color-scheme-dark font-bold h-14"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Hora</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="time"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4.5 pl-11 pr-4 text-sm font-bold h-14"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Equipment Selection */}
                <section className="animate-slide-up">
                    <div className="flex flex-col items-center justify-center mb-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                        <div className="flex items-center gap-2">
                            <Wrench size={16} className="text-[#00d4ff]" />
                            <span>Selección de Equipo</span>
                        </div>
                    </div>

                    {clientEquipment.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-4">
                            {clientEquipment.map((eq) => (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    key={eq.id}
                                    onClick={() => setSelectedEquipmentId(eq.id)}
                                    className={`shrink-0 w-36 h-28 rounded-2xl border flex flex-col items-center justify-center p-3 transition-all relative overflow-hidden ${selectedEquipmentId === eq.id
                                        ? 'border-[#00d4ff] bg-[#00d4ff]/10 shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                                        : 'bg-gray-900/50 border-white/5'
                                        }`}
                                >
                                    {selectedEquipmentId === eq.id && (
                                        <div className="absolute top-2 right-2 size-2 rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" />
                                    )}
                                    <Smartphone className={selectedEquipmentId === eq.id ? "text-[#00d4ff]" : "text-gray-600"} size={22} />
                                    <span className={`text-[11px] font-black mt-1 line-clamp-1 ${selectedEquipmentId === eq.id ? 'text-white' : 'text-gray-400'}`}>{eq.brand}</span>
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tight">{eq.type}</span>
                                </motion.button>
                            ))}
                            <button
                                onClick={() => setSelectedEquipmentId(null)}
                                className={`shrink-0 w-36 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 transition-all ${!selectedEquipmentId ? 'border-[#00d4ff] bg-[#00d4ff]/5' : 'border-gray-800 opacity-30 shadow-inner'}`}
                            >
                                <PlusCircle className="text-gray-500 mb-1" size={24} />
                                <span className="text-[10px] font-black text-gray-500 uppercase">Nuevo</span>
                            </button>
                        </div>
                    )}

                    {!selectedEquipmentId && (
                        <div className="grid grid-cols-5 gap-2">
                            {appliances.map((app) => (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    key={app.id}
                                    onClick={() => setSelectedApplianceType(app.label)}
                                    className={`flex flex-col items-center justify-center h-22 rounded-2xl border transition-all duration-300 ${selectedApplianceType === app.label
                                        ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-white shadow-lg'
                                        : 'bg-gray-900 border-white/5 text-gray-600'
                                        }`}
                                >
                                    <app.icon size={22} className={selectedApplianceType === app.label ? "text-[#00d4ff]" : ""} />
                                    <span className="text-[8px] font-black uppercase tracking-widest mt-2">{app.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Warranty Toggle */}
                <section className="animate-slide-up">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, is_warranty: !formData.is_warranty })}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all relative overflow-hidden group ${formData.is_warranty
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-gray-900/40 border-white/5'
                            }`}
                    >
                        {formData.is_warranty && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                        )}
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${formData.is_warranty ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-800 text-gray-600'}`}>
                                <Zap size={18} />
                            </div>
                            <div className="text-left">
                                <p className={`text-[13px] font-black uppercase tracking-tight ${formData.is_warranty ? 'text-amber-500' : 'text-gray-400'}`}>Servicio de Garantía</p>
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Sin cargo adicional para el cliente</p>
                            </div>
                        </div>
                        <div className={`size-6 rounded-full border flex items-center justify-center transition-all ${formData.is_warranty ? 'border-amber-500 bg-amber-500' : 'border-gray-700'}`}>
                            {formData.is_warranty && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                    </motion.button>
                </section>

                {/* Reported Issue */}
                <section>
                    <div className="flex flex-col items-center justify-center mb-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                        <div className="flex items-center gap-2">
                            <StickyNote size={16} className="text-amber-500" />
                            <span>Reporte de Falla</span>
                        </div>
                    </div>
                    <div className="relative group">
                        <textarea
                            rows={4}
                            placeholder="Describa el problema detalladamente..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm outline-none focus:border-amber-500/50 focus:bg-white/[0.04] transition-all resize-none font-medium placeholder:text-gray-700 h-32"
                            value={formData.reported_issue}
                            onChange={(e) => setFormData({ ...formData, reported_issue: e.target.value })}
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={toggleListening}
                            className={`absolute bottom-4 right-4 p-3 rounded-xl shadow-xl transition-all ${isListening ? 'bg-[#00ff9d] text-black animate-pulse' : 'bg-[#135bec] text-white'}`}
                        >
                            <Mic size={18} />
                        </motion.button>
                    </div>
                </section>

                {/* Technician Assignment */}
                <section>
                    <div className="flex flex-col items-center justify-center mb-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                        <div className="flex items-center gap-2">
                            <UserCheck size={16} className="text-indigo-400" />
                            <span>Técnico Responsable</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {technicians.length > 0 ? technicians.map((tech, idx) => {
                            // Mock busy status for visual variety
                            const isBusy = idx === 1;

                            return (
                                <motion.div
                                    key={tech.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setFormData({ ...formData, technician_id: tech.id })}
                                    className={`relative flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${formData.technician_id === tech.id
                                        ? 'bg-indigo-600/10 border-indigo-500 shadow-lg'
                                        : 'bg-gray-900/40 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-xl ${formData.technician_id === tech.id ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                                            {tech.full_name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-bold ${formData.technician_id === tech.id ? 'text-white' : 'text-gray-300'}`}>{tech.full_name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className={`size-1.5 rounded-full ${isBusy ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isBusy ? 'text-orange-500/80' : 'text-emerald-500/80'}`}>
                                                    {isBusy ? 'Ocupado' : 'Disponible'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`size-5 rounded-full border flex items-center justify-center transition-all ${formData.technician_id === tech.id
                                        ? 'border-indigo-500 bg-indigo-500'
                                        : 'border-gray-800 bg-transparent'
                                        }`}>
                                        {formData.technician_id === tech.id && (
                                            <CheckCircle2 size={12} className="text-white" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <p className="text-center py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">Buscando técnicos...</p>
                        )}
                    </div>
                </section>
            </main>

            {/* Footer Action */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto p-6 bg-[#0a0c10]/95 backdrop-blur-3xl border-t border-white/5 z-[70]">
                <button
                    onClick={handleCreateService}
                    disabled={isSaving}
                    className="w-full h-16 bg-[#135bec] text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(19,91,236,0.3)] active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Calendar size={22} />
                            <span className="uppercase tracking-[0.2em]">Agendar Servicio</span>
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
}

export default function NewServicePage() {
    return (
        <Suspense fallback={
            <div className="bg-[#0a0c10] min-h-screen flex items-center justify-center">
                <div className="size-10 border-4 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin"></div>
            </div>
        }>
            <NewServiceContent />
        </Suspense>
    );
}
