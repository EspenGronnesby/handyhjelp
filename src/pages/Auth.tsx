import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home, Building2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState<'private' | 'business' | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: 'Velkommen tilbake!',
          description: 'Du er nå logget inn.'
        });
        navigate('/dashboard');
      } else {
        if (!fullName || !phone || !customerType) {
          toast({
            title: 'Feil',
            description: 'Vennligst fyll ut alle felter',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, phone, customerType);
        if (error) throw error;
        toast({
          title: 'Konto opprettet!',
          description: 'Du er nå logget inn og kan begynne å bruke dashboardet.'
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      let errorMessage = 'Noe gikk galt. Prøv igjen.';
      
      // Provide specific error messages for known issues
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = 'Denne e-posten er allerede registrert. Prøv å logge inn i stedet.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Ugyldig e-post eller passord. Vennligst prøv igjen.';
      } else if (error.message?.includes('invalid email') || error.message?.includes('Email')) {
        errorMessage = 'Ugyldig e-postadresse. Vennligst sjekk og prøv igjen.';
      } else if (error.message?.includes('password') || error.message?.includes('Password')) {
        errorMessage = 'Passordet må være minst 6 tegn langt.';
      } else if (error.message?.includes('Database error') || error.message?.includes('constraint')) {
        errorMessage = 'Kunne ikke opprette konto. Vennligst prøv igjen eller kontakt support hvis problemet vedvarer.';
      }
      
      toast({
        title: 'Feil',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Logg inn' : 'Opprett konto'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? 'Logg inn for å se dine tilbud og jobber'
              : 'Opprett en konto for å holde oversikt over dine forespørsler'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Fullt navn</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ola Nordmann"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+47 123 45 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium">Privat eller bedrift?</Label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <Button
                      type="button"
                      variant={customerType === "private" ? "default" : "outline"}
                      className="h-24 md:h-20 flex flex-col items-center justify-center space-y-2 active:scale-95"
                      onClick={() => setCustomerType('private')}
                    >
                      <Home className="h-7 w-7 md:h-6 md:w-6" />
                      <span className="text-sm md:text-base">Privat</span>
                    </Button>
                    <Button
                      type="button"
                      variant={customerType === "business" ? "default" : "outline"}
                      className="h-24 md:h-20 flex flex-col items-center justify-center space-y-2 active:scale-95"
                      onClick={() => setCustomerType('business')}
                    >
                      <Building2 className="h-7 w-7 md:h-6 md:w-6" />
                      <span className="text-sm md:text-base">Bedrift</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@epost.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Logg inn' : 'Opprett konto'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin
                ? 'Har du ikke en konto? Opprett en her'
                : 'Har du allerede en konto? Logg inn'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
