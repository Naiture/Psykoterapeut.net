import type { Briefing } from "@/lib/types";

/**
 * Briefing v2 — baseret på Ads-snapshot 22. aug 2025 – 27. maj 2026 og GA4 YTD 2026.
 * Tallene er udledt af `lib/ads/snapshot.ts` og `lib/ga4/snapshot.ts`.
 * Næste version skal trække fra live BigQuery når Ads-historikken er dyb nok.
 */
export const currentBriefing: Briefing = {
  date: "2026-05-27",
  summary:
    "Her er hvad jeg ser i de seneste 9 måneders Ads-data og GA4 YTD: Angst-kampagnen er kontoens motor (26 conversions, CPA 327 kr), Højbjerg leverer stille men solidt, og Stress og Online Terapi koster mere end de bidrager. På landingssiderne er der ét stort huller-i-bunden-problem: /terapi-mod-stress får flest sessions men konverterer 0,2%. Og så er der attribution: GA4 registrerer 21 Book Gratis Samtale YTD, mens Google Ads viser 0 conversions for samme periode — vi mister altså data på det vigtigste signal.",
  insights: [
    {
      id: "advice-1",
      tone: "anbefaling",
      headline: "Angst-kampagnen er klart bedst — overvej at hæve budgettet",
      body:
        "Angst leverer 26 conversions til CPA 327 kr på 9 måneder — bedst i klassen med god margin. Til sammenligning: Højbjerg ligger på 607 kr, og Stress (pauset) på 1.534 kr. Dagligt budget er kun 30 kr, og kampagnen er kvalificeret. Mit forslag: prøv 45 kr/dag i 30 dage — det er den mest sandsynlige vej til flere conversions uden at jagte nye keywords. Hold øje med CPA, stop hvis den krydser 450 kr.",
      evidence: {
        kind: "stats",
        items: [
          { label: "Conversions", value: "26", sub: "9 mdr", trend: "up" },
          { label: "CPA", value: "327 kr", sub: "bedst i klassen", trend: "down" },
          { label: "Spend", value: "8.505 kr", sub: "44% af konto" },
          { label: "Dagligt budget", value: "30 kr", sub: "lavt taget i betragtning" },
        ],
      },
      actionTitle: "Hæv Angst dagligt budget fra 30 → 45 kr/dag",
      actionDescription: "Test i 30 dage. Mål: 14-18 conv i perioden. Stop hvis CPA > 450 kr.",
      estimatedImpact: "høj",
      estimatedEffortHours: 0.25,
      tags: ["kampagne", "spend"],
    },
    {
      id: "advice-2",
      tone: "advarsel",
      headline: "/terapi-mod-stress har 424 sessions og 0,2% conv rate",
      body:
        "Det er den side der får mest trafik i hele YTD (424 sessions, mest af alle), men den konverterer dårligst af alle behandlingssider — 1 key event ud af 424. Til sammenligning konverterer /angst-behandling 3,4% (12 ud af 322), og /terapi konverterer 2,5%. Med tanke på at Stress-kampagnen er pauset er det værd at spørge: er det selve siden eller var det trafikken? Da /terapi-mod-stress stadig får organic trafik, peger pilen på siden. Værd at sammenligne CTA-placeringen med /angst-behandling der virker.",
      evidence: {
        kind: "bars",
        label: "Conv rate pr. landingsside (GA4 YTD)",
        unit: "%",
        items: [
          { label: "/book-samtale", value: 18.2 },
          { label: "/angst-behandling", value: 3.4 },
          { label: "/terapi", value: 2.5 },
          { label: "/om", value: 1.6 },
          { label: "/", value: 0.7 },
          { label: "/terapi-mod-stress", value: 0.2, highlight: true },
        ],
      },
      actionTitle: "Audit /terapi-mod-stress mod /angst-behandling — find forskellen i CTA-flow",
      actionDescription: "Sammenlign sektion-rækkefølge, CTA-placering og knap-tekster. Lav 1-2 hypoteser til test.",
      estimatedImpact: "høj",
      estimatedEffortHours: 1.5,
      tags: ["landing-page", "cta"],
    },
    {
      id: "advice-3",
      tone: "advarsel",
      headline: "Ads-konto viser 0 conversions — GA4 viser 21 Book Gratis Samtale",
      body:
        "Det her er det vigtigste på listen, selvom det ikke ser flot ud. GA4 har registreret 21 Book Gratis Samtale events og 13 Click Phone Number events YTD — det er reelle kunde-handlinger. Men Google Ads BigQuery-eksporten viser 0 conversions for samme periode, fordi Ads conversion tracking blev sat op meget sent. Det betyder at hver eneste beslutning vi tager på CPA og 'maksimér conversions'-budstrategi er truffet på blind data. Indtil tracking er fixet, kan vi ikke stole på CPA-tallene i Ads.",
      evidence: {
        kind: "stats",
        items: [
          { label: "GA4 Book Gratis Samtale", value: "21", sub: "YTD 2026", trend: "up" },
          { label: "GA4 Click Phone Number", value: "13", sub: "YTD 2026", trend: "up" },
          { label: "Ads-rapporterede conv", value: "0", sub: "samme periode", trend: "down" },
          { label: "Risiko", value: "Høj", sub: "Smart bidding kører blind" },
        ],
      },
      actionTitle: "Verificér Google Ads conversion tracking og import af GA4-key-events",
      actionDescription: "Tjek at Book_Gratis_Samtale, Click Phone Number og Click Mail Links er importeret som conversions. Bekræft i Ads UI at conversion-kolonnen begynder at tælle.",
      estimatedImpact: "høj",
      estimatedEffortHours: 1,
      tags: ["tracking", "kampagne"],
    },
    {
      id: "advice-4",
      tone: "mulighed",
      headline: "Online Terapi har 47 impressions over 9 måneder — kampagnen er reelt inaktiv",
      body:
        "Online Terapi-kampagnen står som aktiv med 30 kr dagligt budget, men har på 9 måneder kun fået 47 impressions og 7 klik. CTR er 14,9% (høj fordi tallene er små), men der er stort set ingen visning. Det er enten budstrategi der ikke får trækkraft (Maksimér antal konverteringer med 0 conversions giver lavt prioritering) eller for snævre keywords. To veje: (1) skift midlertidigt til Maksimér klik for at indlære algoritmen, eller (2) luk kampagnen og flyt budgettet til Angst. Givet at Højbjerg og Angst begge konverterer, er option 2 mest sandsynligt rigtigst.",
      evidence: {
        kind: "stats",
        items: [
          { label: "Impressions", value: "47", sub: "9 mdr", trend: "flat" },
          { label: "Klik", value: "7", sub: "CTR 14,9%", trend: "flat" },
          { label: "Conversions", value: "0", trend: "down" },
          { label: "Spend", value: "219 kr" },
        ],
      },
      actionTitle: "Luk Online Terapi-kampagnen og flyt 30 kr/dag til Angst",
      actionDescription: "Arkivér i Google Ads. Tilføj note til change log. Hvis du vil bevare online-spor — start ny kampagne med Maksimér klik som test, ikke samme dag.",
      estimatedImpact: "medium",
      estimatedEffortHours: 0.5,
      tags: ["kampagne", "ryd-op"],
    },
    {
      id: "advice-5",
      tone: "observation",
      headline: "Højbjerg leverer på én bred keyword — 'psykoterapeut århus' alene giver 8 conv",
      body:
        "Højbjerg-kampagnen er på papiret #2 i conversions (8 stk), men 8 af de 8 conversions kommer fra ét enkelt broad-keyword: 'psykoterapeut århus' (303 klik, 4.778 kr). Det er en stærk indikator på at folk der søger Aarhus-specifikt konverterer. To muligheder værd at overveje: enten dele kampagnen op i en lokationsspecifik annoncegruppe og bygge mere ud over den, eller lave en lokal landingsside specifikt til Aarhus-trafik. CPA på den ene keyword er 597 kr — okay, ikke fantastisk, men leverer.",
      evidence: {
        kind: "bars",
        label: "Conversions pr. keyword på tværs af konto",
        unit: "conv",
        items: [
          { label: "angst behandling (broad)", value: 9 },
          { label: "psykoterapeut århus (broad)", value: 8, highlight: true },
          { label: "hjælp til depression og angst", value: 5 },
          { label: "hjælp til stress og angst", value: 4 },
          { label: "angst terapi (broad)", value: 3 },
        ],
      },
      actionTitle: "Overvej dedikeret Aarhus-annoncegruppe eller -landingsside",
      actionDescription: "Drøft med Inger Marie om der er noget lokationsspecifikt der kan løfte siden (klinik-billede, vejvisning, parkering).",
      estimatedImpact: "medium",
      estimatedEffortHours: 2,
      tags: ["kampagne", "landing-page"],
    },
  ],
};
