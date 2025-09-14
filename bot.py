import os
import json
import time
import random
import requests
import hmac, hashlib, struct, base64
import re
from itertools import combinations
from typing import Optional, List, Dict, Set, Tuple
from pathlib import Path
import tempfile
import shutil

# Price cache state
_item_values = {}         # in-memory snapshot used for all decisions/printing
_item_values_fetched_at = 0.0
_last_refresh_attempt = 0.0

# Price cache config (initialized after config is loaded)
PRICE_CACHE = {}
PRICE_CACHE_ENABLED = True
PRICE_CACHE_FILE = "cache/rolimons_itemdetails.json"
PRICE_CACHE_TTL = 600
PRICE_CACHE_MIN_INTERVAL = 120
PRICE_CACHE_REFRESH_ON_MISSING = True

# Projected items config (initialized after config is loaded)
AVOID_PROJECTED = True
AVOID_PROJECTED_OFFER = False
PROJECTED_UNKNOWN_IS_PROJECTED = False

# Load configuration from JSON file
with open('config.json', 'r') as f:
    config = json.load(f)

# Update config-dependent values
PRICE_CACHE = config.get("price_cache", {})
PRICE_CACHE_ENABLED = PRICE_CACHE.get("enabled", True)
PRICE_CACHE_FILE = PRICE_CACHE.get("file", "cache/rolimons_itemdetails.json")
PRICE_CACHE_TTL = int(PRICE_CACHE.get("ttl_seconds", 600))
PRICE_CACHE_MIN_INTERVAL = int(PRICE_CACHE.get("min_refresh_interval_seconds", 120))
PRICE_CACHE_REFRESH_ON_MISSING = bool(PRICE_CACHE.get("refresh_on_missing_id", True))

AVOID_PROJECTED = config['trading_preferences'].get('avoid_projected', True)
AVOID_PROJECTED_OFFER = config['trading_preferences'].get('avoid_projected_offer', False)
PROJECTED_UNKNOWN_IS_PROJECTED = config['trading_preferences'].get('projected_unknown_is_projected', False)

def _safe_read_json(path: str):
    p = Path(path)
    if not p.exists():
        return None
    try:
        with p.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None

def _safe_write_json_atomic(path: str, data: dict):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = None
    try:
        fd, tmp = tempfile.mkstemp(prefix="rolimons_", suffix=".json", dir=str(p.parent))
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f)
        shutil.move(tmp, p)
    finally:
        try:
            if tmp and os.path.exists(tmp):
                os.remove(tmp)
        except Exception:
            pass

def fetch_item_values_http():
    # single place to call Rolimon's
    try:
        r = requests.get(rolimons_api_url, timeout=10 if FAST_MODE else 20)
        r.raise_for_status()
        return r.json().get("items", {})
    except Exception:
        return {}

def _load_cache_from_disk():
    data = _safe_read_json(PRICE_CACHE_FILE)
    if not data or "items" not in data or "fetched_at" not in data:
        return {}, 0.0
    return data["items"], float(data["fetched_at"])

def _save_cache_to_disk(items: dict):
    payload = {"items": items, "fetched_at": time.time()}
    _safe_write_json_atomic(PRICE_CACHE_FILE, payload)

def _should_refresh(now: float) -> bool:
    global _item_values_fetched_at, _last_refresh_attempt
    if not PRICE_CACHE_ENABLED:
        return True
    # stale by TTL
    if now - _item_values_fetched_at > PRICE_CACHE_TTL:
        # also rate-limit refresh attempts
        return (now - _last_refresh_attempt) > PRICE_CACHE_MIN_INTERVAL
    return False

def get_item_values_cached(ensure_ids: List[int] = None, force_refresh: bool = False) -> dict:
    """
    Returns the in-memory snapshot, refreshing from disk or HTTP if needed.
    ensure_ids: if any not present and policy allows, do a one-off refresh.
    """
    global _item_values, _item_values_fetched_at, _last_refresh_attempt

    now = time.time()

    # First load from disk if in-memory is empty
    if not _item_values:
        disk_items, disk_ts = _load_cache_from_disk()
        if disk_items:
            _item_values = disk_items
            _item_values_fetched_at = disk_ts

    # Decide if we need an HTTP refresh
    need_refresh = force_refresh or _should_refresh(now)

    # If missing IDs are requested and allowed, trigger refresh even if TTL not expired
    if ensure_ids and PRICE_CACHE_ENABLED and PRICE_CACHE_REFRESH_ON_MISSING:
        missing = [str(i) for i in ensure_ids if str(i) not in _item_values]
        if missing and (now - _last_refresh_attempt) > PRICE_CACHE_MIN_INTERVAL:
            need_refresh = True

    if need_refresh:
        _last_refresh_attempt = now
        fresh = fetch_item_values_http()
        if fresh:
            _item_values = fresh
            _item_values_fetched_at = time.time()
            if PRICE_CACHE_ENABLED:
                _save_cache_to_disk(_item_values)
        # if HTTP failed, keep using the last-good in-memory/disk snapshot

    return _item_values

def values_snapshot_age_seconds() -> int:
    return int(time.time() - _item_values_fetched_at) if _item_values_fetched_at else -1

# Owner tracking constants
ROLIMONS_ITEM_URL = "https://www.rolimons.com/item/{asset_id}"
TABLE_ID = "bc_owners_table"  # per your HTML


# Load configuration from JSON file
with open('config.json', 'r') as f:
    config = json.load(f)

# Owner tracking config
OWNER_TRACKING_ENABLED = config['owner_tracking']['enabled']
TARGET_ASSET_ID = config['owner_tracking']['target_asset_id']
MIN_OWNED_DAYS = config['owner_tracking']['min_owned_days']
MAX_OWNED_DAYS = config['owner_tracking']['max_owned_days']
PAGE_SIZE = config['owner_tracking']['page_size']
MAX_PAGES = config['owner_tracking']['max_pages']
OUTPUT_FILE = config['owner_tracking']['output_file']
OUTPUT_CSV = config['owner_tracking']['output_csv']
STOP_WHEN_OLDER = config['owner_tracking']['stop_when_older']
FLUSH_PER_PAGE = config['owner_tracking']['flush_per_page']
ASSUME_SORTED = config['owner_tracking']['assume_sorted']

# Processed owners tracking
PROCESSED_OWNERS_FILE = "processed_owners.txt"

# =====================
# SPEED TUNING
# =====================
FAST_MODE = config['speed']['fast_mode']                 # master switch for speed
FAST_DISABLE_IMAGES = config['speed']['fast_disable_images']       # speeds up rendering; safe (we click DOM, not images)
IMPLICIT_WAIT_SECS = config['speed']['implicit_wait_secs']
PAGE_CHANGE_TIMEOUT = config['speed']['page_change_timeout']
MUTATION_POLL_MS = config['speed']['mutation_poll_ms']
HUMAN_DELAY_MIN = config['speed']['human_delay_min']
HUMAN_DELAY_MAX = config['speed']['human_delay_max']
MAX_PAGES_SCAN = config['speed']['max_pages_scan']             # max "next" clicks per panel

# =====================
# CONFIG (yours)
# =====================
# Load all rap tiers dynamically
RAP_TIERS = sorted(config['rap_tiers'], key=lambda t: t.get('min_value', 0))

MIN_ITEM_VALUE = config['limits'].get('min_item_value', 1000)

