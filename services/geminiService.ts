import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Mock Data Context to feed the AI so it knows about the business
const BUSINESS_CONTEXT = {
  companyName: "ServiTech Pro",
  inventory: [
    { name: 'Motor Drenaje LG', sku: '12903', quantity: 15, location: 'Estante A' },
    { name: 'Termostato Universal', sku: '88210', quantity: 3, location: 'Estante B' },
    { name: 'Capacitor 45uF', sku: 'CAP-45', quantity: 2, location: 'Cajón 1' },
    { name: 'Gas Refrigerante R134a', sku: 'GAS-134', quantity: 8, location: 'Bodega' },
    { name: 'Bomba Desagüe Samsung', sku: 'PUMP-S01', quantity: 0, location: 'Agotado' },
  ],
  activeServices: [
    { client: 'Juan Pérez', appliance: 'Samsung EcoBubble', issue: 'No centrifuga', status: 'En camino', tech: 'Carlos Ruiz', time: '09:00 AM' },
    { client: 'Maria López', appliance: 'LG Smart Inverter', issue: 'No enfría', status: 'Pendiente', tech: 'Ana García', time: '11:30 AM' },
    { client: 'Pedro Sanchez', appliance: 'Whirlpool Dryer', issue: 'Ruido fuerte', status: 'Nuevo', tech: 'Pedro Martinez', time: '02:00 PM' },
    { client: 'Fernando Torres', appliance: 'Lavadora Whirlpool', issue: 'Garantía', status: 'Revisión', tech: 'Carlos Ruiz', time: '01:00 PM' }
  ],
  technicians: [
    { name: 'Carlos Ruiz', role: 'Senior', status: 'Ocupado' },
    { name: 'Ana García', role: 'Admin/Tech', status: 'Disponible' },
    { name: 'Pedro Martinez', role: 'Junior', status: 'En camino' }
  ],
  financialSummary: {
    dailyIncome: '$350.00',
    monthlyIncome: '$4,250.00',
    pendingInvoices: 3
  }
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const model = 'gemini-3-pro-preview';
    
    // Construct a rich system instruction with the business data
    const systemInstruction = `
      You are 'ServiBot', the advanced AI Operations Manager for ${BUSINESS_CONTEXT.companyName}.
      
      You have direct access to the following real-time business database:
      ${JSON.stringify(BUSINESS_CONTEXT, null, 2)}

      YOUR RESPONSIBILITIES:
      1. Answer questions about **Inventory**: Check stock levels, SKUs, and locations. Warn if items are low stock (quantity < 5).
      2. Answer questions about **Agenda/Services**: Tell the user where technicians are, what the next appointments are, and details about specific clients.
      3. Answer questions about **Technicians**: Who is available, their roles, and current status.
      4. Provide **Technical Support**: If asked about repair procedures (e.g., "How to test a capacitor"), use your general knowledge to provide steps, but link it back to inventory if we have the part.
      5. **Business Intelligence**: Summarize financials if asked.

      TONE:
      Professional, efficient, and helpful. Use emojis occasionally to structure data (e.g., 📦 for stock, 📅 for dates).
      
      CRITICAL:
      - If a user asks about a specific client (e.g., "Juan"), look up the 'activeServices' list.
      - If a user asks for parts, check 'inventory'.
      - Keep responses concise.
    `;

    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "No pude procesar la respuesta.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Lo siento, tuve problemas para conectar con el servidor de IA. Por favor verifica tu conexión o API Key.";
  }
};