import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit2, Upload, User } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FormData {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  summary: string;
  experience1Title: string;
  experience1Company: string;
  experience1Period: string;
  experience1Desc: string;
  experience2Title?: string;
  experience2Company?: string;
  experience2Period?: string;
  experience2Desc?: string;
  education: string;
  educationSchool: string;
  educationYear: string;
  skills: string;
}

interface EditableTemplateEditorProps {
  variant: "professional" | "modern-photo" | "executive" | "creative-photo" | "minimal" | "two-column" | "sidebar-photo" | "elegant";
  templateName: string;
  initialData?: FormData;
}

export default function EditableTemplateEditor({ variant, templateName, initialData }: EditableTemplateEditorProps) {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [formData, setFormData] = useState<FormData>(initialData || {
    name: "John Smith",
    jobTitle: "Senior Sales Associate",
    email: "john@email.com",
    phone: "123-456-7890",
    linkedin: "linkedin.com/in/johnsmith",
    location: "New York, NY",
    summary: "Experienced sales professional with 5+ years in B2B sales and team leadership. Proven track record of exceeding targets and building high-performing teams.",
    experience1Title: "Senior Sales Associate",
    experience1Company: "Company Name",
    experience1Period: "2020-2024",
    experience1Desc: "Led sales team of 8 members, exceeded quarterly targets by 25%, implemented new CRM system",
    experience2Title: "Sales Associate",
    experience2Company: "Previous Company",
    experience2Period: "2018-2020",
    experience2Desc: "Managed key client relationships, achieved 120% of annual quota, developed training materials",
    education: "Bachelor of Business Administration",
    educationSchool: "University Name",
    educationYear: "2018",
    skills: "Sales Management • Team Leadership • CRM Tools • Client Relations • Negotiation • Data Analysis",
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById("editable-template-preview");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`resume-${templateName}.pdf`);
  };

  const renderPhotoCircle = (size: string = "w-24 h-24") => (
    <div className={`${size} bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {photoUrl ? (
        <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <User className={`${size === "w-24 h-24" ? "w-12 h-12" : size === "w-32 h-32" ? "w-16 h-16" : "w-10 h-10"} text-white`} />
      )}
    </div>
  );

  const renderPhotoSquare = () => (
    <div className="w-32 h-32 bg-gray-300 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
      {photoUrl ? (
        <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <User className="w-16 h-16 text-gray-600" />
      )}
    </div>
  );

  const renderProfessionalTemplate = () => (
    <div className="w-full bg-white text-black p-12 min-h-[1100px]">
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        <h1
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setFormData(prev => ({ ...prev, name: e.currentTarget.textContent || "" }))}
          className="font-bold text-4xl mb-2 uppercase tracking-wide"
        >
          {formData.name}
        </h1>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setFormData(prev => ({ ...prev, jobTitle: e.currentTarget.textContent || "" }))}
          className="text-lg text-gray-600 mb-3"
        >
          {formData.jobTitle}
        </p>
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          <span contentEditable suppressContentEditableWarning>📞 {formData.phone}</span>
          <span contentEditable suppressContentEditableWarning>✉ {formData.email}</span>
          <span contentEditable suppressContentEditableWarning>🔗 {formData.linkedin}</span>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-xl mb-3 uppercase tracking-wide">Summary</h2>
          <p contentEditable suppressContentEditableWarning className="text-gray-700 leading-relaxed">{formData.summary}</p>
        </div>
        <div>
          <h2 className="font-bold text-xl mb-3 uppercase tracking-wide">Education</h2>
          <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.education}</p>
          <p contentEditable suppressContentEditableWarning className="text-gray-600 italic">{formData.educationSchool} • {formData.educationYear}</p>
        </div>
        <div>
          <h2 className="font-bold text-xl mb-3 uppercase tracking-wide">Experience</h2>
          <div className="space-y-4">
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience1Company} | {formData.experience1Period}</p>
              <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience1Desc}</p>
            </div>
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience2Title}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience2Company} | {formData.experience2Period}</p>
              <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience2Desc}</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-bold text-xl mb-3 uppercase tracking-wide">Technical Skills</h2>
          <p contentEditable suppressContentEditableWarning className="text-gray-700">{formData.skills}</p>
        </div>
      </div>
    </div>
  );

  const renderModernPhotoTemplate = () => (
    <div className="w-full bg-white text-black p-12 min-h-[1100px]">
      <div className="flex items-start gap-6 mb-8 pb-6 border-b-4 border-gray-800">
        {renderPhotoCircle("w-32 h-32")}
        <div className="flex-1">
          <h1 contentEditable suppressContentEditableWarning className="font-bold text-4xl mb-2">{formData.name}</h1>
          <p contentEditable suppressContentEditableWarning className="text-xl text-gray-600 mb-3">{formData.jobTitle}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p contentEditable suppressContentEditableWarning>{formData.email} • {formData.phone}</p>
            <p contentEditable suppressContentEditableWarning>{formData.linkedin}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-xl mb-3 text-gray-800">EXPERIENCE</h2>
            <div className="space-y-4">
              <div>
                <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title}</p>
                <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience1Company}</p>
                <p contentEditable suppressContentEditableWarning className="text-sm text-gray-500">{formData.experience1Period}</p>
                <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience1Desc}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-xl mb-3 text-gray-800">EDUCATION</h2>
            <p contentEditable suppressContentEditableWarning className="font-semibold">{formData.education}</p>
            <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.educationSchool}</p>
          </div>
          <div>
            <h2 className="font-bold text-xl mb-3 text-gray-800">SKILLS</h2>
            <p contentEditable suppressContentEditableWarning className="text-gray-700">{formData.skills}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExecutiveTemplate = () => (
    <div className="w-full bg-white text-black p-12 min-h-[1100px]">
      <div className="flex gap-8 mb-8">
        {renderPhotoSquare()}
        <div className="flex-1">
          <h1 contentEditable suppressContentEditableWarning className="font-bold text-5xl mb-3">{formData.name}</h1>
          <p contentEditable suppressContentEditableWarning className="text-2xl text-gray-600 mb-4">{formData.jobTitle}</p>
          <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.email} • {formData.location}</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded">
          <h2 className="font-bold text-xl mb-3">PROFESSIONAL SUMMARY</h2>
          <p contentEditable suppressContentEditableWarning className="text-gray-700 leading-relaxed">{formData.summary}</p>
        </div>
        <div>
          <h2 className="font-bold text-xl mb-3">LEADERSHIP EXPERIENCE</h2>
          <div className="space-y-4">
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title} • {formData.experience1Company}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience1Period}</p>
              <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience1Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreativePhotoTemplate = () => (
    <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 text-black p-12 min-h-[1100px]">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-white" />
          )}
        </div>
        <div>
          <h1 contentEditable suppressContentEditableWarning className="font-bold text-4xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {formData.name}
          </h1>
          <p contentEditable suppressContentEditableWarning className="text-2xl text-gray-700">{formData.jobTitle}</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur p-6 rounded-xl">
          <h2 className="font-bold text-xl text-indigo-600 mb-3">About Me</h2>
          <p contentEditable suppressContentEditableWarning className="text-gray-700">{formData.summary}</p>
        </div>
        <div className="bg-white/80 backdrop-blur p-6 rounded-xl">
          <h2 className="font-bold text-xl text-indigo-600 mb-3">Work Experience</h2>
          <div className="space-y-4">
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience1Company} | {formData.experience1Period}</p>
              <p contentEditable suppressContentEditableWarning className="mt-2">{formData.experience1Desc}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl">
            <h2 className="font-bold text-xl text-indigo-600 mb-3">Education</h2>
            <p contentEditable suppressContentEditableWarning className="font-semibold">{formData.education}</p>
            <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.educationSchool}</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl">
            <h2 className="font-bold text-xl text-indigo-600 mb-3">Skills</h2>
            <p contentEditable suppressContentEditableWarning className="text-gray-700">{formData.skills}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalTemplate = () => (
    <div className="w-full bg-white text-black p-12 min-h-[1100px]">
      <h1 contentEditable suppressContentEditableWarning className="font-bold text-4xl mb-2">{formData.name}</h1>
      <div contentEditable suppressContentEditableWarning className="text-gray-600 mb-8 flex gap-4">
        <span>{formData.email}</span>
        <span>•</span>
        <span>{formData.phone}</span>
        <span>•</span>
        <span>{formData.linkedin}</span>
      </div>
      <div className="space-y-8">
        <div>
          <h2 className="font-bold text-2xl mb-4 uppercase tracking-wide">Experience</h2>
          <div className="border-l-4 border-gray-300 pl-6 space-y-6">
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title} • {formData.experience1Company}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600 mb-2">{formData.experience1Period}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-700">{formData.experience1Desc}</p>
            </div>
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience2Title} • {formData.experience2Company}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600 mb-2">{formData.experience2Period}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-700">{formData.experience2Desc}</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-bold text-2xl mb-4 uppercase tracking-wide">Education</h2>
          <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.education}</p>
          <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.educationSchool} | {formData.educationYear}</p>
        </div>
        <div>
          <h2 className="font-bold text-2xl mb-4 uppercase tracking-wide">Skills</h2>
          <p contentEditable suppressContentEditableWarning className="text-gray-700">{formData.skills}</p>
        </div>
      </div>
    </div>
  );

  const renderTwoColumnTemplate = () => (
    <div className="w-full bg-white text-black p-8 min-h-[1100px]">
      <div className="flex gap-8">
        <div className="w-2/5 space-y-6">
          <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-20 h-20 text-white" />
            )}
          </div>
          <div className="text-center">
            <h2 className="font-bold text-xl mb-4">CONTACT</h2>
            <p contentEditable suppressContentEditableWarning className="text-sm text-gray-700 mb-2">📞 {formData.phone}</p>
            <p contentEditable suppressContentEditableWarning className="text-sm text-gray-700 mb-2">✉ {formData.email}</p>
            <p contentEditable suppressContentEditableWarning className="text-sm text-gray-700">🔗 {formData.linkedin}</p>
          </div>
          <div>
            <h2 className="font-bold text-xl mb-4">SKILLS</h2>
            <div contentEditable suppressContentEditableWarning className="text-sm text-gray-700 whitespace-pre-wrap">
              {formData.skills.split('•').map(s => `• ${s.trim()}`).join('\n')}
            </div>
          </div>
        </div>
        <div className="w-3/5 space-y-6">
          <div>
            <h1 contentEditable suppressContentEditableWarning className="font-bold text-4xl mb-2">{formData.name}</h1>
            <p contentEditable suppressContentEditableWarning className="text-xl text-gray-600 mb-6">{formData.jobTitle}</p>
          </div>
          <div>
            <h2 className="font-bold text-xl mb-3">EXPERIENCE</h2>
            <div className="space-y-4">
              <div>
                <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title}</p>
                <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience1Company} | {formData.experience1Period}</p>
                <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience1Desc}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-xl mb-3">EDUCATION</h2>
            <p contentEditable suppressContentEditableWarning className="font-semibold">{formData.education}</p>
            <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.educationSchool}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSidebarPhotoTemplate = () => (
    <div className="w-full bg-white text-black flex min-h-[1100px]">
      <div className="w-1/3 bg-slate-700 text-white p-8 space-y-6">
        <div className="w-32 h-32 bg-slate-500 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-white" />
          )}
        </div>
        <div className="text-center">
          <h2 className="font-bold text-xl mb-4">CONTACT</h2>
          <p contentEditable suppressContentEditableWarning className="text-sm text-slate-300 mb-2">{formData.phone}</p>
          <p contentEditable suppressContentEditableWarning className="text-sm text-slate-300 mb-2">{formData.email}</p>
          <p contentEditable suppressContentEditableWarning className="text-sm text-slate-300">{formData.linkedin}</p>
        </div>
        <div>
          <h2 className="font-bold text-xl mb-4">SKILLS</h2>
          <div contentEditable suppressContentEditableWarning className="text-sm text-slate-300 whitespace-pre-wrap">
            {formData.skills.split('•').map(s => `• ${s.trim()}`).join('\n')}
          </div>
        </div>
      </div>
      <div className="w-2/3 p-12 space-y-6">
        <div>
          <h1 contentEditable suppressContentEditableWarning className="font-bold text-4xl mb-2">{formData.name}</h1>
          <p contentEditable suppressContentEditableWarning className="text-xl text-gray-600 mb-6">{formData.jobTitle}</p>
        </div>
        <div>
          <h2 className="font-bold text-2xl mb-4">EXPERIENCE</h2>
          <div className="space-y-4">
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience1Company} | {formData.experience1Period}</p>
              <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience1Desc}</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-bold text-2xl mb-4">EDUCATION</h2>
          <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.education}</p>
          <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.educationSchool}</p>
        </div>
      </div>
    </div>
  );

  const renderElegantTemplate = () => (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white text-black p-12 min-h-[1100px]">
      <div className="border-b-4 border-slate-800 pb-6 mb-8">
        <h1 contentEditable suppressContentEditableWarning className="font-bold text-5xl tracking-wide mb-2">{formData.name}</h1>
        <p contentEditable suppressContentEditableWarning className="text-xl text-gray-600">{formData.jobTitle}</p>
      </div>
      <div className="flex gap-8 text-sm text-gray-600 mb-8">
        <span contentEditable suppressContentEditableWarning>📧 {formData.email}</span>
        <span contentEditable suppressContentEditableWarning>📞 {formData.phone}</span>
        <span contentEditable suppressContentEditableWarning>📍 {formData.location}</span>
      </div>
      <div className="space-y-8">
        <div>
          <h2 className="font-bold text-2xl tracking-wide mb-4 uppercase">Professional Experience</h2>
          <div className="space-y-4">
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience1Title}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience1Company} • {formData.experience1Period}</p>
              <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience1Desc}</p>
            </div>
            <div>
              <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.experience2Title}</p>
              <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.experience2Company} • {formData.experience2Period}</p>
              <p contentEditable suppressContentEditableWarning className="mt-2 text-gray-700">{formData.experience2Desc}</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-bold text-2xl tracking-wide mb-4 uppercase">Education</h2>
          <p contentEditable suppressContentEditableWarning className="font-semibold text-lg">{formData.education}</p>
          <p contentEditable suppressContentEditableWarning className="text-gray-600">{formData.educationSchool} • {formData.educationYear}</p>
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (variant) {
      case "professional":
        return renderProfessionalTemplate();
      case "modern-photo":
        return renderModernPhotoTemplate();
      case "executive":
        return renderExecutiveTemplate();
      case "creative-photo":
        return renderCreativePhotoTemplate();
      case "minimal":
        return renderMinimalTemplate();
      case "two-column":
        return renderTwoColumnTemplate();
      case "sidebar-photo":
        return renderSidebarPhotoTemplate();
      case "elegant":
        return renderElegantTemplate();
      default:
        return renderMinimalTemplate();
    }
  };

  const hasPhoto = ["modern-photo", "executive", "creative-photo", "two-column", "sidebar-photo"].includes(variant);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Edit Your Resume - {templateName}</h2>
          </div>
          <div className="flex gap-2">
            {hasPhoto && (
              <Button variant="outline" asChild data-testid="button-upload-photo">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </Button>
            )}
            <Button onClick={handleDownload} data-testid="button-download-resume">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Click on any text in the resume to edit it directly. {hasPhoto && "Upload your photo to personalize the template."}
        </p>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div id="editable-template-preview" className="max-w-[850px] mx-auto" data-testid="editable-resume-preview">
          {renderTemplate()}
        </div>
      </Card>
    </div>
  );
}
