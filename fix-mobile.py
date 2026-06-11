#!/usr/bin/env python3
"""Apply mobile reliability fixes across all HTML pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent

MOBILE_CSS = """
/* Mobile reliability fixes */
@media (max-width:768px),(hover:none) and (pointer:coarse){
  body,button,a,.btn,.nav-link,.hamburger,.faq-q,.ind-card,.f-social-btn,.footer-links a,.exit-close,.exit-dismiss,.nl-btn,.nav-logo,.dd-item{cursor:auto!important;-webkit-tap-highlight-color:rgba(200,241,53,0.15)}
  #cursor,#cursor-ring{display:none!important}
  #bg-canvas,#hero-canvas,.hero-canvas-wrap{display:none!important}
  .reveal{opacity:1!important;transform:none!important}
  .hero{min-height:auto;padding:100px 0 60px}
}
"""

MOBILE_JS = """
(function(){
  var mobile=window.matchMedia('(max-width:768px)').matches||window.matchMedia('(hover:none) and (pointer:coarse)').matches;
  if(!mobile)return;
  ['cursor','cursor-ring','bg-canvas'].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});
  document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('vis');});
})();
"""


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    if "Mobile reliability fixes" not in text and "</style>" in text:
        text = text.replace("</style>", MOBILE_CSS + "</style>", 1)

    if "Mobile reliability fixes" in text and "var mobile=window.matchMedia" not in text:
        if "<script>" in text:
            text = text.replace("<script>", "<script>" + MOBILE_JS, 1)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for html in ROOT.rglob("*.html"):
        if html.name.startswith("_"):
            continue
        if patch_file(html):
            changed += 1
            print(f"  patched: {html.relative_to(ROOT)}")
    print(f"Done. Updated {changed} files.")


if __name__ == "__main__":
    main()
