
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
    console.log("Testing Gemini API with gemini-2.0-flash-exp...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = "Hola, di esto es una prueba de ServiBot.";

    try {
        const result = await model.generateContent(prompt);
        console.log("Response:", result.response.text());
        console.log("SUCCESS: Connection to Gemini is working.");
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

test();