def get_tier_for_rap(rap_value):
    """Get the appropriate tier for a given RAP value."""
    for tier in RAP_TIERS:
        min_val = tier.get('min_value', 0)
        max_val = tier.get('max_value', float('inf'))
        if min_val <= rap_value <= max_val:
            return tier
    # If no tier matches, return the last one (highest tier)
    return RAP_TIERS[-1] if RAP_TIERS else None

UPGRADE_TO_VALUED_ONLY = config['trading_preferences']['upgrade_to_valued_only']
VALUED_PREMIUM_MIN_PERCENT = config['trading_preferences']['valued_premium_min_percent']
VALUED_PREMIUM_MAX_PERCENT = config['trading_preferences']['valued_premium_max_percent']

MAX_OFFER_ITEMS = config['limits']['max_offer_items']
MAX_REQUEST_ITEMS = config['limits']['max_request_items']

USER_ID = config['user']['user_id']
COOKIE_VALUE = config['user']['cookie_value'] or os.getenv("ROBLOSECURITY", "").strip()

ITEMS_I_WANT_TO_KEEP = config['user']['items_i_want_to_keep']

# APIs
inventory_url_template = "https://inventory.roblox.com/v1/users/{}/assets/collectibles?assetType=All&sortOrder=Asc&limit=100"
trade_check_url_template = "https://trades.roblox.com/v1/users/{}/can-trade-with"
rolimons_api_url = "https://www.rolimons.com/itemapi/itemdetails"
user_ids_api_url = "https://api.rolimons.com/tradeads/v1/getrecentads"

ITEMS_I_WANT_TO_KEEP = []

# APIs
inventory_url_template = "https://inventory.roblox.com/v1/users/{}/assets/collectibles?assetType=All&sortOrder=Asc&limit=100"
trade_check_url_template = "https://trades.roblox.com/v1/users/{}/can-trade-with"
rolimons_api_url = "https://www.rolimons.com/itemapi/itemdetails"
user_ids_api_url = "https://api.rolimons.com/tradeads/v1/getrecentads"

# Console colors - Standard ANSI colors for UI compatibility
light_gray = "\033[37m"    # White (bright)
medium_gray = "\033[90m"   # Bright black (gray)
dark_gray = "\033[30m"     # Black
white = "\033[97m"         # Bright white
soft_green = "\033[34m"    # Blue (will be mapped to accent color)
soft_red = "\033[91m"      # Bright red
RESET_COLOR = "\033[0m"

# =====================
# SELENIUM CONFIG
# =====================
USE_EXISTING_CHROME_PROFILE = config['selenium']['use_existing_chrome_profile']
CHROME_USER_DATA_DIR = config['selenium']['chrome_user_data_dir']
CHROME_PROFILE_NAME = config['selenium']['chrome_profile_name']

HEADLESS = config['selenium']['headless']
WINDOW_SIZE = config['selenium']['window_size']

# =====================
# Selenium setup
# =====================
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver import ActionChains

from collections import Counter

def _count_by_asset_id(items):
    """
    items: list of dicts that include 'assetId'
    Returns Counter[str assetId] of how many copies to select.
    """
    c = Counter()
    for it in items:
        c[str(it["assetId"])] += 1
    return dict(c)

def _human_pause():
    time.sleep(random.uniform(HUMAN_DELAY_MIN, HUMAN_DELAY_MAX))

def build_driver():
    opts = Options()
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument(f"--window-size={WINDOW_SIZE}")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-extensions")
    opts.add_argument("--log-level=3")
    opts.add_argument("--disable-renderer-backgrounding")
    opts.add_argument("--disable-background-timer-throttling")
    opts.add_argument("--disable-background-networking")
    opts.add_argument("--disable-features=Translate,site-per-process")
    if FAST_DISABLE_IMAGES:
        opts.add_experimental_option("prefs", {
            "profile.managed_default_content_settings.images": 2
        })
    # Faster load: don't wait for all resources
    try:
        opts.page_load_strategy = 'eager'
    except Exception:
        pass

    if USE_EXISTING_CHROME_PROFILE:
        opts.add_argument(f"--user-data-dir={CHROME_USER_DATA_DIR}")
        opts.add_argument(f"--profile-directory={CHROME_PROFILE_NAME}")

    # Use Selenium Manager (no Service, no webdriver_manager)
    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(30)
    driver.implicitly_wait(IMPLICIT_WAIT_SECS)
    return driver

def ensure_logged_in(driver):
    driver.get("https://www.roblox.com/home")
    _human_pause()
    if USE_EXISTING_CHROME_PROFILE:
        return
    if not COOKIE_VALUE:
        raise RuntimeError("Missing ROBLOSECURITY cookie. Set env var ROBLOSECURITY.")
    driver.delete_all_cookies()
    driver.add_cookie({
        "name": ".ROBLOSECURITY",
        "value": COOKIE_VALUE,
        "domain": ".roblox.com",
        "path": "/",
        "httpOnly": True,
        "secure": True,
        "sameSite": "Lax"
    })
    driver.get("https://www.roblox.com/home")
    _human_pause()

# =====================
# 2FA helpers
# =====================
def generate_totp(secret_base32: str, interval: int = 30, digits: int = 6) -> str:
    if not secret_base32:
        return ""
    key = base64.b32decode(secret_base32.replace(" ", "").upper())
    counter = int(time.time()) // interval
    msg = struct.pack(">Q", counter)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    o = h[19] & 0x0F
    code = (struct.unpack(">I", h[o:o+4])[0] & 0x7fffffff) % (10 ** digits)
    return str(code).zfill(digits)


# =====================
# Owner tracking helpers
# =====================
def t(s: Optional[str]) -> str:
    return (s or "").strip()


def wait_css(driver, css, timeout=25):
    return WebDriverWait(driver, timeout).until(EC.presence_of_element_located((By.CSS_SELECTOR, css)))


def parse_age_to_days(txt: str) -> Optional[float]:
    """Parse '3 days ago', '6 days ago', '1 week ago', '8 hours ago' -> days (float)."""
    s = t(txt).lower()
    if "ago" not in s:
        return None
    s = s.replace("about ", "").replace("an ", "1 ").replace("a ", "1 ")
    m = re.match(r"(\d+)\s+(hour|day|week|month|year)s?\s+ago", s)
    if not m:
        return None
    n = int(m.group(1))
    unit = m.group(2)
    factor = {"hour": 1/24, "day": 1, "week": 7, "month": 30, "year": 365}.get(unit)
    return n * factor if factor else None


def click_premium_copies_if_present(driver, verbose=False):
    for xp in ["//a[contains(.,'Premium Copies')]", "//button[contains(.,'Premium Copies')]", "//a[contains(@href,'#premium')]"]:
        try:
            el = driver.find_element(By.XPATH, xp)
            cls = (el.get_attribute("class") or "").lower()
            if "active" not in cls:
                try:
                    el.click()
                except Exception:
                    driver.execute_script("arguments[0].click();", el)
                time.sleep(0.35)
            if verbose:
                print("[tab] Premium Copies ensured.")
            return
        except Exception:
            continue
    if verbose:
        print("[tab] Premium Copies not found (likely already there).")


def table_first_row_sig(driver) -> str:
    try:
        first = driver.find_elements(By.CSS_SELECTOR, f"table#{TABLE_ID} tbody tr")[0]
        return first.text
    except Exception:
        return ""


