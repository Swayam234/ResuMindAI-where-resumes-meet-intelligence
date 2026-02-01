import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Upload } from "lucide-react";
import VisualTemplatePreview from "@/components/VisualTemplatePreview";
import FileUpload from "@/components/FileUpload";
import ATSScoreCircle from "@/components/ATSScoreCircle";
import RecommendationChip from "@/components/RecommendationChip";
import { Lightbulb, BookOpen } from "lucide-react";
import EditableTemplateEditor from "@/components/EditableTemplateEditor";

const cvTemplates = [
  { id: "academic-professional", name: "Academic Professional", category: "Research & Academia", isPremium: false, variant: "professional" as const, hasPhoto: false },
  { id: "academic-photo", name: "Academic with Photo", category: "Research & Academia", isPremium: true, variant: "executive" as const, hasPhoto: true },
  { id: "research-minimal", name: "Research Minimal", category: "Science & Research", isPremium: false, variant: "minimal" as const, hasPhoto: false },
  { id: "medical-cv", name: "Medical Professional CV", category: "Healthcare", isPremium: false, variant: "professional" as const, hasPhoto: false },
  { id: "phd-modern", name: "PhD Modern", category: "Academia", isPremium: true, variant: "two-column" as const, hasPhoto: true },
  { id: "professor-elegant", name: "Professor Elegant", category: "Higher Education", isPremium: true, variant: "elegant" as const, hasPhoto: false },
  { id: "research-sidebar", name: "Research Sidebar", category: "R&D", isPremium: true, variant: "sidebar-photo" as const, hasPhoto: true },
  { id: "international-academic", name: "International Academic", category: "Global Academia", isPremium: false, variant: "minimal" as const, hasPhoto: false },
];

export default function CVGenerator() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const handleTemplateSelect = (id: string) => {
    console.log("CV Template selected:", id);
    setSelectedTemplate(id);
    setIsEditing(false);
  };

  const handleStartBuilding = () => {
    if (selectedTemplate) {
      setIsEditing(true);
    }
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
              {!isEditing ? (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Choose a CV Template</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {cvTemplates.map(template => (
                      <VisualTemplatePreview
                        key={template.id}
                        id={template.id}
                        name={template.name}
                        isPremium={template.isPremium}
                        variant={template.variant}
                        onSelect={handleTemplateSelect}
                      />
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
                      <Button className="mt-4" onClick={handleStartBuilding} data-testid="button-start-cv">
                        Start Building CV
                      </Button>
                    </Card>
                  )}
                </div>
              ) : (
                <div>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="mb-4">
                    ← Back to Templates
                  </Button>
                  <EditableTemplateEditor
                    variant={cvTemplates.find(t => t.id === selectedTemplate)?.variant as any || "minimal"}
                    templateName={cvTemplates.find(t => t.id === selectedTemplate)?.name || "CV"}
                  />
                </div>
              )}
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
