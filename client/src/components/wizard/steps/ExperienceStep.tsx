import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, GripVertical, Trash2, Wand2, Loader2, Plus as PlusCircle, X } from 'lucide-react';
import { generateId } from '@/types/resume';
import type { Experience } from '@/types/resume';
import { useToast } from '@/hooks/use-toast';
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

interface ExperienceStepProps {
    onNext: () => void;
    onBack: () => void;
}

const actionVerbs = [
    'Developed', 'Implemented', 'Designed', 'Led', 'Managed', 'Created', 'Built',
    'Optimized', 'Improved', 'Reduced', 'Increased', 'Achieved', 'Delivered',
    'Collaborated', 'Coordinated', 'Established', 'Launched', 'Spearheaded',
    'Streamlined', 'Transformed', 'Architected', 'Engineered', 'Automated'
];

function ExperienceCard({ experience, onUpdate, onDelete }: {
    experience: Experience;
    onUpdate: (data: Partial<Experience>) => void;
    onDelete: () => void;
}) {
    const { toast } = useToast();
    const [newResponsibility, setNewResponsibility] = useState('');
    const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
    const [showVerbSuggestions, setShowVerbSuggestions] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: experience.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleAddResponsibility = () => {
        if (!newResponsibility.trim()) return;
        onUpdate({
            responsibilities: [...experience.responsibilities, newResponsibility.trim()],
        });
        setNewResponsibility('');
    };

    const handleDeleteResponsibility = (index: number) => {
        onUpdate({
            responsibilities: experience.responsibilities.filter((_, i) => i !== index),
        });
    };

    const handleEnhanceResponsibility = async (index: number) => {
        const responsibility = experience.responsibilities[index];
        setEnhancingIndex(index);

        try {
            const response = await fetch('/api/enhanced-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalText: responsibility,
                    sectionType: 'experience',
                    jobRole: experience.role,
                }),
            });

            if (!response.ok) throw new Error('Enhancement failed');

            const data = await response.json();
            const updated = [...experience.responsibilities];
            updated[index] = data.enhancedText;
            onUpdate({ responsibilities: updated });

            toast({
                title: 'Enhanced!',
                description: 'Your responsibility has been improved.',
            });
        } catch (error) {
            toast({
                title: 'Enhancement Failed',
                description: 'Could not enhance. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setEnhancingIndex(null);
        }
    };

    const insertActionVerb = (verb: string) => {
        setNewResponsibility(verb + ' ');
        setShowVerbSuggestions(false);
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
                                <Label className="text-xs">Company</Label>
                                <Input
                                    value={experience.company}
                                    onChange={(e) => onUpdate({ company: e.target.value })}
                                    placeholder="Company Name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Role</Label>
                                <Input
                                    value={experience.role}
                                    onChange={(e) => onUpdate({ role: e.target.value })}
                                    placeholder="Software Engineer"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Start Date</Label>
                                <Input
                                    type="month"
                                    value={experience.startDate}
                                    onChange={(e) => onUpdate({ startDate: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">End Date</Label>
                                <div className="space-y-2">
                                    <Input
                                        type="month"
                                        value={experience.endDate}
                                        onChange={(e) => onUpdate({ endDate: e.target.value })}
                                        disabled={experience.current}
                                        className="mt-1"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`current-${experience.id}`}
                                            checked={experience.current}
                                            onCheckedChange={(checked) => onUpdate({ current: checked as boolean })}
                                        />
                                        <label
                                            htmlFor={`current-${experience.id}`}
                                            className="text-xs text-muted-foreground cursor-pointer"
                                        >
                                            Currently working here
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs">Responsibilities & Achievements</Label>
                            <div className="mt-2 space-y-2">
                                {experience.responsibilities.map((resp, index) => (
                                    <div key={index} className="flex gap-2 items-start group">
                                        <span className="text-muted-foreground mt-1">•</span>
                                        <p className="flex-1 text-sm">{resp}</p>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleEnhanceResponsibility(index)}
                                                disabled={enhancingIndex === index}
                                            >
                                                {enhancingIndex === index ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Wand2 className="w-3 h-3" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => handleDeleteResponsibility(index)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 relative">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            value={newResponsibility}
                                            onChange={(e) => setNewResponsibility(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && e.ctrlKey) {
                                                    handleAddResponsibility();
                                                }
                                            }}
                                            placeholder="Add a responsibility or achievement..."
                                            className="min-h-[60px] text-sm"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowVerbSuggestions(!showVerbSuggestions)}
                                            className="absolute top-1 right-1 h-7 text-xs"
                                        >
                                            Action Verbs
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleAddResponsibility}
                                        size="sm"
                                        disabled={!newResponsibility.trim()}
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                    </Button>
                                </div>

                                {showVerbSuggestions && (
                                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg p-2 grid grid-cols-3 gap-1 max-h-48 overflow-auto">
                                        {actionVerbs.map((verb) => (
                                            <button
                                                key={verb}
                                                onClick={() => insertActionVerb(verb)}
                                                className="text-left px-2 py-1 hover:bg-accent rounded text-xs"
                                            >
                                                {verb}
                                            </button>
                                        ))}
                                    </div>
                                )}
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

export default function ExperienceStep({ onNext, onBack }: ExperienceStepProps) {
    const { state, dispatch } = useResume();
    const { experience } = state.resumeData;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddExperience = () => {
        const newExperience: Experience = {
            id: generateId(),
            company: '',
            role: '',
            startDate: '',
            endDate: '',
            current: false,
            responsibilities: [],
            order: experience.length,
        };
        dispatch({ type: 'ADD_EXPERIENCE', payload: newExperience });
    };

    const handleUpdateExperience = (id: string, data: Partial<Experience>) => {
        dispatch({ type: 'UPDATE_EXPERIENCE', payload: { id, data } });
    };

    const handleDeleteExperience = (id: string) => {
        dispatch({ type: 'DELETE_EXPERIENCE', payload: id });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = experience.findIndex((e) => e.id === active.id);
            const newIndex = experience.findIndex((e) => e.id === over.id);

            const reordered = arrayMove(experience, oldIndex, newIndex).map((e, index) => ({
                ...e,
                order: index,
            }));

            dispatch({ type: 'REORDER_EXPERIENCE', payload: reordered });
        }
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
                    <p className="text-muted-foreground">
                        Add your professional experience. Use action verbs and quantify achievements when possible.
                    </p>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={experience.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {experience.map((exp) => (
                                <ExperienceCard
                                    key={exp.id}
                                    experience={exp}
                                    onUpdate={(data) => handleUpdateExperience(exp.id, data)}
                                    onDelete={() => handleDeleteExperience(exp.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {experience.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No experience entries yet</p>
                        <Button onClick={handleAddExperience} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Experience
                        </Button>
                    </div>
                )}

                {experience.length > 0 && (
                    <Button onClick={handleAddExperience} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Experience
                    </Button>
                )}

                <div className="flex justify-between pt-4 border-t">
                    <Button onClick={onBack} variant="outline" size="lg">
                        Back
                    </Button>
                    <Button onClick={onNext} size="lg">
                        Continue to Projects
                    </Button>
                </div>
            </div>
        </Card>
    );
}
