#!/usr/bin/env python3
"""Parse all 3 Google Ads CSV exports → single TypeScript snapshot module."""
import re
import sys
from collections import defaultdict

ROOT = "/Users/chris/Documents/GitHub/psykoterapeut.net"
DEST = f"{ROOT}/dashboard/src/lib/ads/snapshot.ts"

def parse_danish_number(s):
    if s is None: return 0.0
    s = s.strip().replace('"', '').replace('%', '').replace(' --', '0')
    if not s or s == '--': return 0.0
    # Danish thousand separator is "." and decimal is ","
    # If both, "." is thousands. If only ",", it's decimal.
    if '.' in s and ',' in s:
        s = s.replace('.', '').replace(',', '.')
    elif ',' in s:
        s = s.replace(',', '.')
    # else keep as-is (plain integer or already-decimal)
    try:
        return float(s)
    except ValueError:
        return 0.0

def clean_keyword(s):
    s = s.strip()
    s = re.sub(r'^"+|"+$', '', s).strip()
    if s.startswith('[') and s.endswith(']'):
        s = s[1:-1]
    return s.strip()

def match_type_norm(s):
    s = s.strip().lower()
    if 'eksakt' in s: return 'exact'
    if 'sætning' in s: return 'phrase'
    if 'bredt' in s or 'broad' in s: return 'broad'
    return 'phrase'

def read_utf16(path):
    with open(path, encoding='utf-16-le') as f:
        c = f.read()
    if c.startswith('﻿'): c = c[1:]
    return c.replace('\r\n', '\n').split('\n')

