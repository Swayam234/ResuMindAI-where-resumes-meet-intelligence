import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import ATSScoreCircle from "@/components/ATSScoreCircle";
import RecommendationChip from "@/components/RecommendationChip";
import { Lightbulb, CheckCircle2, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface AnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: Array<{
    text: string;
    icon: any;
    variant: "default" | "destructive" | "success" | "warning";
  }>;
}

export default function ResumeScreening() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [ctc, setCtc] = useState("");
  const [experience, setExperience] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + " ";
    }
    return fullText;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const calculateScore = (resumeText: string, jdText: string) => {
    // 1. Extract Keywords from JD (Simple frequency analysis + stop words removal)
    const stopWords = new Set(["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "image", "button", "click", "page"]);
    const cleanText = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    const jdKeywords = new Set(cleanText(jdText));
    const resumeWords = new Set(cleanText(resumeText));

    // 2. Calculate matches
    const matches = Array.from(jdKeywords).filter(k => resumeWords.has(k));
    const missing = Array.from(jdKeywords).filter(k => !resumeWords.has(k));

    const matchCount = matches.length;
    const totalKeywords = jdKeywords.size;

    // 3. Score Calculation (Weighted)
    // Base score 40 + (match ratio * 60)
    const matchRatio = totalKeywords > 0 ? matchCount / totalKeywords : 0;
    let score = Math.round(40 + (matchRatio * 60));

    // Cap score at 95 unless perfect match
    if (score > 95 && missing.length > 0) score = 95;

    return { score, matches, missing };
  };

  const generateRecommendations = (score: number, missing: string[]) => {
    const recs: AnalysisResult['recommendations'] = [];

    if (score < 60) {
      recs.push({ text: "Low keyword match. Tailor your resume to the JD.", icon: AlertCircle, variant: "destructive" });
    } else if (score < 80) {
      recs.push({ text: "Good start, but missing some key skills.", icon: TrendingUp, variant: "warning" });
    } else {
      recs.push({ text: "Excellent match! Your profile is strong.", icon: CheckCircle2, variant: "success" });
    }

    if (missing.length > 0) {
      const topMissing = missing.slice(0, 5).join(", ");
      recs.push({ text: `Consider adding: ${topMissing}`, icon: Lightbulb, variant: "warning" });
    }

    return recs;
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      alert("Please upload a resume and provide a Job Description.");
      return;
    }

    setIsAnalyzing(true);
    try {
      let text = "";
      if (file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        text = await extractTextFromDocx(file);
      } else {
        alert("Unsupported file type");
        setIsAnalyzing(false);
        return;
      }

      console.log("Extracted Text Length:", text.length);

      const { score, matches, missing } = calculateScore(text, jobDescription);
      const recommendations = generateRecommendations(score, missing);

      setResult({
        score,
        matchedKeywords: matches,
        missingKeywords: missing,
        recommendations
      });

    } catch (error: any) {
      console.error("Analysis failed:", error);
      setResult(null);
      alert(`Failed to analyze resume: ${error.message || "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Resume Screening (AI-Powered)</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">1. Upload Your Resume</h2>
                <FileUpload onFileSelect={setFile} accept=".pdf,.docx" maxSize={10} />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">2. Job Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobRole">Job Role</Label>
                    <Input
                      id="jobRole"
                      placeholder="e.g., Software Engineer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobDescription">Job Description (Required)</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the full job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  <Button onClick={handleAnalyze} className="w-full" disabled={isAnalyzing} data-testid="button-analyze">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Resume"
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              {result ? (
                <div className="space-y-6">
                  <Card className="p-8">
                    <h2 className="text-xl font-semibold mb-6 text-center">ATS Analysis Results</h2>
                    <div className="flex justify-center mb-6">
                      <ATSScoreCircle score={result.score} />
                    </div>
                    <p className="text-center text-muted-foreground">
                      {result.score >= 80 ? "Great job! Your resume matches the job description well." : result.score >= 60 ? "Good match, but room for improvement." : "Low match. Consider tailoring your resume."}
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                    <div className="flex flex-col gap-3">
                      {result.recommendations.map((rec, idx) => (
                        <RecommendationChip key={idx} {...rec} />
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Matched Keywords</span>
                        <span className="font-semibold text-green-600">{result.matchedKeywords.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Missing Keywords</span>
                        <span className="font-semibold text-red-500">{result.missingKeywords.length}</span>
                      </div>
                    </div>
                    {result.missingKeywords.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Missing Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.slice(0, 10).map(k => (
                            <span key={k} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{k}</span>
                          ))}
                          {result.missingKeywords.length > 10 && <span className="text-xs text-muted-foreground">+{result.missingKeywords.length - 10} more</span>}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <Card className="p-12 h-full flex items-center justify-center bg-slate-50 border-dashed">
                  <div className="text-center text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                    <p className="text-lg font-medium">Ready to Optimize?</p>
                    <p className="text-sm mt-2">Upload a resume and paste a job description to see your real-time ATS score.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
