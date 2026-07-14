import { describe, it, expect } from "vitest";
import { isKnownPath, KNOWN_ROUTE_PREFIXES } from "./routes";

// Regresjonstest for 404-dørvakten i AppRouter.
// Bakgrunn: /anmeldelse manglet i allowlisten og hele anmeldelsesfunnelen
// (lenket fra send-feedback-request-e-poster) ga 404 i produksjon.

describe("isKnownPath", () => {
  it("godtar anmeldelsessiden med jobb-id (lenkes fra e-post)", () => {
    expect(isKnownPath("/anmeldelse/123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });

  it("godtar alle offentlige hovedsider", () => {
    for (const path of [
      "/",
      "/tilbud",
      "/fast-avtale",
      "/prosjekter",
      "/prosjekter/en-id",
      "/raad",
      "/raad/en-artikkel",
      "/tjenester/vaktmester",
      "/kontakt",
      "/auth",
      "/dashboard",
      "/dashboard/admin",
    ]) {
      expect(isKnownPath(path), `${path} skal være en gyldig rute`).toBe(true);
    }
  });

  it("avviser ukjente ruter (skal gi 404)", () => {
    for (const path of ["/finnes-ikke", "/anmeldels", "/admin-hemmelig", "/tilbudX"]) {
      expect(isKnownPath(path), `${path} skal gi 404`).toBe(false);
    }
  });

  it("rot-ruten matcher kun eksakt '/'", () => {
    expect(isKnownPath("/")).toBe(true);
    // Alt annet må matche et spesifikt prefiks, ikke '/' + hva som helst
    expect(isKnownPath("/tullball")).toBe(false);
  });

  it("allowlisten inneholder ingen duplikater", () => {
    expect(new Set(KNOWN_ROUTE_PREFIXES).size).toBe(KNOWN_ROUTE_PREFIXES.length);
  });
});
