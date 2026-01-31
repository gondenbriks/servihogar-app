"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in environment variables for diagnosis.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface DiagnosisResult {
    diagnosis: string;
    probability: "Alta" | "Media" | "Baja";
    suggested_parts: string[];
    estimated_labor_time: string;
    repair_steps: string[];
    safety_warning: string;
}

export async function diagnoseService(
    applianceData: { brand: string; model: string; year?: string },
    symptoms: string
): Promise<DiagnosisResult> {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const prompt = `
    ROL: ERES "TECH-MENTOR", ASISTENTE EXPERTO EN REPARACIÓN TÉCNICA.
    
    EQUIPO: ${applianceData.brand} ${applianceData.model} (${applianceData.year || 'Año no especificado'}).
    SÍNTOMAS REPORTADOS POR EL TÉCNICO: "${symptoms}".

    OBJETIVO:
    Proporcionar un diagnóstico técnico preciso, pasos de reparación detallados, repuestos necesarios y advertencias de seguridad críticas.

    REQUERIMIENTOS:
    - La respuesta DEBE ser un objeto JSON válido.
    - El campo "diagnosis" debe ser técnico y conciso.
    - El campo "safety_warning" es obligatorio y debe resaltar riesgos eléctricos o físicos.
    - El campo "repair_steps" debe ser una lista lógica de acciones.
    - El campo "suggested_parts" debe listar componentes específicos a reemplazar.

    ESTRUCTURA JSON DESEADA:
    {
      "diagnosis": "Resumen técnico de la falla",
      "probability": "Alta/Media/Baja",
      "suggested_parts": ["Pieza 1", "Pieza 2"],
      "estimated_labor_time": "ej: 45 min",
      "repair_steps": ["1. Desconectar...", "2. Probar..."],
      "safety_warning": "ADVERTENCIA CRÍTICA: ..."
    }
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                // @ts-ignore - responseMimeType es soportado aunque no esté en el tipo base
                responseMimeType: "application/json",
            },
        });

        const text = result.response.text();
        return JSON.parse(text) as DiagnosisResult;
    } catch (error) {
        console.error("Error with Gemini Technical Diagnostic Action:", error);
        throw new Error("No se pudo generar el diagnóstico técnico. Intenta de nuevo.");
    }
}
