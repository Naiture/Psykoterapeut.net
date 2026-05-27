#!/usr/bin/env python3
"""Parse Google Ads UTF-16 Danish CSV keyword report → TypeScript snapshot module."""
import csv
import sys
import re

SRC = "/Users/chris/Documents/GitHub/psykoterapeut.net/Rapport om søgeord til Søgenetværket.csv"
DEST = "/Users/chris/Documents/GitHub/psykoterapeut.net/dashboard/src/lib/ads/snapshot.ts"

def parse_danish_number(s):
    if s is None: return 0.0
    s = s.strip().replace('"', '').replace('%', '').replace(' --', '0')
    if not s or s == '--': return 0.0
    s = s.replace('.', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return 0.0

def clean_keyword(s):
    s = s.strip()
    # Strip surrounding quotes/brackets and the """ phrase wrapper
    s = re.sub(r'^"+|"+$', '', s)
    s = s.strip()
    if s.startswith('[') and s.endswith(']'):
        s = s[1:-1]
    return s.strip()

def match_type_norm(s):
    s = s.strip()
    if 'eksakt' in s.lower(): return 'exact'
    if 'sætning' in s.lower(): return 'phrase'
    if 'bredt' in s.lower() or 'broad' in s.lower(): return 'broad'
    return 'phrase'

rows = []
with open(SRC, encoding='utf-16-le') as f:
    content = f.read()
    # Strip BOM
    if content.startswith('﻿'):
        content = content[1:]
    lines = content.split('\r\n') if '\r\n' in content else content.split('\n')
    # Skip first 2 metadata lines + header line
    title = lines[0]
    period = lines[1]
    header = lines[2].split('\t')
    for line in lines[3:]:
        if not line.strip(): continue
        cells = line.split('\t')
        if len(cells) < 18: continue
        # Skip total/summary rows ("I alt:" — they appear in keyword field or campaign field)
        status_clean = cells[0].strip().replace('-', '').strip()
        if not status_clean: continue
        if 'I alt' in cells[1] or 'I alt' in cells[3]: continue
        if cells[3].strip() in ('--', '-- ', ' --'): continue
        rows.append({
            'status': cells[0].strip(),
            'keyword': clean_keyword(cells[1]),
            'matchType': match_type_norm(cells[2]),
            'campaign': cells[3].strip(),
            'adGroup': cells[4].strip(),
            'qualified': cells[5].strip() == 'Kvalificeret',
            'statusReason': cells[6].strip(),
            'clicks': int(parse_danish_number(cells[10])),
            'impressions': int(parse_danish_number(cells[11])),
            'ctrPct': parse_danish_number(cells[12]),
            'avgCpcKr': parse_danish_number(cells[14]),
            'costKr': parse_danish_number(cells[15]),
            'conversions': parse_danish_number(cells[16]),
        })

print(f"Parsed {len(rows)} rows", file=sys.stderr)
print(f"Period: {period}", file=sys.stderr)

# Generate TS
def ts_str(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

def ts_num(n):
    if n == int(n): return str(int(n))
    return f"{n:.2f}"

lines_out = [
    "/**",
    " * Google Ads keyword snapshot — manual CSV export 'Rapport om søgeord til Søgenetværket'.",
    f" * Period: {period}",
    f" * Rows: {len(rows)} keywords across all campaigns.",
    " *",
    " * Will be replaced by BigQuery query once the daily Ads transfer has backfilled enough",
    " * history (currently only ~7 days deep).",
    " */",
    "",
    "export interface AdsKeywordSnapshot {",
    "  keyword: string;",
    "  matchType: \"exact\" | \"phrase\" | \"broad\";",
    "  campaign: string;",
    "  adGroup: string;",
    "  qualified: boolean;",
    "  statusReason: string;",
    "  clicks: number;",
    "  impressions: number;",
    "  ctrPct: number;",
    "  avgCpcKr: number;",
    "  costKr: number;",
    "  conversions: number;",
    "}",
    "",
    "export const ADS_SNAPSHOT_PERIOD = " + ts_str(period) + ";",
    "export const ADS_SNAPSHOT_DATE = \"2026-05-27\";",
    "",
    "export const ADS_KEYWORDS: AdsKeywordSnapshot[] = [",
]
for r in rows:
    parts = [
        f"keyword: {ts_str(r['keyword'])}",
        f'matchType: "{r["matchType"]}"',
        f"campaign: {ts_str(r['campaign'])}",
        f"adGroup: {ts_str(r['adGroup'])}",
        f"qualified: {'true' if r['qualified'] else 'false'}",
        f"statusReason: {ts_str(r['statusReason'])}",
        f"clicks: {r['clicks']}",
        f"impressions: {r['impressions']}",
        f"ctrPct: {ts_num(r['ctrPct'])}",
        f"avgCpcKr: {ts_num(r['avgCpcKr'])}",
        f"costKr: {ts_num(r['costKr'])}",
        f"conversions: {ts_num(r['conversions'])}",
    ]
    lines_out.append("  { " + ", ".join(parts) + " },")
lines_out.append("];")
lines_out.append("")

# Campaign aggregates
from collections import defaultdict
camp = defaultdict(lambda: {'clicks':0, 'impressions':0, 'costKr':0.0, 'conversions':0.0, 'keywords':0})
for r in rows:
    c = camp[r['campaign']]
    c['clicks'] += r['clicks']
    c['impressions'] += r['impressions']
    c['costKr'] += r['costKr']
    c['conversions'] += r['conversions']
    c['keywords'] += 1

lines_out.append("export interface AdsCampaignSnapshot {")
lines_out.append("  name: string;")
lines_out.append("  keywords: number;")
lines_out.append("  clicks: number;")
lines_out.append("  impressions: number;")
lines_out.append("  costKr: number;")
lines_out.append("  conversions: number;")
lines_out.append("}")
lines_out.append("")
lines_out.append("export const ADS_CAMPAIGNS_SNAPSHOT: AdsCampaignSnapshot[] = [")
for name, c in sorted(camp.items(), key=lambda kv: -kv[1]['costKr']):
    parts = [
        f"name: {ts_str(name)}",
        f"keywords: {c['keywords']}",
        f"clicks: {c['clicks']}",
        f"impressions: {c['impressions']}",
        f"costKr: {ts_num(c['costKr'])}",
        f"conversions: {ts_num(c['conversions'])}",
    ]
    lines_out.append("  { " + ", ".join(parts) + " },")
lines_out.append("];")
lines_out.append("")

with open(DEST, 'w') as f:
    f.write('\n'.join(lines_out))

print(f"Wrote {DEST}", file=sys.stderr)

# Summary stats
total_cost = sum(r['costKr'] for r in rows)
total_clicks = sum(r['clicks'] for r in rows)
total_conv = sum(r['conversions'] for r in rows)
print(f"Total: {total_clicks} clicks, {total_cost:.0f} kr spent, {total_conv:.1f} conversions across {len(rows)} keywords / {len(camp)} campaigns", file=sys.stderr)
