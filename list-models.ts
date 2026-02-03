import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listAndTestModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in environment");
        return;
    }

    console.log(`✅ API Key loaded: ${apiKey.substring(0, 10)}...`);
    console.log("\n🔍 Listing all available models...\n");

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // List all available models
        const models = await genAI.listModels();

        console.log(`Found ${models.length} models:\n`);

        const textModels: any[] = [];

        for (const model of models) {
            console.log(`📦 ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(", ") || "N/A"}`);

            // Check if it supports generateContent
            if (model.supportedGenerationMethods?.includes("generateContent")) {
                textModels.push(model);
            }
            console.log("");
        }

        console.log(`\n✅ Found ${textModels.length} models that support generateContent:\n`);

        for (const model of textModels) {
            console.log(`   - ${model.name}`);
        }

        // Test the first available model
        if (textModels.length > 0) {
            const testModelName = textModels[0].name.replace("models/", "");
            console.log(`\n🧪 Testing model: ${testModelName}\n`);

            const testModel = genAI.getGenerativeModel({ model: testModelName });
            const result = await testModel.generateContent("Say 'Hello, I am working!' in one sentence.");
            const response = await result.response;
            const text = response.text();

            console.log(`✅ SUCCESS! Response from ${testModelName}:`);
            console.log(`   "${text}"\n`);
            console.log(`\n💡 USE THIS MODEL IN YOUR CODE: "${testModelName}"\n`);
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
        if (error.status) console.error("Status:", error.status);
    }
}

listAndTestModels();
