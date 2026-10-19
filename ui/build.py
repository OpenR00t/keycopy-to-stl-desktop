#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 The KeyCopy to STL contributors
"""Rebuild dist/index.html (the app's embedded UI) from ui/. Run from anywhere; no dependencies."""
import pathlib, re
UI = pathlib.Path(__file__).resolve().parent
OUT = UI.parent / "dist" / "index.html"
r = lambda p: (UI / p).read_text(encoding="utf-8")
html = r("ui.html")
html = html.replace('<script src="https://cdn.jsdelivr.net/npm/clipper-lib@6.4.2/clipper.js"></script>', "<script>" + r("vendor/clipper.js") + "</script>")
html = html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', "<script>" + r("vendor/three.min.js") + "</script>")
html = re.sub(r'<link rel="preconnect"[^>]*>\n', "", html)
html = re.sub(r'<link href="https://fonts.googleapis.com[^>]*>', lambda m: "<style>" + r("vendor/fonts.css") + "</style>", html)
html = html.replace("/*CORE*/", r("core.js")).replace("/*WARD*/", r("wardings.min.json"))
assert not re.search(r"(googleapis|gstatic|cdn\.jsdelivr|cdnjs)", html), "external reference left in build"
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