def ts_str(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

def ts_num(n):
    return str(int(n)) if n == int(n) else f"{n:.2f}"

# ---------- Keywords ----------
lines = read_utf16(f"{ROOT}/dashboard/data/ads-snapshot-2026-05-27/Rapport om søgeord til Søgenetværket.csv")
kw_period = lines[1]
keywords = []
for line in lines[3:]:
    if not line.strip(): continue
    c = line.split('\t')
    if len(c) < 18: continue
    if 'I alt' in c[1] or 'I alt' in c[3]: continue
    if c[3].strip() in ('--', '-- ', ' --'): continue
    status_clean = c[0].strip().replace('-', '').strip()
    if not status_clean: continue
    keywords.append({
        'keyword': clean_keyword(c[1]),
        'matchType': match_type_norm(c[2]),
        'campaign': c[3].strip(),
        'adGroup': c[4].strip(),
        'qualified': c[5].strip() == 'Kvalificeret',
        'statusReason': c[6].strip(),
        'clicks': int(parse_danish_number(c[10])),
        'impressions': int(parse_danish_number(c[11])),
        'ctrPct': parse_danish_number(c[12]),
        'avgCpcKr': parse_danish_number(c[14]),
        'costKr': parse_danish_number(c[15]),
        'conversions': parse_danish_number(c[16]),
    })

# ---------- Campaigns (authoritative) ----------
lines = read_utf16(f"{ROOT}/Kampagnerapport.csv")
camp_period = lines[1]
campaigns = []
for line in lines[3:]:
    if not line.strip(): continue
    c = line.split('\t')
    if len(c) < 19: continue
    if 'I alt' in c[0] or 'I alt' in c[1]: continue
    if not c[1].strip() or c[1].strip() in ('--', ' --'): continue
    campaigns.append({
        'status': 'active' if c[0].strip() == 'Aktiveret' else 'paused' if 'pause' in c[0].lower() else 'other',
        'name': c[1].strip(),
        'dailyBudgetKr': parse_danish_number(c[2]),
        'qualificationStatus': c[6].strip(),
        'qualificationReason': c[7].strip(),
        'optimizationScorePct': parse_danish_number(c[8]),
        'campaignType': c[10].strip(),
        'clicks': int(parse_danish_number(c[11])),
        'impressions': int(parse_danish_number(c[12])),
        'ctrPct': parse_danish_number(c[13]),
        'avgCpcKr': parse_danish_number(c[14]),
        'costKr': parse_danish_number(c[15]),
        'bidStrategy': c[16].strip(),
        'conversions': parse_danish_number(c[17]),
    })

# ---------- Search terms ----------
lines = read_utf16(f"{ROOT}/Rapport om søgetermer.csv")
st_period = lines[1]
search_terms = []
for line in lines[3:]:
    if not line.strip(): continue
    c = line.split('\t')
    if len(c) < 13: continue
    if 'I alt' in c[0] or 'I alt' in c[3]: continue
    if not c[0].strip(): continue
    if c[0].strip() in ('--', ' --'): continue
    search_terms.append({
        'term': c[0].strip(),
        'matchType': match_type_norm(c[1]),
        'addedExcluded': c[2].strip(),
        'campaign': c[3].strip(),
        'adGroup': c[4].strip(),
        'clicks': int(parse_danish_number(c[5])),
        'impressions': int(parse_danish_number(c[6])),
        'ctrPct': parse_danish_number(c[7]),
        'avgCpcKr': parse_danish_number(c[9]),
        'costKr': parse_danish_number(c[10]),
    })

# ---------- Write TS ----------
out = []
out.append("/**")
out.append(" * Google Ads snapshot — manual CSV exports from Google Ads UI.")
out.append(f" * Period: {camp_period}")
out.append(" *")
out.append(" * Sources:")
out.append(" *   - Kampagnerapport.csv (campaigns, budgets, optimization scores)")
out.append(" *   - Rapport om søgeord til Søgenetværket.csv (active keywords)")
out.append(" *   - Rapport om søgetermer.csv (actual search queries)")
out.append(" *")
out.append(" * Will be replaced by BigQuery query once the daily Ads transfer has backfilled enough")
out.append(" * history (currently only ~7 days deep).")
out.append(" */")
out.append("")
out.append(f"export const ADS_SNAPSHOT_PERIOD = {ts_str(camp_period)};")
out.append('export const ADS_SNAPSHOT_DATE = "2026-05-27";')
out.append("")

# Campaigns interface + data
out.append("export interface AdsCampaignSnapshot {")
out.append('  status: "active" | "paused" | "other";')
out.append("  name: string;")
out.append("  dailyBudgetKr: number;")
out.append("  qualificationStatus: string;")
out.append("  qualificationReason: string;")
out.append("  optimizationScorePct: number;")
out.append("  campaignType: string;")
out.append("  clicks: number;")
out.append("  impressions: number;")
out.append("  ctrPct: number;")
out.append("  avgCpcKr: number;")
out.append("  costKr: number;")
out.append("  bidStrategy: string;")
out.append("  conversions: number;")
out.append("}")
out.append("")
out.append("export const ADS_CAMPAIGNS_SNAPSHOT: AdsCampaignSnapshot[] = [")
for c in sorted(campaigns, key=lambda x: -x['costKr']):
    parts = [
        f'status: "{c["status"]}"',
        f"name: {ts_str(c['name'])}",
        f"dailyBudgetKr: {ts_num(c['dailyBudgetKr'])}",
        f"qualificationStatus: {ts_str(c['qualificationStatus'])}",
        f"qualificationReason: {ts_str(c['qualificationReason'])}",
        f"optimizationScorePct: {ts_num(c['optimizationScorePct'])}",
        f"campaignType: {ts_str(c['campaignType'])}",
        f"clicks: {c['clicks']}",
        f"impressions: {c['impressions']}",
        f"ctrPct: {ts_num(c['ctrPct'])}",
        f"avgCpcKr: {ts_num(c['avgCpcKr'])}",
        f"costKr: {ts_num(c['costKr'])}",
        f"bidStrategy: {ts_str(c['bidStrategy'])}",
        f"conversions: {ts_num(c['conversions'])}",
    ]
    out.append("  { " + ", ".join(parts) + " },")
out.append("];")
out.append("")

# Keywords
out.append("export interface AdsKeywordSnapshot {")
out.append("  keyword: string;")
out.append('  matchType: "exact" | "phrase" | "broad";')
out.append("  campaign: string;")
out.append("  adGroup: string;")
out.append("  qualified: boolean;")
out.append("  statusReason: string;")
out.append("  clicks: number;")
out.append("  impressions: number;")
out.append("  ctrPct: number;")
out.append("  avgCpcKr: number;")
out.append("  costKr: number;")
out.append("  conversions: number;")
out.append("}")
out.append("")
out.append("export const ADS_KEYWORDS: AdsKeywordSnapshot[] = [")
for k in keywords:
    parts = [
        f"keyword: {ts_str(k['keyword'])}",
        f'matchType: "{k["matchType"]}"',
        f"campaign: {ts_str(k['campaign'])}",
        f"adGroup: {ts_str(k['adGroup'])}",
        f"qualified: {'true' if k['qualified'] else 'false'}",
        f"statusReason: {ts_str(k['statusReason'])}",
        f"clicks: {k['clicks']}",
        f"impressions: {k['impressions']}",
        f"ctrPct: {ts_num(k['ctrPct'])}",
        f"avgCpcKr: {ts_num(k['avgCpcKr'])}",
        f"costKr: {ts_num(k['costKr'])}",
        f"conversions: {ts_num(k['conversions'])}",
    ]
    out.append("  { " + ", ".join(parts) + " },")
out.append("];")
out.append("")

# Search terms
out.append("export interface AdsSearchTermSnapshot {")
out.append("  term: string;")
out.append('  matchType: "exact" | "phrase" | "broad";')
out.append("  addedExcluded: string;")
out.append("  campaign: string;")
out.append("  adGroup: string;")
out.append("  clicks: number;")
out.append("  impressions: number;")
out.append("  ctrPct: number;")
out.append("  avgCpcKr: number;")
out.append("  costKr: number;")
out.append("}")
out.append("")
out.append("export const ADS_SEARCH_TERMS: AdsSearchTermSnapshot[] = [")
# Keep only meaningful rows: clicks > 0 OR impressions >= 5 (rest is single-impression noise)
filtered_terms = [s for s in search_terms if s['clicks'] > 0 or s['impressions'] >= 5]
print(f"Search terms kept after filter: {len(filtered_terms)} of {len(search_terms)}", file=sys.stderr)
for s in filtered_terms:
    parts = [
        f"term: {ts_str(s['term'])}",
        f'matchType: "{s["matchType"]}"',
        f"addedExcluded: {ts_str(s['addedExcluded'])}",
        f"campaign: {ts_str(s['campaign'])}",
        f"adGroup: {ts_str(s['adGroup'])}",
        f"clicks: {s['clicks']}",
        f"impressions: {s['impressions']}",
        f"ctrPct: {ts_num(s['ctrPct'])}",
        f"avgCpcKr: {ts_num(s['avgCpcKr'])}",
        f"costKr: {ts_num(s['costKr'])}",
    ]
    out.append("  { " + ", ".join(parts) + " },")
out.append("];")
out.append("")

with open(DEST, 'w') as f:
    f.write('\n'.join(out))

# Summary
import sys
ck = sum(c['clicks'] for c in campaigns); kk = sum(k['clicks'] for k in keywords); sk = sum(s['clicks'] for s in search_terms)
print(f"Campaigns: {len(campaigns)} ({ck} clicks)", file=sys.stderr)
print(f"Keywords: {len(keywords)} ({kk} clicks)", file=sys.stderr)
print(f"Search terms: {len(search_terms)} ({sk} clicks)", file=sys.stderr)
print(f"Written: {DEST}", file=sys.stderr)
