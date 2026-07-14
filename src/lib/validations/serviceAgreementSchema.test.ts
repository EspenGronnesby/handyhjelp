import { describe, it, expect } from "vitest";
import { serviceAgreementSchema } from "./serviceAgreementSchema";

// Regresjonstester for fastavtale-skjemaets validering.
// Bakgrunn: skjemaet manglet stegvalidering — kunder kunne klikke seg
// gjennom alle steg uten utfylling og få en «død» send-knapp.

const gyldigSkjema = {
  customerType: "borettslag",
  address: "Storgata 1, 4612 Kristiansand",
  services: ["vaktmester"],
  frequency: "ukentlig",
  fixedContactPerson: false,
  contractDuration: "12mnd",
  currentSituation: "har_ingen",
  contactPerson: "Ola Nordmann",
  contactRole: "styreleder",
  email: "ola@example.com",
  phone: "12345678",
};

describe("serviceAgreementSchema", () => {
  it("godtar et komplett, gyldig skjema", () => {
    const result = serviceAgreementSchema.safeParse(gyldigSkjema);
    expect(result.success).toBe(true);
  });

  it("avviser tom adresse med norsk feilmelding", () => {
    const result = serviceAgreementSchema.safeParse({ ...gyldigSkjema, address: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "address")?.message;
      expect(msg).toBe("Adresse er påkrevd");
    }
  });

  it("krever minst én tjeneste", () => {
    const result = serviceAgreementSchema.safeParse({ ...gyldigSkjema, services: [] });
    expect(result.success).toBe(false);
  });

  it("krever nøyaktig 8 siffer i telefonnummer (norsk format)", () => {
    expect(serviceAgreementSchema.safeParse({ ...gyldigSkjema, phone: "1234567" }).success).toBe(false);
    expect(serviceAgreementSchema.safeParse({ ...gyldigSkjema, phone: "123456789" }).success).toBe(false);
    // Mellomrom skal vaskes bort før sjekk
    expect(serviceAgreementSchema.safeParse({ ...gyldigSkjema, phone: "12 34 56 78" }).success).toBe(true);
  });

  it("avviser ugyldig e-postadresse", () => {
    expect(serviceAgreementSchema.safeParse({ ...gyldigSkjema, email: "ikke-epost" }).success).toBe(false);
  });

  it("godtar navn med æøå", () => {
    expect(
      serviceAgreementSchema.safeParse({ ...gyldigSkjema, contactPerson: "Åse Følgesvenn-Øyen" }).success
    ).toBe(true);
  });
});
