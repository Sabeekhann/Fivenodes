#!/usr/bin/env python3
"""Download external images and rewrite HTML to use local /images/ paths."""
import os
import re
import ssl
import hashlib
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

CLIENTS = {
    "fastaccounts.io": "fastaccounts.png",
    "recruitly.io": "recruitly.png",
    "peacecoin.com": "peacecoin.png",
    "cheetay.pk": "cheetay.png",
    "finqalab.com": "finqalab.png",
    "everest.org": "everest.png",
    "annebarge.com": "annebarge.png",
    "numerico.ai": "numerico.png",
}

AWARDS = {
    "https://static.clutch.co/static/files/widget-top-company-badge.svg": "clutch-badge.svg",
    "https://media.goodfirms.co/badges/white-badge/top-software-development-companies.svg": "goodfirms-badge.svg",
    "https://img.upcity.com/local-excellence-award-black.png": "upcity-award.png",
    "https://assets.themanifest.com/company/badge/2024-most-reviewed-companies.png": "manifest-badge.png",
}

PRODUCTS = {
    "https://image.thum.io/get/width/800/crop/600/noanimate/https://www.hrmprime.com/home": "hrm-prime-snapshot.webp",
    "https://image.thum.io/get/width/800/crop/600/noanimate/https://dgexpense.com/": "dg-expense-dashboard.png",
}


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return slug or "image"


def download(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 500:
        print(f"  skip (exists): {dest.name}")
        return True
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=45, context=ctx) as resp:
            data = resp.read()
        if len(data) < 200:
            print(f"  FAIL tiny file: {url}")
            return False
        dest.write_bytes(data)
        print(f"  saved: {dest.relative_to(ROOT)} ({len(data)} bytes)")
        return True
    except Exception as exc:
        print(f"  FAIL {url}: {exc}")
        return False


def fix_double_https(text: str) -> str:
    return text.replace("https://https://", "https://")


def main() -> None:
    for sub in ("clients", "awards", "portfolio", "products"):
        (ROOT / "images" / sub).mkdir(parents=True, exist_ok=True)

    print("=== Client logos ===")
    for domain, filename in CLIENTS.items():
        download(f"https://logo.clearbit.com/{domain}", ROOT / "images/clients" / filename)

    print("=== Awards ===")
    for url, filename in AWARDS.items():
        download(url, ROOT / "images/awards" / filename)

    print("=== Products ===")
    for url, filename in PRODUCTS.items():
        download(url, ROOT / "images/products" / filename)

    print("=== Portfolio ===")
    portfolio_map: dict[str, str] = {}
    portfolio_html = (ROOT / "portfolio/index.html").read_text(encoding="utf-8")
    portfolio_html = fix_double_https(portfolio_html)
    for match in re.finditer(r'<img class="proj-img" src="([^"]+)" alt="([^"]+)"', portfolio_html):
        url, alt = match.group(1), match.group(2)
        if url.startswith("/images/"):
            continue
        ext = ".webp" if ".webp" in url.split("?", 1)[0] else ".png"
        filename = f"{slugify(alt)}{ext}"
        portfolio_map[url] = f"/images/portfolio/{filename}"
        download(url, ROOT / "images/portfolio" / filename)

    print("=== Updating HTML ===")
    index = fix_double_https((ROOT / "index.html").read_text(encoding="utf-8"))
    for domain, filename in CLIENTS.items():
        bad = f'https://logo.clearbit.com/{domain}'
        good = f"/images/clients/{filename}"
        index = index.replace(f"https://https://logo.clearbit.com/{domain}", good)
        index = index.replace(bad, good)
    for url, filename in AWARDS.items():
        good = f"/images/awards/{filename}"
        index = index.replace(f"https://{url}", good)
        index = index.replace(url, good)
    (ROOT / "index.html").write_text(index, encoding="utf-8")
    print("  updated index.html")

    products = fix_double_https((ROOT / "products/index.html").read_text(encoding="utf-8"))
    products = products.replace(
        "https://devsouq.com/wp-content/uploads/2026/01/hrm-prime-snapshot.webp",
        "/images/products/hrm-prime-snapshot.webp",
    )
    products = products.replace(
        "https://devsouq.com/wp-content/uploads/2026/01/dashboard-scaled.png",
        "/images/products/dg-expense-dashboard.png",
    )
    (ROOT / "products/index.html").write_text(products, encoding="utf-8")
    print("  updated products/index.html")

    for url, local in portfolio_map.items():
        portfolio_html = portfolio_html.replace(url, local)
    (ROOT / "portfolio/index.html").write_text(portfolio_html, encoding="utf-8")
    print("  updated portfolio/index.html")

    remaining = []
    for html in ROOT.rglob("*.html"):
        text = html.read_text(encoding="utf-8", errors="ignore")
        if "devsouq.com" in text or "https://https://" in text:
            remaining.append(str(html.relative_to(ROOT)))
    if remaining:
        print("WARNING: remaining external refs in:", ", ".join(remaining))
    else:
        print("OK: no devsouq.com or double-https refs left in HTML")


if __name__ == "__main__":
    main()