def wait_for_redraw(driver, old_sig: str, timeout=6) -> bool:
    end = time.time() + timeout
    while time.time() < end:
        if table_first_row_sig(driver) != old_sig:
            return True
        time.sleep(0.12)
    return False


def set_page_size(driver, size=100, verbose=False):
    """Force 'Show size' by name = bc_owners_table_length; then wait for redraw."""
    try:
        select = driver.find_element(By.CSS_SELECTOR, "select[name='bc_owners_table_length']")
        old = table_first_row_sig(driver)
        try:
            Select(select).select_by_value(str(size))
        except Exception:
            driver.execute_script("""
                const s = arguments[0];
                s.value = arguments[1];
                s.dispatchEvent(new Event('change', {bubbles:true}));
            """, select, str(size))
        time.sleep(0.5)
        if not wait_for_redraw(driver, old, timeout=6) and verbose:
            print("[page-size] Redraw not detected (may already match).")
        elif verbose:
            print(f"[page-size] Set to {size}.")
        return True
    except Exception:
        if verbose:
            print("[page-size] Could not set select (selector missing).")
        return False


def has_next(driver) -> bool:
    """Check li.next in the paginator for bc_owners_table."""
    try:
        li = driver.find_element(By.CSS_SELECTOR, f"#{TABLE_ID}_paginate li.next")
        cls = li.get_attribute("class") or ""
        return "disabled" not in cls
    except Exception:
        # Fallback using aria-controls
        try:
            a = driver.find_element(By.CSS_SELECTOR, f"a[aria-controls='{TABLE_ID}'].page-link")
            parent = a.find_element(By.XPATH, "./parent::*")
            cls = parent.get_attribute("class") or ""
            return "disabled" not in cls
        except Exception:
            return False


def click_next(driver, verbose=False) -> bool:
    for css in [f"#{TABLE_ID}_paginate li.next a.page-link", f"#{TABLE_ID}_paginate li.next a",
                f"a[aria-controls='{TABLE_ID}'].page-link"]:
        try:
            a = driver.find_element(By.CSS_SELECTOR, css)
            sig_before = table_first_row_sig(driver)
            try:
                a.click()
            except Exception:
                driver.execute_script("arguments[0].click();", a)
            time.sleep(0.35)
            if wait_for_redraw(driver, sig_before, timeout=6):
                if verbose:
                    print("[paginate] Next -> page changed.")
                return True
            else:
                if verbose:
                    print("[paginate] Next clicked but no redraw.")
                return False
        except Exception:
            continue
    if verbose:
        print("[paginate] Next not found.")
    return False


def extract_user_from_row(row) -> Tuple[Optional[int], str]:
    """Find first <a href='/player/ID'>username</a> in row."""
    try:
        link = row.find_element(By.CSS_SELECTOR, "a[href^='/player/']")
        href = link.get_attribute("href") or ""
        m = re.search(r"/player/(\d+)", href)
        uid = int(m.group(1)) if m else None
        uname = t(link.text)
        return uid, uname
    except Exception:
        return None, ""


