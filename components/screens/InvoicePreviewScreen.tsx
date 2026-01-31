'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

const InvoicePreviewScreen: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;

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
      const { data: orderData } = await supabase
        .from('service_orders')
        .select('*, client:clients(*), equipment:equipment(*), technician:technicians(*)')
        .eq('id', serviceId)
        .single();

      if (orderData) {
        setOrder(orderData);
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, part:parts(*)')
          .eq('order_id', serviceId);
        setItems(itemsData || []);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!order) return;
    const message = `Hola ${order.client?.full_name}, adjunto la factura de su servicio ${order.order_number} por value de $${Number(order.total_cost).toLocaleString()}.`;
    window.open(`https://wa.me/${order.client?.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) return (
    <div className="bg-[#0a0c10] min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#135bec] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return (
    <div className="bg-[#0a0c10] min-h-screen flex flex-col items-center justify-center p-6 text-white text-center">
      <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">Orden no encontrada</h2>
      <button onClick={() => router.back()} className="text-[#135bec] font-bold text-sm">Regresar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col font-sans max-w-md mx-auto relative pb-40 overflow-x-hidden">
      <header className="p-4 flex items-center justify-between border-b border-gray-800 bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00d4ff]">Digital Receipt</h1>
        <button className="p-2 text-gray-400">
          <Share2 size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 flex flex-col min-h-[600px]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-1">Factura</h2>
              <p className="text-sm font-bold text-slate-400">#{order.order_number}</p>
              <div className="mt-3 bg-[#135bec] text-white text-[9px] font-black px-4 py-1.5 rounded-full inline-flex items-center gap-2 uppercase tracking-widest">
                <Calendar size={12} />
                {new Date(order.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-[#135bec] mb-1">
                <Wrench size={24} />
                <span className="font-black text-lg italic tracking-tighter">ServiHogar</span>
              </div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">NIT: 900.123.456-7</p>
            </div>
          </div>

          <div className="mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={16} className="text-[#135bec] mt-0.5" />
                <div>
                  <p className="text-[8px] text-slate-400 font-black uppercase">Cliente</p>
                  <p className="font-black text-slate-800 text-sm leading-tight">{order.client?.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#135bec] mt-0.5" />
                <div>
                  <p className="text-[8px] text-slate-400 font-black uppercase">Ubicación</p>
                  <p className="font-bold text-slate-800 text-xs leading-tight">{order.client?.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex text-[9px] font-black text-white bg-slate-800 p-3 rounded-t-2xl uppercase tracking-widest">
              <div className="flex-1">Descripción del Servicio</div>
              <div className="w-20 text-right">Total</div>
            </div>
            <div className="border border-slate-100 rounded-b-2xl mb-6 bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-slate-800 text-xs">MANO DE OBRA Y DIAGNÓSTICO</span>
                  <span className="font-black text-slate-800 text-sm">${Number(order.labor_cost).toLocaleString()}</span>
                </div>
              </div>
              {items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 border-b border-slate-50 bg-slate-50/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-bold text-slate-700 text-xs uppercase">{item.part?.name}</span>
                      <p className="text-[9px] text-slate-400 font-bold">CANT: {item.quantity}</p>
                    </div>
                    <span className="font-black text-slate-800 text-sm">${(Number(item.price_at_time) * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="bg-slate-900 p-6 rounded-3xl flex justify-between items-center shadow-xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Cancelado</p>
              <span className="text-3xl font-black text-white tracking-tighter">${Number(order.total_cost).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#0a0c10]/95 backdrop-blur-2xl border-t border-white/5 p-5 fixed bottom-0 w-full max-w-md z-50 rounded-t-[2.5rem]">
        <button
          onClick={handleShareWhatsApp}
          className="w-full bg-[#1ab05c] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 mb-4 shadow-lg shadow-[#1ab05c]/20"
        >
          <MessageSquare size={20} />
          <span className="uppercase tracking-widest text-sm">WhatsApp</span>
        </button>
        <div className="grid grid-cols-2 gap-4">
          <button className="py-3 bg-gray-900 border border-white/5 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Download size={14} /> PDF
          </button>
          <button className="py-3 bg-gray-900 border border-white/5 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </footer>
    </div>
  );
};

export default InvoicePreviewScreen;
