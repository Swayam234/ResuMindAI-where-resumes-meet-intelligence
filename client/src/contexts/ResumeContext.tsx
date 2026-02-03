import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ResumeData, WizardStep, createEmptyResumeData } from '@/types/resume';

interface ResumeState {
    resumeData: ResumeData;
    currentStep: WizardStep;
    completedSteps: WizardStep[];
    validationErrors: Record<string, string>;
}

type ResumeAction =
    | { type: 'UPDATE_PERSONAL'; payload: Partial<ResumeData['personal']> }
    | { type: 'ADD_EDUCATION'; payload: ResumeData['education'][0] }
    | { type: 'UPDATE_EDUCATION'; payload: { id: string; data: Partial<ResumeData['education'][0]> } }
    | { type: 'DELETE_EDUCATION'; payload: string }
    | { type: 'REORDER_EDUCATION'; payload: ResumeData['education'] }
    | { type: 'ADD_SKILL'; payload: ResumeData['skills'][0] }
    | { type: 'DELETE_SKILL'; payload: string }
    | { type: 'UPDATE_SKILLS'; payload: ResumeData['skills'] }
    | { type: 'ADD_EXPERIENCE'; payload: ResumeData['experience'][0] }
    | { type: 'UPDATE_EXPERIENCE'; payload: { id: string; data: Partial<ResumeData['experience'][0]> } }
    | { type: 'DELETE_EXPERIENCE'; payload: string }
    | { type: 'REORDER_EXPERIENCE'; payload: ResumeData['experience'] }
    | { type: 'ADD_PROJECT'; payload: ResumeData['projects'][0] }
    | { type: 'UPDATE_PROJECT'; payload: { id: string; data: Partial<ResumeData['projects'][0]> } }
    | { type: 'DELETE_PROJECT'; payload: string }
    | { type: 'REORDER_PROJECTS'; payload: ResumeData['projects'] }
    | { type: 'ADD_CERTIFICATION'; payload: ResumeData['certifications'][0] }
    | { type: 'UPDATE_CERTIFICATION'; payload: { id: string; data: Partial<ResumeData['certifications'][0]> } }
    | { type: 'DELETE_CERTIFICATION'; payload: string }
    | { type: 'UPDATE_SOCIAL_LINKS'; payload: Partial<ResumeData['socialLinks']> }
    | { type: 'SET_TEMPLATE'; payload: string }
    | { type: 'SET_STEP'; payload: WizardStep }
    | { type: 'MARK_STEP_COMPLETE'; payload: WizardStep }
    | { type: 'LOAD_RESUME'; payload: ResumeData }
    | { type: 'RESET_RESUME' }
    | { type: 'SET_VALIDATION_ERROR'; payload: { field: string; error: string } }
    | { type: 'CLEAR_VALIDATION_ERROR'; payload: string };

const initialState: ResumeState = {
    resumeData: createEmptyResumeData(),
    currentStep: 'personal',
    completedSteps: [],
    validationErrors: {},
};

function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
    switch (action.type) {
        case 'UPDATE_PERSONAL':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    personal: { ...state.resumeData.personal, ...action.payload },
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'ADD_EDUCATION':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    education: [...state.resumeData.education, action.payload],
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'UPDATE_EDUCATION':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    education: state.resumeData.education.map(edu =>
                        edu.id === action.payload.id ? { ...edu, ...action.payload.data } : edu
                    ),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'DELETE_EDUCATION':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    education: state.resumeData.education.filter(edu => edu.id !== action.payload),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'REORDER_EDUCATION':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    education: action.payload,
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'ADD_SKILL':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    skills: [...state.resumeData.skills, action.payload],
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'DELETE_SKILL':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    skills: state.resumeData.skills.filter(skill => skill.id !== action.payload),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'UPDATE_SKILLS':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    skills: action.payload,
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'ADD_EXPERIENCE':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    experience: [...state.resumeData.experience, action.payload],
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'UPDATE_EXPERIENCE':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    experience: state.resumeData.experience.map(exp =>
                        exp.id === action.payload.id ? { ...exp, ...action.payload.data } : exp
                    ),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'DELETE_EXPERIENCE':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    experience: state.resumeData.experience.filter(exp => exp.id !== action.payload),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'REORDER_EXPERIENCE':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    experience: action.payload,
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'ADD_PROJECT':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    projects: [...state.resumeData.projects, action.payload],
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'UPDATE_PROJECT':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    projects: state.resumeData.projects.map(proj =>
                        proj.id === action.payload.id ? { ...proj, ...action.payload.data } : proj
                    ),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'DELETE_PROJECT':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    projects: state.resumeData.projects.filter(proj => proj.id !== action.payload),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'REORDER_PROJECTS':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    projects: action.payload,
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'ADD_CERTIFICATION':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    certifications: [...state.resumeData.certifications, action.payload],
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'UPDATE_CERTIFICATION':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    certifications: state.resumeData.certifications.map(cert =>
                        cert.id === action.payload.id ? { ...cert, ...action.payload.data } : cert
                    ),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'DELETE_CERTIFICATION':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    certifications: state.resumeData.certifications.filter(cert => cert.id !== action.payload),
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'UPDATE_SOCIAL_LINKS':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    socialLinks: { ...state.resumeData.socialLinks, ...action.payload },
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'SET_TEMPLATE':
            return {
                ...state,
                resumeData: {
                    ...state.resumeData,
                    templateId: action.payload,
                    updatedAt: new Date().toISOString(),
                },
            };

        case 'SET_STEP':
            return {
                ...state,
                currentStep: action.payload,
            };

        case 'MARK_STEP_COMPLETE':
            return {
                ...state,
                completedSteps: state.completedSteps.includes(action.payload)
                    ? state.completedSteps
                    : [...state.completedSteps, action.payload],
            };

        case 'LOAD_RESUME':
            return {
                ...state,
                resumeData: action.payload,
            };

        case 'RESET_RESUME':
            return initialState;

        case 'SET_VALIDATION_ERROR':
            return {
                ...state,
                validationErrors: {
                    ...state.validationErrors,
                    [action.payload.field]: action.payload.error,
                },
            };

        case 'CLEAR_VALIDATION_ERROR':
            const { [action.payload]: _, ...remainingErrors } = state.validationErrors;
            return {
                ...state,
                validationErrors: remainingErrors,
            };

        default:
            return state;
    }
}

interface ResumeContextType {
    state: ResumeState;
    dispatch: React.Dispatch<ResumeAction>;
    isFormValid: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(resumeReducer, initialState);

    // Compute form validity
    const isFormValid = Object.keys(state.validationErrors).length === 0;

    // Auto-save to localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('resumeData', JSON.stringify(state.resumeData));
        }, 1000); // Debounce saves by 1 second

        return () => clearTimeout(timer);
    }, [state.resumeData]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('resumeData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                dispatch({ type: 'LOAD_RESUME', payload: data });
            } catch (error) {
                console.error('Failed to load saved resume:', error);
            }
        }
    }, []);

    return (
        <ResumeContext.Provider value={{ state, dispatch, isFormValid }}>
            {children}
        </ResumeContext.Provider>
    );
}

export function useResume() {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within ResumeProvider');
    }
    return context;
}
