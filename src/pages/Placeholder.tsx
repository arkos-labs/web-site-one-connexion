import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, ArrowLeft, Construction } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description?: string;
}

const Placeholder = ({ title, description = "Cette page est en cours de développement." }: PlaceholderProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-medium">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-8 w-8 text-cta" />
            <span className="text-xl font-display font-bold">One Connexion Express</span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-cta text-cta hover:bg-cta hover:text-cta-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto p-12 text-center shadow-strong border-0">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-hero flex items-center justify-center">
            <Construction className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary mb-4">{title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{description}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/">
              <Button variant="cta" size="lg">
                Retour à l'accueil
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Se connecter
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Placeholder;
