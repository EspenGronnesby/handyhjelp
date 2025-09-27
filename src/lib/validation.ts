import { z } from 'zod';

// Contact form validation schema
export const contactFormSchema = z.object({
  type: z.enum(['private', 'business'], {
    required_error: 'Velg kunde type',
  }),
  name: z.string()
    .trim()
    .min(2, { message: 'Navn må være minst 2 tegn' })
    .max(100, { message: 'Navn kan ikke være mer enn 100 tegn' })
    .regex(/^[a-zA-ZæøåÆØÅ\s\-'\.]+$/, { message: 'Navn kan kun inneholde bokstaver, bindestrek og apostrof' }),
  email: z.string()
    .trim()
    .email({ message: 'Ugyldig e-postadresse' })
    .max(255, { message: 'E-post kan ikke være mer enn 255 tegn' }),
  phone: z.string()
    .trim()
    .min(8, { message: 'Telefonnummer må være minst 8 siffer' })
    .max(15, { message: 'Telefonnummer kan ikke være mer enn 15 siffer' })
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, { message: 'Ugyldig telefonnummer format' }),
  description: z.string()
    .trim()
    .min(10, { message: 'Beskrivelse må være minst 10 tegn' })
    .max(2000, { message: 'Beskrivelse kan ikke være mer enn 2000 tegn' })
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 2000); // Limit length
};

// URL validation for external links
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Rate limiting helper (for future use)
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    userAttempts.count++;
    return true;
  };
};