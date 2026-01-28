'use client';

import React, { useRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Trash2, CheckCircle2 } from 'lucide-react';

interface SignatureCanvasProps {
    onSave: (dataUrl: string) => void;
    onClear?: () => void;
}

export default function SignatureCanvas({ onSave, onClear }: SignatureCanvasProps) {
    const sigPad = useRef<SignaturePad>(null);

    const clear = () => {
        sigPad.current?.clear();
        if (onClear) onClear();
    };

    const save = () => {
        if (sigPad.current?.isEmpty()) {
            alert('Por favor, firme antes de guardar.');
            return;
        }
        const dataUrl = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
        if (dataUrl) onSave(dataUrl);
    };

    return (
        <div className="w-full space-y-4">
            <div className="relative w-full h-48 bg-white rounded-3xl overflow-hidden border-4 border-gray-900 shadow-2xl flex items-center justify-center cursor-crosshair">
                <SignaturePad
                    ref={sigPad}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-full signature-canvas'
                    }}
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                    <span className="text-gray-300 font-bold text-[10px] uppercase select-none opacity-50 tracking-widest">
                        Firme dentro del recuadro
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={clear}
                    className="flex-1 bg-gray-900/50 border border-white/5 text-gray-400 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                >
                    <Trash2 size={16} />
                    <span className="text-[10px] uppercase tracking-widest">Borrar</span>
                </button>
                <button
                    onClick={save}
                    className="flex-1 bg-[#00ff9d]/10 border border-[#00ff9d]/20 text-[#00ff9d] font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00ff9d] hover:text-black transition-all"
                >
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] uppercase tracking-widest">Confirmar Firma</span>
                </button>
            </div>
        </div>
    );
}
