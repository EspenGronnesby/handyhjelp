import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useCustomerProjects } from "@/hooks/useCustomerProjects";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { ProjectCard } from "@/components/customer/ProjectCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CustomerPortal = () => {
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const { projects, loading, error, refetch } = useCustomerProjects(customer?.email);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/kunde-innlogging");
    }
  }, [isAuthenticated, navigate]);

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CustomerHeader customerName={customer.name} onLogout={logout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Mine fullførte prosjekter
            </h1>
            <p className="text-muted-foreground">
              Oversikt over alle dine fullførte oppdrag
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={refetch}>
                  Prøv igjen
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <p className="text-lg text-muted-foreground">
                Ingen fullførte prosjekter ennå
              </p>
              <p className="text-sm text-muted-foreground">
                Kontakt oss på{" "}
                <a href="mailto:handyhjelp@gmail.com" className="text-primary hover:underline">
                  handyhjelp@gmail.com
                </a>
              </p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Har du spørsmål? Kontakt oss:
          </p>
          <a
            href="mailto:handyhjelp@gmail.com"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            handyhjelp@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
};

export default CustomerPortal;
