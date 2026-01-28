"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generatePersonalizedMessage(
    clientName: string,
    appliance: string,
    topic: 'maintenance' | 'promo' | 'payment' | 'general' = 'maintenance'
): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    let topicContext = "";
    switch (topic) {
        case 'maintenance': topicContext = "Recordarle que su equipo requiere mantenimiento preventivo."; break;
        case 'promo': topicContext = "Ofrecerle un 20% de descuento en su próxima reparación."; break;
        case 'payment': topicContext = "Aviso cordial sobre un pago pendiente de su último servicio."; break;
        case 'general': topicContext = "Informarle que tenemos disponibilidad inmediata para revisión técnica."; break;
    }

    const prompt = `Actúa como 'ServiBot' 🤖. Redacta un mensaje súper corto (máximo 25 palabras) y muy amistoso para "${clientName}".
        Contexto: ${topicContext}
        Equipo: ${appliance || 'equipo'}.
        Tono: Muy amable, fresco y breve. Usa emojis. No pongas "Asunto:". Sé directo.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in Gemini Personalized Message Action:", error);
        return `¡Hola ${clientName}! 😊 Le recordamos que es tiempo del mantenimiento para su ${appliance || 'equipo'}. ¡Escríbanos para agendar! 🛠️✨`;
    }
}
