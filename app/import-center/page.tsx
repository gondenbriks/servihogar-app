'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    ChevronLeft,
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    Database,
    X,
    Trash2,
    Calendar,
    User,
    Wrench,
    Zap
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Background from '../../components/design/Background';
import NeonButton from '../../components/design/NeonButton';

interface ImportRow {
    id: string;
    national_id: string;
    full_name: string;
    phone: string;
    address: string;
    equipment_type: string;
    brand: string;
    serial_number: string;
    reported_issue: string;
    service_type: string;
    priority: string;
    date: string;
    time: string;
    status: 'idle' | 'processing' | 'success' | 'error';
    error?: string;
}

export default function ImportCenterPage() {
    const router = useRouter();
    const [rows, setRows] = useState<ImportRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                Falla: 'No enfría la parte inferior',
                Fecha: new Date().toISOString().split('T')[0],
                Hora: '10:00',
                Prioridad: 'NORMAL',
                'Tipo Servicio': 'REPAIR'
            },
            {
                Cedula: '87654321',
                Nombre: 'Empresa ABC',
                Telefono: '3109876543',
                Direccion: 'Av. Siempre Viva 123',
                Tipo: 'Aire Acondicionado',
                Marca: 'LG',
                Serial: 'SN-LG-5544',
                Falla: 'Mantenimiento preventivo anual',
                Fecha: new Date().toISOString().split('T')[0],
                Hora: '14:30',
                Prioridad: 'URGENT',
                'Tipo Servicio': 'MAINTENANCE'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla ServiTech');
        XLSX.writeFile(wb, 'Plantilla_Servicios_ServiTech.xlsx');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data: any[] = XLSX.utils.sheet_to_json(ws);

                const mapped: ImportRow[] = data.map((row, idx) => ({
                    id: `row-${idx}`,
                    national_id: String(row.Cedula || row.ID || row.Identificacion || ''),
                    full_name: String(row.Nombre || row['Nombre Completo'] || ''),
                    phone: String(row.Telefono || ''),
                    address: String(row.Direccion || ''),
                    equipment_type: String(row.Tipo || row.Articulo || 'Otros'),
                    brand: String(row.Marca || 'Genérica'),
                    serial_number: String(row.Serial || row.Serie || `SN-AUTO-${Math.random().toString(36).substring(7)}`),
                    reported_issue: String(row.Falla || row.Problema || 'Revisión General'),
                    service_type: String(row['Tipo Servicio'] || 'REPAIR'),
                    priority: String(row.Prioridad || 'NORMAL').toUpperCase(),
                    date: row.Fecha || new Date().toISOString().split('T')[0],
                    time: row.Hora || '09:00',
                    status: 'idle' as const
                })).filter(r => r.full_name && r.national_id);

                setRows(mapped);
            } catch (error) {
                alert('Error al leer el archivo: ' + (error as Error).message);
            }
        };
        reader.readAsBinaryString(file);
    };

    const processImport = async () => {
        setIsProcessing(true);
        const updatedRows = [...rows];

        for (let i = 0; i < updatedRows.length; i++) {
            const row = updatedRows[i];
            if (row.status === 'success') continue;

            updatedRows[i].status = 'processing';
            setRows([...updatedRows]);

            try {
                // 1. Upsert Client
                const { data: client, error: cErr } = await supabase
                    .from('clients')
                    .upsert({
                        national_id: row.national_id,
                        full_name: row.full_name,
                        phone: row.phone,
                        address: row.address,
                        category: 'REGULAR'
                    }, { onConflict: 'national_id' })
                    .select()
                    .single();

                if (cErr) throw cErr;

                // 2. Upsert Equipment
                const { data: equip, error: eErr } = await supabase
                    .from('equipment')
                    .upsert({
                        client_id: client.id,
                        type: row.equipment_type,
                        brand: row.brand,
                        model: 'Estandar',
                        serial_number: row.serial_number
                    }, { onConflict: 'serial_number' })
                    .select()
                    .single();

                if (eErr) throw eErr;

                // 3. Insert Service Order
                const scheduledAt = `${row.date}T${row.time}:00`;
                const { error: oErr } = await supabase
                    .from('service_orders')
                    .insert({
                        client_id: client.id,
                        equipment_id: equip.id,
                        status: 'PENDING',
                        reported_issue: row.reported_issue,
                        service_type: row.service_type,
                        priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(row.priority) ? row.priority : 'NORMAL',
                        scheduled_at: scheduledAt,
                        order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}-IMP`
                    });

                if (oErr) throw oErr;

                updatedRows[i].status = 'success';
            } catch (err: any) {
                updatedRows[i].status = 'error';
                updatedRows[i].error = err.message;
            }
            setRows([...updatedRows]);
        }
        setIsProcessing(false);
    };

    return (
        <div className="bg-background min-h-screen text-white font-outfit max-w-2xl mx-auto pb-32">
            <Background />
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="size-10 bg-gray-900 rounded-xl flex items-center justify-center border border-white/5">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">Carga Masiva</h1>
                        <p className="text-[10px] text-[#135bec] font-black uppercase tracking-widest">Excel / CSV a Supabase</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {rows.length === 0 && (
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 bg-emerald-600/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-600/20 transition-all"
                        >
                            <FileText size={14} />
                            Plantilla
                        </button>
                    )}
                    {rows.length > 0 && !isProcessing && (
                        <button onClick={() => setRows([])} className="text-rose-500 font-bold text-xs flex items-center gap-2">
                            <Trash2 size={16} /> Limpiar
                        </button>
                    )}
                </div>
            </header>

            <main className="p-6">
                {rows.length === 0 ? (
                    <div className="space-y-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="py-20 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center bg-gray-900/20 cursor-pointer hover:border-[#135bec]/50 transition-all hover:bg-[#135bec]/5 group"
                        >
                            <div className="size-20 rounded-3xl bg-gray-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                                <Upload className="text-[#135bec]" size={36} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Sube tu Excel de Servicios</h3>
                            <p className="text-xs text-gray-500 max-w-xs text-center px-4 font-medium">
                                Arr規範 tu archivo o haz clic para seleccionar. El sistema detectará automáticamente clientes, equipos y fallas.
                            </p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />
                        </div>

                        <button
                            onClick={downloadTemplate}
                            className="w-full py-5 rounded-[2rem] border border-white/5 bg-gray-900/40 flex items-center justify-center gap-3 hover:bg-gray-900 transition-all group"
                        >
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">¿No tienes la plantilla?</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Descarga el modelo oficial aquí</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6 bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-3xl">
                            <div>
                                <p className="text-sm font-bold">{rows.length} registros detectados</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Listo para importar a la lista</p>
                            </div>
                            <button
                                onClick={processImport}
                                disabled={isProcessing}
                                className="bg-[#135bec] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#135bec]/20"
                            >
                                {isProcessing ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Database size={16} />}
                                Iniciar Proceso
                            </button>
                        </div>

                        <div className="space-y-3">
                            {rows.map((row) => (
                                <div key={row.id} className={`p-5 rounded-[2rem] border transition-all ${row.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                    row.status === 'error' ? 'bg-rose-500/10 border-rose-500/30' :
                                        row.status === 'processing' ? 'bg-indigo-500/10 border-indigo-500 animate-pulse' :
                                            'bg-gray-900/40 border-white/5'
                                    }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`size-12 rounded-xl flex items-center justify-center font-black ${row.status === 'success' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'
                                                }`}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{row.full_name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{row.national_id}</p>
                                            </div>
                                        </div>
                                        {row.status === 'success' && <CheckCircle2 className="text-emerald-500" size={20} />}
                                        {row.status === 'error' && <AlertCircle className="text-rose-500" size={20} />}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-[10px] flex items-center gap-2">
                                            <Wrench size={12} className="text-[#135bec]" />
                                            <span className="font-bold">{row.equipment_type} {row.brand}</span>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-[10px] flex items-center gap-2">
                                            <Calendar size={12} className="text-rose-500" />
                                            <span className="font-bold">{row.date} {row.time}</span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-400 line-clamp-2 px-1 mb-2">
                                        <span className="font-black text-gray-600 uppercase tracking-tighter mr-2">Falla:</span>
                                        {row.reported_issue}
                                    </p>

                                    {row.error && (
                                        <p className="text-[9px] text-rose-500 font-bold mt-2 bg-rose-500/10 p-2 rounded-lg">
                                            Error: {row.error}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
