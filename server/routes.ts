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

  const httpServer = createServer(app);

  return httpServer;
}
