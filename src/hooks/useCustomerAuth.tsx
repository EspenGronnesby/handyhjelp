import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerSession } from "@/types/customer";
import { loginCustomer, isValidEmail } from "@/lib/customerApi";
import { toast } from "sonner";

const STORAGE_KEY = "handyhjelp_customer_session";

export const useCustomerAuth = () => {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored) as CustomerSession;
        if (session.email && session.name) {
          setCustomer(session);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Session check error:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string) => {
    setLoading(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Ugyldig e-postadresse");
      setLoading(false);
      return;
    }

    try {
      const response = await loginCustomer(email);

      if (response.success && response.customer) {
        if (response.projectCount === 0) {
          setError("Du har ingen registrerte prosjekter ennå. Kontakt oss på handyhjelp@gmail.com");
          setLoading(false);
          return;
        }

        const session: CustomerSession = {
          email: response.customer.email,
          name: response.customer.name,
          projectCount: response.projectCount || 0,
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setCustomer(session);
        toast.success("Velkommen!");
        navigate("/kunde-portal");
      } else {
        setError(response.error || "Innlogging feilet. Vennligst prøv igjen.");
      }
    } catch (error) {
      setError("En feil oppstod. Vennligst prøv igjen.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomer(null);
    toast.success("Du er nå logget ut");
    navigate("/kunde-innlogging");
  };

  return {
    customer,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!customer,
  };
};
