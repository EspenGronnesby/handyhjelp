import { z } from 'zod';

// Sanitization helpers
const sanitizeString = (value: string) => value.trim().replace(/\s+/g, ' ');
const sanitizePhone = (value: string) => value.replace(/[^0-9]/g, '');

// Custom validators
const norwegianNameRegex = /^[a-zA-ZæøåÆØÅ\s\-'\.]+$/;
const phoneRegex = /^[0-9]{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const serviceAgreementSchema = z.object({
  customerType: z.enum(["borettslag", "bedrift", "privat", "annet"], {
    required_error: "Velg kundetype",
    invalid_type_error: "Ugyldig kundetype",
  }),

  unitsCount: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),

  totalArea: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),

  address: z
    .string()
    .min(1, "Adresse er påkrevd")
    .min(5, "Adresse må være minst 5 tegn")
    .max(200, "Adresse kan ikke være mer enn 200 tegn")
    .transform(sanitizeString),

  services: z
    .array(z.string())
    .min(1, "Velg minst én tjeneste"),

  otherServices: z
    .string()
    .max(500, "Beskrivelse kan ikke være mer enn 500 tegn")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),

  frequency: z
    .string()
    .min(1, "Frekvens er påkrevd"),

  fixedContactPerson: z.boolean(),

  contractDuration: z
    .string()
    .min(1, "Avtalevarighet er påkrevd"),

  customContractDuration: z
    .string()
    .max(100, "Kan ikke være mer enn 100 tegn")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),

  startDate: z.date().optional(),

  currentSituation: z
    .string()
    .min(1, "Vennligst velg et alternativ"),

  contactPerson: z
    .string()
    .min(1, "Kontaktperson er påkrevd")
    .min(2, "Navn må være minst 2 tegn")
    .max(100, "Navn kan ikke være mer enn 100 tegn")
    .refine((val) => norwegianNameRegex.test(val), {
      message: "Navn kan kun inneholde bokstaver, mellomrom og bindestrek",
    })
    .transform(sanitizeString),

  contactRole: z
    .string()
    .min(1, "Rolle er påkrevd"),

  customContactRole: z
    .string()
    .max(100, "Kan ikke være mer enn 100 tegn")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),

  email: z
    .string()
    .min(1, "E-post er påkrevd")
    .max(255, "E-post kan ikke være mer enn 255 tegn")
    .refine((val) => emailRegex.test(val), {
      message: "Ugyldig e-postadresse",
    })
    .transform((val) => val.trim().toLowerCase()),

  phone: z
    .string()
    .min(1, "Telefonnummer er påkrevd")
    .transform(sanitizePhone)
    .refine((val) => phoneRegex.test(val), {
      message: "Telefonnummer må være nøyaktig 8 siffer",
    }),

  additionalInfo: z
    .string()
    .max(2000, "Tilleggsinformasjon kan ikke være mer enn 2000 tegn")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
});

export type ServiceAgreementFormData = z.infer<typeof serviceAgreementSchema>;
