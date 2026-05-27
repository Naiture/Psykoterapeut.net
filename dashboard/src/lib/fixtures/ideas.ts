import type { Idea } from "@/lib/types";

export const ideas: Idea[] = [
  { id: "1", title: "Video-introduktion på forside", description: "30 sek video af Inger Marie der præsenterer sig selv.", status: "frø", proposedBy: "Inger Marie", effortHours: 8, impact: "medium", tags: ["brand", "landing-page"] },
  { id: "2", title: "Flyt pris under USP", description: "Test om pris-info under USP-section reducerer bounce rate.", status: "udfoldet", proposedBy: "Chris", effortHours: 2, impact: "medium", tags: ["landing-page", "pris"] },
  { id: "3", title: "Nyhedsbrev til klienter", description: "Månedlig opdatering med refleksioner, ressourcer.", status: "frø", proposedBy: "Inger Marie", effortHours: 16, impact: "lav", tags: ["retention", "brand"] },
  { id: "4", title: "Pause Brand-kampagne", description: "Brand-kampagnen konverterer ikke. Pause i 14 dage.", status: "test", proposedBy: "Claude", effortHours: 0.5, impact: "høj", tags: ["kampagne", "spend"] },
  { id: "5", title: "Tilføj 50 negatives", description: "Filter ord som 'gratis', 'uddannelse' fra.", status: "implementeret", proposedBy: "Claude", effortHours: 1, impact: "høj", tags: ["keyword", "spend"] },
  { id: "6", title: "Facebook-annoncer", description: "Test om FB Ads kan komplementere Google.", status: "forkastet", proposedBy: "Chris", effortHours: 20, impact: "lav", tags: ["kampagne", "kanal"] },
  { id: "7", title: "FAQ-sektion på alle landingssider", description: "Top 5 spørgsmål svaret in-page.", status: "frø", proposedBy: "Chris", effortHours: 6, impact: "medium", tags: ["landing-page", "seo"] },
];
