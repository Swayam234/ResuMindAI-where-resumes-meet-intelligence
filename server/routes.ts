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

  const httpServer = createServer(app);

  return httpServer;
}
