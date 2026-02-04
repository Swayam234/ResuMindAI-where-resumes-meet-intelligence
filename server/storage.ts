import {
  type User, type InsertUser,
  type MockInterview, type InsertMockInterview,
  type InterviewQuestion, type InsertInterviewQuestion,
  type InterviewAnswer, type InsertInterviewAnswer
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Mock Interview Methods
  createMockInterview(interview: InsertMockInterview): Promise<MockInterview>;
  getMockInterview(id: string): Promise<MockInterview | undefined>;
  updateMockInterview(id: string, updates: Partial<MockInterview>): Promise<MockInterview>;

  createInterviewQuestions(questions: InsertInterviewQuestion[]): Promise<InterviewQuestion[]>;
  getInterviewQuestions(interviewId: string): Promise<InterviewQuestion[]>;

  addInterviewAnswer(answer: InsertInterviewAnswer): Promise<InterviewAnswer>;
  getInterviewAnswers(interviewId: string): Promise<InterviewAnswer[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private interviews: Map<string, MockInterview>;
  private questions: Map<string, InterviewQuestion>;
  private answers: Map<string, InterviewAnswer>;

  constructor() {
    this.users = new Map();
    this.interviews = new Map();
    this.questions = new Map();
    this.answers = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMockInterview(insertInterview: InsertMockInterview): Promise<MockInterview> {
    const id = randomUUID();
    const interview: MockInterview = {
      ...insertInterview,
      id,
      createdAt: new Date().toISOString(),
      score: null,
      feedback: null,
      status: "in_progress",
      jobDescription: insertInterview.jobDescription || null
    };
    this.interviews.set(id, interview);
    return interview;
  }

  async getMockInterview(id: string): Promise<MockInterview | undefined> {
    return this.interviews.get(id);
  }

  async updateMockInterview(id: string, updates: Partial<MockInterview>): Promise<MockInterview> {
    const interview = this.interviews.get(id);
    if (!interview) throw new Error("Interview not found");
    const updated = { ...interview, ...updates };
    this.interviews.set(id, updated);
    return updated;
  }

  async createInterviewQuestions(questions: InsertInterviewQuestion[]): Promise<InterviewQuestion[]> {
    const createdQuestions: InterviewQuestion[] = [];
    for (const q of questions) {
      const id = randomUUID();
      const newQ: InterviewQuestion = {
        ...q,
        id,
        modelAnswer: q.modelAnswer || null
      };
      this.questions.set(id, newQ);
      createdQuestions.push(newQ);
    }
    return createdQuestions;
  }

  async getInterviewQuestions(interviewId: string): Promise<InterviewQuestion[]> {
    return Array.from(this.questions.values())
      .filter(q => q.interviewId === interviewId)
      .sort((a, b) => parseInt(a.order) - parseInt(b.order));
  }

  async addInterviewAnswer(answer: InsertInterviewAnswer): Promise<InterviewAnswer> {
    const id = randomUUID();
    const newAnswer: InterviewAnswer = {
      ...answer,
      id,
      aiFeedback: answer.aiFeedback || null,
      score: answer.score || null
    };
    this.answers.set(id, newAnswer);
    return newAnswer;
  }

  async getInterviewAnswers(interviewId: string): Promise<InterviewAnswer[]> {
    // Get all questions for this interview
    const questions = await this.getInterviewQuestions(interviewId);
    const questionIds = new Set(questions.map(q => q.id));

    // valid answers are those where questionId is in the set
    return Array.from(this.answers.values())
      .filter(a => questionIds.has(a.questionId));
  }
}

export const storage = new MemStorage();
