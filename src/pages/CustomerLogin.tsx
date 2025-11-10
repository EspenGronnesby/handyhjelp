import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const { loading, error, login } = useCustomerAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <img 
            src="/src/assets/handyhjelp-logo.png" 
            alt="HandyHjelp" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground">Kundeportal</h1>
          <p className="text-muted-foreground">
            Se dine fullførte prosjekter
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logg inn</CardTitle>
            <CardDescription>
              Skriv inn e-postadressen din for å se dine prosjekter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="din@epost.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logger inn..." : "Logg inn"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Trenger du hjelp? Kontakt oss på{" "}
          <a href="mailto:handyhjelp@gmail.com" className="text-primary hover:underline">
            handyhjelp@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
