import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResumeProvider } from "@/contexts/ResumeContext";
import ResumeWizard from "@/components/wizard/ResumeWizard";

export default function ResumeGenerator() {
  return (
    <ResumeProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />

        <main className="flex-grow py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Create Your Professional Resume
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Build a stunning, ATS-friendly resume in minutes with our step-by-step wizard.
                Powered by AI to help you stand out.
              </p>
            </div>

            <ResumeWizard />
          </div>
        </main>

        <Footer />
      </div>
    </ResumeProvider>
  );
}
