# UO Events -> Discord (API-first, robust timezone conversion, multi-webhook)
# deps: requests, beautifulsoup4, tzdata (Windows)
# run:  py -3.13 EventNotifier.py

from __future__ import annotations
import html
import json
import re
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Sequence, Tuple, Union

import requests
from bs4 import BeautifulSoup
from zoneinfo import ZoneInfo

# ---------------------- Config ----------------------
WEBHOOKS = [
    # Your webhooks (send to all in this list)
    #"https://discord.com/api/webhooks/1423678868824395941/bp9Il08cz_-RqB4xcEo15O1sdYm1bSIBHNJHDBrVgYAiWqFpfMPFGleSXzMIklR",
]

API_URL = "https://uo.com/wp-json/tribe/events/v1/events"
LIST_URL = "https://uo.com/events/list/"
USER_AGENT = "uo-events-scraper/7.3"
TIMEOUT = 30
PER_PAGE = 100
POST_PAUSE_SEC = 0.3  # small delay between posts

# Convert everything to this timezone:
TARGET_TZ = "America/New_York"

# Abbreviation → IANA timezone
ABBR_TO_TZ: Dict[str, str] = {
    # North America
    "PDT": "America/Los_Angeles", "PST": "America/Los_Angeles",
    "MDT": "America/Denver",      "MST": "America/Denver",
    "CDT": "America/Chicago",     "CST": "America/Chicago",
    "EDT": "America/New_York",    "EST": "America/New_York",
    # Europe
    "BST": "Europe/London", "GMT": "Etc/GMT",
    "CET": "Europe/Berlin", "CEST": "Europe/Berlin",
    # Asia
    "JST": "Asia/Tokyo", "KST": "Asia/Seoul", "IST": "Asia/Kolkata",
    # Generic
    "UTC": "UTC",
}

MONTHS = (
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
)

# ---------------------- Helpers ----------------------
def get_tz(tz_key: Optional[str]) -> Optional[ZoneInfo]:
    """IANA first, else known abbreviations."""
    if not tz_key:
        return None
    try:
        return ZoneInfo(tz_key)
    except Exception:
        pass
    abbr = tz_key.upper()
    mapped = ABBR_TO_TZ.get(abbr)
    if mapped:
        try:
            return ZoneInfo(mapped)
        except Exception:
            return None
    return None

def fmt_12h(dt: datetime) -> str:
    h = dt.hour % 12 or 12
    return f"{h}:{dt.minute:02d} {'AM' if dt.hour < 12 else 'PM'}"

def today_bounds_tgt() -> Tuple[datetime, datetime, ZoneInfo]:
    tgt = get_tz(TARGET_TZ) or ZoneInfo("UTC")
    now = datetime.now(tgt)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start, end, tgt

def discord_post(webhooks: Union[str, Sequence[str]], content: str) -> None:
    """Post content to one or many Discord webhooks, chunking for 2000-char limit."""
    targets = [webhooks] if isinstance(webhooks, str) else list(webhooks)

    # chunk to avoid Discord 2000-char limit
    parts: List[str] = []
    if len(content) <= 1900:
        parts = [content]
    else:
        buf = ""
        for line in content.splitlines():
            if len(buf) + len(line) + 1 > 1900:
                parts.append(buf)
                buf = line
            else:
                buf = (buf + "\n" + line) if buf else line
        if buf:
            parts.append(buf)

    for wh in targets:
        for p in parts:
            r = requests.post(wh, json={"content": p}, timeout=TIMEOUT)
            if r.status_code not in (200, 204):
                print(f"Discord error {r.status_code} -> {wh[:60]}…: {r.text[:300]}")
            time.sleep(POST_PAUSE_SEC)

# ---------------------- API path ----------------------
def _title_from_api(ev) -> str:
    t = ev.get("title") or ev.get("title_plain") or ev.get("post_title") or ""
    if isinstance(t, dict) and "rendered" in t:
        t = t["rendered"]
    return html.unescape(str(t)).strip()

def _link_from_api(ev) -> str:
    return (ev.get("url") or ev.get("link") or ev.get("permalink") or "").strip()

def _extract_any_abbr_or_tz(ev) -> Tuple[Optional[str], Optional[str]]:
    """Return (IANA_name, abbr) from plausible fields."""
    sdd = ev.get("start_date_details") or {}
    tz_name = (sdd.get("timezone") or "").strip()
    abbr = (sdd.get("timezone_abbr") or "").strip()
    if tz_name or abbr:
        return (tz_name or None, abbr or None)
    tz_name = (ev.get("timezone") or "").strip()
    abbr = (ev.get("timezone_abbr") or "").strip()
    return (tz_name or None, abbr or None)

