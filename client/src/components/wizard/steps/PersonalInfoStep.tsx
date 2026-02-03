import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PersonalInfoStepProps {
    onNext: () => void;
}

export default function PersonalInfoStep({ onNext }: PersonalInfoStepProps) {
    const { state, dispatch } = useResume();
    const { personal } = state.resumeData;
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (field: keyof typeof personal, value: string) => {
        dispatch({
            type: 'UPDATE_PERSONAL',
            payload: { [field]: value },
        });
    };

    const handleGenerateSummary = async () => {
        if (!personal.jobTitle) {
            toast({
                title: 'Job Title Required',
                description: 'Please enter your target job title first.',
                variant: 'destructive',
            });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: personal.jobTitle,
                    name: personal.fullName,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate summary');

            const data = await response.json();
            handleChange('professionalSummary', data.summary);

            toast({
                title: 'Summary Generated!',
                description: 'Your professional summary has been created.',
            });
        } catch (error) {
            toast({
                title: 'Generation Failed',
                description: 'Could not generate summary. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const isValid = () => {
        return (
            personal.fullName.trim() !== '' &&
            personal.jobTitle.trim() !== '' &&
            personal.email.trim() !== '' &&
            personal.phone.trim() !== '' &&
            personal.location.trim() !== ''
        );
    };

    const summaryLength = personal.professionalSummary.length;
    const maxLength = 500;

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
                    <p className="text-muted-foreground">
                        Let's start with your basic information. This will appear at the top of your resume.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="fullName">
                            Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="fullName"
                            value={personal.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            placeholder="John Doe"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="jobTitle">
                            Target Job Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="jobTitle"
                            value={personal.jobTitle}
                            onChange={(e) => handleChange('jobTitle', e.target.value)}
                            placeholder="Software Engineer"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={personal.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="john.doe@example.com"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone">
                            Phone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={personal.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="mt-1"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="location">
                            Location <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="location"
                            value={personal.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="San Francisco, CA"
                            className="mt-1"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="professionalSummary">Professional Summary</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateSummary}
                            disabled={isGenerating || !personal.jobTitle}
                            className="h-8"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-3 h-3 mr-2" />
                                    Generate with AI
                                </>
                            )}
                        </Button>
                    </div>
                    <Textarea
                        id="professionalSummary"
                        value={personal.professionalSummary}
                        onChange={(e) => handleChange('professionalSummary', e.target.value)}
                        placeholder="A brief summary highlighting your key strengths and career objectives..."
                        className="mt-1 min-h-[120px]"
                        maxLength={maxLength}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">
                            Write a compelling summary that highlights your expertise
                        </p>
                        <span
                            className={`text-xs font-medium ${summaryLength > maxLength * 0.9
                                    ? 'text-destructive'
                                    : summaryLength > maxLength * 0.7
                                        ? 'text-yellow-600'
                                        : 'text-muted-foreground'
                                }`}
                        >
                            {summaryLength}/{maxLength}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onNext} disabled={!isValid()} size="lg">
                        Continue to Education
                    </Button>
                </div>
            </div>
        </Card>
    );
}
