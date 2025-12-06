import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const WEB3FORMS_ACCESS_KEY = "e73de942-c444-45b1-ba7a-1556f5862bfd";
const WEB3FORMS_URL = "https://api.web3forms.com/submit";

interface Web3FormsData {
  subject: string;
  from_name?: string;
  [key: string]: any;
}

interface ConfirmationEmailData {
  name: string;
  email: string;
  phone?: string;
  customerType?: string;
}

interface AgreementConfirmationData {
  contactPerson: string;
  email: string;
}

interface UseWeb3FormsReturn {
  submitToWeb3Forms: (data: Web3FormsData) => Promise<boolean>;
  sendConfirmationEmail: (data: ConfirmationEmailData) => Promise<boolean>;
  sendAgreementConfirmation: (data: AgreementConfirmationData) => Promise<boolean>;
}

export function useWeb3Forms(): UseWeb3FormsReturn {
  const submitToWeb3Forms = useCallback(async (data: Web3FormsData): Promise<boolean> => {
    try {
      const formData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        from_name: data.from_name || "HandyHjelp Nettside",
        ...data,
      };

      const response = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Web3Forms error:", errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Web3Forms submission error:", error);
      return false;
    }
  }, []);

  const sendConfirmationEmail = useCallback(async (data: ConfirmationEmailData): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke("send-confirmation-email", {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          customerType: data.customerType || "private",
        },
      });

      if (error) {
        console.error("Confirmation email error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      return false;
    }
  }, []);

  const sendAgreementConfirmation = useCallback(async (data: AgreementConfirmationData): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke("send-agreement-confirmation", {
        body: {
          contactPerson: data.contactPerson,
          email: data.email,
        },
      });

      if (error) {
        console.error("Agreement confirmation email error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to send agreement confirmation:", error);
      return false;
    }
  }, []);

  return {
    submitToWeb3Forms,
    sendConfirmationEmail,
    sendAgreementConfirmation,
  };
}
