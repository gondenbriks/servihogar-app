'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import {
    ChevronLeft,
    Share2,
    Download,
    Printer,
    MessageSquare,
    Wrench,
    User,
    MapPin,
    Smartphone,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function InvoicePreviewPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (serviceId) {
            fetchOrderDetails();
        }
    }, [serviceId]);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch Order with Client and Equipment
            const { data: orderData, error: orderError } = await supabase
                .from('service_orders')
                .select(`
                    *,
                    client:clients(*),
                    equipment:equipment(*),
                    technician:technicians(*)
                `)
                .eq('id', serviceId)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData);

            // Fetch Order Items (Parts)
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select(`
                    *,
                    part:parts(*)
                `)
                .eq('order_id', serviceId);

            if (itemsError) throw itemsError;
            setItems(itemsData || []);

        } catch (error) {
            console.error('Error fetching invoice details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareWhatsApp = () => {
        if (!order) return;
        const message = `Hola ${order.client?.full_name}, adjunto la factura de su servicio técnico ${order.order_number} por un valor de $${Number(order.total_cost).toLocaleString()}. Gracias por confiar en ServiTech Pro.`;
        window.open(`https://wa.me/${order.client?.phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (isLoading) return (
        <div className="bg-[#0a0c10] min-h-screen flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-[#135bec]/30 border-t-[#135bec] rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold opacity-50">Generando vista previa...</p>
        </div>
    );

    if (!order) return (
        <div className="bg-[#0a0c10] min-h-screen flex flex-col items-center justify-center text-white p-6">
            <p className="text-xl font-bold mb-4">Orden no encontrada</p>
            <button onClick={() => router.back()} className="text-[#135bec] font-bold">Volver</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col font-sans max-w-md mx-auto relative pb-40">
            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-gray-800 bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-50">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-black uppercase tracking-tight text-[#00d4ff]">Factura Digital</h1>
                <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <Share2 size={20} className="text-gray-400" />
                </button>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                <div className="bg-white text-[#1a202c] rounded-[2rem] shadow-2xl overflow-hidden relative p-8 min-h-[650px] flex flex-col">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter leading-none mb-1">FACTURA</h2>
                            <p className="text-lg font-bold text-gray-400">#{order.order_number.split('-').pop()}</p>
                            <div className="mt-3 bg-[#135bec] text-white text-[10px] font-black px-4 py-1.5 rounded-full inline-flex items-center gap-2 uppercase tracking-widest">
                                <Calendar size={12} />
                                {new Date(order.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="flex items-center gap-2 text-[#135bec] mb-2">
                                <Wrench size={24} />
                                <span className="font-black text-xl italic tracking-tighter">ServiTech</span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight text-right">
                                NIT: 900.123.456-7<br />
                                Servicio Técnico Especializado
                            </p>
                        </div>
                    </div>

                    {/* Client Box */}
                    <div className="mb-8 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-2">Información del Cliente</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User size={16} className="text-[#135bec] mt-0.5" />
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Cliente</p>
                                    <p className="font-black text-[#0f172a] text-sm">{order.client?.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-[#135bec] mt-0.5" />
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Ubicación</p>
                                    <p className="font-bold text-[#0f172a] text-xs leading-snug">{order.client?.address}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-start gap-2">
                                    <Wrench size={14} className="text-[#135bec] mt-0.5" />
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Equipo</p>
                                        <p className="font-bold text-[#0f172a] text-xs">{order.equipment?.brand} {order.equipment?.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Smartphone size={14} className="text-[#135bec] mt-0.5" />
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Contacto</p>
                                        <p className="font-bold text-[#0f172a] text-xs">{order.client?.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="flex-1">
                        <div className="flex text-[10px] font-black text-white bg-[#0f172a] p-3 rounded-t-2xl uppercase tracking-widest mb-1">
                            <div className="flex-1">Concepto</div>
                            <div className="w-20 text-right">Importe</div>
                        </div>

                        <div className="border border-gray-100 rounded-b-2xl mb-6 bg-white overflow-hidden">
                            {/* Labor Cost */}
                            <div className="p-4 border-b border-gray-50 group hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-black text-[#0f172a] text-xs uppercase tracking-tight">Servicio Técnico y Mano de Obra</span>
                                    <span className="font-black text-[#0f172a] text-sm">${Number(order.labor_cost).toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                    {order.reported_issue ? `Reparación: ${order.reported_issue}` : 'Diagnóstico y reparación general.'}
                                </p>
                            </div>

                            {/* Parts (Items) */}
                            {items.map((item: any, idx: number) => (
                                <div key={idx} className="p-4 border-b border-gray-50 bg-gray-50/30">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-bold text-[#0f172a] text-xs uppercase tracking-tight">{item.part?.name}</span>
                                            <p className="text-[9px] text-gray-400 font-bold">CANT: {item.quantity} • COD: {item.part?.code}</p>
                                        </div>
                                        <span className="font-black text-[#0f172a] text-sm">${(Number(item.price_at_time) * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Totals */}
                    <div className="mt-auto space-y-6">
                        {/* Technician Box */}
                        {order.technician && (
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <div className="size-12 bg-[#135bec]/10 rounded-2xl flex items-center justify-center text-[#135bec] border border-[#135bec]/10">
                                    <User size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Técnico Asignado</p>
                                    <p className="font-black text-[#0f172a] text-sm">{order.technician.full_name}</p>
                                    <p className="text-gray-400 text-[9px] font-bold italic">{order.technician.specialty || 'Especialista en Línea Blanca'}</p>
                                </div>
                            </div>
                        )}

                        {/* Grand Total */}
                        <div className="bg-[#0f172a] p-6 rounded-3xl flex justify-between items-center shadow-xl shadow-[#0f172a]/20">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Total a Pagar</p>
                                <p className="text-sm font-bold text-white/50 lowercase tracking-tighter italic">Liquidación final del servicio</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-white tracking-tighter">${Number(order.total_cost).toLocaleString()}</span>
                                <div className="flex items-center justify-end gap-1 text-[10px] text-[#00ff9d] font-black uppercase mt-1">
                                    <ArrowRight size={12} />
                                    IVA Incluido
                                </div>
                            </div>
                        </div>

                        {/* Legal */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Share2 size={10} className="text-[#135bec]" />
                                Garantía y Condiciones
                            </h4>
                            <p className="text-[8px] text-gray-500 leading-relaxed text-justify italic">
                                Este servicio cuenta con una garantía de 90 días sobre mano de obra y partes instaladas.
                                {order.warranty_expiration && (
                                    <span className="block mt-1 font-bold text-[#135bec]">
                                        Válida hasta: {new Date(order.warranty_expiration).toLocaleDateString()}
                                    </span>
                                )}
                                <br />
                                La empresa no se responsabiliza por fallas posteriores derivadas de fluctuaciones eléctricas
                                o mal uso del equipo por parte del usuario final.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Actions */}
            <footer className="bg-[#12141a]/95 backdrop-blur-3xl border-t border-white/5 p-5 fixed bottom-0 w-full max-w-md z-50 rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                <button
                    onClick={handleShareWhatsApp}
                    className="w-full bg-[#1ab05c] hover:bg-[#159a4f] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 mb-4 shadow-lg shadow-[#1ab05c]/20 transition-all active:scale-[0.97]"
                >
                    <MessageSquare size={20} />
                    <span className="uppercase tracking-widest text-sm">Enviar por WhatsApp</span>
                </button>
                <div className="grid grid-cols-2 gap-4">
                    <button className="py-3.5 bg-gray-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                        <Download size={14} className="text-gray-400" />
                        PDF
                    </button>
                    <button className="py-3.5 bg-gray-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                        <Printer size={14} className="text-gray-400" />
                        Imprimir
                    </button>
                </div>
            </footer>
        </div>
    );
}
