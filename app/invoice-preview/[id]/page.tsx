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
        const message = `*FACTURA DIGITAL - ServiHogar*\n\nHola ${order.client?.full_name}, adjunto el enlace para ver y descargar su factura oficial de servicio técnico.\n\n📄 *Orden:* #${order.order_number}\n💰 *Total:* $${Number(order.total_cost).toLocaleString()}\n\nVer factura aquí: ${window.location.href}`;
        window.open(`https://wa.me/${order.client?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handlePrint = () => {
        window.print();
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
        <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col font-sans max-w-md mx-auto relative pb-40 print:pb-0 print:bg-white print:text-black">
            <style jsx global>{`
                @media print {
                    body { background: white !important; }
                    .print-compact { padding: 1.5rem !important; min-height: auto !important; }
                    .print-no-shadow { shadow: none !important; border: 1px solid #eee !important; }
                    @page { margin: 0.5cm; }
                }
            `}</style>

            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-gray-800 bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-50 print:hidden">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-black uppercase tracking-tight text-[#00d4ff]">Factura Digital</h1>
                <button
                    onClick={handleShareWhatsApp}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                    <Share2 size={20} className="text-[#1ab05c]" />
                </button>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-y-auto print:p-0">
                <div className="bg-white text-[#1a202c] rounded-[2rem] shadow-2xl overflow-hidden relative p-8 min-h-[600px] flex flex-col print:shadow-none print:border print:border-gray-200 print:min-h-0 print-compact">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-[#0f172a] tracking-tighter leading-none mb-1">FACTURA</h2>
                            <p className="text-base font-bold text-gray-400">#{order.order_number.split('-').pop()}</p>
                            <div className="mt-2 bg-[#135bec] text-white text-[9px] font-black px-3 py-1 rounded-full inline-flex items-center gap-2 uppercase tracking-widest print:bg-gray-100 print:text-black">
                                <Calendar size={10} />
                                {new Date(order.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="flex items-center gap-2 text-[#135bec] mb-1">
                                <Wrench size={20} />
                                <span className="font-black text-lg italic tracking-tighter">ServiTech</span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-tight text-right">
                                NIT: 900.123.456-7<br />
                                Cali, Colombia
                            </p>
                        </div>
                    </div>

                    {/* Client Box */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 print:bg-white">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Cliente</h3>
                                <p className="font-black text-[#0f172a] text-xs">{order.client?.full_name}</p>
                                <p className="text-[9px] text-gray-500 mt-1">{order.client?.phone}</p>
                            </div>
                            <div>
                                <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Ubicación</h3>
                                <p className="font-bold text-[#0f172a] text-[10px] leading-tight">{order.client?.address}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="size-6 bg-white rounded-lg flex items-center justify-center text-[#135bec] border border-gray-100">
                                    <Smartphone size={12} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600">{order.equipment?.brand} {order.equipment?.type}</span>
                            </div>
                            {order.technician && (
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Técnico: {order.technician.full_name.split(' ')[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="flex-1 mb-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[9px] font-black text-white bg-[#0f172a] uppercase tracking-widest print:bg-gray-100 print:text-black">
                                    <th className="p-3 rounded-l-xl">Descripción</th>
                                    <th className="p-3 text-right rounded-r-xl w-24">Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-50 group hover:bg-gray-50 transition-colors">
                                    <td className="p-3">
                                        <p className="font-black text-[#0f172a] text-[11px] uppercase">Mano de Obra y Diagnóstico</p>
                                        <p className="text-[9px] text-gray-500 italic mt-0.5">{order.reported_issue || 'Revision General'}</p>
                                    </td>
                                    <td className="p-3 text-right font-black text-[#0f172a] text-xs">
                                        ${Number(order.labor_cost).toLocaleString()}
                                    </td>
                                </tr>
                                {items.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b border-gray-50 bg-gray-50/20">
                                        <td className="p-3 text-[11px]">
                                            <span className="font-bold text-[#0f172a] uppercase">{item.part?.name}</span>
                                            <p className="text-[8px] text-gray-400 font-bold">CANT: {item.quantity} • {item.part?.code}</p>
                                        </td>
                                        <td className="p-3 text-right font-black text-[#0f172a] text-xs">
                                            ${(Number(item.price_at_time) * item.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & Footer */}
                    <div className="mt-auto">
                        <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center shadow-lg print:bg-gray-100 print:shadow-none print:border print:border-gray-200">
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Liquidación</p>
                                <p className="text-[9px] text-[#00ff9d] font-bold uppercase tracking-widest print:text-black">IVA Incluido</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white tracking-tighter print:text-black">${Number(order.total_cost).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Legal */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 print:bg-white print:border-none">
                            <p className="text-[8px] text-gray-500 leading-relaxed text-center italic">
                                Garantía de 90 días sobre mano de obra y partes instaladas.
                                {order.warranty_expiration && ` Vence: ${new Date(order.warranty_expiration).toLocaleDateString()}`}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Actions */}
            <footer className="bg-[#12141a]/95 backdrop-blur-3xl border-t border-white/5 p-5 fixed bottom-0 w-full max-w-md z-50 rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] print:hidden">
                <button
                    onClick={handleShareWhatsApp}
                    className="w-full bg-[#1ab05c] hover:bg-[#159a4f] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 mb-4 shadow-lg shadow-[#1ab05c]/20 transition-all active:scale-[0.97]"
                >
                    <Share2 size={20} />
                    <span className="uppercase tracking-widest text-sm">Enviar Factura Digital</span>
                </button>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handlePrint}
                        className="py-3.5 bg-gray-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                        <Download size={14} className="text-[#135bec]" />
                        PDF
                    </button>
                    <button
                        onClick={handlePrint}
                        className="py-3.5 bg-gray-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                        <Printer size={14} className="text-[#00ff9d]" />
                        Imprimir
                    </button>
                </div>
            </footer>
        </div>
    );
}
