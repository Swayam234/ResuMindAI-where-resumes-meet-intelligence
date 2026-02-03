import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical, Trash2, Github, ExternalLink, X } from 'lucide-react';
import { generateId } from '@/types/resume';
import type { Project } from '@/types/resume';
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

interface ProjectsStepProps {
    onNext: () => void;
    onBack: () => void;
}

const techStackSuggestions = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Django', 'Flask',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS',
    'Azure', 'GCP', 'TailwindCSS', 'Material-UI', 'Express', 'FastAPI',
    'GraphQL', 'REST API', 'WebSocket', 'Firebase', 'Supabase'
];

function ProjectCard({ project, onUpdate, onDelete }: {
    project: Project;
    onUpdate: (data: Partial<Project>) => void;
    onDelete: () => void;
}) {
    const [newTech, setNewTech] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleTechInputChange = (value: string) => {
        setNewTech(value);
        if (value.trim()) {
            const suggestions = techStackSuggestions.filter(tech =>
                tech.toLowerCase().includes(value.toLowerCase()) &&
                !project.techStack.includes(tech)
            );
            setFilteredSuggestions(suggestions);
        } else {
            setFilteredSuggestions([]);
        }
    };

    const handleAddTech = (tech?: string) => {
        const techName = tech || newTech.trim();
        if (!techName || project.techStack.includes(techName)) return;

        onUpdate({
            techStack: [...project.techStack, techName],
        });
        setNewTech('');
        setFilteredSuggestions([]);
    };

    const handleRemoveTech = (tech: string) => {
        onUpdate({
            techStack: project.techStack.filter(t => t !== tech),
        });
    };

    const isValidUrl = (url: string) => {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
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
                        <div>
                            <Label className="text-xs">Project Title</Label>
                            <Input
                                value={project.title}
                                onChange={(e) => onUpdate({ title: e.target.value })}
                                placeholder="My Awesome Project"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                                value={project.description}
                                onChange={(e) => onUpdate({ description: e.target.value })}
                                placeholder="Brief description of what the project does and your role..."
                                className="mt-1 min-h-[80px]"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Tech Stack</Label>
                            <div className="mt-2 flex flex-wrap gap-2 mb-2">
                                {project.techStack.map((tech) => (
                                    <Badge key={tech} variant="secondary" className="pl-3 pr-1 py-1">
                                        {tech}
                                        <button
                                            onClick={() => handleRemoveTech(tech)}
                                            className="ml-2 hover:bg-black/10 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="relative">
                                <Input
                                    value={newTech}
                                    onChange={(e) => handleTechInputChange(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTech();
                                        }
                                    }}
                                    placeholder="Add technology..."
                                    className="text-sm"
                                />
                                {filteredSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-32 overflow-auto">
                                        {filteredSuggestions.map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => handleAddTech(suggestion)}
                                                className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs flex items-center gap-1">
                                    <Github className="w-3 h-3" />
                                    GitHub URL (Optional)
                                </Label>
                                <Input
                                    value={project.githubUrl || ''}
                                    onChange={(e) => onUpdate({ githubUrl: e.target.value })}
                                    placeholder="https://github.com/username/repo"
                                    className={`mt-1 ${project.githubUrl && !isValidUrl(project.githubUrl) ? 'border-destructive' : ''}`}
                                />
                            </div>
                            <div>
                                <Label className="text-xs flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    Live Demo URL (Optional)
                                </Label>
                                <Input
                                    value={project.liveUrl || ''}
                                    onChange={(e) => onUpdate({ liveUrl: e.target.value })}
                                    placeholder="https://myproject.com"
                                    className={`mt-1 ${project.liveUrl && !isValidUrl(project.liveUrl) ? 'border-destructive' : ''}`}
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

export default function ProjectsStep({ onNext, onBack }: ProjectsStepProps) {
    const { state, dispatch } = useResume();
    const { projects } = state.resumeData;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddProject = () => {
        const newProject: Project = {
            id: generateId(),
            title: '',
            description: '',
            techStack: [],
            order: projects.length,
        };
        dispatch({ type: 'ADD_PROJECT', payload: newProject });
    };

    const handleUpdateProject = (id: string, data: Partial<Project>) => {
        dispatch({ type: 'UPDATE_PROJECT', payload: { id, data } });
    };

    const handleDeleteProject = (id: string) => {
        dispatch({ type: 'DELETE_PROJECT', payload: id });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = projects.findIndex((p) => p.id === active.id);
            const newIndex = projects.findIndex((p) => p.id === over.id);

            const reordered = arrayMove(projects, oldIndex, newIndex).map((p, index) => ({
                ...p,
                order: index,
            }));

            dispatch({ type: 'REORDER_PROJECTS', payload: reordered });
        }
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Projects</h2>
                    <p className="text-muted-foreground">
                        Showcase your best projects. Include links to GitHub repositories and live demos.
                    </p>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={projects.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onUpdate={(data) => handleUpdateProject(project.id, data)}
                                    onDelete={() => handleDeleteProject(project.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {projects.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No projects yet</p>
                        <Button onClick={handleAddProject} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Project
                        </Button>
                    </div>
                )}

                {projects.length > 0 && (
                    <Button onClick={handleAddProject} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Project
                    </Button>
                )}

                <div className="flex justify-between pt-4 border-t">
                    <Button onClick={onBack} variant="outline" size="lg">
                        Back
                    </Button>
                    <Button onClick={onNext} size="lg">
                        Continue to Certifications
                    </Button>
                </div>
            </div>
        </Card>
    );
}
