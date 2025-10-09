import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Wand2 } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Latest templates inspired by LinkedIn and job platforms
const templates = [
  { id: "linkedin-modern", name: "LinkedIn Modern", category: "All Industries", isPremium: false, preview: "LinkedIn-style layout with photo section" },
  { id: "tech-startup", name: "Tech Startup", category: "Tech & Engineering", isPremium: false, preview: "Clean tech-focused design" },
  { id: "creative-bold", name: "Creative Bold", category: "Design & Marketing", isPremium: true, preview: "Eye-catching creative layout" },
  { id: "executive-premium", name: "Executive Premium", category: "Management & Leadership", isPremium: true, preview: "Sophisticated C-level design" },
  { id: "minimal-clean", name: "Minimal Clean", category: "All Industries", isPremium: false, preview: "Simple ATS-friendly format" },
  { id: "indeed-classic", name: "Indeed Classic", category: "All Industries", isPremium: false, preview: "Traditional professional style" },
  { id: "glassdoor-pro", name: "Glassdoor Pro", category: "Business & Finance", isPremium: true, preview: "Professional business format" },
  { id: "startup-ninja", name: "Startup Ninja", category: "Tech & Startups", isPremium: false, preview: "Dynamic startup-focused design" },
  { id: "marketing-guru", name: "Marketing Guru", category: "Marketing & Sales", isPremium: true, preview: "Results-driven marketing layout" },
  { id: "data-scientist", name: "Data Scientist", category: "Data & Analytics", isPremium: false, preview: "Technical skills showcase" },
  { id: "remote-worker", name: "Remote First", category: "Remote Work", isPremium: false, preview: "Optimized for remote positions" },
  { id: "career-changer", name: "Career Changer", category: "All Industries", isPremium: true, preview: "Highlights transferable skills" },
];

export default function ResumeGenerator() {
  const [activeTab, setActiveTab] = useState("automatic");
  const [formData, setFormData] = useState({
    name: "",
    jobRole: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
    education: "",
    achievements: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    console.log("Generating resume with:", formData);
    setShowPreview(true);
  };

  const handleTemplateSelect = (id: string) => {
    console.log("Template selected:", id);
    setSelectedTemplate(id);
    setShowPreview(true);
  };

  const handleDownload = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("resume.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Resume Generator</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="automatic" data-testid="tab-automatic">
                <Wand2 className="w-4 h-4 mr-2" />
                Automatic Generator
              </TabsTrigger>
              <TabsTrigger value="template" data-testid="tab-template">
                Template-Based
              </TabsTrigger>
            </TabsList>

            <TabsContent value="automatic">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Tell us about yourself</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} data-testid="input-name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="jobRole">Target Job Role</Label>
                      <Input id="jobRole" value={formData.jobRole} onChange={(e) => handleInputChange("jobRole", e.target.value)} data-testid="input-job-role" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} data-testid="input-email-resume" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} data-testid="input-phone" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="experience">Work Experience</Label>
                      <Textarea id="experience" value={formData.experience} onChange={(e) => handleInputChange("experience", e.target.value)} data-testid="textarea-experience" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input id="skills" value={formData.skills} onChange={(e) => handleInputChange("skills", e.target.value)} data-testid="input-skills" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="education">Education</Label>
                      <Textarea id="education" value={formData.education} onChange={(e) => handleInputChange("education", e.target.value)} data-testid="textarea-education" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="achievements">Key Achievements</Label>
                      <Textarea id="achievements" value={formData.achievements} onChange={(e) => handleInputChange("achievements", e.target.value)} data-testid="textarea-achievements" className="mt-1" />
                    </div>
                    <Button onClick={handleGenerate} className="w-full" data-testid="button-generate">
                      Generate Resume
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Preview</h2>
                    {showPreview && (
                      <Button onClick={handleDownload} data-testid="button-download">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                  <div id="resume-preview" className="bg-white text-black p-8 rounded-lg min-h-[600px]" data-testid="preview-resume">
                    {showPreview ? (
                      <div className="space-y-4" contentEditable suppressContentEditableWarning>
                        <h1 className="text-3xl font-bold">{formData.name || "Your Name"}</h1>
                        <p className="text-lg text-gray-600">{formData.jobRole || "Job Title"}</p>
                        <div className="text-sm text-gray-600">
                          <p>{formData.email || "email@example.com"} | {formData.phone || "+1 234 567 8900"}</p>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Experience</h2>
                          <p className="whitespace-pre-wrap">{formData.experience || "Your experience here..."}</p>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Skills</h2>
                          <p>{formData.skills || "Your skills..."}</p>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Education</h2>
                          <p className="whitespace-pre-wrap">{formData.education || "Your education..."}</p>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Achievements</h2>
                          <p className="whitespace-pre-wrap">{formData.achievements || "Your achievements..."}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Fill the form and click Generate to see preview
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="template">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Choose a Template</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {templates.map(template => (
                    <TemplateCard key={template.id} {...template} onSelect={handleTemplateSelect} />
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <Card className="p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-4">Customize Your Resume</h3>
                  <p className="text-muted-foreground">
                    Template selected: {templates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                  <Button className="mt-4" onClick={handleDownload} data-testid="button-download-template">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
