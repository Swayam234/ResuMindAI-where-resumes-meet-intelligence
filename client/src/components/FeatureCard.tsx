import { Link } from "wouter";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
}

export default function FeatureCard({ title, description, icon: Icon, href, gradient }: FeatureCardProps) {
  return (
    <Link href={href} data-testid={`link-feature-${href.replace("/", "")}`}>
      <a>
        <Card className={`h-64 p-8 border-2 hover-elevate active-elevate-2 transition-all duration-300 hover:-translate-y-1 ${gradient}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-background/50 backdrop-blur">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground">{title}</h3>
            </div>
            <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
            <div className="flex items-center gap-2 text-primary font-semibold">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </a>
    </Link>
  );
}
