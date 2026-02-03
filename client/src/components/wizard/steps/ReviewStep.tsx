import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Check, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReviewStepProps {
    onBack: () => void;
    onEditStep: (step: string) => void;
}

export default function ReviewStep({ onBack, onEditStep }: ReviewStepProps) {
    const { state } = useResume();
    const { resumeData } = state;
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            console.log('Starting PDF export...');
            const element = document.getElementById('resume-preview-final');

            if (!element) {
                console.error('Preview element not found in DOM');
                throw new Error('Preview element not found');
            }

            console.log('Element found, capturing with html2canvas...');
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            console.log('Canvas created, converting to image...');
            const imgData = canvas.toDataURL('image/png');

            console.log('Creating PDF...');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const fileName = `${(resumeData.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
            console.log('Saving PDF as:', fileName);
            pdf.save(fileName);

            toast({
                title: 'Success!',
                description: 'Your resume has been downloaded.',
            });
        } catch (error) {
            console.error('PDF Export Error:', error);
            toast({
                title: 'Export Failed',
                description: error instanceof Error ? error.message : 'Could not generate PDF. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const sections = [
        {
            title: 'Personal Information',
            step: 'personal',
            items: [
                resumeData.personal.fullName,
                resumeData.personal.jobTitle,
                resumeData.personal.email,
                resumeData.personal.phone,
                resumeData.personal.location,
            ].filter(Boolean),
        },
        {
            title: 'Education',
            step: 'education',
            items: resumeData.education.map(e => `${e.degree} in ${e.specialization} - ${e.institution}`),
        },
        {
            title: 'Skills',
            step: 'skills',
            items: resumeData.skills.map(s => s.name),
        },
        {
            title: 'Experience',
            step: 'experience',
            items: resumeData.experience.map(e => `${e.role} at ${e.company}`),
        },
        {
            title: 'Projects',
            step: 'projects',
            items: resumeData.projects.map(p => p.title),
        },
        {
            title: 'Certifications',
            step: 'certifications',
            items: resumeData.certifications.map(c => c.name),
        },
        {
            title: 'Social Links',
            step: 'links',
            items: Object.entries(resumeData.socialLinks)
                .filter(([_, value]) => value)
                .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1)),
        },
    ];

    const completionPercentage = sections.reduce((acc, section) => {
        return acc + (section.items.length > 0 ? 1 : 0);
    }, 0) / sections.length * 100;

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Review Your Resume</h2>
                        <p className="text-muted-foreground">
                            Review all sections before downloading. Click on any section to edit.
                        </p>
                    </div>

                    {/* Completion Status */}
                    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Resume Completion</span>
                            <span className="text-2xl font-bold text-primary">{Math.round(completionPercentage)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Sections Summary */}
                    <div className="space-y-3">
                        {sections.map((section) => (
                            <div
                                key={section.step}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{section.title}</h3>
                                            {section.items.length > 0 ? (
                                                <Badge variant="default" className="bg-green-500">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Complete
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Empty</Badge>
                                            )}
                                        </div>
                                        {section.items.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {section.items.slice(0, 3).map((item, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {item}
                                                    </Badge>
                                                ))}
                                                {section.items.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{section.items.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No items added</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEditStep(section.step)}
                                        className="ml-4"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
                            Back
                        </Button>
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isExporting || completionPercentage < 50}
                            size="lg"
                            className="flex-1"
                        >
                            {isExporting ? (
                                <>
                                    <FileText className="w-4 h-4 mr-2 animate-pulse" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Resume PDF
                                </>
                            )}
                        </Button>
                    </div>

                    {completionPercentage < 50 && (
                        <p className="text-sm text-muted-foreground text-center">
                            Complete at least 50% of your resume to download
                        </p>
                    )}
                </div>
            </Card>

            {/* Off-screen Preview for PDF Export - positioned off-screen but still rendered */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    id="resume-preview-final"
                    className="bg-white text-black p-12"
                    style={{ width: '210mm', minHeight: '297mm' }}
                >
                    <div className="space-y-6 font-sans">
                        <div className="border-b-2 border-gray-800 pb-4">
                            <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900 mb-2">
                                {resumeData.personal.fullName || 'Your Name'}
                            </h1>
                            <p className="text-xl text-gray-700 font-medium mb-3">
                                {resumeData.personal.jobTitle || 'Job Title'}
                            </p>
                            <div className="text-sm text-gray-600 flex gap-3 flex-wrap">
                                <span>{resumeData.personal.email}</span>
                                <span>•</span>
                                <span>{resumeData.personal.phone}</span>
                                <span>•</span>
                                <span>{resumeData.personal.location}</span>
                            </div>
                        </div>

                        {resumeData.personal.professionalSummary && (
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-2 pb-1">
                                    Professional Summary
                                </h2>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {resumeData.personal.professionalSummary}
                                </p>
                            </div>
                        )}

                        {resumeData.experience.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">
                                    Experience
                                </h2>
                                {resumeData.experience.map((exp) => (
                                    <div key={exp.id} className="mb-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                                            <span className="text-sm text-gray-600">
                                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{exp.company}</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {exp.responsibilities.map((resp, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{resp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {resumeData.projects.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">
                                    Projects
                                </h2>
                                {resumeData.projects.map((proj) => (
                                    <div key={proj.id} className="mb-3">
                                        <h3 className="font-semibold text-gray-900">{proj.title}</h3>
                                        <p className="text-sm text-gray-700 mb-1">{proj.description}</p>
                                        <p className="text-xs text-gray-600">
                                            <strong>Tech Stack:</strong> {proj.techStack.join(', ')}
                                        </p>
                                        {(proj.githubUrl || proj.liveUrl) && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                {proj.githubUrl && <span>{proj.githubUrl}</span>}
                                                {proj.githubUrl && proj.liveUrl && ' | '}
                                                {proj.liveUrl && <span>{proj.liveUrl}</span>}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {resumeData.skills.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-2 pb-1">
                                    Skills
                                </h2>
                                <p className="text-sm text-gray-700">
                                    {resumeData.skills.map(s => s.name).join(' • ')}
                                </p>
                            </div>
                        )}

                        {resumeData.education.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">
                                    Education
                                </h2>
                                {resumeData.education.map((edu) => (
                                    <div key={edu.id} className="mb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {edu.degree} in {edu.specialization}
                                                </h3>
                                                <p className="text-sm text-gray-700">{edu.institution}</p>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {edu.startDate} - {edu.endDate}
                                            </span>
                                        </div>
                                        {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {resumeData.certifications.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-2 pb-1">
                                    Certifications
                                </h2>
                                {resumeData.certifications.map((cert) => (
                                    <p key={cert.id} className="text-sm text-gray-700 mb-1">
                                        <strong>{cert.name}</strong> - {cert.issuer} ({cert.date})
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
