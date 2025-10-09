import { Link, useLocation } from "wouter";
import { Moon, Sun, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home-logo">
            <a className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                ResuMind AI
              </span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" data-testid="link-home">
              <a className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                isActive("/") ? "bg-primary/10 text-primary" : "text-foreground"
              }`}>
                Home
              </a>
            </Link>
            <Link href="/resume-generator" data-testid="link-resume-generator">
              <a className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                isActive("/resume-generator") ? "bg-primary/10 text-primary" : "text-foreground"
              }`}>
                Resume Generator
              </a>
            </Link>
            <Link href="/resume-screening" data-testid="link-resume-screening">
              <a className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                isActive("/resume-screening") ? "bg-primary/10 text-primary" : "text-foreground"
              }`}>
                Resume Screening
              </a>
            </Link>
            <Link href="/cv-generator" data-testid="link-cv-generator">
              <a className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                isActive("/cv-generator") ? "bg-primary/10 text-primary" : "text-foreground"
              }`}>
                CV Generator
              </a>
            </Link>
            <Link href="/about" data-testid="link-about">
              <a className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                isActive("/about") ? "bg-primary/10 text-primary" : "text-foreground"
              }`}>
                About
              </a>
            </Link>
            <Link href="/contact" data-testid="link-contact">
              <a className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                isActive("/contact") ? "bg-primary/10 text-primary" : "text-foreground"
              }`}>
                Contact
              </a>
            </Link>
          </nav>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="rounded-full"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
