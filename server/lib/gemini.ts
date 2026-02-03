import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
// Users should get their key from https://aistudio.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

export interface EnhancementRequest {
    originalText: string;
    sectionType: "experience" | "achievements" | "skills" | "summary";
    jobRole: string;
    experienceLevel?: string;
}

export async function enhanceResumeSection({
    originalText,
    sectionType,
    jobRole,
    experienceLevel = "Mid-Level",
}: EnhancementRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "dummy-key") {
        // If no key is present, mock a response to prevent crashing, 
        // but ideally the frontend handles the error if this throws.
        // However, for a user just testing the UI, we might want to throw 
        // to prompt them to add the key.
        console.warn("GEMINI_API_KEY is missing.");
        throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert Resume Writer and ATS (Applicant Tracking System) Specialist.
      
      Your task is to rewrite the following ${sectionType} section for a ${experienceLevel} ${jobRole} position.
      
      Original Text:
      "${originalText}"
      
      Instructions:
      1. Rewrite the text to be professional, concise, and impact-driven.
      2. Use strong action verbs (e.g., spearheaded, engineered, optimized).
      3. Incorporate relevant industry keywords for a ${jobRole} role to improve ATS scoring.
      4. Ensure the tone is confident and suitable for a ${experienceLevel} professional.
      5. Do not invent facts, but elaborate on the provided details to make them sound more professional.
      6. Return ONLY the rewritten text, no conversational filler or markdown formatting (like **).
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        const err = error as any;
        console.error("Gemini Enhancement Error:", err);
        throw new Error(`Gemini Error: ${err.message || err}`);
    }
}
