import type { Idea } from "@/lib/types";

export const ideas: Idea[] = [
  {
    id: "online-angst-kampagne",
    title: "Online-kampagne på angst-vinkel",
    description:
      "Køb de billige angst-klik (5–13 kr/klik) og lad annoncen tydeligt sige \"online\" — så vi fanger dem der vil have terapi men ikke fysisk fremmøde (især social angst/panikangst, hvor det at slippe for at tage hjemmefra er hele pointen). Hele DK, mål = Book Gratis Samtale. " +
      "Søgeord (frasematch, i gåseøjne): \"angst behandling\", \"hjælp til angst\", \"angst terapi\", \"behandling af angst\", \"terapi mod angst\", \"hjælp mod angst\", \"social angst\", \"socialfobi\", \"hjælp til social angst\", \"panikangst\", \"panikangst behandling\", \"hjælp til panikangst\", \"angstanfald\" — + bredt med lille budget: \"angst\", \"kronisk angst\", \"konstant angst\", \"generaliseret angst\". " +
      "Negativer: test, symptomer, øvelser, medicin, gratis, henvisning, app m.fl. Online er både billigere pr. klik end \"online terapi\"-ord (52 kr) og rammer den store angst-volumen.",
    status: "idé",
    proposedBy: "Chris",
    effortHours: 4,
    impact: "høj",
    tags: ["Google Ads", "Angst", "Online", "Ny kampagne"],
  },
  {
    id: "mobil-kontaktknap-menu",
    title: "Kontakt-knap i mobil-menuen (øverst)",
    description:
      "Mobil er den mest besøgte version af sitet, men der er ingen kontakt-/ring-knap i toppen af menuen — man skal lede for at finde vej til kontakt. Tilføj en tydelig kontakt-/ring-knap direkte i mobil-headeren/menuen, så besøgende kan ringe eller skrive med ét tryk. " +
      "Hænger sammen med det lave konverteringstal vi så i analysen (129 betalte klik → ~1 målt henvendelse på 28 dage): hvis vejen til kontakt ikke er oplagt øverst på mobil, taber vi leads præcis dér. Skal ind i Elementor Pro Theme Builder-headeren (mobil-breakpoint). Beslægtet med CTA-knapper øverst på /online-terapi.",
    status: "idé",
    proposedBy: "Chris",
    effortHours: 2,
    impact: "høj",
    tags: ["Konvertering", "Mobil", "UX", "Elementor"],
  },
  {
    id: "online-terapi-naevn-lidelser-top",
    title: "Nævn angst, depression m.fl. højt oppe på /online-terapi",
    description:
      "Når man søger på \"angst\" og lander på online-kampagnesiden, står der intet om angst nogen steder. Det er et message match-problem: det er netop angst-søgeordene der kører i Online Terapi-kampagnen nu, men siden bekræfter ikke at man er landet rigtigt. " +
      "Skriv i toppen (eller højt oppe) noget om \"hjælp til angst, depression og andre lidelser\" så søgningen genkendes med det samme. " +
      "Dobbelt gevinst: (1) bedre Quality Score i Google Ads → billigere klik, (2) brugeren føler sig set og hopper ikke af. Hænger direkte sammen med det lave konverteringstal (129 klik → ~1 målt henvendelse).",
    status: "idé",
    proposedBy: "Inger Marie",
    effortHours: 3,
    impact: "høj",
    tags: ["Landingsside", "Angst", "Quality Score", "Konvertering"],
  },
  {
    id: "online-terapi-ring-mail-cta",
    title: "Ring/mail-CTA øverst på /online-terapi",
    description:
      "Tilføj tydelige \"Ring\"- og \"Skriv/mail\"-knapper øverst på /online-terapi, så besøgende kan tage kontakt med det samme uden at scrolle. Kopiér mønstret fra /book-samtale. " +
      "Vigtigt fordi siden er kampagnens landingsside og lige nu ikke har en oplagt kontakt-vej i toppen — endnu en sandsynlig årsag til det lave konverteringstal. Beslægtet med mobil-kontaktknap-idéen.",
    status: "idé",
    proposedBy: "Chris",
    effortHours: 2,
    impact: "høj",
    tags: ["Konvertering", "CTA", "Online Terapi", "Elementor"],
  },
];
