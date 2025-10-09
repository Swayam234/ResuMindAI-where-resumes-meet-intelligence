import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Upload } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import FileUpload from "@/components/FileUpload";
import ATSScoreCircle from "@/components/ATSScoreCircle";
import RecommendationChip from "@/components/RecommendationChip";
import { Lightbulb, BookOpen } from "lucide-react";

const cvTemplates = [
  { id: "academic-modern", name: "Academic Modern", category: "Research & Academia", isPremium: false, preview: "Contemporary research CV" },
  { id: "scientific-publications", name: "Scientific Publications", category: "Science & Research", isPremium: true, preview: "Publication-focused design" },
  { id: "medical-professional", name: "Medical Professional", category: "Healthcare", isPremium: false, preview: "Clinical experience layout" },
  { id: "phd-candidate", name: "PhD Candidate", category: "Academia", isPremium: false, preview: "Graduate research focus" },
  { id: "professor-track", name: "Professor Track", category: "Higher Education", isPremium: true, preview: "Teaching & research balance" },
  { id: "industry-research", name: "Industry Research", category: "R&D", isPremium: false, preview: "Applied research emphasis" },
  { id: "grant-focused", name: "Grant Writer", category: "Research Funding", isPremium: true, preview: "Funding & grants highlight" },
  { id: "international-cv", name: "International CV", category: "Global Academia", isPremium: true, preview: "Multi-region format" },
];

export default function CVGenerator() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleTemplateSelect = (id: string) => {
    console.log("CV Template selected:", id);
    setSelectedTemplate(id);
  };

  const handleImproveCV = () => {
    if (!uploadedCV) {
      alert("Please upload a CV first");
      return;
    }
    console.log("Analyzing CV:", uploadedCV.name);
    setShowAnalysis(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">CV Generator</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="create" data-testid="tab-create-cv">
                <FilePlus className="w-4 h-4 mr-2" />
                Create New CV
              </TabsTrigger>
              <TabsTrigger value="improve" data-testid="tab-improve-cv">
                <Upload className="w-4 h-4 mr-2" />
                Improve My CV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Choose a CV Template</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {cvTemplates.map(template => (
                    <TemplateCard key={template.id} {...template} onSelect={handleTemplateSelect} />
                  ))}
                </div>

                {selectedTemplate && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Build Your CV</h3>
                    <p className="text-muted-foreground mb-4">
                      Template selected: {cvTemplates.find(t => t.id === selectedTemplate)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start customizing your CV with job-specific questions and content...
                    </p>
                    <Button className="mt-4" data-testid="button-start-cv">
                      Start Building CV
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="improve">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Upload Your CV</h2>
                    <FileUpload onFileSelect={setUploadedCV} accept=".pdf,.docx" maxSize={10} />
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Analysis Settings</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      We'll analyze your CV for academic and research positions
                    </p>
                    <Button onClick={handleImproveCV} className="w-full" data-testid="button-analyze-cv">
                      Analyze CV
                    </Button>
                  </Card>
                </div>

                <div>
                  {showAnalysis ? (
                    <div className="space-y-6">
                      <Card className="p-8">
                        <h2 className="text-xl font-semibold mb-6 text-center">CV Analysis</h2>
                        <div className="flex justify-center mb-6">
                          <ATSScoreCircle score={82} />
                        </div>
                        <p className="text-center text-muted-foreground">
                          Your CV is well-structured for academic positions
                        </p>
                      </Card>

                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Improvement Suggestions</h3>
                        <div className="flex flex-wrap gap-3">
                          <RecommendationChip text="Add more publications" icon={BookOpen} variant="warning" />
                          <RecommendationChip text="Strong research focus" icon={Lightbulb} variant="success" />
                          <RecommendationChip text="Include teaching experience" icon={Lightbulb} variant="default" />
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <Card className="p-12 h-full flex items-center justify-center">
                      <p className="text-muted-foreground text-center">
                        Upload your CV to get improvement recommendations
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
