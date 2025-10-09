import { FileText, Search, FilePenLine } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent leading-tight" data-testid="text-hero-title">
              Build Your Dream Career
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered resume and CV tools designed for Gen Z professionals. Get hired faster with ATS-optimized documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Resume Generator"
              description="Create professional ATS-friendly resumes in minutes with our AI-powered generator and stunning templates"
              icon={FileText}
              href="/resume-generator"
              gradient="bg-gradient-to-br from-primary/10 to-chart-2/10"
            />
            <FeatureCard
              title="Resume Screening"
              description="Get instant ATS score analysis and personalized recommendations to improve your resume"
              icon={Search}
              href="/resume-screening"
              gradient="bg-gradient-to-br from-chart-2/10 to-chart-3/10"
            />
            <FeatureCard
              title="CV Generator"
              description="Build comprehensive CVs for academic and research positions with expert templates"
              icon={FilePenLine}
              href="/cv-generator"
              gradient="bg-gradient-to-br from-chart-3/10 to-primary/10"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
