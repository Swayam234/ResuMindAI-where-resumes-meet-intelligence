import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardTitle, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, MicOff, Send, CheckCircle2, AlertCircle, ArrowRight, Video, Timer, EyeOff, MonitorOff, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { WebcamPreview } from "@/components/WebcamPreview";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

// Types
interface Interview {
    id: string;
    jobTitle: string;
    experienceLevel: string;
    status: string;
}
interface Question {
    id: string;
    question: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
}
interface Answer {
    questionId: string;
    userAnswer: string;
    feedback?: any;
}

// Configuration
const THINKING_TIME_SEC = 30;
const ANSWER_TIME_SEC = 120; // 2 minutes
const MAX_VIOLATIONS = 3;

export default function InterviewSession() {
    const [, params] = useRoute("/mock-interview/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Session Data
    const [interview, setInterview] = useState<Interview | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);

    // Interview Flow State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer State
    const [phase, setPhase] = useState<'thinking' | 'answering'>('thinking');
    const [timeLeft, setTimeLeft] = useState(THINKING_TIME_SEC);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Proctoring State
    const [violations, setViolations] = useState(0);
    const [cameraError, setCameraError] = useState(false);
    const [integrityScore, setIntegrityScore] = useState(100);
    const [isPhoneDetected, setIsPhoneDetected] = useState(false);

    // AI Model
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const requestRef = useRef<number>();

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Load Session
    useEffect(() => {
        if (params?.id) fetchSession(params.id);
    }, [params?.id]);

    // Load AI Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                console.log("AI Proctoring Model Loaded");
            } catch (err) {
                console.error("Failed to load AI model", err);
            }
        };
        loadModel();
    }, []);

    // Object Detection Loop
    const detectFrame = useCallback(async () => {
        if (model && videoRef.current && videoRef.current.readyState === 4) {
            try {
                const predictions = await model.detect(videoRef.current);
                const foundPhone = predictions.find(p => p.class === "cell phone" && p.score > 0.6);

                if (foundPhone) {
                    setIsPhoneDetected(true);
                    handleCriticalViolation("Phone Detected");
                } else {
                    setIsPhoneDetected(false);
                }
            } catch (e) {
                // error during detection (e.g. video not ready)
            }
        }
        requestRef.current = requestAnimationFrame(detectFrame);
    }, [model]);

    useEffect(() => {
        if (model) {
            requestRef.current = requestAnimationFrame(detectFrame);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [model, detectFrame]);


    // Anti-Cheating: Tab Visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !loading && interview) {
                recordViolation("Tab Switch / Minimized", 25);
            }
        };

        const handleBlur = () => {
            if (!loading && interview) {
                recordViolation("Window Focus Loss", 15);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, [loading, interview, violations]); // Added violations to dependencies to ensure state is fresh

    // Timer Logic
    useEffect(() => {
        if (loading || !interview) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimerExpiry();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase, loading, interview]);

    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                }
                if (finalTranscript) setUserAnswer(prev => prev + " " + finalTranscript);
            };
        }
    }, []);

    const fetchSession = async (id: string) => {
        try {
            const res = await apiRequest("GET", `/api/interviews/${id}`);
            const data = await res.json();
            setInterview(data.interview);
            setQuestions(data.questions);

            // Resume logic
            const answeredIds = new Set(data.answers.map((a: any) => a.questionId));
            const firstUnanswered = data.questions.findIndex((q: any) => !answeredIds.has(q.id));

            if (firstUnanswered !== -1) {
                setCurrentIndex(firstUnanswered);
            } else if (data.questions.length > 0 && data.questions.length === data.answers.length) {
                setLocation(`/mock-interview/${id}/result`);
                return;
            }

            setLoading(false);
            startQuestionTimer();
        } catch (error) {
            toast({ title: "Error", description: "Failed to load session", variant: "destructive" });
        }
    };

    const recordViolation = (type: string, penalty = 10) => {
        // Prevent recording if already terminated or loading
        if (!interview || violations >= MAX_VIOLATIONS) return;

        // Update score ensuring it doesn't go below 0
        const newScore = Math.max(0, integrityScore - penalty);
        setIntegrityScore(newScore);

        const newCount = violations + 1;
        setViolations(newCount);

        toast({
            title: "⚠️ Integrity Violation Detected",
            description: `${type}. Warning ${newCount}/${MAX_VIOLATIONS}. Integrity Score: ${newScore}%`,
            variant: "destructive",
            duration: 5000
        });

        if (newCount >= MAX_VIOLATIONS) {
            terminateInterview("Multiple integrity violations limit reached.");
        }
    };

    const handleCriticalViolation = (type: string) => {
        if (!interview) return;
        // Check if already terminating to avoid loops
        if (integrityScore === 0 && violations >= MAX_VIOLATIONS) return;

        setIntegrityScore(0);
        terminateInterview(`CRITICAL: ${type}. Immediate Termination.`);
    };

    const startQuestionTimer = () => {
        setPhase('thinking');
        setTimeLeft(THINKING_TIME_SEC);
    };

    const handleTimerExpiry = () => {
        if (phase === 'thinking') {
            setPhase('answering');
            setTimeLeft(ANSWER_TIME_SEC);
        } else {
            // Answering time over
            handleSubmitAnswer(true); // Auto submit
        }
    };

    const skipThinking = () => {
        setPhase('answering');
        setTimeLeft(ANSWER_TIME_SEC);
    };

    const toggleListening = () => {
        if (!isSupported) return;
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleSubmitAnswer = async (autoSubmit = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Stop timer
        if (timerRef.current) clearInterval(timerRef.current);
        if (isListening) toggleListening();

        const currentQ = questions[currentIndex];
        const timeTaken = ANSWER_TIME_SEC - timeLeft; // Approx

        try {
            // Submit answer
            await apiRequest("POST", `/api/interviews/${interview?.id}/answer`, {
                questionId: currentQ.id,
                userAnswer: userAnswer || "(No Answer Provided)",
                timeTaken
            });

            // Move to next or finish
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setUserAnswer("");
                setIsSubmitting(false);
                startQuestionTimer();
            } else {
                finishInterview();
            }

        } catch (error) {
            console.error(error);
            // If error, try to move on anyway to avoid being stuck
            setIsSubmitting(false);
        }
    };

    const finishInterview = async () => {
        try {
            await apiRequest("POST", `/api/interviews/${interview?.id}/finish`, {
                violationCount: violations,
                integrityScore: integrityScore
            });
            setLocation(`/mock-interview/${interview?.id}/result`);
        } catch (e) {
            console.error(e);
        }
    };

    // Use a ref to prevent double-termination calls
    const isTerminatingRef = useRef(false);

    const terminateInterview = async (reason: string) => {
        if (isTerminatingRef.current) return;
        isTerminatingRef.current = true;

        try {
            // Stop loops
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timerRef.current) clearInterval(timerRef.current);

            await apiRequest("POST", `/api/interviews/${interview?.id}/finish`, {
                violationCount: violations + 1, // Add the final violation
                integrityScore: 0, // Force fail score
                terminationReason: reason
            });

            toast({ title: "Interview Terminated", description: reason, variant: "destructive", duration: 10000 });
            setLocation(`/mock-interview/${interview?.id}/result`);
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 select-none" onContextMenu={(e) => e.preventDefault()}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4 space-y-4">
                            {/* Webcam Preview */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase flex justify-between">
                                    Live Monitor
                                    {isPhoneDetected && <Badge variant="destructive" className="animate-pulse">PHONE DETECTED</Badge>}
                                </h3>
                                <WebcamPreview
                                    className={`h-40 w-full ${isPhoneDetected ? 'border-4 border-red-600' : ''}`}
                                    onPermissionError={() => {
                                        setCameraError(true);
                                        recordViolation("Camera Access Denied", 30);
                                    }}
                                    onVideoRef={(ref) => { videoRef.current = ref; }}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>Integrity Status</span>
                                    <span className={integrityScore > 80 ? "text-green-500" : "text-red-500"}>{integrityScore}%</span>
                                </div>
                                <Progress value={integrityScore} className={`h-1 ${integrityScore > 80 ? 'bg-slate-800' : 'bg-red-900'}`} />
                                <div className="text-xs text-slate-500 flex flex-col gap-1">
                                    <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Violations: {violations}/{MAX_VIOLATIONS}</span>
                                    {isPhoneDetected && <span className="text-red-500 font-bold flex items-center gap-1"><Smartphone className="w-3 h-3" /> Phone Detected</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="p-4 py-3 border-b border-slate-800">
                            <CardTitle className="text-sm font-medium">Session Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Q {currentIndex + 1} of {questions.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2 bg-slate-800" />

                            <div className="space-y-2 mt-4">
                                {questions.map((q, idx) => {
                                    const isCurrent = idx === currentIndex;
                                    const isPast = idx < currentIndex;
                                    return (
                                        <div key={q.id} className={`flex items-center gap-2 text-xs p-2 rounded ${isCurrent ? 'bg-primary/20 text-primary-foreground' : 'text-slate-500'}`}>
                                            {isPast ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                                            <span className="truncate">Q{idx + 1}: {q.category}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Interaction Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Timer Banner */}
                    <div className={`rounded-xl p-4 flex items-center justify-between border-2 transition-colors ${phase === 'thinking' ? 'bg-blue-950/30 border-blue-500/30' : 'bg-amber-950/30 border-amber-500/30'}`}>
                        <div className="flex items-center gap-3">
                            {phase === 'thinking' ? <Target className="w-6 h-6 text-blue-400" /> : <Timer className="w-6 h-6 text-amber-400" />}
                            <div>
                                <h3 className={`font-bold ${phase === 'thinking' ? 'text-blue-400' : 'text-amber-400'}`}>
                                    {phase === 'thinking' ? "Thinking Time" : "Answer Time"}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {phase === 'thinking' ? "Analyze the question. You cannot type yet." : "Type your answer now."}
                                </p>
                            </div>
                        </div>
                        <div className="text-3xl font-mono font-bold tracking-widest">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                    </div>

                    <Card className="bg-slate-900 border-slate-800 shadow-xl">
                        <CardHeader>
                            <div className="flex justify-between mb-2">
                                <Badge variant="outline" className="border-slate-700 text-slate-300">{currentQuestion.category}</Badge>
                                <Badge className={currentQuestion.difficulty === 'Easy' ? 'bg-green-600' : currentQuestion.difficulty === 'Medium' ? 'bg-amber-600' : 'bg-red-600'}>
                                    {currentQuestion.difficulty}
                                </Badge>
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-relaxed">{currentQuestion.question}</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Textarea
                                    className="min-h-[300px] bg-slate-950 border-slate-800 text-lg p-6 resize-none focus:ring-primary/50 text-slate-200"
                                    placeholder={phase === 'thinking' ? "Waiting for thinking time..." : "Type your answer here..."}
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    disabled={phase === 'thinking' || isSubmitting}
                                    spellCheck={false}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        toast({ title: "Action Blocked", description: "Copy/Paste is disabled during interview.", variant: "destructive" });
                                    }}
                                />

                                {phase === 'answering' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`absolute bottom-4 right-4 rounded-full transition-colors ${isListening ? "text-red-500 bg-red-950/50 hover:bg-red-900/50" : "text-slate-500 hover:text-white"}`}
                                        onClick={toggleListening}
                                        disabled={!isSupported || isSubmitting}
                                    >
                                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end p-6 bg-slate-900/50 border-t border-slate-800 gap-3">
                            {phase === 'thinking' ? (
                                <Button onClick={skipThinking} variant="secondary" className="w-full sm:w-auto">
                                    I'm Ready to Answer <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={() => handleSubmitAnswer(false)} disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                                    Submit Answer
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <div className="flex justify-center text-xs text-slate-600 gap-6">
                        <span className="flex items-center gap-1"><MonitorOff className="w-3 h-3" /> Tab Switching Monitored</span>
                        <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Focus Tracking Active</span>
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Camera Required</span>
                        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Phone Detection</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon helper
function Target(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
