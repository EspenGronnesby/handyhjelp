import { z } from 'zod';

// Sanitization helpers
const sanitizeString = (value: string) => value.trim().replace(/\s+/g, ' ');
const sanitizePhone = (value: string) => value.replace(/[^0-9]/g, '');

// Custom validators
const norwegianNameRegex = /^[a-zA-ZæøåÆØÅ\s\-'\.]+$/;
const phoneRegex = /^[0-9]{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Step 1: Customer type
export const customerTypeSchema = z.object({
  type: z.enum(['private', 'business'], {
    required_error: 'Velg kundetype',
    invalid_type_error: 'Ugyldig kundetype',
  }),
});

// Step 2: Contact information - Base fields
const baseContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Navn er påkrevd')
    .min(2, 'Navn må være minst 2 tegn')
    .max(100, 'Navn kan ikke være mer enn 100 tegn')
    .refine((val) => norwegianNameRegex.test(val), {
      message: 'Navn kan kun inneholde bokstaver, mellomrom og bindestrek',
    })
    .transform(sanitizeString),

  email: z
    .string()
    .min(1, 'E-post er påkrevd')
    .max(255, 'E-post kan ikke være mer enn 255 tegn')
    .refine((val) => emailRegex.test(val), {
      message: 'Ugyldig e-postadresse',
    })
    .transform((val) => val.trim().toLowerCase()),

  phone: z
    .string()
    .min(1, 'Telefonnummer er påkrevd')
    .transform(sanitizePhone)
    .refine((val) => phoneRegex.test(val), {
      message: 'Telefonnummer må være nøyaktig 8 siffer',
    }),
});

// Private customer schema (requires address)
export const privateContactSchema = baseContactSchema.extend({
  type: z.literal('private'),
  address: z
    .string()
    .min(1, 'Adresse er påkrevd')
    .min(5, 'Adresse må være minst 5 tegn')
    .max(200, 'Adresse kan ikke være mer enn 200 tegn')
    .transform(sanitizeString),
});

// Business customer schema (requires company selection)
export const businessContactSchema = baseContactSchema.extend({
  type: z.literal('business'),
  selectedCompany: z
    .object({
      orgNumber: z.string().min(1),
      name: z.string().min(1),
      organizationForm: z.string(),
      address: z.string(),
      postalCode: z.string(),
      city: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Vennligst finn og velg din bedrift fra Brønnøysundregistrene',
    }),
  address: z.string().optional(),
});

// Business customer schema for logged-in users (company already known)
export const businessContactLoggedInSchema = baseContactSchema.extend({
  type: z.literal('business'),
  selectedCompany: z
    .object({
      orgNumber: z.string(),
      name: z.string(),
      organizationForm: z.string(),
      address: z.string(),
      postalCode: z.string(),
      city: z.string(),
    })
    .nullable()
    .optional(),
  address: z.string().optional(),
});

// Step 3: Description
export const descriptionSchema = z.object({
  description: z
    .string()
    .min(1, 'Beskrivelse er påkrevd')
    .min(10, 'Beskrivelse må være minst 10 tegn')
    .max(2000, 'Beskrivelse kan ikke være mer enn 2000 tegn')
    .transform(sanitizeString),
});

// Validation functions
export function validateCustomerType(type: string | null): { success: boolean; errors: Record<string, string> } {
  const result = customerTypeSchema.safeParse({ type });
  
  if (result.success) {
    return { success: true, errors: {} };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0] as string;
    errors[field] = err.message;
  });
  
  return { success: false, errors };
}

export function validateContactInfo(
  data: {
    type: 'private' | 'business' | null;
    name: string;
    email: string;
    phone: string;
    address: string;
    selectedCompany: any;
  },
  isLoggedIn: boolean
): { success: boolean; errors: Record<string, string>; sanitizedData?: any } {
  const errors: Record<string, string> = {};
  
  if (!data.type) {
    return { success: false, errors: { type: 'Velg kundetype' } };
  }

  let schema;
  if (data.type === 'private') {
    schema = privateContactSchema;
  } else if (isLoggedIn) {
    schema = businessContactLoggedInSchema;
  } else {
    schema = businessContactSchema;
  }

  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, errors: {}, sanitizedData: result.data };
  }

  result.error.errors.forEach((err) => {
    const field = err.path[0] as string;
    // Map 'selectedCompany' errors to 'company' for UI consistency
    const errorField = field === 'selectedCompany' ? 'company' : field;
    if (!errors[errorField]) {
      errors[errorField] = err.message;
    }
  });

  return { success: false, errors };
}

export function validateDescription(description: string): { 
  success: boolean; 
  errors: Record<string, string>; 
  sanitizedData?: { description: string } 
} {
  const result = descriptionSchema.safeParse({ description });
  
  if (result.success) {
    return { 
      success: true, 
      errors: {}, 
      sanitizedData: { description: result.data.description } 
    };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0] as string;
    errors[field] = err.message;
  });
  
  return { success: false, errors };
}

// Full form validation for submission
export function validateFullForm(
  data: {
    type: 'private' | 'business' | null;
    name: string;
    email: string;
    phone: string;
    address: string;
    selectedCompany: any;
    description: string;
  },
  isLoggedIn: boolean
): { success: boolean; errors: Record<string, string>; sanitizedData?: {
  type: 'private' | 'business';
  name: string;
  email: string;
  phone: string;
  address?: string;
  selectedCompany?: any;
  description: string;
} } {
  const contactValidation = validateContactInfo(data, isLoggedIn);
  if (!contactValidation.success) {
    return { success: false, errors: contactValidation.errors };
  }

  const descriptionValidation = validateDescription(data.description);
  if (!descriptionValidation.success) {
    return { success: false, errors: descriptionValidation.errors };
  }

  return {
    success: true,
    errors: {},
    sanitizedData: {
      ...contactValidation.sanitizedData!,
      description: descriptionValidation.sanitizedData!.description,
    },
  };
}
