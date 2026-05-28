import type { Briefing } from "@/lib/types";

/**
 * Briefing v2 — baseret på Ads-snapshot 22. aug 2025 – 27. maj 2026 og GA4 YTD 2026.
 * Tallene er udledt af `lib/ads/snapshot.ts` og `lib/ga4/snapshot.ts`.
 * Næste version skal trække fra live BigQuery når Ads-historikken er dyb nok.
 */
export const currentBriefing: Briefing = {
  date: "2026-05-27",
  summary:
    "Her er hvad jeg ser i de seneste 9 måneders Ads-data og GA4 YTD: Angst-kampagnen er kontoens motor (26 conversions, CPA 327 kr), Højbjerg leverer stille men solidt, og Stress er pauset og bør formentlig blive det. Online Terapi er lige startet — den hører til en samtale, ikke en optimering. På landingssiderne er der ét stort huller-i-bunden-problem: /terapi-mod-stress får flest sessions men konverterer 0,2%. Og på budstrategi-fronten: vi har nu nok conversions (37 over 9 mdr) til endelig at sætte Mål-CPA på Angst og styre algoritmen i stedet for at lade den jagte.",
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
      tone: "anbefaling",
      headline: "Vi har nu nok data til Mål-CPA — Ads foreslår det selv",
      body:
        "Med 37 conversions over 9 måneder (19 kontakter + 18 formular-indsendelser) har vi endelig nok data til at sætte en realistisk Mål-CPA. Google Ads viser også en aktiv notifikation om at angive Mål-CPA for én af budstrategierne. Account-CPA ligger på 492 kr i snit, men spændet er stort: Angst på 327 kr, Højbjerg på 607 kr, Stress på 1.534 kr (paused). Den fornuftige bevægelse er at sætte Mål-CPA på Angst først — fx 400 kr som loft. Det giver algoritmen et klart styresignal og forhindrer at den jagter trafik der koster mere end den må. Højbjerg er sværere — skal man sætte 600 eller 500 og acceptere lavere volumen? Værd at teste én ad gangen.",
      evidence: {
        kind: "bars",
        label: "CPA pr. kampagne (9 mdr)",
        unit: "kr",
        items: [
          { label: "Angst", value: 327, highlight: true },
          { label: "Højbjerg", value: 607 },
          { label: "Konto-snit", value: 492 },
          { label: "Stress (paused)", value: 1534 },
        ],
      },
      actionTitle: "Sæt Mål-CPA = 400 kr på Angst-kampagnen som første test",
      actionDescription: "Skift fra 'Maksimér antal konverteringer' til 'Mål-CPA 400 kr'. Kør i 30 dage. Hvis volumen falder >25% uden CPA-fald — gå tilbage. Højbjerg vurderes separat når Angst-resultatet er ind.",
      estimatedImpact: "medium",
      estimatedEffortHours: 0.5,
      tags: ["kampagne", "budstrategi"],
    },
    {
      id: "advice-4",
      tone: "mulighed",
      headline: "Online Terapi er lige startet — en samtale Inger Marie og Chris skal have først",
      body:
        "Vigtig kontekst: Online Terapi-kampagnen er helt ny, så de 47 impressions/7 klik/0 conv vi ser i snapshot er ikke et signal om at den ikke virker — det er bare for tidligt at sige noget. Før vi går videre med budget, bud-strategi eller keyword-oprydning er der nogle valg I to skal tage stilling til. Det her er ikke en optimeringsopgave endnu, det er en strategi-snak. Mine forslag til hvad I skal igennem:\n\n• **Målgruppe og positionering** — Online terapi i Danmark er et mættet marked. Hvem vil Inger Marie ramme? Folk udenfor Østjylland der ikke kan komme til Højbjerg? Pendlere og småbørnsforældre der ikke har tid til transport? Danskere i udlandet (en lille, men loyal niche)? Det dikterer både keywords og landingsside-vinkel.\n\n• **Kapacitet og pris** — Hvor mange online-timer/uge vil Inger Marie tilbyde? Samme pris som fysisk, eller anderledes? Hvis online er en bi-praksis, skal annoncerne ikke konkurrere mod Angst og Højbjerg om budget.\n\n• **Landingssiden først** — /online-terapi har 16 sessions YTD og 0 conv. Den side skal stå stærkt inden vi sender betalt trafik ind. Ellers betaler vi for klik der bouncer. Det er sandsynligvis det første konkrete spor, før vi rører kampagnen.\n\n• **Læringsperiode** — Når I er klar: giv kampagnen 60-90 dage med Maksimér klik (ikke conv — der er ikke nok data til at træne algoritmen), og benchmark mod Højbjergs første 90 dage som realistisk reference.\n\nMin anbefaling lige nu: hold kampagnen aktiv på lavt budget mens samtalen tages, men hold den ikke ansvarlig for resultater endnu.",
      evidence: {
        kind: "stats",
        items: [
          { label: "Impressions", value: "47", sub: "siden start", trend: "flat" },
          { label: "Klik", value: "7", sub: "CTR 14,9%", trend: "flat" },
          { label: "Landingsside-sessions", value: "16", sub: "YTD — 0 conv", trend: "flat" },
          { label: "Status", value: "For tidligt", sub: "ingen valid CPA endnu" },
        ],
      },
      actionTitle: "Book en strategi-samtale: målgruppe, kapacitet, pris, landingsside",
      actionDescription: "Inger Marie + Chris. Fokus: hvem er online-klienten, hvor mange timer/uge, hvilken pris, og hvad skal /online-terapi-siden sige før vi pumper budget i. Ingen kampagne-ændringer før samtalen.",
      estimatedImpact: "høj",
      estimatedEffortHours: 1.5,
      tags: ["strategi", "kampagne", "landing-page"],
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
    {
      id: "advice-6",
      tone: "anbefaling",
      headline: "Online-vinkel fundet: ram dem der vil have terapi uden fysisk fremmøde",
      body:
        "Det her er svaret på online-samtalen (jf. ovenfor). I stedet for at jagte ordet \"online terapi\" — som næsten ingen søger på, og som er kontoens DYRESTE klik (52,86 kr) — vender vi det om: vi køber de billige angst-klik (5–13 kr) og lader annoncen TYDELIGT sige \"online\". Så filtrerer annoncen selv: de der vil møde fysisk klikker ikke (gratis for os, vi betaler kun pr. klik), og vi fanger det segment der vil have terapi men ikke fysisk fremmøde. Det passer bedst til netop angst — især social angst og panikangst, hvor det at slippe for at tage hjemmefra ikke er en feature, men hele pointen. Bonus: online = hele Danmark, ikke kun Aarhus. Start med angst (det eneste der beviseligt konverterer), og replikér strukturen til stress/depression/traume når vinklen er bekræftet.",
      evidence: {
        kind: "bars",
        label: "Pris pr. klik: angst-ord (billige) vs online-ord (dyre)",
        unit: "kr",
        items: [
          { label: "hjælp til stress og angst", value: 5.43, highlight: true },
          { label: "angst behandling", value: 12.59 },
          { label: "angst terapi", value: 18.23 },
          { label: "online psykoterapi", value: 22.26 },
          { label: "online terapi", value: 52.86 },
        ],
      },
      actionTitle: "Opret kampagne \"Online Terapi – Angst\" (hele DK), mål = Book Gratis Samtale",
      actionDescription:
        "Frasematch-søgeord: \"angst behandling\", \"hjælp til angst\", \"angst terapi\", \"social angst\", \"panikangst\" m.fl. Annoncer der råber \"online/hjemmefra\". Negativer: test, medicin, gratis, henvisning. Se fuld plan på idé-kortet i Idé-banken.",
      estimatedImpact: "høj",
      estimatedEffortHours: 4,
      tags: ["kampagne", "online", "angst"],
    },
  ],
};
