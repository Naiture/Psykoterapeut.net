import type { ChangeLogEntry } from "@/lib/types";

export const changeLog: ChangeLogEntry[] = [
  {
    id: "1",
    timestamp: "2026-05-24T10:30:00Z",
    category: "keyword",
    title: "Tilføjet 50 negatives på Online Terapi",
    description: "Filtrerede ord som 'gratis', 'uddannelse', 'studie' fra. Mål: reducere wasted spend.",
    expectedImpact: "CPA falder med 8-12%",
    author: "Claude",
  },
  {
    id: "2",
    timestamp: "2026-05-19T14:00:00Z",
    category: "landing-page",
    title: "Ny CTA på /book-samtale",
    description: "Telefon + mail-knapper øverst, før beskrivelse.",
    expectedImpact: "Conv rate +0.5 pp",
    author: "Chris",
  },
  {
    id: "3",
    timestamp: "2026-05-13T09:15:00Z",
    category: "kampagne",
    title: "Pause på Stress-kampagne",
    description: "Brand-kampagnen genererede klik uden conversions, sat på pause i 14 dage for at se baseline.",
    expectedImpact: "Spend −240 kr/uge",
    author: "Inger Marie",
  },
  {
    id: "4",
    timestamp: "2026-05-09T11:45:00Z",
    category: "seo",
    title: "Ny side: Få hjælp til",
    description: "Hub-side der linker til alle behandlingsområder.",
    expectedImpact: "Organic traffic +5% over 3 mdr",
    author: "Chris",
  },
];