def load_processed_owners() -> Set[int]:
    """Load processed owners from file."""
    processed = set()
    try:
        if os.path.exists(PROCESSED_OWNERS_FILE):
            with open(PROCESSED_OWNERS_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        processed.add(int(line))
    except Exception:
        pass
    return processed


def save_processed_owner(owner_id: int):
    """Save a processed owner to file."""
    try:
        with open(PROCESSED_OWNERS_FILE, "a", encoding="utf-8") as f:
            f.write(f"{owner_id}\n")
    except Exception:
        pass


def scrape_owners(driver, asset_id: int, min_days: float, max_days: float,
                  page_size: int, max_pages: int, verbose=False,
                  stop_when_older=True, assume_sorted=True,
                  out_handle=None, out_csv_handle=None):
    driver.get(ROLIMONS_ITEM_URL.format(asset_id=asset_id))
    click_premium_copies_if_present(driver, verbose=verbose)

    wait_css(driver, f"table#{TABLE_ID}", timeout=25)
    set_page_size(driver, size=page_size, verbose=verbose)

    collected: List[Dict] = []
    seen: Set[int] = set()
    pages = 0
    seen_in_window_any = False  # have we ever seen a row within [min,max] yet?

    while pages < max_pages:
        pages += 1
        rows = driver.find_elements(By.CSS_SELECTOR, f"table#{TABLE_ID} tbody tr.odd, table#{TABLE_ID} tbody tr.even")
        if verbose:
            print(f"[page {pages}] rows: {len(rows)}")

        page_hits = 0
        page_all_older = True  # assume older until we find otherwise

        for r in rows:
            days = None
            # Owned Since is usually td.sorting_1
            try:
                owned_td = r.find_element(By.CSS_SELECTOR, "td.sorting_1")
                days = parse_age_to_days(owned_td.text)
            except Exception:
                for td in r.find_elements(By.TAG_NAME, "td"):
                    if "ago" in (td.text or "").lower():
                        d = parse_age_to_days(td.text)
                        if d is not None:
                            days = d
                            break

            if days is None:
                # Can't interpret; don't affect early-stop heuristic
                continue

            if days <= max_days:
                page_all_older = False  # found something not older than max

            if min_days <= days <= max_days:
                uid, uname = extract_user_from_row(r)
                if uid and uid not in seen:
                    seen.add(uid)
                    rec = {"user_id": uid, "username": uname, "owned_since_days": round(days, 3)}
                    collected.append(rec)
                    page_hits += 1
                    seen_in_window_any = True

                    # Flush immediately if requested (handles both txt and csv)
                    if out_handle is not None:
                        out_handle.write(str(uid) + "\n")
                        out_handle.flush()
                    if out_csv_handle is not None:
                        out_csv_handle.write(f'{uid},{uname},{round(days,3)}\n')
                        out_csv_handle.flush()

        if verbose:
            print(f"[page {pages}] captured: {page_hits}, total: {len(collected)}")

        # Early stop if we assume sorted and this page is entirely older than max
        if stop_when_older and assume_sorted and seen_in_window_any and page_all_older:
            if verbose:
                print("[early-stop] Entire page is older than max; stopping.")
            break

        if not has_next(driver):
            if verbose:
                print("[paginate] No next page.")
            break

        if not click_next(driver, verbose=verbose):
            break

    return collected

def maybe_handle_two_step_verification(driver, max_attempts: int = 3) -> bool:
    try:
        WebDriverWait(driver, 2 if FAST_MODE else 3).until(
            EC.presence_of_element_located((By.ID, "two-step-verification-code-input"))
        )
    except Exception:
        return True  # no 2FA
    for attempt in range(1, max_attempts + 1):
        secret = config['user']['totp_secret'] or os.getenv("ROBLOX_TOTP_SECRET", "").strip()
        if secret:
            code = generate_totp(secret)
            print(f"{white}[2FA] Using TOTP (attempt {attempt}/{max_attempts}).{RESET_COLOR}")
        else:
            try:
                code = input("Enter 6-digit Roblox 2FA code: ").strip()
            except Exception:
                code = ""
        if not (code and code.isdigit() and len(code) == 6):
            print(f"{soft_red}[2FA] Invalid code; must be 6 digits.{RESET_COLOR}")
            continue
        try:
            box = driver.find_element(By.ID, "two-step-verification-code-input")
            box.clear()
            box.send_keys(code)
            # Click Verify
            verify_btn = None
            for sel in [
                'button.btn-cta-md.modal-modern-footer-button[aria-label="Verify"]',
                '//button[contains(@class,"modal-modern-footer-button") and contains(.,"Verify")]',
                '//button[contains(.,"Verify")]'
            ]:
                try:
                    verify_btn = driver.find_element(By.XPATH, sel) if sel.startswith("//") else driver.find_element(By.CSS_SELECTOR, sel)
                    if verify_btn.is_displayed() and verify_btn.is_enabled():
                        break
                    verify_btn = None
                except Exception:
                    verify_btn = None
            if not verify_btn:
                print(f"{soft_red}[2FA] Verify button not found.{RESET_COLOR}")
                continue
            try:
                verify_btn.click()
            except Exception:
                driver.execute_script("arguments[0].click();", verify_btn)
            # Quick poll for disappearance
            end = time.time() + (2.5 if FAST_MODE else 8)
            ok = False
            while time.time() < end:
                try:
                    if not driver.find_elements(By.ID, "two-step-verification-code-input"):
                        ok = True
                        break
                except Exception:
                    ok = True
                    break
                time.sleep(0.12 if FAST_MODE else 0.25)
            if ok:
                print(f"{soft_green}[2FA] Verified.{RESET_COLOR}")
                return True
            print(f"{soft_red}[2FA] Code rejected/timeout; retrying… ({attempt}/{max_attempts}){RESET_COLOR}")
        except Exception as e:
            print(f"{soft_red}[2FA] Error: {e}{RESET_COLOR}")
    return False

# =====================
# Helpers for value/RAP logic
# =====================
def fetch_item_values():
    try:
        response = requests.get(rolimons_api_url, timeout=10 if FAST_MODE else 20)
        response.raise_for_status()
        data = response.json()
        return data['items']
    except requests.RequestException:
        return {}

def rolimons_value(item, item_values):
    iid = str(item['assetId'])
    if iid in item_values and item_values[iid][3] != -1:
        return item_values[iid][3]
    return -1

def get_item_value(item, item_values):
    val = rolimons_value(item, item_values)
    return val if val != -1 else item.get('recentAveragePrice', 0) or 0

def is_valued(item, item_values):
    return rolimons_value(item, item_values) != -1

def is_rap_only(item, item_values):
    return rolimons_value(item, item_values) == -1

PROJECTED_IDX = 7  # Rolimon's itemdetails: [name, acronym, rap, value, defaultValue, demand, trend, projected, hyped, rare]

def is_projected(item, item_values) -> bool:
    arr = item_values.get(str(item['assetId']))
    if not arr:
        # If we didn't get Rolimon's row for this item, follow your preference:
        return bool(PROJECTED_UNKNOWN_IS_PROJECTED)
    # Rolimon's uses 1 for true, -1 for false (or sometimes 0/None when absent)
    try:
        flag = int(arr[PROJECTED_IDX]) if len(arr) > PROJECTED_IDX and arr[PROJECTED_IDX] is not None else -1
    except Exception:
        flag = -1
    return flag == 1

def drop_projecteds(inv: List[dict], item_values: dict, for_offer_side: bool) -> List[dict]:
    """
    Remove projected items based on config:
      - for_offer_side=True  -> use AVOID_PROJECTED_OFFER
      - for_offer_side=False -> use AVOID_PROJECTED
    """
    use_flag = AVOID_PROJECTED_OFFER if for_offer_side else AVOID_PROJECTED
    if not use_flag:
        return inv
    out = []
    for it in inv:
        # PROJECTED_UNKNOWN_IS_PROJECTED lets you be strict if Rolimon's row is missing
        if not is_projected(it, item_values):
            out.append(it)
    return out

# =====================
# Inventory + users
# =====================
def fetch_limiteds(user_id):
    api_url = inventory_url_template.format(user_id)
    try:
        response = requests.get(api_url, timeout=10 if FAST_MODE else 20)
        response.raise_for_status()
        data = response.json()
        limiteds = [item for item in data.get('data', []) if not item.get('isOnHold', True)]
        return [{
            'userAssetId': item['userAssetId'],
            'assetId': item['assetId'],
            'name': item['name'],
            'recentAveragePrice': item.get('recentAveragePrice', 0) or 0,
        } for item in limiteds]
    except requests.RequestException:
        return []

def can_trade_with(user_id):
    url = trade_check_url_template.format(user_id)
    headers = {'Cookie': f'.ROBLOSECURITY={COOKIE_VALUE}'}
    try:
        response = requests.get(url, headers=headers, timeout=8 if FAST_MODE else 15)
        response.raise_for_status()
        data = response.json()
        return data.get('canTrade', False)
    except requests.RequestException:
        return False

def fetch_new_user_ids(seen_user_ids):
    try:
        response = requests.get(user_ids_api_url, timeout=8 if FAST_MODE else 20)
        data = response.json()
        if data.get("success"):
            current_user_ids = [ad[2] for ad in data.get("trade_ads", [])]
            new_user_ids = [uid for uid in current_user_ids if uid not in seen_user_ids]
            seen_user_ids.update(new_user_ids)
            return new_user_ids
        return []
    except Exception:
        return []

# =====================
# RAP gain rules
# =====================
def calculate_rap_gain(your_total_rap, their_total_rap):
    rap_difference = their_total_rap - your_total_rap
    tier = get_tier_for_rap(your_total_rap)
    if not tier:
        return False
    rap_gain_min = your_total_rap * tier['min_gain_percent']
    rap_gain_max = your_total_rap * tier['max_gain_percent']
    return rap_gain_min <= rap_difference <= rap_gain_max

# =====================
# NEW: valued-upgrade finder
# =====================
def within_valued_premium_bounds(your_total, their_total):
    if your_total <= 0:
        return False
    premium = (their_total - your_total) / float(your_total)
    return VALUED_PREMIUM_MIN_PERCENT <= premium <= VALUED_PREMIUM_MAX_PERCENT

def find_upgrade_to_valued_trade(your_inventory, their_inventory, item_values):
    your_sorted = sorted(
        [i for i in your_inventory if i['assetId'] not in ITEMS_I_WANT_TO_KEEP],
        key=lambda it: get_item_value(it, item_values), reverse=True
    )[:12]
    their_sorted = sorted(their_inventory, key=lambda it: get_item_value(it, item_values), reverse=True)[:12]
    your_pool = [i for i in your_sorted if is_rap_only(i, item_values)]
    if AVOID_PROJECTED_OFFER:
        your_pool = [i for i in your_pool if not is_projected(i, item_values)]
    their_pool = [i for i in their_sorted if is_valued(i, item_values)]
    if AVOID_PROJECTED:
        their_pool = [i for i in their_pool if not is_projected(i, item_values)]

    best = []
    seen_offers = set()

    for r in range(1, min(len(your_pool), MAX_OFFER_ITEMS) + 1):
        for offer_combo in combinations(your_pool, r):
            offer_ids = frozenset(i['userAssetId'] for i in offer_combo)
            if offer_ids in seen_offers:
                continue
            offer_total = sum(get_item_value(i, item_values) for i in offer_combo)

            for s in range(1, min(len(their_pool), MAX_REQUEST_ITEMS) + 1):
                for ask_combo in combinations(their_pool, s):
                    ask_total = sum(get_item_value(i, item_values) for i in ask_combo)
                    if ask_total <= offer_total:
                        continue
                    if within_valued_premium_bounds(offer_total, ask_total):
                        trade = {
                            'items': list(offer_combo),
                            'their_items': list(ask_combo),
                            'my_total_rap': offer_total,
                            'their_total_rap': ask_total,
                            'rap_gain': ask_total - offer_total,
                            'mode': 'upgrade_to_valued',
                        }
                        best.append(trade)
                        seen_offers.add(offer_ids)
                        return sorted(best, key=lambda x: x['rap_gain'], reverse=True)[:1]
    return sorted(best, key=lambda x: x['rap_gain'], reverse=True)[:1]

# =====================
# (Other finders kept for flexibility)
# =====================
def find_upgrade_trade(your_inventory, their_inventory, item_values):
    your_inventory = sorted(your_inventory, key=lambda item: get_item_value(item, item_values), reverse=True)[:10]
    their_inventory = sorted(their_inventory, key=lambda item: get_item_value(item, item_values), reverse=True)[:10]
    top_trades = []
    unique_offerings = set()
    for r in range(1, min(len(your_inventory), MAX_OFFER_ITEMS) + 1):
        for combo in combinations(your_inventory, r):
            if AVOID_PROJECTED_OFFER and any(is_projected(x, item_values) for x in combo):
                continue
            combo_total_rap = sum(get_item_value(item, item_values) for item in combo)
            combo_set = frozenset(item['userAssetId'] for item in combo)
            if combo_set in unique_offerings:
                continue
            for s in range(1, min(len(their_inventory), MAX_REQUEST_ITEMS) + 1):
                for their_combo in combinations(their_inventory, s):
                    if AVOID_PROJECTED and any(is_projected(x, item_values) for x in their_combo):
                        continue
                    their_combo_total_rap = sum(get_item_value(item, item_values) for item in their_combo)
                    if s >= r or their_combo_total_rap <= combo_total_rap:
                        continue
                    if calculate_rap_gain(combo_total_rap, their_combo_total_rap):
                        top_trades.append({
                            'items': combo,
                            'their_items': their_combo,
                            'my_total_rap': combo_total_rap,
                            'their_total_rap': their_combo_total_rap,
                            'rap_gain': their_combo_total_rap - combo_total_rap,
                            'mode': 'upgrade'
                        })
                        unique_offerings.add(combo_set)
                        return sorted(top_trades, key=lambda x: x['rap_gain'], reverse=True)[:1]
    return sorted(top_trades, key=lambda x: x['rap_gain'], reverse=True)[:1]

def find_downgrade_trade(your_inventory, their_inventory, item_values):
    # Filter out items below minimum value threshold
    your_inventory = [item for item in your_inventory
                     if get_item_value(item, item_values) >= MIN_ITEM_VALUE]
    their_inventory = [item for item in their_inventory
                      if get_item_value(item, item_values) >= MIN_ITEM_VALUE]
    
    if not your_inventory or not their_inventory:
        return []
        
    your_inventory = sorted(your_inventory, key=lambda item: get_item_value(item, item_values), reverse=True)[:10]
    their_inventory = sorted(their_inventory, key=lambda item: get_item_value(item, item_values), reverse=True)[:10]
    best_trades = []
    unique_offerings = set()
    for r in range(1, min(len(your_inventory), MAX_OFFER_ITEMS) + 1):
        for your_combo in combinations(your_inventory, r):
            if AVOID_PROJECTED_OFFER and any(is_projected(x, item_values) for x in your_combo):
                continue
            your_combo_total_rap = sum(get_item_value(item, item_values) for item in your_combo)
            combo_set = frozenset(item['userAssetId'] for item in your_combo)
            if combo_set in unique_offerings:
                continue
            if r == 1:
                for s in range(2, min(len(their_inventory), MAX_REQUEST_ITEMS) + 1):
                    for their_combo in combinations(their_inventory, s):
                        if AVOID_PROJECTED and any(is_projected(x, item_values) for x in their_combo):
                            continue
                        if all(get_item_value(item, item_values) < your_combo_total_rap for item in their_combo):
                            their_combo_total_rap = sum(get_item_value(item, item_values) for item in their_combo)
                            rap_gain = their_combo_total_rap - your_combo_total_rap
                            trade_id = (tuple(sorted(item['userAssetId'] for item in your_combo)),
                                        tuple(sorted(item['userAssetId'] for item in their_combo)))
                            if calculate_rap_gain(your_combo_total_rap, their_combo_total_rap) and trade_id not in unique_offerings:
                                best_trades.append({
                                    'items': your_combo,
                                    'their_items': their_combo,
                                    'my_total_rap': your_combo_total_rap,
                                    'their_total_rap': their_combo_total_rap,
                                    'rap_gain': rap_gain,
                                    'mode': 'downgrade'
                                })
                                unique_offerings.add(trade_id)
                                return sorted(best_trades, key=lambda x: x['rap_gain'], reverse=True)[:1]
            else:
                for s in range(1, min(len(their_inventory), MAX_REQUEST_ITEMS) + 1):
                    for their_combo in combinations(their_inventory, s):
                        if AVOID_PROJECTED and any(is_projected(x, item_values) for x in their_combo):
                            continue
                        their_combo_total_rap = sum(get_item_value(item, item_values) for item in their_combo)
                        if (r < s and their_combo_total_rap > your_combo_total_rap) or (r > s and their_combo_total_rap < your_combo_total_rap):
                            rap_gain = their_combo_total_rap - your_combo_total_rap
                            trade_id = (tuple(sorted(item['userAssetId'] for item in your_combo)),
                                        tuple(sorted(item['userAssetId'] for item in their_combo)))
                            if calculate_rap_gain(your_combo_total_rap, their_combo_total_rap) and trade_id not in unique_offerings:
                                best_trades.append({
                                    'items': your_combo,
                                    'their_items': their_combo,
                                    'my_total_rap': your_combo_total_rap,
                                    'their_total_rap': their_combo_total_rap,
                                    'rap_gain': rap_gain,
                                    'mode': 'downgrade'
                                })
                                unique_offerings.add(trade_id)
    return sorted(best_trades, key=lambda x: x['rap_gain'], reverse=True)[:1]

def find_1v1_trade(your_inventory, their_inventory, item_values):
    your_inventory = sorted(your_inventory, key=lambda item: get_item_value(item, item_values), reverse=True)[:10]
    their_inventory = sorted(their_inventory, key=lambda item: get_item_value(item, item_values), reverse=True)[:10]
    top_trades = []
    unique_offerings = set()
    for your_item in your_inventory:
        for their_item in their_inventory:
            your_item_value = get_item_value(your_item, item_values)
            their_item_value = get_item_value(their_item, item_values)
            combo_set = frozenset([your_item['userAssetId']])
            if combo_set in unique_offerings or their_item_value <= your_item_value:
                continue
            rap_gain = their_item_value - your_item_value
            if calculate_rap_gain(your_item_value, their_item_value):
                top_trades.append({
                    'items': [your_item],
                    'their_items': [their_item],
                    'my_total_rap': your_item_value,
                    'their_total_rap': their_item_value,
                    'rap_gain': rap_gain,
                    'mode': '1v1'
                })
                unique_offerings.add(combo_set)
                return sorted(top_trades, key=lambda x: x['rap_gain'], reverse=True)[:1]
    return sorted(top_trades, key=lambda x: x['rap_gain'], reverse=True)[:1]

# =====================
# UI helpers (console)
# =====================
def generate_tradelink(user_id, their_user_asset_ids):
    asset_ids = ','.join(str(asset_id) for asset_id in their_user_asset_ids)
    return f"https://www.roblox.com/users/{user_id}/trade?ritems={asset_ids}"

def calculate_win_percentage(rap_gain, total_rap):
    if total_rap == 0:
        return 0
    return (rap_gain / total_rap) * 100

def display_inventory(inventory):
    print("\nFetching Your Inventory...")
    if inventory:
        print("Tradable Items:")
        for item in inventory:
            print(f" {light_gray} - {item['name']}{RESET_COLOR}")
    else:
        print("No tradable items found.")

# =====================
# Selenium – FAST DOM actions (scan pages, bulk click matches)
# =====================
def _wait(driver, by, sel, timeout=10 if FAST_MODE else 30):
    return WebDriverWait(driver, timeout).until(EC.presence_of_element_located((by, sel)))

def get_inventory_panel(driver, side: str):
    headers = driver.find_elements(By.CSS_SELECTOR, "h2.inventory-label.paired-name")
    target_header = None
    for h in headers:
        txt = (h.text or "").strip()
        if side == "your" and txt == "Your Inventory":
            target_header = h
            break
        if side == "their" and txt.endswith("Inventory") and txt != "Your Inventory":
            target_header = h
            break
    if not target_header:
        return None
    try:
        panel = target_header.find_element(
            By.XPATH,
            "./ancestor::*[contains(@class,'inventory') or contains(@class,'panel') or contains(@class,'trade')][1]"
        )
    except Exception:
        panel = target_header
    return panel

def _panel_visible_asset_ids(driver, panel):
    # JS is much faster than Python loops
    try:
        return driver.execute_script("""
            const pnl = arguments[0];
            const els = pnl.querySelectorAll('span.thumbnail-2d-container[thumbnail-target-id]');
            const out = [];
            for (const e of els) out.push(e.getAttribute('thumbnail-target-id'));
            return out;
        """, panel) or []
    except Exception:
        return []

def _panel_click_arrow_and_wait(driver, side: str, panel, direction="right") -> bool:
    before = _panel_visible_asset_ids(driver, panel)
    css = "span.icon-right" if direction == "right" else "span.icon-left"
    try:
        arrow = panel.find_element(By.CSS_SELECTOR, css)
    except Exception:
        return False
    try:
        arrow.click()
    except Exception:
        driver.execute_script("arguments[0].click();", arrow)

    # short polling for change
    deadline = time.time() + PAGE_CHANGE_TIMEOUT
    while time.time() < deadline:
        pnl = get_inventory_panel(driver, side)
        if not pnl:
            return False
        after = _panel_visible_asset_ids(driver, pnl)
        if after and after != before:
            return True
        time.sleep(MUTATION_POLL_MS / 1000.0)
    return False

def _go_to_first_page(driver, side: str, max_hops: int = 10 if FAST_MODE else 40):
    panel = get_inventory_panel(driver, side)
    if not panel:
        return
    seen_sig = None
    hops = 0
    while hops < max_hops:
        panel = get_inventory_panel(driver, side)
        if not panel:
            break
        current = tuple(_panel_visible_asset_ids(driver, panel))
        if current == seen_sig:
            break
        seen_sig = current
        moved = _panel_click_arrow_and_wait(driver, side, panel, direction="left")
        if not moved:
            break
        hops += 1

def _bulk_click_asset_ids_on_page_multi(driver, panel, need_counts):
    """
    Click up to `count` distinct thumbnails for each assetId on this panel.
    Skips 'on hold' cards and already-selected cards when possible.

    need_counts: dict[str assetId] -> int remaining to select
    Returns: dict[str assetId] -> int actually clicked on this page
    """
    try:
        clicked_counts = driver.execute_script("""
            const pnl = arguments[0];
            const need = arguments[1]; // {assetId: count}
            const result = {};
            const isSelected = (card) => {
              // Heuristics for "already in trade"/selected.
              if (!card) return false;
              const cls = (card.getAttribute('class') || '').toLowerCase();
              if (cls.includes('selected') || cls.includes('in-trade')) return true;
              if (card.getAttribute('aria-pressed') === 'true') return true;
              if (card.dataset && (card.dataset.selected === 'true' || card.dataset.inTrade === 'true')) return true;
              // Some UIs add a checkmark overlay:
              if (card.querySelector('.selected, .in-trade, .check, .checkmark')) return true;
              return false;
            };
            const isHolding = (card) => {
              if (!card) return false;
              return !!card.querySelector('.item-card-holding-label');
            };

            for (const [aid, countNeeded] of Object.entries(need)) {
              if (!countNeeded || countNeeded <= 0) continue;
              let remaining = countNeeded;

              // Prefer targeting by userAssetId if present on DOM
              // (Some UIs expose data-userasset-id on each card)
              // If not, fallback to many cards with same assetId.
              const thumbs = pnl.querySelectorAll('span.thumbnail-2d-container[thumbnail-target-id="'+aid+'"]');
              // We will traverse and click DISTINCT cards until we satisfy `remaining`
              for (const th of thumbs) {
                if (remaining <= 0) break;
                const card = th.closest('.item-card') || th.closest('[data-item-card]');
                // Skip cards that appear "on hold" or already selected when possible:
                if (isHolding(card) || isSelected(card)) continue;

                // Click this card
                th.click();
                remaining -= 1;
              }

              // If we still need more, relax the filters and allow cards that look selected/holding
              // (some UIs do not update classes immediately, or use different markup)
              if (remaining > 0) {
                for (const th of thumbs) {
                  if (remaining <= 0) break;
                  const card = th.closest('.item-card') || th.closest('[data-item-card]');
                  // Try to avoid double-click deselect: if it *looks* selected, skip it.
                  // But if every card looked selected, we at least try a click:
                  // here we only click ones that don't look selected to reduce toggling risk.
                  const cls = (card && card.getAttribute('class') || '').toLowerCase();
                  if (cls.includes('selected') || cls.includes('in-trade')) continue;
                  th.click();
                  remaining -= 1;
                }
              }

              result[aid] = countNeeded - Math.max(0, remaining);
            }
            return result;
        """, panel, dict(need_counts)) or {}
        # Remove zero entries; return only what was clicked
        return {k: int(v) for k, v in clicked_counts.items() if int(v) > 0}
    except Exception:
        return {}

def _select_items_across_pages_multi(driver, side: str, need_counts):
    """
    need_counts: dict[str assetId] -> int copies needed.
    Returns True when all counts hit zero.
    """
    # normalize keys to str and drop zeros
    remaining = {str(k): int(v) for k, v in need_counts.items() if int(v) > 0}
    if not remaining:
        return True

    _go_to_first_page(driver, side)

    seen_sigs = set()
    for _ in range(MAX_PAGES_SCAN):
        panel = get_inventory_panel(driver, side)
        if not panel:
            break

        vis = _panel_visible_asset_ids(driver, panel)
        sig = (tuple(vis), tuple(sorted(remaining.items())))
        if sig in seen_sigs:
            # No further progress on this visible set with same remaining
            # move pages until we cycle or run out
            pass
        seen_sigs.add(sig)

        # Which assetIds on this page do we still need?
        need_here = {aid: cnt for aid, cnt in remaining.items() if aid in vis and cnt > 0}
        if need_here:
            clicked_counts = _bulk_click_asset_ids_on_page_multi(driver, panel, need_here)
            if clicked_counts:
                # subtract clicked from remaining
                for aid, got in clicked_counts.items():
                    remaining[aid] = max(0, remaining.get(aid, 0) - int(got))
                # small settle
                time.sleep(0.08 if FAST_MODE else 0.2)

                # prune zeros
                remaining = {k: v for k, v in remaining.items() if v > 0}
                if not remaining:
                    return True

        # Next page
        if not _panel_click_arrow_and_wait(driver, side, panel, "right"):
            break

    return len(remaining) == 0

def send_trade_via_selenium(driver, other_user_id, my_items, their_items):
    trade_url = f"https://www.roblox.com/users/{other_user_id}/trade"
    driver.get(trade_url)

    # Wait for any trade UI text (short wait)
    try:
        _wait(driver, By.CSS_SELECTOR, "h2.inventory-label.paired-name", timeout=8 if FAST_MODE else 40)
    except Exception:
        print(f"{soft_red}[UI] Trade composer not detected.{RESET_COLOR}")
        return False

    # Sometimes need to click a tab/button to start composing
    for sel in [
        '//button[contains(.,"Send") and contains(.,"Trade")]',
        '//a[contains(.,"Send") and contains(.,"Trade")]',
        '//button[contains(.,"Make Offer")]',
        '//button[contains(.,"Send Offer")]',
    ]:
        try:
            el = driver.find_element(By.XPATH, sel)
            if el.is_displayed() and el.is_enabled():
                try:
                    el.click()
                except Exception:
                    driver.execute_script("arguments[0].click();", el)
                break
        except Exception:
            pass

    # Select YOUR items
    # Select YOUR items (support multiple copies)
    my_need = _count_by_asset_id(my_items)
    if not _select_items_across_pages_multi(driver, "your", my_need):
        print(f"{soft_red}[UI] Could not add all YOUR items (missing some).{RESET_COLOR}")
        return False

    # Select THEIR items (support multiple copies)
    their_need = _count_by_asset_id(their_items)
    if not _select_items_across_pages_multi(driver, "their", their_need):
        print(f"{soft_red}[UI] Could not add all THEIR items (missing some).{RESET_COLOR}")
        return False

    # Click Send/Make Offer button
    send_clicked = False
    for sel in [
        '//button[contains(.,"Send") and contains(.,"Offer")]',
        '//button[contains(.,"Make Offer")]',
        '//button[contains(.,"Send")]',
        'button.trade-submit',
    ]:
        try:
            btn = driver.find_element(By.XPATH, sel) if sel.startswith("//") else driver.find_element(By.CSS_SELECTOR, sel)
            if btn.is_displayed() and btn.is_enabled():
                try:
                    btn.click()
                except Exception:
                    driver.execute_script("arguments[0].click();", btn)
                send_clicked = True
                break
        except Exception:
            pass
    if not send_clicked:
        print(f"{soft_red}[UI] Send/Offer button not found.{RESET_COLOR}")
        return False

    # Modal confirm (fast)
    try:
        modal_btn = WebDriverWait(driver, 2.5 if FAST_MODE else 8).until(
            EC.element_to_be_clickable((By.ID, "modal-action-button"))
        )
        try:
            modal_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", modal_btn)
    except Exception:
        pass  # modal may not always appear

    # 2FA
    if not maybe_handle_two_step_verification(driver, max_attempts=2 if FAST_MODE else 3):
        print(f"{soft_red}[2FA] Verification failed. Trade not sent.{RESET_COLOR}")
        return False

    # Optional: reset both panels to page 1 to keep UI tidy
    _go_to_first_page(driver, "your")
    _go_to_first_page(driver, "their")

    print(f"{soft_green}[OK] Trade submitted in UI for user {other_user_id}.{RESET_COLOR}")
    return True

# =====================
# MAIN LOOP
# =====================
def fetch_item_values():
    """Legacy alias for get_item_values_cached()"""
    return get_item_values_cached()


def run_owner_tracking():
    """Run owner tracking for a specific item and return collected user IDs."""
    if not OWNER_TRACKING_ENABLED or TARGET_ASSET_ID == 0:
        return []
    
    print(f"{medium_gray}[Owner Tracking] Starting tracking for asset {TARGET_ASSET_ID}...{RESET_COLOR}")
    
    # Prepare output files (overwrite on each run)
    out_handle = None
    out_csv_handle = None
    try:
        if OUTPUT_FILE:
            os.makedirs(os.path.dirname(OUTPUT_FILE) or ".", exist_ok=True)
            out_handle = open(OUTPUT_FILE, "w", encoding="utf-8")
        if OUTPUT_CSV:
            os.makedirs(os.path.dirname(OUTPUT_CSV) or ".", exist_ok=True)
            out_csv_handle = open(OUTPUT_CSV, "w", encoding="utf-8")
            out_csv_handle.write("user_id,username,owned_since_days\n")
            out_csv_handle.flush()

        driver = build_driver()
        try:
            records = scrape_owners(
                driver,
                asset_id=TARGET_ASSET_ID,
                min_days=MIN_OWNED_DAYS,
                max_days=MAX_OWNED_DAYS,
                page_size=PAGE_SIZE,
                max_pages=MAX_PAGES,
                verbose=True,  # Enable verbose output
                stop_when_older=bool(STOP_WHEN_OLDER),
                assume_sorted=bool(ASSUME_SORTED),
                out_handle=out_handle if bool(FLUSH_PER_PAGE) else None,
                out_csv_handle=out_csv_handle if bool(FLUSH_PER_PAGE) else None
            )
        finally:
            try:
                driver.quit()
            except Exception:
                pass
    finally:
        # If we didn't flush per page, write everything now
        if out_handle is not None and bool(FLUSH_PER_PAGE) == False:
            for rec in records:
                out_handle.write(str(rec["user_id"]) + "\n")
        if out_csv_handle is not None and bool(FLUSH_PER_PAGE) == False:
            for rec in records:
                out_csv_handle.write(f'{rec["user_id"]},{rec["username"]},{rec["owned_since_days"]}\n')
        if out_handle:
            out_handle.close()
        if out_csv_handle:
            out_csv_handle.close()

    print(f"{soft_green}[Owner Tracking] Collected {len(records)} owner(s) for asset {TARGET_ASSET_ID} in range {MIN_OWNED_DAYS}-{MAX_OWNED_DAYS}.{RESET_COLOR}")
    if OUTPUT_FILE:
        print(f"{light_gray} -> IDs saved to: {OUTPUT_FILE}{RESET_COLOR}")
    if OUTPUT_CSV:
        print(f"{light_gray} -> CSV saved to: {OUTPUT_CSV}{RESET_COLOR}")
    
    # Return just the user IDs for integration with the trading bot
    return [rec["user_id"] for rec in records]

def fetch_limiteds(user_id):
    api_url = inventory_url_template.format(user_id)
    try:
        r = requests.get(api_url, timeout=10 if FAST_MODE else 20)
        r.raise_for_status()
        data = r.json()
        limiteds = [item for item in data.get('data', []) if not item.get('isOnHold', True)]
        return [{
            'userAssetId': item['userAssetId'],
            'assetId': item['assetId'],
            'name': item['name'],
            'recentAveragePrice': item.get('recentAveragePrice', 0) or 0,
        } for item in limiteds]
    except Exception:
        return []

def main():
    # Initialize price cache at startup
    item_values = get_item_values_cached()
    print(f"{medium_gray}[Cache] Loaded Rolimon's snapshot (age: {values_snapshot_age_seconds()}s){RESET_COLOR}")

    # Run owner tracking if enabled
    owner_tracking_users = []
    if OWNER_TRACKING_ENABLED and TARGET_ASSET_ID != 0:
        owner_tracking_users = run_owner_tracking()
        print(f"{medium_gray}[Owner Tracking] Found {len(owner_tracking_users)} users to target.{RESET_COLOR}")
    
    # Load processed owners to avoid reprocessing
    processed_users = load_processed_owners()
    print(f"{medium_gray}[Info] Loaded {len(processed_users)} previously processed users.{RESET_COLOR}")
    
    seen_user_ids = set()
    
    # Refresh cache if stale before processing users
    if _should_refresh(time.time()):
        item_values = get_item_values_cached()
        print(f"{medium_gray}[Cache] Refreshed Rolimon's snapshot (age: {values_snapshot_age_seconds()}s){RESET_COLOR}")

    your_inventory = fetch_limiteds(USER_ID)
    your_inventory = [item for item in your_inventory if item['assetId'] not in ITEMS_I_WANT_TO_KEEP]
    your_inventory.sort(key=lambda x: get_item_value(x, item_values), reverse=True)

    display_inventory(your_inventory)
    print(f"\n{white}Finding Trades...{RESET_COLOR}\n")

    driver = build_driver()
    ensure_logged_in(driver)

    try:
        while True:
            # Get candidate users quickly
            new_user_ids = []
            if owner_tracking_users:
                # Use owner tracking users if available
                new_user_ids = [uid for uid in owner_tracking_users if uid not in seen_user_ids]
                if not new_user_ids:
                    # If we've processed all owner tracking users, exit
                    print(f"{white}[Owner Tracking] Finished processing all {len(owner_tracking_users)} users.{RESET_COLOR}")
                    break
            else:
                # Fall back to fetching new user IDs from API
                new_user_ids = fetch_new_user_ids(seen_user_ids)
            
            for other_user_id in new_user_ids:
                if other_user_id in processed_users:
                    continue
                if not can_trade_with(other_user_id):
                    processed_users.add(other_user_id)
                    continue

                other_inventory = fetch_limiteds(other_user_id)
                if not other_inventory:
                    processed_users.add(other_user_id)
                    continue

                other_inventory = [item for item in other_inventory if item['assetId'] not in ITEMS_I_WANT_TO_KEEP]
                your_inventory.sort(key=lambda x: get_item_value(x, item_values), reverse=True)

                # Ensure needed IDs are present in cache
                need_ids = [it['assetId'] for it in your_inventory + other_inventory]
                item_values = get_item_values_cached(ensure_ids=need_ids)

                # Hard-filter projections early (fewer combos later)
                your_inventory  = drop_projecteds(your_inventory,  item_values, for_offer_side=True)
                other_inventory = drop_projecteds(other_inventory, item_values, for_offer_side=False)

                # Determine which trade types to search for based on trading modes
                trading_modes = config['trading_preferences'].get('trading_modes', ['upgrade'])
                if not isinstance(trading_modes, list):
                    trading_modes = [trading_modes]  # Backward compatibility
                
                upgrade_to_valued_trades = []
                upgrade_trades = []
                downgrade_trades = []
                onevone_trades = []

                if UPGRADE_TO_VALUED_ONLY or 'valued' in trading_modes:
                    upgrade_to_valued_trades = find_upgrade_to_valued_trade(your_inventory, other_inventory, item_values)
                if 'upgrade' in trading_modes:
                    upgrade_trades = find_upgrade_trade(your_inventory, other_inventory, item_values)
                if 'downgrade' in trading_modes:
                    downgrade_trades = find_downgrade_trade(your_inventory, other_inventory, item_values)
                if '1v1' in trading_modes:
                    onevone_trades = find_1v1_trade(your_inventory, other_inventory, item_values)

                mode_lists = {
                    'valued':    upgrade_to_valued_trades or [],
                    'upgrade':   upgrade_trades or [],
                    'downgrade': downgrade_trades or [],
                    '1v1':       onevone_trades or [],
                }

                # pick first non-empty list following the order in trading_modes
                best = None
                best_mode = None
                for mode in trading_modes:
                    lst = mode_lists.get(mode, [])
                    if lst:
                        best = lst[0]
                        best_mode = mode
                        break

                # if still nothing (e.g., modes disabled), fall back to any
                if not best:
                    all_trades = sum(mode_lists.values(), [])
                    if not all_trades:
                        processed_users.add(other_user_id)
                        continue
                    best = all_trades[0]
                    best_mode = best.get("mode", "trade")

                print(f"{light_gray}-------{RESET_COLOR}")
                print(f"{white}User ID: {other_user_id}{RESET_COLOR}")

                def print_trade(label, trade):
                    my_items_display = ', '.join([item['name'] for item in trade['items']])
                    their_items_display = ', '.join([item['name'] for item in trade['their_items']])
                    tradelink = generate_tradelink(other_user_id, [item['userAssetId'] for item in trade['their_items']])
                    win_percentage = calculate_win_percentage(trade['rap_gain'], trade['my_total_rap'])
                    print(
                        f"{medium_gray}[{label}]{RESET_COLOR}\n"
                        f"{white}Offering [{my_items_display}] ({trade['my_total_rap']}) "
                        f"for [{their_items_display}] ({trade['their_total_rap']}) | {trade['rap_gain']} "
                        f"{soft_green}({win_percentage:.2f}%) {RESET_COLOR}\n"
                        f"{medium_gray}[using Rolimon's snapshot age: {values_snapshot_age_seconds()}s]{RESET_COLOR}\n"
                        f"{light_gray}{tradelink}{RESET_COLOR}"
                    )

                print_trade(best_mode, best)

                # Ship via Selenium
                my_sel = [{"assetId": it["assetId"], "name": it["name"]} for it in best["items"]]
                their_sel = [{"assetId": it["assetId"], "name": it["name"]} for it in best["their_items"]]

                ok = send_trade_via_selenium(driver, other_user_id, my_sel, their_sel)
                if not ok:
                    print(f"{soft_red}[FAIL] Selenium send failed for user {other_user_id}.{RESET_COLOR}")
                else:
                    print(f"{soft_green}[DONE] Trade attempted for user {other_user_id}.{RESET_COLOR}")

                print(f"{light_gray}-------{RESET_COLOR}")
                processed_users.add(other_user_id)
                save_processed_owner(other_user_id)

            time.sleep(0.25 if FAST_MODE else 1.0)
    finally:
        try:
            driver.quit()
        except Exception:
            pass

# Reuse value helpers (placed after to keep file compact)
def fetch_item_values():  # override earlier alias for clarity
    """Legacy alias for get_item_values_cached()"""
    return get_item_values_cached()

if __name__ == "__main__":
    main()


