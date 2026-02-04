import React, { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, RotateCcw, Home, Target, Zap, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function InterviewResult() {
    const [, params] = useRoute("/mock-interview/:id/result");
    const [, setLocation] = useLocation();
    const [interview, setInterview] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            apiRequest("GET", `/api/interviews/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setInterview(data.interview);
                    setQuestions(data.questions);
                    setAnswers(data.answers);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [params?.id]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    const score = parseFloat(interview.score || "0");
    const scoreColor = score >= 8 ? "text-green-600" : score >= 5 ? "text-yellow-600" : "text-red-600";
    const scorePercentage = (score / 10) * 100;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="inline-flex items-center justify-center p-6 bg-white rounded-full shadow-lg border-4 border-green-100 mb-2"
                    >
                        <Trophy className="w-12 h-12 text-yellow-500" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-900">Interview Complete!</h1>
                    <p className="text-slate-500">Here is how you performed in your {interview.jobTitle} interview.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className={`md:col-span-2 border-l-8 ${parseInt(interview.integrityScore || "100") < 60 ? "border-l-red-600" : "border-l-primary"}`}>
                        <CardHeader>
                            <CardTitle>Overall Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                {parseInt(interview.integrityScore || "100") < 60 ? (
                                    <div className="text-red-600 font-bold text-lg flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5" /> Session Compromised
                                    </div>
                                ) : (
                                    <div className={`text-5xl font-bold mb-2 ${scoreColor}`}>{score}/10</div>
                                )}
                                <p className="text-muted-foreground">
                                    {interview.terminationReason ? `Terminated: ${interview.terminationReason}` : interview.feedback}
                                </p>
                            </div>
                            <div className="w-1/3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Score</span>
                                    <span>{scorePercentage}%</span>
                                </div>
                                <Progress value={scorePercentage} className="h-3" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`md:col-span-1 border-l-8 ${parseInt(interview.integrityScore || "100") < 100 ? "border-l-red-500" : "border-l-blue-500"}`}>
                        <CardHeader>
                            <CardTitle>Session Integrity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-4xl font-bold mb-2 ${parseInt(interview.integrityScore || "100") < 100 ? "text-red-600" : "text-blue-600"}`}>
                                {interview.integrityScore || 100}%
                            </div>
                            <p className="text-sm text-slate-500 mb-2">
                                {interview.terminationReason || (parseInt(interview.violationCount || "0") > 0
                                    ? `${interview.violationCount} suspicious activity detected.`
                                    : "No suspicious activity detected.")
                                }
                            </p>
                            <Progress value={parseInt(interview.integrityScore || "100")} className={`h-2 ${parseInt(interview.integrityScore || "100") < 100 ? "bg-red-200" : ""}`} />
                        </CardContent>
                    </Card>

                    {/* Detailed Feedback */}
                    <div className="md:col-span-3 space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" /> Question Analysis
                        </h2>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {questions.map((q, idx) => {
                                const answer = answers.find(a => a.questionId === q.id);
                                const qScore = parseFloat(answer?.score || "0");
                                const statusColor = qScore >= 7 ? "bg-green-100 text-green-800" : qScore >= 4 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";

                                return (
                                    <AccordionItem key={q.id} value={q.id} className="border rounded-lg bg-white shadow-sm px-4">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex flex-1 items-center justify-between mr-4 text-left">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-base">Question {idx + 1}: {q.category}</span>
                                                    <span className="text-sm text-slate-500 line-clamp-1">{q.question}</span>
                                                </div>
                                                <Badge variant="outline" className={statusColor}>
                                                    {qScore}/10
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-2 pb-4">
                                            <div className="bg-slate-50 p-3 rounded border">
                                                <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Question</h4>
                                                <p className="text-sm">{q.question}</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-xs text-muted-foreground uppercase">Your Answer</h4>
                                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border h-full">{answer?.userAnswer}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-xs text-muted-foreground uppercase">Model Answer / Key Points</h4>
                                                    <p className="text-sm text-slate-700 bg-green-50/50 p-3 rounded border border-green-100 h-full">{q.modelAnswer || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50/50 p-4 rounded border border-blue-100">
                                                <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                                                    <Target className="h-4 w-4" /> AI Feedback
                                                </h4>
                                                <p className="text-sm text-slate-700 mb-2">{answer?.aiFeedback}</p>
                                                {/* Parse improvements out if needed, usually passed as string */}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-8">
                    <Button variant="outline" onClick={() => setLocation("/mock-interview")}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Start New Interview
                    </Button>
                    <Button onClick={() => setLocation("/")}>
                        <Home className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </div>

            </div>
        </div>
    );
}