def _dt_from_utc_str(s: str) -> Optional[datetime]:
    """Parse an ISO-like UTC string to aware datetime in UTC."""
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        pass
    try:
        dt = datetime.strptime(s.strip(), "%Y-%m-%d %H:%M:%S")
        return dt.replace(tzinfo=timezone.utc)
    except Exception:
        return None

def _format_when_converted(ev) -> Tuple[str, int, int]:
    """
    Build pretty time string converted to TARGET_TZ.
    Returns (text, month_in_target, day_in_target).
    """
    tgt_tz = get_tz(TARGET_TZ) or ZoneInfo("UTC")

    # Best: explicit UTC stamps
    s_utc = ev.get("start_date_utc") or ev.get("utc_start_date") or ev.get("start_utc")
    e_utc = ev.get("end_date_utc")   or ev.get("utc_end_date")   or ev.get("end_utc")
    if s_utc:
        sdt_utc = _dt_from_utc_str(s_utc)
        edt_utc = _dt_from_utc_str(e_utc) if e_utc else None
        if sdt_utc:
            s = sdt_utc.astimezone(tgt_tz)
            pretty = f"{MONTHS[s.month-1]} {s.day} @ {fmt_12h(s)} {s.tzname() or ''}"
            if edt_utc:
                e = edt_utc.astimezone(tgt_tz)
                if e.date() == s.date():
                    pretty += f" – {fmt_12h(e)} {e.tzname() or ''}"
                else:
                    pretty += f" – {MONTHS[e.month-1]} {e.day} @ {fmt_12h(e)} {e.tzname() or ''}"
            return pretty, s.month, s.day

    # Next: detail fields + a source tz
    sdd = ev.get("start_date_details") or {}
    edd = ev.get("end_date_details") or {}

    def _build_dt(d: dict) -> Optional[datetime]:
        try:
            nowy = datetime.now().year
            y = int(d.get("year") or nowy)
            m = int(d.get("month") or 0)
            da = int(d.get("day") or 0)
            hh = int(d.get("hour") or 0)
            mm = int(d.get("minutes") or 0)
            if not (y and m and da):
                return None
            return datetime(y, m, da, hh, mm)
        except Exception:
            return None

    s_naive = _build_dt(sdd)
    e_naive = _build_dt(edd) if edd else None

    src_name, src_abbr = _extract_any_abbr_or_tz(ev)
    src_tz = get_tz(src_name) or get_tz(src_abbr)

    if s_naive:
        s_src = s_naive.replace(tzinfo=src_tz or tgt_tz)  # assume target if unknown
        s = s_src.astimezone(tgt_tz)
        pretty = f"{MONTHS[s.month-1]} {s.day} @ {fmt_12h(s)} {s.tzname() or ''}"
        if e_naive:
            e_src = e_naive.replace(tzinfo=src_tz or tgt_tz)
            e = e_src.astimezone(tgt_tz)
            if e.date() == s.date():
                pretty += f" – {fmt_12h(e)} {e.tzname() or ''}"
            else:
                pretty += f" – {MONTHS[e.month-1]} {e.day} @ {fmt_12h(e)} {e.tzname() or ''}"
        return pretty, s.month, s.day

    # Fallback: parse a start_date string
    start_iso = ev.get("start_date") or ev.get("start") or ev.get("start_datetime")
    if start_iso:
        try:
            dt = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=(src_tz or tgt_tz))
            dt = dt.astimezone(tgt_tz)
            pretty = f"{MONTHS[dt.month-1]} {dt.day} @ {fmt_12h(dt)} {dt.tzname() or ''}"
            return pretty, dt.month, dt.day
        except Exception:
            pass
        try:
            cleaned = start_iso.replace("T", " ").split("+")[0].split("Z")[0].strip()
            dt = datetime.strptime(cleaned, "%Y-%m-%d %H:%M:%S")
            dt = (dt.replace(tzinfo=src_tz) if src_tz else dt.replace(tzinfo=tgt_tz)).astimezone(tgt_tz)
            pretty = f"{MONTHS[dt.month-1]} {dt.day} @ {fmt_12h(dt)} {dt.tzname() or ''}"
            return pretty, dt.month, dt.day
        except Exception:
            pass

    # Last resort: human field (no conversion)
    pretty = html.unescape(str(ev.get("human_start_time") or ev.get("date") or ev.get("date_utc") or "")).strip()
    return pretty, 0, 0

