import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { generateId } from '@/types/resume';
import type { Education } from '@/types/resume';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EducationStepProps {
    onNext: () => void;
    onBack: () => void;
}

function EducationCard({ education, onUpdate, onDelete }: {
    education: Education;
    onUpdate: (data: Partial<Education>) => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: education.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                    <button
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-2"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>

                    <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Institution</Label>
                                <Input
                                    value={education.institution}
                                    onChange={(e) => onUpdate({ institution: e.target.value })}
                                    placeholder="University Name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Degree</Label>
                                <Input
                                    value={education.degree}
                                    onChange={(e) => onUpdate({ degree: e.target.value })}
                                    placeholder="Bachelor of Science"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Specialization</Label>
                                <Input
                                    value={education.specialization}
                                    onChange={(e) => onUpdate({ specialization: e.target.value })}
                                    placeholder="Computer Science"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">GPA (Optional)</Label>
                                <Input
                                    value={education.gpa || ''}
                                    onChange={(e) => onUpdate({ gpa: e.target.value })}
                                    placeholder="3.8/4.0"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Start Date</Label>
                                <Input
                                    type="month"
                                    value={education.startDate}
                                    onChange={(e) => onUpdate({ startDate: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">End Date</Label>
                                <Input
                                    type="month"
                                    value={education.endDate}
                                    onChange={(e) => onUpdate({ endDate: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default function EducationStep({ onNext, onBack }: EducationStepProps) {
    const { state, dispatch } = useResume();
    const { education } = state.resumeData;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddEducation = () => {
        const newEducation: Education = {
            id: generateId(),
            institution: '',
            degree: '',
            specialization: '',
            startDate: '',
            endDate: '',
            order: education.length,
        };
        dispatch({ type: 'ADD_EDUCATION', payload: newEducation });
    };

    const handleUpdateEducation = (id: string, data: Partial<Education>) => {
        dispatch({ type: 'UPDATE_EDUCATION', payload: { id, data } });
    };

    const handleDeleteEducation = (id: string) => {
        dispatch({ type: 'DELETE_EDUCATION', payload: id });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = education.findIndex((e) => e.id === active.id);
            const newIndex = education.findIndex((e) => e.id === over.id);

            const reordered = arrayMove(education, oldIndex, newIndex).map((e, index) => ({
                ...e,
                order: index,
            }));

            dispatch({ type: 'REORDER_EDUCATION', payload: reordered });
        }
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Education</h2>
                    <p className="text-muted-foreground">
                        Add your educational background. You can add multiple entries and drag to reorder them.
                    </p>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={education.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <EducationCard
                                    key={edu.id}
                                    education={edu}
                                    onUpdate={(data) => handleUpdateEducation(edu.id, data)}
                                    onDelete={() => handleDeleteEducation(edu.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {education.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No education entries yet</p>
                        <Button onClick={handleAddEducation} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Education
                        </Button>
                    </div>
                )}

                {education.length > 0 && (
                    <Button onClick={handleAddEducation} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Education
                    </Button>
                )}

                <div className="flex justify-between pt-4 border-t">
                    <Button onClick={onBack} variant="outline" size="lg">
                        Back
                    </Button>
                    <Button onClick={onNext} size="lg">
                        Continue to Skills
                    </Button>
                </div>
            </div>
        </Card>
    );
}
