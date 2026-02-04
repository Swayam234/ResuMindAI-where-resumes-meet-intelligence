import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enhanceResumeSection } from "./lib/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.post("/api/enhanced-resume", async (req, res) => {
    try {
      const { originalText, sectionType, jobRole, experienceLevel } = req.body;

      if (!originalText || !sectionType || !jobRole) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      console.log(`[API] received request for ${sectionType}. Job: ${jobRole}, Level: ${experienceLevel}`);

      const enhancedText = await enhanceResumeSection({
        originalText,
        sectionType,
        jobRole,
        experienceLevel,
      });

      res.json({ enhancedText });
    } catch (error: any) {
      console.error("Enhancement API Error:", error);
      // Return the specific error message to the client
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  });

  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { jobTitle, name } = req.body;

      if (!jobTitle) {
        return res.status(400).json({ message: "Job title is required" });
      }

      console.log(`[API] Generating summary for ${jobTitle}`);

      const summary = await enhanceResumeSection({
        originalText: `Generate a professional summary for a ${jobTitle}`,
        sectionType: "summary",
        jobRole: jobTitle,
        experienceLevel: "Mid-Level",
      });

      res.json({ summary });
    } catch (error: any) {
      console.error("Summary Generation API Error:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  });

  // Mock Interview Routes

  // Start a new interview session
  app.post("/api/interviews/start", async (req, res) => {
    try {
      const { jobTitle, experienceLevel, jobDescription, userId } = req.body;

      if (!jobTitle || !experienceLevel) {
        return res.status(400).json({ message: "Job title and experience level are required" });
      }

      console.log(`[API] Starting interview for ${jobTitle} (${experienceLevel})`);

      // 1. Create Interview Session in DB
      const interview = await storage.createMockInterview({
        userId: userId || "anonymous", // Fallback for now
        jobTitle,
        experienceLevel,
        jobDescription,
      });

      // 2. Generate Questions
      const { generateInterviewQuestions } = await import("./lib/interviewAI");
      const generatedQuestions = await generateInterviewQuestions({
        jobTitle,
        experienceLevel,
        jobDescription,
        questionCount: 5
      });

      // 3. Save Questions to DB
      const questionsToSave = generatedQuestions.map((q, index) => ({
        interviewId: interview.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        modelAnswer: q.modelAnswer,
        order: (index + 1).toString()
      }));

      await storage.createInterviewQuestions(questionsToSave);

      res.json({ interviewId: interview.id, questions: questionsToSave });
    } catch (error: any) {
      console.error("Start Interview API Error:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  });

  // Get interview details and progress
  app.get("/api/interviews/:id", async (req, res) => {
    try {
      const interview = await storage.getMockInterview(req.params.id);
      if (!interview) return res.status(404).json({ message: "Interview not found" });

      const questions = await storage.getInterviewQuestions(interview.id);
      const answers = await storage.getInterviewAnswers(interview.id);

      res.json({ interview, questions, answers });
    } catch (error: any) {
      console.error("Get Interview API Error:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  });

  // Submit an answer
  app.post("/api/interviews/:id/answer", async (req, res) => {
    try {
      const { questionId, userAnswer, timeTaken } = req.body;
      const interviewId = req.params.id;

      if (!questionId || !userAnswer) return res.status(400).json({ message: "Missing fields" });

      // 1. Get Question Context (for evaluation)
      const questions = await storage.getInterviewQuestions(interviewId);
      const question = questions.find(q => q.id === questionId);

      if (!question) return res.status(404).json({ message: "Question not found" });

      // 2. Evaluate Answer with AI
      const { evaluateInterviewAnswer } = await import("./lib/interviewAI");
      const evaluation = await evaluateInterviewAnswer(
        question.question,
        userAnswer,
        question.modelAnswer || undefined
      );

      // 3. Save Answer
      const savedAnswer = await storage.addInterviewAnswer({
        questionId,
        userAnswer,
        aiFeedback: evaluation.feedback,
        score: evaluation.score.toString(),
        timeTaken: timeTaken?.toString() || "0"
      });

      res.json({ answer: savedAnswer, evaluation });
    } catch (error: any) {
      console.error("Submit Answer API Error:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  });

  // Finish interview
  // Finish interview
  app.post("/api/interviews/:id/finish", async (req, res) => {
    try {
      const interviewId = req.params.id;
      const { violationCount, integrityScore, terminationReason } = req.body;
      const answers = await storage.getInterviewAnswers(interviewId);

      // Calculate average score
      const totalScore = answers.reduce((sum, a) => sum + (parseInt(a.score || "0") || 0), 0);
      const avgScore = answers.length > 0 ? (totalScore / answers.length).toFixed(1) : "0";

      // Update interview status
      const updatedInterview = await storage.updateMockInterview(interviewId, {
        status: terminationReason ? "terminated" : "completed",
        score: avgScore,
        feedback: terminationReason ? "Interview Terminated" : "Interview Completed",
        violationCount: violationCount?.toString() || "0",
        integrityScore: integrityScore?.toString() || "100",
        terminationReason: terminationReason || null
      });

      res.json({ interview: updatedInterview });
    } catch (error: any) {
      console.error("Finish Interview API Error:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  });

  // ATS Analysis endpoint - Advanced AI-powered resume screening
  app.post("/api/ats-analysis", async (req, res) => {
    try {
      const { resumeText, jobDescription, jobRole } = req.body;

      if (!resumeText || !jobDescription) {
        return res.status(400).json({ message: "Resume text and job description are required" });
      }

      console.log(`[API] Starting ATS analysis. JD length: ${jobDescription.length}, Resume length: ${resumeText.length}`);

      // Dynamic import to avoid circular dependencies
      const { performATSAnalysis } = await import("./lib/atsAnalysis");

      const analysis = await performATSAnalysis({
        resumeText,
        jobDescription,
        jobRole,
      });

      console.log(`[API] ATS analysis complete. Final score: ${analysis.finalScore}, Processing time: ${analysis.processingTime}ms`);

      res.json(analysis);
    } catch (error: any) {
      console.error("ATS Analysis API Error:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        details: "Failed to perform ATS analysis"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
