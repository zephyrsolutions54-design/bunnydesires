import { Heart, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { SEOHead } from "@/components/SEOHead";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

const PageLayout = ({ title, children, lastUpdated }: PageLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={title} path={location.pathname} />
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary fill-primary" />
              <span className="font-display font-bold text-lg text-gradient">
                Bunny Desires
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="font-display text-4xl font-bold mb-4">{title}</h1>
        {lastUpdated && (
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
        )}

        <div className="prose prose-invert max-w-none space-y-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
