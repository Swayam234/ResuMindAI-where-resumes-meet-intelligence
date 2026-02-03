import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Wand2 } from "lucide-react";
import VisualTemplatePreview from "@/components/VisualTemplatePreview";
import EditableTemplateEditor from "@/components/EditableTemplateEditor";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Diverse templates inspired by LinkedIn, Canva, and professional resume designs
const templates = [
  { id: "professional-clean", name: "Professional Clean", category: "All Industries", isPremium: false, variant: "professional" as const, hasPhoto: false },
  { id: "modern-photo", name: "Modern with Photo", category: "All Industries", isPremium: false, variant: "modern-photo" as const, hasPhoto: true },
  { id: "executive-photo", name: "Executive Profile", category: "Management", isPremium: true, variant: "executive" as const, hasPhoto: true },
  { id: "creative-designer", name: "Creative Designer", category: "Design & Creative", isPremium: true, variant: "creative-photo" as const, hasPhoto: true },
  { id: "minimal-ats", name: "Minimal ATS-Friendly", category: "All Industries", isPremium: false, variant: "minimal" as const, hasPhoto: false },
  { id: "two-column-photo", name: "Two Column with Photo", category: "Tech & Business", isPremium: false, variant: "two-column" as const, hasPhoto: true },
  { id: "sidebar-professional", name: "Sidebar Professional", category: "Data & Analytics", isPremium: true, variant: "sidebar-photo" as const, hasPhoto: true },
  { id: "elegant-business", name: "Elegant Business", category: "Business & Finance", isPremium: false, variant: "elegant" as const, hasPhoto: false },
  { id: "tech-minimal", name: "Tech Minimal", category: "Tech & Engineering", isPremium: false, variant: "minimal" as const, hasPhoto: false },
  { id: "canva-inspired", name: "Canva Inspired", category: "Marketing & Sales", isPremium: true, variant: "creative-photo" as const, hasPhoto: true },
  { id: "linkedin-style", name: "LinkedIn Style", category: "All Industries", isPremium: false, variant: "modern-photo" as const, hasPhoto: true },
  { id: "classic-professional", name: "Classic Professional", category: "All Industries", isPremium: false, variant: "professional" as const, hasPhoto: false },
];

