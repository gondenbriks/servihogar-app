"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
);

export async function chatWithGemini(
    message: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {

    // Fetch real-time context
    const { data: inventory } = await supabaseAdmin.from('parts').select('name, code, stock_level').limit(10);
    const { data: recentOrders } = await supabaseAdmin.from('service_orders').select('order_number, status, reported_issue, client:clients(full_name)').order('created_at', { ascending: false }).limit(5);

    const context = {
        inventory: inventory || [],
        recentServices: recentOrders || [],
        companyName: "ServiHogar Cali",
        location: "Cali, Colombia"
    };

    const systemInstruction = `
      Eres 'ServiBot', el asistente de operaciones de ${context.companyName}.
      
      ESTADO ACTUAL DEL NEGOCIO:
      - Inventario destacado: ${JSON.stringify(context.inventory)}
      - Últimos servicios: ${JSON.stringify(context.recentServices)}

      RESPONSABILIDADES:
      1. Responder sobre stock: Si preguntan por repuestos, revisa el inventario. Advierte si hay menos de 5 unidades.
      2. Consultas de Agenda: Informa sobre el estado de los servicios recientes si mencionan nombres de clientes o números de orden.
      3. Soporte Técnico: Usa tu conocimiento para guiar en reparaciones, pero siempre menciona si tenemos el repuesto en stock.
      4. Tono: Profesional, técnico, eficiente. Usa emojis ocasionalmente (🔧, 📦, 📅).
      
      IMPORTANTE:
      - Sé conciso.
      - Si no tienes la información exacta en el contexto, indícalo educadamente.
      - Habla siempre en español.
    `;

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
    });

    const chat = model.startChat({
        history: history,
    });

    try {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in Gemini Chat Action:", error);
        throw new Error("No se pudo conectar con ServiBot. Intenta de nuevo.");
    }
}
