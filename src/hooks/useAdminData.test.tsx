import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Quote } from "@/types/admin";

// Regresjonstest for «stuck quotes»-buggen (lessons.md 2026-06-19):
// handleStartJob satte quote-status til 'in_progress' FØR jobben ble
// opprettet. Feilet jobb-inserten, forsvant tilbudet fra admin-panelet
// (borte fra «pending», ingen job i «active»). Riktig rekkefølge er
// jobb-insert først, statusendring etterpå — det låser disse testene.

const { callLog, results, toastSpy } = vi.hoisted(() => ({
  // Logg over alle skrivekall, i rekkefølge, som "tabell.operasjon"
  callLog: [] as string[],
  // Overstyr svar per "tabell.operasjon" (default: { data: [], error: null })
  results: {} as Record<string, { data: unknown; error: { message: string } | null }>,
  toastSpy: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => {
  const makeBuilder = (table: string) => {
    let op = "select";
    // Kjedbar query-builder-mock: alle metoder returnerer builderen,
    // og `await builder` gir svaret fra results-oppslaget.
    const builder: Record<string, unknown> = {};
    for (const m of ["select", "order", "eq", "single", "limit"]) {
      builder[m] = () => builder;
    }
    builder.insert = () => {
      op = "insert";
      callLog.push(`${table}.insert`);
      return builder;
    };
    builder.update = () => {
      op = "update";
      callLog.push(`${table}.update`);
      return builder;
    };
    builder.then = (resolve: (v: unknown) => unknown) =>
      resolve(results[`${table}.${op}`] ?? { data: [], error: null });
    return builder;
  };
  return {
    supabase: {
      from: (table: string) => makeBuilder(table),
      functions: {
        invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
      },
    },
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

vi.mock("@/hooks/useActivityLog", () => ({
  logActivity: vi.fn(() => Promise.resolve()),
}));

import { useAdminData } from "./useAdminData";

const testQuote: Quote = {
  id: "quote-1",
  type: "private",
  name: "Kari Testkunde",
  email: "kari@example.com",
  phone: "12345678",
  description: "Fikse takrenne på garasjen",
  status: "pending",
  created_at: new Date().toISOString(),
  user_id: "user-1",
};

describe("useAdminData handleStartJob", () => {
  beforeEach(() => {
    callLog.length = 0;
    toastSpy.mockClear();
    for (const key of Object.keys(results)) delete results[key];
  });

  it("oppretter jobben FØR quote-status endres", async () => {
    const { result } = renderHook(() => useAdminData(true));

    await act(async () => {
      await result.current.handleStartJob(testQuote);
    });

    const insertIndex = callLog.indexOf("jobs.insert");
    const updateIndex = callLog.indexOf("quotes.update");
    expect(insertIndex, "jobs.insert skal ha blitt kalt").toBeGreaterThanOrEqual(0);
    expect(updateIndex, "quotes.update skal ha blitt kalt").toBeGreaterThanOrEqual(0);
    expect(insertIndex, "jobben må opprettes før statusendringen").toBeLessThan(updateIndex);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Suksess!" })
    );
  });

  it("rører IKKE quote-status hvis jobb-insert feiler (hindrer stuck quotes)", async () => {
    results["jobs.insert"] = { data: null, error: { message: "simulert RLS-feil" } };
    const { result } = renderHook(() => useAdminData(true));

    await act(async () => {
      await result.current.handleStartJob(testQuote);
    });

    expect(callLog).toContain("jobs.insert");
    expect(callLog, "quote må forbli 'pending' ved feil").not.toContain("quotes.update");
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" })
    );
  });

  it("fungerer for gjestekunder uten user_id (ingen notifikasjon, ingen krasj)", async () => {
    const guestQuote: Quote = { ...testQuote, user_id: undefined };
    const { result } = renderHook(() => useAdminData(true));

    await act(async () => {
      await result.current.handleStartJob(guestQuote);
    });

    const insertIndex = callLog.indexOf("jobs.insert");
    const updateIndex = callLog.indexOf("quotes.update");
    expect(insertIndex).toBeGreaterThanOrEqual(0);
    expect(updateIndex).toBeGreaterThan(insertIndex);
    expect(callLog, "gjester har ingen konto å varsle").not.toContain("notifications.insert");
  });
});