export default function ResumeGenerator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("automatic");
  const [formData, setFormData] = useState({
    name: "",
    jobRole: "",
    experienceLevel: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
    education: "",
    achievements: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState({
    experience: false,
    achievements: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEnhance = async (section: "experience" | "achievements") => {
    const originalText = formData[section];
    if (!originalText || originalText.length < 10) {
      toast({
        title: "Content too short",
        description: "Please enter at least 10 characters to enhance.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.jobRole) {
      toast({
        title: "Missing Job Role",
        description: "Please enter a target job role for better context.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(prev => ({ ...prev, [section]: true }));
    try {
      const response = await fetch("/api/enhanced-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText,
          sectionType: section,
          jobRole: formData.jobRole,
          experienceLevel: formData.experienceLevel || "Mid-Level",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Enhancement failed");
      }

      const data = await response.json();
      handleInputChange(section, data.enhancedText);
      toast({
        title: "Enhancement Successful",
        description: `Your ${section} section has been optimized for ATS.`,
      });
    } catch (error: any) {
      console.error("Frontend Enhancement Error:", error);
      toast({
        title: "Enhancement Failed",
        description: error.message || "Could not enhance the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleGenerate = () => {
    if (
      !formData.name ||
      !formData.jobRole ||
      !formData.email ||
      !formData.phone ||
      !formData.skills ||
      !formData.education
    ) {
      alert("Please fill out all required fields correctly.");
      return;
    }
    console.log("Generating resume with:", formData);
    setShowPreview(true);
  };

  const handleTemplateSelect = (id: string) => {
    console.log("Template selected:", id);
    setSelectedTemplate(id);
    setIsEditing(true);
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[A-Za-z\s]*$/.test(value)) {
                              handleInputChange("name", value);
                            }
                          }}
                          data-testid="input-name"
                          className="mt-1"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select
                          value={formData.experienceLevel}
                          onValueChange={(value) => handleInputChange("experienceLevel", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                            <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="jobRole">Target Job Role</Label>
                      <Input id="jobRole"
                        value={formData.jobRole}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[A-Za-z\s]*$/.test(value)) {
                            handleInputChange("jobRole", value);
                          }
                        }}
                        placeholder="e.g. Software Engineer"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        data-testid="input-email-resume"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            handleInputChange("phone", value);
                          }
                        }}
                        maxLength={10}
                        data-testid="input-phone"
                        className="mt-1"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="experience">Work Experience</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnhance("experience")}
                          disabled={!formData.experience || !formData.jobRole || isEnhancing.experience}
                          className="h-7 text-xs"
                        >
                          {isEnhancing.experience ? (
                            <Wand2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Wand2 className="w-3 h-3 mr-1" />
                          )}
                          Enhance with AI
                        </Button>
                      </div>
                      <Textarea id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        placeholder="Describe your work experience..."
                        required
                        minLength={10}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input id="skills"
                        value={formData.skills}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[A-Za-z\s,]*$/.test(value)) {
                            handleInputChange("skills", value);
                          }
                        }}
                        placeholder="e.g. Python, React, AI"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="education">Education</Label>
                      <Textarea id="education"
                        value={formData.education}
                        onChange={(e) => handleInputChange("education", e.target.value)}
                        placeholder="Your degrees, institutions, etc."
                        required
                        minLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="achievements">Key Achievements</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnhance("achievements")}
                          disabled={!formData.achievements || !formData.jobRole || isEnhancing.achievements}
                          className="h-7 text-xs"
                        >
                          {isEnhancing.achievements ? (
                            <Wand2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Wand2 className="w-3 h-3 mr-1" />
                          )}
                          Enhance with AI
                        </Button>
                      </div>
                      <Textarea id="achievements"
                        value={formData.achievements}
                        onChange={(e) => handleInputChange("achievements", e.target.value)}
                        placeholder="Awards, recognitions, notable projects..."
                        required
                        minLength={5}
                        className="mt-1 min-h-[100px]" />
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
                      <div className="flex gap-2">
                        {/* Future: Add theme toggle here */}
                        <Button onClick={handleDownload} data-testid="button-download">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-100 p-8 rounded-lg overflow-auto flex justify-center min-h-[600px]">
                    <div
                      id="resume-preview"
                      className="bg-white text-black shadow-2xl p-[40px] w-[210mm] min-h-[297mm] mx-auto transform scale-90 origin-top"
                      data-testid="preview-resume"
                    >
                      {showPreview ? (
                        <div className="space-y-6 font-sans" contentEditable suppressContentEditableWarning>
                          <div className="border-b-2 border-gray-800 pb-4 mb-6">
                            <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900 mb-2">{formData.name || "Your Name"}</h1>
                            <p className="text-xl text-gray-700 font-medium">{formData.jobRole || "Job Title"}</p>
                            <div className="mt-3 text-sm text-gray-600 flex gap-4 flex-wrap">
                              <span>{formData.email || "email@example.com"}</span>
                              <span>•</span>
                              <span>{formData.phone || "+1 234 567 8900"}</span>
                            </div>
                          </div>

                          <div className="space-y-5">
                            <section>
                              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Experience</h2>
                              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                                {formData.experience || "Describe your professional experience here..."}
                              </div>
                            </section>

                            <section>
                              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Skills</h2>
                              <p className="text-gray-700 leading-relaxed text-sm">
                                {formData.skills || "List your key skills..."}
                              </p>
                            </section>

                            <section>
                              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Education</h2>
                              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                                {formData.education || "List your educational background..."}
                              </div>
                            </section>

                            <section>
                              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Achievements</h2>
                              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                                {formData.achievements || "Highlight your key achievements..."}
                              </div>
                            </section>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 pt-32">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Wand2 className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-lg">Fill the form and click Generate to preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="template">
              {!isEditing ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Choose a Template</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map(template => (
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
                </div>
              ) : (
                <div>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="mb-6">
                    ← Back to Templates
                  </Button>
                  <EditableTemplateEditor
                    variant={templates.find(t => t.id === selectedTemplate)?.variant as any || "minimal"}
                    templateName={templates.find(t => t.id === selectedTemplate)?.name || "Resume"}
                    initialData={formData.name ? {
                      name: formData.name,
                      jobTitle: formData.jobRole,
                      email: formData.email,
                      phone: formData.phone,
                      linkedin: "",
                      location: "",
                      summary: formData.achievements,
                      experience1Title: "Role",
                      experience1Company: "Company",
                      experience1Period: "Period",
                      experience1Desc: formData.experience,
                      education: formData.education,
                      educationSchool: "School/University",
                      educationYear: "Year",
                      skills: formData.skills,
                    } : undefined}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
