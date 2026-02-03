import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { generateId } from '@/types/resume';
import type { Certification } from '@/types/resume';

interface CertificationsStepProps {
    onNext: () => void;
    onBack: () => void;
}

function CertificationCard({ certification, onUpdate, onDelete }: {
    certification: Certification;
    onUpdate: (data: Partial<Certification>) => void;
    onDelete: () => void;
}) {
    return (
        <Card className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <Label className="text-xs">Certification Name</Label>
                        <Input
                            value={certification.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            placeholder="AWS Certified Developer"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Issuing Organization</Label>
                        <Input
                            value={certification.issuer}
                            onChange={(e) => onUpdate({ issuer: e.target.value })}
                            placeholder="Amazon Web Services"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Date Obtained</Label>
                        <Input
                            type="month"
                            value={certification.date}
                            onChange={(e) => onUpdate({ date: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}

export default function CertificationsStep({ onNext, onBack }: CertificationsStepProps) {
    const { state, dispatch } = useResume();
    const { certifications } = state.resumeData;

    const handleAddCertification = () => {
        const newCertification: Certification = {
            id: generateId(),
            name: '',
            issuer: '',
            date: '',
            order: certifications.length,
        };
        dispatch({ type: 'ADD_CERTIFICATION', payload: newCertification });
    };

    const handleUpdateCertification = (id: string, data: Partial<Certification>) => {
        dispatch({ type: 'UPDATE_CERTIFICATION', payload: { id, data } });
    };

    const handleDeleteCertification = (id: string) => {
        dispatch({ type: 'DELETE_CERTIFICATION', payload: id });
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Certifications & Achievements</h2>
                    <p className="text-muted-foreground">
                        Add any professional certifications, awards, or notable achievements.
                    </p>
                </div>

                <div className="space-y-3">
                    {certifications.map((cert) => (
                        <CertificationCard
                            key={cert.id}
                            certification={cert}
                            onUpdate={(data) => handleUpdateCertification(cert.id, data)}
                            onDelete={() => handleDeleteCertification(cert.id)}
                        />
                    ))}
                </div>

                {certifications.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No certifications yet</p>
                        <Button onClick={handleAddCertification} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Certification
                        </Button>
                    </div>
                )}

                {certifications.length > 0 && (
                    <Button onClick={handleAddCertification} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Certification
                    </Button>
                )}

                <div className="flex justify-between pt-4 border-t">
                    <Button onClick={onBack} variant="outline" size="lg">
                        Back
                    </Button>
                    <Button onClick={onNext} size="lg">
                        Continue to Links
                    </Button>
                </div>
            </div>
        </Card>
    );
}
