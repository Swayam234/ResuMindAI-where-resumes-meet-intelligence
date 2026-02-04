import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const mockInterviews = pgTable("mock_interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Assuming we might want to link to users later, or just track sessions
  jobTitle: text("job_title").notNull(),
  experienceLevel: text("experience_level").notNull(),
  jobDescription: text("job_description"),
  score: text("score"), // Overall score
  feedback: text("feedback"), // Overall feedback
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  status: text("status").default("in_progress"), // in_progress, completed, terminated
  violationCount: text("violation_count").default("0"),
  integrityScore: text("integrity_score").default("100"),
  terminationReason: text("termination_reason"), // e.g., "cheating", "violations_limit"
});

export const interviewQuestions = pgTable("interview_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").notNull(), //.references(() => mockInterviews.id),
  question: text("question").notNull(),
  category: text("category").notNull(), // technical, behavioral, etc.
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  modelAnswer: text("model_answer"),
  order: text("order").notNull(), // To keep sequence
});

export const interviewAnswers = pgTable("interview_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull(), //.references(() => interviewQuestions.id),
  userAnswer: text("user_answer").notNull(),
  aiFeedback: text("ai_feedback"),
  score: text("score"), // 1-10
  timeTaken: text("time_taken"), // Seconds
});

export const insertMockInterviewSchema = createInsertSchema(mockInterviews);
export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions);
export const insertInterviewAnswerSchema = createInsertSchema(interviewAnswers);

export type MockInterview = typeof mockInterviews.$inferSelect;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InterviewAnswer = typeof interviewAnswers.$inferSelect;
