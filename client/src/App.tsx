import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import ResumeGenerator from "@/pages/ResumeGenerator";
import ResumeScreening from "@/pages/ResumeScreening";
import CVGenerator from "@/pages/CVGenerator";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import MockInterviewDashboard from "@/pages/Interview/MockInterviewDashboard";
import InterviewSession from "@/pages/Interview/InterviewSession";
import InterviewResult from "@/pages/Interview/InterviewResult";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/resume-generator" component={ResumeGenerator} />
      <Route path="/resume-screening" component={ResumeScreening} />
      <Route path="/cv-generator" component={CVGenerator} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/mock-interview" component={MockInterviewDashboard} />
      <Route path="/mock-interview/:id" component={InterviewSession} />
      <Route path="/mock-interview/:id/result" component={InterviewResult} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
