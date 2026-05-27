import type { Briefing } from "@/lib/types";

export const currentBriefing: Briefing = {
  date: "2026-05-27",
  summary:
    "Denne uge ser jeg især to bevægelser: Online Terapi-kampagnen begynder at finde sin form efter de 50 negatives, og Brand-kampagnens pause bekræfter at den ikke trækker conversions. Til gengæld har et par af landingssiderne en bounce-profil der er værd at kigge nærmere på — særligt /faa-hjaelp-til der ligger markant under benchmark. Herunder er fem indsigter jeg vil fremhæve.",
  insights: [
    {
      id: "advice-1",
      tone: "anbefaling",
      headline: "Online Terapi performer — overvej at skrue forsigtigt op for budgettet",
      body:
        "CPA på Online Terapi DK er faldet fra 113 til 101 kr efter negatives, og kampagnen leverer nu 18 conversions på 30 dage — bedst i klassen. Det er det stærkeste signal vi har lige nu. Hvis vi øger dagligt budget med 20-25% (fra ~60 til ~75 kr/dag) over de næste 14 dage, kan vi sandsynligvis trække yderligere 4-6 conversions ud uden at jeg forventer CPA løber af sted. Det handler om at høste momentum mens kampagnen er på sit bedste.",
      evidence: {
        kind: "stats",
        items: [
          { label: "CPA før", value: "113 kr", sub: "for 30 dage siden" },
          { label: "CPA nu", value: "101 kr", sub: "↓ 11% efter negatives", trend: "down" },
          { label: "Conversions", value: "18", sub: "↑ fra 14", trend: "up" },
          { label: "Spend", value: "1.820 kr", sub: "44% af total", trend: "flat" },
        ],
      },
      actionTitle: "Hæv dagligt budget på Online Terapi DK med 25%",
      actionDescription: "Test i 14 dage. Mål: 22-24 conversions. Stop hvis CPA stiger over 115 kr.",
      estimatedImpact: "høj",
      estimatedEffortHours: 0.5,
      tags: ["kampagne", "spend"],
    },
    {
      id: "advice-2",
      tone: "advarsel",
      headline: "/faa-hjaelp-til konverterer 1,1% — det er under halvdelen af benchmark",
      body:
        "Den nye hub-side får 180 sessions men kun 1,1% conv rate (mod 3,8% på /online-terapi). Sessions-tiden er også lav — 96 sekunder mod 142 på /online-terapi. Det tyder på at folk lander der, ikke finder hvad de leder efter, og forsvinder igen. Min hypotese: siden fungerer som en mellem-station uden klar CTA. Værd at teste om en direkte 'Book samtale'-knap i top, før selve hub-listen, ændrer billedet.",
      evidence: {
        kind: "bars",
        label: "Conv rate pr. landingsside",
        unit: "%",
        items: [
          { label: "/terapi-mod-stress", value: 4.2 },
          { label: "/online-terapi", value: 3.8 },
          { label: "/terapi-mod-depression", value: 3.5 },
          { label: "/angst-behandling", value: 2.9 },
          { label: "/traumebehandling", value: 1.8 },
          { label: "/faa-hjaelp-til", value: 1.1, highlight: true },
        ],
      },
      actionTitle: "Tilføj sticky 'Book samtale'-CTA øverst på /faa-hjaelp-til",
      actionDescription: "Samme knap-design som /book-samtale. Test i 14 dage. Mål: conv rate over 2%.",
      estimatedImpact: "medium",
      estimatedEffortHours: 1,
      tags: ["landing-page", "cta"],
    },
    {
      id: "advice-3",
      tone: "observation",
      headline: "Brand-kampagnens pause bekræfter hypotesen — overvej at lukke permanent",
      body:
        "Brand-kampagnen har været på pause i 14 dage og spend er faldet med 240 kr/uge uden mærkbar effekt på samlede conversions. Det er den bekræftelse vi havde brug for. I stedet for at lade pausen rulle videre, kan vi lukke kampagnen permanent og omfordele budgettet — sandsynligvis til Online Terapi DK (jf. indsigt 1). Det rydder også op i kontoen.",
      evidence: {
        kind: "sparkline",
        label: "Conversions/uge (total)",
        caption: "Pause start: uge 19 · ingen drop",
        data: [
          { x: "uge 14", y: 9 },
          { x: "uge 15", y: 10 },
          { x: "uge 16", y: 8 },
          { x: "uge 17", y: 11 },
          { x: "uge 18", y: 10 },
          { x: "uge 19", y: 10 },
          { x: "uge 20", y: 11 },
          { x: "uge 21", y: 12 },
        ],
      },
      actionTitle: "Luk Generel · Brand-kampagne permanent",
      actionDescription: "Arkivér i Google Ads. Tilføj noter til change log. Frigør 240 kr/uge til andre kampagner.",
      estimatedImpact: "medium",
      estimatedEffortHours: 0.5,
      tags: ["kampagne", "ryd-op"],
    },
    {
      id: "advice-4",
      tone: "mulighed",
      headline: "Wasted spend-keywords er stadig synlige — der ligger en kvik gevinst i at filtrere mere",
      body:
        "Selvom vi har tilføjet 50 negatives, ser jeg stadig 411 kr spend over 30 dage på keywords der ikke konverterer ('gratis terapi', 'psykolog uddannelse', 'terapeut løn', 'psykolog studie'). Det er den slags klik der koster os 95-180 kr stykket uden afkast. Et hurtigt sweep af search terms-rapporten i Google Ads vil sandsynligvis afsløre 10-15 yderligere kandidater til negative-listen.",
      evidence: {
        kind: "bars",
        label: "Wasted spend pr. keyword (0 conv)",
        unit: "kr",
        items: [
          { label: "gratis terapi", value: 180, highlight: true },
          { label: "psykolog uddannelse", value: 95, highlight: true },
          { label: "terapeut løn", value: 72, highlight: true },
          { label: "psykolog studie", value: 64, highlight: true },
        ],
      },
      actionTitle: "Kør en negatives-runde til på alle aktive kampagner",
      actionDescription: "Mål: identificér 10+ nye negatives. Forventet besparelse: 200-300 kr/måned.",
      estimatedImpact: "medium",
      estimatedEffortHours: 1.5,
      tags: ["keyword", "spend"],
    },
    {
      id: "advice-5",
      tone: "observation",
      headline: "Conversions stiger 12% — det er bedre end I måske tror",
      body:
        "Sessions er stort set fladt (+12%) men conversions stiger 8% og CPA falder 11%. Det betyder at trafikken vi får ind er af bedre kvalitet end før. Det er en stille indikator på at SEO-arbejdet og keyword-rensningen virker — selv hvis det ikke føles dramatisk fra dag til dag. Værd at huske næste gang det føles som om der ikke sker noget.",
      evidence: {
        kind: "sparkline",
        label: "Conversions/dag — sidste 20 dage",
        caption: "Tydelig opadgående trend",
        data: [
          { x: "1", y: 1 }, { x: "2", y: 2 }, { x: "3", y: 1 }, { x: "4", y: 3 },
          { x: "5", y: 2 }, { x: "6", y: 4 }, { x: "7", y: 3 }, { x: "8", y: 2 },
          { x: "9", y: 5 }, { x: "10", y: 3 }, { x: "11", y: 4 }, { x: "12", y: 3 },
          { x: "13", y: 6 }, { x: "14", y: 4 }, { x: "15", y: 7 }, { x: "16", y: 5 },
          { x: "17", y: 8 }, { x: "18", y: 6 }, { x: "19", y: 9 }, { x: "20", y: 7 },
        ],
      },
      actionTitle: "Ingen handling — bare et godt signal at holde øje med",
      actionDescription: "Hold øje med om denne trend fortsætter de næste 30 dage.",
      estimatedImpact: "lav",
      estimatedEffortHours: 0,
      tags: ["observation"],
    },
  ],
};
