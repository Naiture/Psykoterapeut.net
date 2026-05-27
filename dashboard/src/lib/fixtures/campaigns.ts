import type { Campaign } from "@/lib/types";

export const campaigns: Campaign[] = [
  { name: "Online Terapi DK", clicks: 1240, conversions: 18, conversionRate: 1.45, spendKr: 1820, cpaKr: 101, status: "active" },
  { name: "Stress · Aarhus", clicks: 680, conversions: 9, conversionRate: 1.32, spendKr: 920, cpaKr: 102, status: "active" },
  { name: "Depression · Aarhus", clicks: 540, conversions: 7, conversionRate: 1.30, spendKr: 780, cpaKr: 111, status: "active" },
  { name: "Angst · Aarhus", clicks: 480, conversions: 5, conversionRate: 1.04, spendKr: 620, cpaKr: 124, status: "active" },
  { name: "Traumebehandling", clicks: 220, conversions: 3, conversionRate: 1.36, spendKr: 410, cpaKr: 137, status: "active" },
  { name: "Generel · Brand", clicks: 180, conversions: 0, conversionRate: 0, spendKr: 240, cpaKr: 0, status: "paused" },
];
