import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";
import ATSScoreCircle from "@/components/ATSScoreCircle";
import RecommendationChip from "@/components/RecommendationChip";
import { Lightbulb, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

// Mock analysis result
const mockAnalysis = {
  score: 78,
  recommendations: [
    { text: "Add more technical skills", icon: Lightbulb, variant: "warning" as const },
    { text: "Include quantifiable achievements", icon: TrendingUp, variant: "warning" as const },
    { text: "Good use of action verbs", icon: CheckCircle2, variant: "success" as const },
    { text: "Add industry keywords", icon: AlertCircle, variant: "destructive" as const },
  ],
};

export default function ResumeScreening() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [ctc, setCtc] = useState("");
  const [experience, setExperience] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    if (!file || !jobRole) {
      alert("Please upload a resume and enter job role");
      return;
    }
    console.log("Analyzing resume:", { file: file.name, jobRole, ctc, experience });
    setShowResults(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Resume Screening</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
                <FileUpload onFileSelect={setFile} accept=".pdf,.docx" maxSize={10} />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobRole">Job Role</Label>
                    <Input
                      id="jobRole"
                      placeholder="e.g., Software Engineer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      data-testid="input-job-role-screening"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctc">Expected CTC (Annual)</Label>
                    <Input
                      id="ctc"
                      placeholder="e.g., $80,000"
                      value={ctc}
                      onChange={(e) => setCtc(e.target.value)}
                      data-testid="input-ctc"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="e.g., 3"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      data-testid="input-experience"
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleAnalyze} className="w-full" data-testid="button-analyze">
                    Analyze Resume
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              {showResults ? (
                <div className="space-y-6">
                  <Card className="p-8">
                    <h2 className="text-xl font-semibold mb-6 text-center">ATS Analysis Results</h2>
                    <div className="flex justify-center mb-6">
                      <ATSScoreCircle score={mockAnalysis.score} />
                    </div>
                    <p className="text-center text-muted-foreground">
                      Your resume has a {mockAnalysis.score >= 80 ? "great" : mockAnalysis.score >= 60 ? "good" : "fair"} ATS score
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                    <div className="flex flex-wrap gap-3">
                      {mockAnalysis.recommendations.map((rec, idx) => (
                        <RecommendationChip key={idx} {...rec} />
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Keywords Match</span>
                        <span className="font-semibold">75%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Format Quality</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Content Depth</span>
                        <span className="font-semibold">70%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Experience Relevance</span>
                        <span className="font-semibold">82%</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-12 h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Upload your resume and fill in the job details to get ATS analysis
                  </p>
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
