/// <reference types="node" />
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key setup...");

    if (!apiKey) {
        console.error(" ERROR: GEMINI_API_KEY is missing from environment/process.");
        return;
    }

    console.log(`API Key found: ${apiKey.substring(0, 5)}...${apiKey.slice(-4)}`);

    try {
        console.log("Initializing Gemini Client...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Sending test request to Gemini...");
        const prompt = "Hello, assume you are a resume writer. Just say 'Connection Successful'.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("SUCCESS! Response from Gemini:");
        console.log(text);
    } catch (error: any) {
        console.error("API CALL FAILED");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Error Response:", JSON.stringify(error.response, null, 2));
        }
        // Attempt to print detailed error body if available
        if (error.statusText) console.error("Status Text:", error.statusText);
    }
}

testGemini();
