import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center px-4">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-4">Siden ble ikke funnet</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Beklager, siden du leter etter eksisterer ikke eller har blitt flyttet.
          </p>
          <Link to="/">
            <Button variant="cta" size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              Tilbake til forsiden
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
