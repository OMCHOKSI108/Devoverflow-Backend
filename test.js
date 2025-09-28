import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function main() {
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-1.0',
        contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
}

main();