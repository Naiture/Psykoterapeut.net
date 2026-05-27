import type { Experiment } from "@/lib/types";

export const experiments: Experiment[] = [
  {
    id: "1",
    hypothesis: "Hvis vi pauser Brand-kampagnen, falder spend uden conversion-tab.",
    metric: "Spend + conversions",
    periodStart: "2026-05-13",
    periodEnd: "2026-05-27",
    status: "kører",
  },
  {
    id: "2",
    hypothesis: "Hvis vi flytter pris-info under USP på /terapi, falder bounce rate.",
    metric: "Bounce rate på /terapi",
    periodStart: "2026-06-03",
    periodEnd: "2026-06-17",
    status: "planlagt",
  },
  {
    id: "3",
    hypothesis: "Hvis vi tilføjer 50 negatives, falder CPA med 8-12%.",
    metric: "CPA på Online Terapi-kampagne",
    periodStart: "2026-05-10",
    periodEnd: "2026-05-24",
    status: "afsluttet",
    result: "CPA faldt fra 113 kr til 101 kr (−10.6%)",
    conclusion: "Hypotesen bekræftet. Permanent ændring.",
  },
];
