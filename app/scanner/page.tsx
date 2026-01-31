'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    QrCode,
    ChevronLeft,
    Search,
    Package,
    Plus,
    X,
    Flashlight,
    RefreshCw,
    Maximize,
    Box,
    Camera,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

function ScannerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const context = searchParams.get('context');
    const serviceId = searchParams.get('id');

    const [searchQuery, setSearchQuery] = useState('');
    const [parts, setParts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [scannedPart, setScannedPart] = useState<any | null>(null);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (searchQuery.length > 2) {
            searchParts();
        }
    }, [searchQuery]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            setIsCameraActive(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("No se pudo acceder a la cámara. Por favor verifica los permisos.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            setIsCameraActive(false);
        }
    };

    const toggleFlashlight = async () => {
        if (!streamRef.current) return;
        const track = streamRef.current.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities();

        if (capabilities.torch) {
            try {
                await track.applyConstraints({
                    advanced: [{ torch: !isFlashOn } as any]
                });
                setIsFlashOn(!isFlashOn);
            } catch (err) {
                console.error("Error toggling flashlight:", err);
            }
        } else {
            alert("Linterna no soportada en este dispositivo.");
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);

            // Simulation of AI processing
            setTimeout(() => {
                const results = ["Bomba de Desagüe LG", "Electroválvula Samsung", "Termostato Mabe"];
                const randomPart = results[Math.floor(Math.random() * results.length)];
                setSearchQuery(randomPart);
            }, 1000);
        }
    };

    const searchParts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('parts')
            .select('*')
            .ilike('name', `%${searchQuery}%`)
            .limit(5);

        if (data) setParts(data);
        setIsLoading(false);
    };

    const handleSelectPart = (part: any) => {
        setScannedPart(part);
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col font-sans max-w-md mx-auto relative overflow-hidden">
            {/* Immersive Scanner Header - Overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className="size-11 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white transition-all shadow-2xl"
                >
                    <ChevronLeft size={24} />
                </motion.button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-[#00d4ff] uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">Sensing...</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="size-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                        <h1 className="text-xs font-black uppercase tracking-widest text-white/80">Scanner Pro v2</h1>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFlashlight}
                    className={`size-11 flex items-center justify-center rounded-2xl border backdrop-blur-xl transition-all shadow-2xl ${isFlashOn ? 'bg-[#00ff9d] text-black border-[#00ff9d]' : 'bg-black/40 border-white/10 text-white'}`}
                >
                    <Zap size={20} fill={isFlashOn ? "currentColor" : "none"} />
                </motion.button>
            </div>

            {/* Immersive Camera View Area */}
            <div className="relative h-[60vh] w-full bg-black overflow-hidden group">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent z-10" />

                <div className="absolute inset-0 z-20 pointer-events-none p-10 flex flex-col items-center justify-center">
                    <div className="relative w-72 h-72">
                        <div className="absolute -top-1 -left-1 size-10 border-t-2 border-l-2 border-[#00d4ff] rounded-tl-3xl shadow-[0_0_15px_#00d4ff]" />
                        <div className="absolute -top-1 -right-1 size-10 border-t-2 border-r-2 border-[#00d4ff] rounded-tr-3xl shadow-[0_0_15px_#00d4ff]" />
                        <div className="absolute -bottom-1 -left-1 size-10 border-b-2 border-l-2 border-[#00d4ff] rounded-bl-3xl shadow-[0_0_15px_#00d4ff]" />
                        <div className="absolute -bottom-1 -right-1 size-10 border-b-2 border-r-2 border-[#00d4ff] rounded-br-3xl shadow-[0_0_15px_#00d4ff]" />

                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent shadow-[0_0_20px_#00ff9d] z-30"
                        />

                        <div className="absolute inset-10 border border-white/5 rounded-[2rem] animate-pulse" />
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-3">
                        <div className="px-5 py-2 rounded-2xl bg-black/60 border border-white/5 backdrop-blur-xl flex items-center gap-3 pointer-events-auto">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={capturePhoto}
                                className="size-12 rounded-full bg-[#135bec] flex items-center justify-center text-white shadow-lg shadow-[#135bec]/30"
                            >
                                <Camera size={24} />
                            </motion.button>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Capturar para IA</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center px-8">Enfoque la etiqueta del repuesto para identificación asistida</p>
                    </div>
                </div>
            </div>

            <main className="flex-1 -mt-10 relative z-40 bg-[#0a0c10] rounded-t-[3.5rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/5">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Búsqueda Inteligente</h2>
                    {isLoading && <RefreshCw size={14} className="text-[#135bec] animate-spin" />}
                </div>

                <div className="relative group mb-10">
                    <input
                        type="text"
                        placeholder="Nombre, código o modelo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900/40 border border-white/10 rounded-[1.8rem] py-5 pl-14 pr-6 text-sm focus:border-[#135bec] focus:bg-gray-900/80 outline-none transition-all placeholder:text-gray-600 shadow-inner h-16"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#135bec] transition-colors" size={20} />
                </div>

                <div className="space-y-4">
                    {parts.length > 0 ? (
                        parts.map((part, idx) => (
                            <motion.button
                                key={part.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleSelectPart(part)}
                                className="w-full p-5 bg-gray-900/30 border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:bg-gray-800/50 hover:border-white/10 transition-all active:scale-[0.98] overflow-hidden relative"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#135bec] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center text-[#135bec] shadow-inner group-hover:scale-110 transition-transform">
                                        <Package size={26} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-sm font-black text-white tracking-tight">{part.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${part.stock_level > 5 ? 'bg-[#00ff9d]/5 border-[#00ff9d]/20 text-[#00ff9d]' : 'bg-orange-500/5 border-orange-500/20 text-orange-400'}`}>
                                                Stock: {part.stock_level}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{part.code}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#135bec] group-hover:text-white group-hover:border-[#135bec]/30 transition-all shadow-xl">
                                    <Plus size={18} />
                                </div>
                            </motion.button>
                        ))
                    ) : searchQuery.length > 2 && !isLoading ? (
                        <div className="text-center py-12">
                            <div className="size-20 rounded-[2rem] bg-gray-900/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Box size={32} className="text-gray-700" />
                            </div>
                            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">No se encontraron coincidencias</p>
                        </div>
                    ) : (
                        <div className="p-8 rounded-[2.5rem] bg-gray-900/20 border border-dashed border-white/10 flex flex-col items-center text-center">
                            <QrCode size={48} className="text-gray-800 mb-4" />
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-loose">Escanee un componente o escriba arriba para buscar piezas en el inventario</p>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {scannedPart && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setScannedPart(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-md bg-[#0d0f14] rounded-t-[3.5rem] border-t border-white/10 p-10 relative z-[110] shadow-[0_-30px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-800 rounded-full" />

                            <div className="flex justify-between items-start mb-10">
                                <div className="size-20 rounded-[2.2rem] bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] shadow-2xl">
                                    <Package size={40} />
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setScannedPart(null)}
                                    className="size-11 flex items-center justify-center bg-gray-900 rounded-full border border-white/5 text-gray-500"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <div className="space-y-2 mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff9d]">Item Identificado</span>
                                <h3 className="text-3xl font-black text-white tracking-tighter">{scannedPart.name}</h3>
                                <div className="flex items-center gap-3">
                                    <p className="text-sm font-bold text-gray-500">{scannedPart.code}</p>
                                    <div className="size-1 rounded-full bg-gray-700" />
                                    <p className="text-[10px] font-black text-[#135bec] uppercase tracking-widest">{scannedPart.category || 'Repuesto'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-gray-900/50 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Precio Unitario</p>
                                    <p className="text-2xl font-black text-[#00ff9d] tracking-tight">${scannedPart.unit_price?.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-900/50 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Stock Central</p>
                                    <p className="text-2xl font-black text-white tracking-tight">{scannedPart.stock_level} <span className="text-[10px] text-gray-600">UND</span></p>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (context === 'service_order' && serviceId) {
                                        localStorage.setItem('scanned_part_data', JSON.stringify({
                                            ...scannedPart,
                                            serviceId
                                        }));
                                    }
                                    setScannedPart(null);
                                    router.back();
                                }}
                                className="w-full bg-[#135bec] hover:bg-blue-600 text-white font-black py-5 rounded-[1.8rem] shadow-[0_20px_40px_rgba(19,91,236,0.3)] flex items-center justify-center gap-4 transition-all"
                            >
                                <Plus size={24} />
                                <span className="uppercase tracking-[0.2em] text-sm">Vincular a Servicio</span>
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ScannerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
                <div className="size-10 border-4 border-[#135bec]/20 border-t-[#135bec] rounded-full animate-spin"></div>
            </div>
        }>
            <ScannerContent />
        </Suspense>
    );
}
