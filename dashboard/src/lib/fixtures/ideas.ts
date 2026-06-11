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
];
