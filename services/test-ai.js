
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
    console.log("Testing Gemini API...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
