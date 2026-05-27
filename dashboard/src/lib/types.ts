export type TrendDirection = "up" | "down" | "flat";

export interface Kpi {
  label: string;
  value: string;
  trend: string;
  trendDirection: TrendDirection;
}

export type Period = "7d" | "30d" | "90d" | "custom";

export interface Campaign {
  name: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  spendKr: number;
  cpaKr: number;
  status: "active" | "paused";
}

export interface Keyword {
  term: string;
  searchVolume: number;
  clicks: number;
  conversions: number;
  spendKr: number;
}

export interface LandingPage {
  url: string;
  sessions: number;
  conversionRate: number;
  avgTimeSeconds: number;
}

export type ChangeCategory =
  | "kampagne"
  | "keyword"
  | "landing-page"
  | "seo"
  | "andet";

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  category: ChangeCategory;
  title: string;
  description: string;
  expectedImpact: string;
  author: "Chris" | "Inger Marie" | "Claude" | "Bureau";
}

export type IdeaStatus = "frø" | "udfoldet" | "test" | "implementeret" | "forkastet";

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  proposedBy: "Chris" | "Inger Marie" | "Claude";
  effortHours: number;
  impact: "lav" | "medium" | "høj";
  tags: string[];
}

export type AdviceTone = "observation" | "anbefaling" | "advarsel" | "mulighed";

export type Evidence =
  | {
      kind: "stats";
      items: { label: string; value: string; sub?: string; trend?: "up" | "down" | "flat" }[];
    }
  | {
      kind: "sparkline";
      label: string;
      caption?: string;
      data: { x: string; y: number }[];
    }
  | {
      kind: "bars";
      label: string;
      unit?: string;
      items: { label: string; value: number; highlight?: boolean }[];
    };

export interface Advice {
  id: string;
  tone: AdviceTone;
  headline: string;
  body: string;
  evidence?: Evidence;
  actionTitle: string;
  actionDescription: string;
  estimatedImpact: "lav" | "medium" | "høj";
  estimatedEffortHours: number;
  tags: string[];
}

export interface Briefing {
  date: string;
  summary: string;
  insights: Advice[];
}

export type ExperimentStatus = "planlagt" | "kører" | "afsluttet";

export interface Experiment {
  id: string;
  hypothesis: string;
  metric: string;
  periodStart: string;
  periodEnd: string;
  status: ExperimentStatus;
  result?: string;
  conclusion?: string;
}
