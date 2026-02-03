import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import ATSDashboard from "@/components/ats/ATSDashboard";
import AnalysisProgressIndicator from "@/components/ats/AnalysisProgressIndicator";
import { AlertCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import type { ATSAnalysisResult } from "../../../shared/atsTypes";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type AnalysisPhaseType = 'idle' | 'extracting' | 'keyword-analysis' | 'semantic-analysis' | 'generating-report' | 'complete' | 'error';

const getAnalysisPhases = (currentPhase: AnalysisPhaseType) => {
  const phases = [
    { id: 'extract', name: 'Text Extraction', status: 'pending' as const },
    { id: 'keyword', name: 'Keyword Analysis', status: 'pending' as const },
    { id: 'semantic', name: 'Semantic Analysis (SBERT)', status: 'pending' as const },
    { id: 'report', name: 'Generating Report', status: 'pending' as const },
  ];

  if (currentPhase === 'idle' || currentPhase === 'error') {
    return phases;
  }

  // Update statuses based on current phase
  const phaseOrder = ['extracting', 'keyword-analysis', 'semantic-analysis', 'generating-report'];
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return phases.map((phase, index) => {
    if (index < currentIndex) {
      return { ...phase, status: 'complete' as const };
    } else if (index === currentIndex) {
      return { ...phase, status: 'processing' as const };
    }
    return phase;
  });
};

export default function ResumeScreening() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhaseType>('idle');
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError("Please upload a resume and provide a Job Description.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setAnalysisPhase('extracting');

    try {
      // Phase 1: Extract text from resume
      let resumeText = "";
      if (file.type === "application/pdf") {
        resumeText = await extractTextFromPdf(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        resumeText = await extractTextFromDocx(file);
      } else {
        throw new Error("Unsupported file type. Please upload PDF or DOCX.");
      }

      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error("Could not extract text from the resume. The file may be empty or corrupted.");
      }

      console.log("Extracted Resume Text Length:", resumeText.length);

      // Phase 2: Keyword Analysis
      setAnalysisPhase('keyword-analysis');
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief delay for UI feedback

      // Phase 3: Semantic Analysis & Report Generation
      setAnalysisPhase('semantic-analysis');

      // Call the ATS analysis API
      const response = await fetch('/api/ats-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          jobRole: jobRole || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      setAnalysisPhase('generating-report');
      const analysisResult: ATSAnalysisResult = await response.json();

      // Phase 4: Complete
      setAnalysisPhase('complete');
      setResult(analysisResult);

      console.log("ATS Analysis Complete:", {
        finalScore: analysisResult.finalScore,
        keywordScore: analysisResult.keywordScore.score,
        semanticScore: analysisResult.semanticScore.score,
        processingTime: analysisResult.processingTime,
      });

    } catch (error: any) {
      console.error("Analysis failed:", error);
      setError(error.message || "An unexpected error occurred during analysis.");
      setAnalysisPhase('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (!result) return;

    // Create JSON export
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ats-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setJobRole("");
    setResult(null);
    setError(null);
    setAnalysisPhase('idle');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered ATS Resume Screening
            </h1>
            <p className="text-muted-foreground">
              Analyze your resume against job descriptions with dual AI scoring: keyword matching + semantic similarity
            </p>
          </div>

          {!result ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Upload Your Resume
                  </h2>
                  <FileUpload onFileSelect={setFile} accept=".pdf,.docx" maxSize={10} />
                  {file && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      ✓ {file.name}
                    </p>
                  )}
                </Card>

                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Job Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="jobRole">Job Role (Optional)</Label>
                      <Textarea
                        id="jobRole"
                        placeholder="e.g., Full Stack Developer"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        className="mt-1 resize-none"
                        rows={1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobDescription">Job Description *</Label>
                      <Textarea
                        id="jobDescription"
                        placeholder="Paste the full job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="mt-1 min-h-[200px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {jobDescription.length} characters
                      </p>
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      className="w-full h-12 text-lg font-semibold"
                      disabled={isAnalyzing || !file || !jobDescription}
                      data-testid="button-analyze"
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Preview/Status Section */}
              <div>
                {isAnalyzing ? (
                  <Card className="p-8">
                    <AnalysisProgressIndicator phases={getAnalysisPhases(analysisPhase)} />
                  </Card>
                ) : error ? (
                  <Card className="p-8 border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Analysis Failed</h3>
                        <p className="text-sm text-red-700 mb-4">{error}</p>
                        <Button onClick={handleReset} variant="outline" size="sm">
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12 h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-dashed border-2">
                    <div className="text-center text-muted-foreground">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-4xl">🎯</span>
                      </div>
                      <p className="text-lg font-medium mb-2">Ready to Optimize Your Resume?</p>
                      <p className="text-sm max-w-md">
                        Upload your resume and paste a job description to get comprehensive ATS analysis with dual AI scoring.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleReset} variant="outline">
                  ← Analyze Another Resume
                </Button>
              </div>

              {/* ATS Dashboard */}
              <ATSDashboard result={result} onExport={handleExport} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
