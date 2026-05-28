"""Parse Google Keyword Planner CSV-eksport til normaliserede keyword-rækker."""
import re

_KEYWORD_ALIASES = ("keyword", "søgeord", "sogeord")
_VOLUME_ALIASES = ("avg. monthly searches", "monthly searches", "månedlige søgninger", "sogninger")
_COMPETITION_ALIASES = ("competition", "konkurrence")
_CPC_LOW_ALIASES = ("top of page bid (low", "low range", "lavt", "lavt interval")
_CPC_HIGH_ALIASES = ("top of page bid (high", "high range", "højt", "hojt", "højt interval")


def _to_int(value):
    digits = re.sub(r"[^0-9]", "", value or "")
    return int(digits) if digits else 0


def _to_float(value):
    if not value:
        return 0.0
    if "," in value:
        cleaned = re.sub(r"[^0-9,]", "", value).replace(",", ".")
    else:
        cleaned = re.sub(r"[^0-9.]", "", value)
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0


def _norm_competition(value):
    v = (value or "").strip().lower()
    if v in ("low", "lav"):
        return "low"
    if v in ("high", "høj", "hoj"):
        return "high"
    return "medium"


def _find_header_index(headers, aliases):
    for i, h in enumerate(headers):
        hl = h.strip().lower()
        if any(alias in hl for alias in aliases):
            return i
    return None


def _decode(raw):
    if isinstance(raw, str):
        return raw
    for enc in ("utf-16", "utf-8-sig", "utf-8"):
        try:
            return raw.decode(enc)
        except (UnicodeDecodeError, LookupError):
            continue
    return raw.decode("utf-8", errors="replace")


def parse_planner_csv(raw):
    """Tag CSV-tekst (eller bytes) og returnér liste af normaliserede rækker."""
    text = _decode(raw)
    delimiter = "\t" if "\t" in text else ","
    lines = [ln for ln in text.splitlines() if ln.strip()]

    header_row = None
    header_idx = None
    for idx, line in enumerate(lines):
        cells = line.split(delimiter)
        if _find_header_index(cells, _KEYWORD_ALIASES) is not None and len(cells) >= 3:
            header_row = cells
            header_idx = idx
            break
    if header_row is None:
        return []

    col_keyword = _find_header_index(header_row, _KEYWORD_ALIASES)
    col_volume = _find_header_index(header_row, _VOLUME_ALIASES)
    col_comp = _find_header_index(header_row, _COMPETITION_ALIASES)
    col_low = _find_header_index(header_row, _CPC_LOW_ALIASES)
    col_high = _find_header_index(header_row, _CPC_HIGH_ALIASES)

    rows = []
    for line in lines[header_idx + 1:]:
        cells = line.split(delimiter)
        if col_keyword is None or col_keyword >= len(cells):
            continue
        kw = cells[col_keyword].strip()
        if not kw:
            continue
        rows.append({
            "keyword": kw,
            "volume": _to_int(cells[col_volume]) if col_volume is not None and col_volume < len(cells) else 0,
            "competition": _norm_competition(cells[col_comp]) if col_comp is not None and col_comp < len(cells) else "medium",
            "cpc_low": _to_float(cells[col_low]) if col_low is not None and col_low < len(cells) else 0.0,
            "cpc_high": _to_float(cells[col_high]) if col_high is not None and col_high < len(cells) else 0.0,
        })
    return rows
