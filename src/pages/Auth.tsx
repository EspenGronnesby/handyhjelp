import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home, Building2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { CompanySearch } from '@/components/CompanySearch';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  orgNumber: string;
  name: string;
  organizationForm: string;
  address: string;
  postalCode: string;
  city: string;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState<'private' | 'business' | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if this is a password reset callback
  useEffect(() => {
    const resetParam = searchParams.get('reset');
    if (resetParam === 'true') {
      setIsResettingPassword(true);
    }
  }, [searchParams]);

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
        
        // Bedriftskunder må velge en bedrift
        if (customerType === 'business' && !selectedCompany) {
          toast({
            title: 'Feil',
            description: 'Vennligst søk opp og velg din bedrift',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(
          email, 
          password, 
          fullName, 
          phone, 
          customerType,
          selectedCompany?.orgNumber,
          selectedCompany?.name
        );
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Feil',
        description: 'Vennligst skriv inn e-postadressen din.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      toast({
        title: 'E-post sendt!',
        description: 'Sjekk innboksen din for lenke til å tilbakestille passordet.'
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende e-post. Sjekk at e-postadressen er riktig.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: 'Feil',
        description: 'Passordet må være minst 6 tegn.',
        variant: 'destructive'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Feil',
        description: 'Passordene stemmer ikke overens.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast({
        title: 'Passord oppdatert!',
        description: 'Du kan nå logge inn med ditt nye passord.'
      });
      
      setIsResettingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere passord. Prøv igjen.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Form (after clicking email link)
  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sett nytt passord
            </CardTitle>
            <CardDescription className="text-center">
              Velg et nytt passord for din konto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nytt passord</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minst 6 tegn"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bekreft passord</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Skriv passordet på nytt"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Oppdater passord
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot Password Form
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Glemt passord
            </CardTitle>
            <CardDescription className="text-center">
              Skriv inn e-postadressen din så sender vi deg en lenke for å tilbakestille passordet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">E-post sendt!</h3>
                <p className="text-muted-foreground text-sm">
                  Vi har sendt en e-post til <strong>{email}</strong> med en lenke for å tilbakestille passordet ditt.
                </p>
                <p className="text-muted-foreground text-sm">
                  Sjekk også spam-mappen hvis du ikke finner e-posten.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetEmailSent(false);
                    setEmail('');
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbake til innlogging
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="din@epost.no"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send tilbakestillingslenke
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setEmail('');
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbake til innlogging
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    placeholder="8 siffer"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(value);
                    }}
                    maxLength={8}
                    inputMode="numeric"
                    pattern="[0-9]*"
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
                      onClick={() => {
                        setCustomerType('business');
                        setSelectedCompany(null);
                      }}
                    >
                      <Building2 className="h-7 w-7 md:h-6 md:w-6" />
                      <span className="text-sm md:text-base">Bedrift</span>
                    </Button>
                  </div>
                </div>
                
                {/* Vis CompanySearch når bedrift er valgt */}
                {customerType === 'business' && (
                  <div className="space-y-2">
                    <CompanySearch
                      onCompanySelect={setSelectedCompany}
                      selectedCompany={selectedCompany}
                      disabled={loading}
                    />
                  </div>
                )}
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
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Glemt passord?
                </button>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Logg inn' : 'Opprett konto'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Ingen konto?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Opprett her
                </button>
              </>
            ) : (
              <>
                Har konto?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Logg inn
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
