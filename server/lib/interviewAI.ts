import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

export interface InterviewQuestionConfig {
    jobTitle: string;
    experienceLevel: string;
    jobDescription?: string;
    questionCount?: number;
}

export interface GeneratedQuestion {
    question: string;
    category: "Technical" | "Behavioral" | "Situational" | "System Design" | "Resume-based";
    difficulty: "Easy" | "Medium" | "Hard";
    modelAnswer: string;
}

export async function generateInterviewQuestions({
    jobTitle,
    experienceLevel,
    jobDescription = "",
    questionCount = 5
}: InterviewQuestionConfig): Promise<GeneratedQuestion[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert Technical Interviewer at a top-tier tech company.
    Generate a set of ${questionCount} interview questions for a ${experienceLevel} ${jobTitle} candidate.
    
    ${jobDescription ? `Job Description: ${jobDescription}\n` : ""}
    
    The questions should be a mix of:
    - Technical (Core concepts, specific technologies)
    - Behavioral (STAR method, culture fit)
    - Situational (Scenario-based)
    - System Design (if applicable for the level)
    
    For each question, provide:
    1. The Question itself.
    2. Category (Technical, Behavioral, Situational, System Design, or Resume-based).
    3. Difficulty (Easy, Medium, Hard).
    4. A concise Model Answer summary (what to look for).

    Return the response as a VALID JSON array of objects.
    Format:
    [
      {
        "question": "string",
        "category": "string",
        "difficulty": "string",
        "modelAnswer": "string"
      }
    ]
    Do not include markdown backticks like \`\`\`json. Just the raw JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown if present (sometimes Gemini adds it despite instructions)
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const questions = JSON.parse(cleanedText) as GeneratedQuestion[];
        return questions;
    } catch (error) {
        console.error("Error generating interview questions:", error);
        throw new Error("Failed to generate interview questions");
    }
}

export async function evaluateInterviewAnswer(
    question: string,
    userAnswer: string,
    modelAnswer?: string
): Promise<{ feedback: string; score: number; improvements: string }> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are a Technical Interviewer evaluating a candidate's answer.
    
    Question: "${question}"
    Candidate's Answer: "${userAnswer}"
    ${modelAnswer ? `suggested Model Answer: "${modelAnswer}"` : ""}
    
    Evaluate the answer based on:
    1. Clarity and Communication
    2. Technical Correctness
    3. Completeness
    
    Provide:
    1. A Score between 1 and 10.
    2. Specific Feedback (1-2 sentences).
    3. Suggested Improvements (if any).
    
    Return as VALID JSON:
    {
      "score": number,
      "feedback": "string",
      "improvements": "string"
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error evaluating interview answer:", error);
        return {
            score: 0,
            feedback: "Could not evaluate answer at this time.",
            improvements: "N/A"
        };
    }
}