def fetch_events_via_api() -> List[dict]:
    start, end, _tgt = today_bounds_tgt()
    params = {
        "start_date": start.strftime("%Y-%m-%d"),
        "end_date": end.strftime("%Y-%m-%d"),
        "per_page": PER_PAGE,
        "page": 1,
    }
    try:
        r = requests.get(API_URL, params=params, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print("API request/parse error:", e)
        return []

    raw = data.get("events") or data.get("data") or []
    if not isinstance(raw, list):
        raw = raw.get("data") or []

    # (Optional) dump raw events for debugging
    with open("api_debug.json", "w", encoding="utf-8") as f:
        json.dump(raw, f, indent=2, ensure_ascii=False)

    out: List[dict] = []
    for ev in raw:
        title = _title_from_api(ev)
        link = _link_from_api(ev)
        when_text, m, d = _format_when_converted(ev)
        if title and when_text and (m, d) == (start.month, start.day):
            out.append({"title": title, "when": when_text, "link": link})
    return out

# ---------------------- HTML fallback ----------------------
MD_TIME_RE = re.compile(
    r"\b(" + "|".join(MONTHS) + r")\s+(\d{1,2})\s*@\s*([0-1]?\d:[0-5]\d\s*(?:AM|PM|am|pm))"
    r"(?:\s*[–-]\s*([0-1]?\d:[0-5]\d\s*(?:AM|PM|am|pm)))?\s*([A-Z]{2,4})?\b"
)

def parse_time_12h(s: str) -> Tuple[int, int]:
    s = s.strip().upper()
    hhmm, ampm = s.split()
    hh, mm = hhmm.split(":")
    h = int(hh); m = int(mm)
    if ampm == "AM":
        h = h % 12
    else:
        if h != 12:
            h += 12
    return h, m

def fetch_events_via_html_fallback() -> List[dict]:
    try:
        r = requests.get(LIST_URL, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT)
        r.raise_for_status()
    except Exception as e:
        print("HTML request error:", e)
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    containers = (
        soup.select("li.tribe-events-list-event")
        or soup.select("div.tribe-events-calendar-list__event-row")
        or soup.select("article.type-tribe_events")
        or soup.select("div.tribe-events-event-card")
    )

    start, end, tgt_tz = today_bounds_tgt()
    month_today, day_today = start.month, start.day

    rows: List[dict] = []
    for ev in containers:
        a = (
            ev.select_one(".tribe-event-title a")
            or ev.select_one(".tribe-events-calendar-list__event-title a")
            or ev.select_one("h3 a")
            or ev.select_one("h2 a")
        )
        if not a:
            continue

        title = html.unescape(a.get_text(strip=True))
        link = a.get("href") or ""

        dt_el = (
            ev.select_one(".tribe-event-date-start")
            or ev.select_one(".tribe-events-calendar-list__event-datetime")
            or ev.select_one(".tribe-events-event-datetime")
            or ev.select_one("time")
        )
        raw = " ".join((dt_el.get_text(" ", strip=True) if dt_el else ev.get_text(" ", strip=True)).split())

        m = MD_TIME_RE.search(raw)
        if not m:
            continue

        month_name = m.group(1); day = int(m.group(2))
        start_str = m.group(3); end_str = m.group(4)
        abbr = (m.group(5) or "").upper()

        month_num = MONTHS.index(month_name) + 1
        sh, sm = parse_time_12h(start_str)
        src_tz = get_tz(abbr) or get_tz(TARGET_TZ) or ZoneInfo("UTC")

        s_src = datetime(start.year, month_num, day, sh, sm, tzinfo=src_tz)
        s = s_src.astimezone(tgt_tz)

        pretty = f"{MONTHS[s.month-1]} {s.day} @ {fmt_12h(s)} {s.tzname() or ''}"
        if end_str:
            eh, em = parse_time_12h(end_str)
            e_src = datetime(start.year, month_num, day, eh, em, tzinfo=src_tz)
            e = e_src.astimezone(tgt_tz)
            if e.date() == s.date():
                pretty += f" – {fmt_12h(e)} {e.tzname() or ''}"
            else:
                pretty += f" – {MONTHS[e.month-1]} {e.day} @ {fmt_12h(e)} {e.tzname() or ''}"

        if s.month == month_today and s.day == day_today:
            rows.append({"title": title, "when": pretty, "link": link})

    # (Optional) dump detected rows
    with open("events_debug.json", "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    return rows

# ---------------------- Main ----------------------
def main():
    # Build a dynamic note line showing the current target tz abbreviation
    tgt = get_tz(TARGET_TZ) or ZoneInfo("UTC")
    tz_note = datetime.now(tgt).tzname() or TARGET_TZ

    events = fetch_events_via_api()
    if not events:
        print("API returned nothing for today; trying HTML fallback…")
        events = fetch_events_via_html_fallback()

    if events:
        # Console preview
        print("**UO Events Today (preview)**")
        for e in events:
            print(f"- {e['title']} | {e['when']}")

        # Discord message
        header = f"**UO Events Today**\n_(Times converted to {tz_note})_\n"
        body = "\n".join(
            f"• **{e['title']}** — {e['when']}\n<{e['link']}>" if e.get("link")
            else f"• **{e['title']}** — {e['when']}"
            for e in events
        )
        discord_post(WEBHOOKS, header + "\n" + body)
    else:
        print("No events found for today.")

if __name__ == "__main__":
    main()
