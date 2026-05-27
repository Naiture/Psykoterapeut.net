/**
 * Google Ads keyword snapshot — manual CSV export 'Rapport om søgeord til Søgenetværket'.
 * Period: 22. august 2025 - 27. maj 2026
 * Rows: 133 keywords across all campaigns.
 *
 * Will be replaced by BigQuery query once the daily Ads transfer has backfilled enough
 * history (currently only ~7 days deep).
 */

export interface AdsKeywordSnapshot {
  keyword: string;
  matchType: "exact" | "phrase" | "broad";
  campaign: string;
  adGroup: string;
  qualified: boolean;
  statusReason: string;
  clicks: number;
  impressions: number;
  ctrPct: number;
  avgCpcKr: number;
  costKr: number;
  conversions: number;
}

export const ADS_SNAPSHOT_PERIOD = "22. august 2025 - 27. maj 2026";
export const ADS_SNAPSHOT_DATE = "2026-05-27";

export const ADS_KEYWORDS: AdsKeywordSnapshot[] = [
  { keyword: "online psykoterapeut", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 1, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "videoterapi", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "online terapi", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress terapi online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut online", matchType: "exact", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 1, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "online samtaleterapi", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "online terapi", matchType: "exact", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 1, impressions: 9, ctrPct: 11.11, avgCpcKr: 52.86, costKr: 52.86, conversions: 0 },
  { keyword: "psykoterapi online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut hjemmefra", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "onlineterapi", matchType: "exact", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 3, impressions: 14, ctrPct: 21.43, avgCpcKr: 30.08, costKr: 90.24, conversions: 0 },
  { keyword: "terapi på dansk online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi aarhus online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi stress online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "dansk psykoterapeut online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi angst online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "angst terapi online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "dansk terapeut online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "online terapi aarhus", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "relationsterapi online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "dansk terapi online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut aarhus online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "online psykoterapeut", matchType: "exact", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi via video", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 1, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "onlineterapi", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "samtale med psykoterapeut online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "online psykoterapi", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 1, impressions: 9, ctrPct: 11.11, avgCpcKr: 22.26, costKr: 22.26, conversions: 0 },
  { keyword: "terapi hjemmefra", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "online terapi danmark", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi online danmark", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 2, impressions: 6, ctrPct: 33.33, avgCpcKr: 27.04, costKr: 54.07, conversions: 0 },
  { keyword: "psykoterapeut online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 4, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi online", matchType: "exact", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 2, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapi online", matchType: "exact", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut via video", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "traumeterapi online", matchType: "phrase", campaign: "Online Terapi", adGroup: "Annoncegruppe 1", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress hjælp", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; dårlig kvalitet", clicks: 1, impressions: 6, ctrPct: 16.67, avgCpcKr: 12.21, costKr: 12.21, conversions: 0 },
  { keyword: "stress symptomer hjælp", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til stress og depression", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stressbehandling århus", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; dårlig kvalitet", clicks: 0, impressions: 58, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til unge med stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stresscoach aarhus", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 4, impressions: 120, ctrPct: 3.33, avgCpcKr: 12.94, costKr: 51.74, conversions: 0 },
  { keyword: "jobskifte stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "selvbehandling af stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 2, impressions: 33, ctrPct: 6.06, avgCpcKr: 9.15, costKr: 18.29, conversions: 0 },
  { keyword: "hjælp jeg har stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stressbehandling aarhus", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 34, impressions: 631, ctrPct: 5.39, avgCpcKr: 14.19, costKr: 482.55, conversions: 1 },
  { keyword: "behandling af stress angst og depression", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress job", matchType: "phrase", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress job", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 1, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "alternativ behandling stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "nada mod angst", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "slip af med stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "bjarne toftegaard", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "jeg er stresset hvad gør jeg", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; dårlig kvalitet", clicks: 0, impressions: 4, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress coach", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 71, impressions: 1337, ctrPct: 5.31, avgCpcKr: 11.38, costKr: 808.02, conversions: 2 },
  { keyword: "udbrændthed behandling", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 11, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "holistisk stressbehandling", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress coach aarhus", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 14, impressions: 222, ctrPct: 6.31, avgCpcKr: 11.01, costKr: 154.17, conversions: 0 },
  { keyword: "arbejdsrelateret depression", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "akut stress hjælp", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress hjælp gratis", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 3, impressions: 48, ctrPct: 6.25, avgCpcKr: 17.80, costKr: 53.40, conversions: 0 },
  { keyword: "tankemylder hjælp", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 179, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "sygemeldt udbrændthed", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjertebanken stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 2, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress sygemelding", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; dårlig kvalitet", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "kropsterapi stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress terapeut aarhus", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 2, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress håndtering", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til stresset teenager", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress coach", matchType: "phrase", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "belastningsdepression behandling", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress terapi", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 105, impressions: 2052, ctrPct: 5.12, avgCpcKr: 12.35, costKr: 1296.85, conversions: 0 },
  { keyword: "erhvervspsykolog stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til stressramte", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 8, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "tankemylder om natten", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 2, impressions: 118, ctrPct: 1.69, avgCpcKr: 2.69, costKr: 5.39, conversions: 0 },
  { keyword: "tilbage efter stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; dårlig kvalitet", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "konstant træt stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "forebygge stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stresscoach", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 3, impressions: 78, ctrPct: 3.85, avgCpcKr: 12.84, costKr: 38.52, conversions: 0 },
  { keyword: "stress i kroppen", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til udbrændthed", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 22, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress lindring", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 2, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stressudløst angst", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress hvad gør jeg", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause; dårlig kvalitet", clicks: 3, impressions: 3, ctrPct: 100, avgCpcKr: 10.92, costKr: 32.75, conversions: 0 },
  { keyword: "stressterapi", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress coach århus", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 4, impressions: 74, ctrPct: 5.41, avgCpcKr: 19.37, costKr: 77.47, conversions: 0 },
  { keyword: "arbejdsrelateret stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stressbehandling", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "antistress behandling", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stress og depression behandling", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 4, impressions: 246, ctrPct: 1.63, avgCpcKr: 13.61, costKr: 54.43, conversions: 0 },
  { keyword: "kranio sakral terapi depression", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "sygemeldt med stress fyret", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "kan ikke sove stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 4, impressions: 100, ctrPct: 4, avgCpcKr: 11.53, costKr: 46.11, conversions: 0 },
  { keyword: "kom af med stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "behandling for stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 8, impressions: 136, ctrPct: 5.88, avgCpcKr: 10.08, costKr: 80.61, conversions: 0 },
  { keyword: "terapi mod stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 3, impressions: 38, ctrPct: 7.89, avgCpcKr: 19, costKr: 57.01, conversions: 0 },
  { keyword: "hjælp til stress", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 13, impressions: 221, ctrPct: 5.88, avgCpcKr: 13.06, costKr: 169.83, conversions: 0 },
  { keyword: "behandling af stress og depression", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "stresscoach århus", matchType: "broad", campaign: "Stress", adGroup: "Annoncegruppe 1", qualified: false, statusReason: "kampagne sat på pause", clicks: 2, impressions: 30, ctrPct: 6.67, avgCpcKr: 12.22, costKr: 24.44, conversions: 0 },
  { keyword: "terapi aarhus", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut risskov", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut åbyhøj", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapi aarhus", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "terapi højbjerg", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapi højbjerg", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapi århus", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut højbjerg", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut aarhus", matchType: "broad", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 6, impressions: 219, ctrPct: 2.74, avgCpcKr: 9.99, costKr: 59.97, conversions: 0 },
  { keyword: "psykoterapeut viby", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "samtaleterapi aarhus", matchType: "phrase", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "psykoterapeut århus", matchType: "broad", campaign: "Psykoterapi i Højbjerg", adGroup: "Psykoterapi", qualified: true, statusReason: "", clicks: 303, impressions: 5472, ctrPct: 5.54, avgCpcKr: 15.77, costKr: 4777.78, conversions: 8 },
  { keyword: "hjælp til depression og angst", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 110, impressions: 1913, ctrPct: 5.75, avgCpcKr: 11.62, costKr: 1278.30, conversions: 5 },
  { keyword: "hjælp til angstanfald", matchType: "phrase", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "mindhelper angst", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: false, statusReason: "dårlig kvalitet", clicks: 0, impressions: 125, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "angst terapi", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 94, impressions: 1329, ctrPct: 7.07, avgCpcKr: 15.54, costKr: 1460.74, conversions: 3 },
  { keyword: "psykoterapeut angst aarhus", matchType: "exact", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: false, statusReason: "sjældent vist", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til panikangst", matchType: "phrase", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 0, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "angst hjælp til selvhjælp", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: false, statusReason: "dårlig kvalitet", clicks: 0, impressions: 29, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til angst aarhus", matchType: "phrase", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 21, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "behandling mod angst", matchType: "phrase", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 2, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til angst", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 8, impressions: 307, ctrPct: 2.61, avgCpcKr: 12.31, costKr: 98.50, conversions: 2 },
  { keyword: "hjælp til stress og angst", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 159, impressions: 3105, ctrPct: 5.12, avgCpcKr: 9.12, costKr: 1449.35, conversions: 4 },
  { keyword: "angst behandling aarhus", matchType: "exact", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 3, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "angst hjælp", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 11, impressions: 158, ctrPct: 6.96, avgCpcKr: 11.90, costKr: 130.95, conversions: 0 },
  { keyword: "angst behandling", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 179, impressions: 2567, ctrPct: 6.97, avgCpcKr: 12.77, costKr: 2285.23, conversions: 9 },
  { keyword: "social angst hjælp", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 131, impressions: 2005, ctrPct: 6.53, avgCpcKr: 10.95, costKr: 1434.33, conversions: 2 },
  { keyword: "hjælp til sygdomsangst", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 3, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til forældre med angste børn", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 4, impressions: 144, ctrPct: 2.78, avgCpcKr: 13.64, costKr: 54.55, conversions: 0 },
  { keyword: "hjælp mod social angst", matchType: "phrase", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 1, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "panikangst hjælp", matchType: "phrase", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 2, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp angst", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 8, impressions: 196, ctrPct: 4.08, avgCpcKr: 16.09, costKr: 128.71, conversions: 1 },
  { keyword: "angst terapi aarhus", matchType: "exact", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 0, impressions: 4, ctrPct: 0, avgCpcKr: 0, costKr: 0, conversions: 0 },
  { keyword: "hjælp til generaliseret angst", matchType: "broad", campaign: "Angst", adGroup: "ANGST TERAPI + BEHANDLING", qualified: true, statusReason: "", clicks: 1, impressions: 25, ctrPct: 4, avgCpcKr: 9.07, costKr: 9.07, conversions: 0 },
];

export interface AdsCampaignSnapshot {
  name: string;
  keywords: number;
  clicks: number;
  impressions: number;
  costKr: number;
  conversions: number;
}

export const ADS_CAMPAIGNS_SNAPSHOT: AdsCampaignSnapshot[] = [
  { name: "Angst", keywords: 22, clicks: 705, impressions: 11939, costKr: 8329.73, conversions: 26 },
  { name: "Psykoterapi i Højbjerg", keywords: 12, clicks: 309, impressions: 5691, costKr: 4837.75, conversions: 8 },
  { name: "Stress", keywords: 64, clicks: 280, impressions: 5782, costKr: 3463.79, conversions: 3 },
  { name: "Online Terapi", keywords: 35, clicks: 7, impressions: 47, costKr: 219.43, conversions: 0 },
];
