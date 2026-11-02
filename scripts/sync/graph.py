import re, os, sys, json
IMPORT_RE = re.compile(r'''(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|new\s+URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url''', re.S)
EXTS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", "/index.ts", "/index.tsx", "/index.js"]
def specs(text):
    out=[]
    for m in IMPORT_RE.finditer(text):
        s = next(g for g in m.groups() if g)
        out.append(s)
    return out
def resolve_file(base):
    for e in EXTS:
        p = base + e
        if os.path.isfile(p): return p
    return None
class Resolver:
    def __init__(self, alias):  # alias: dict pkg -> dir
        self.alias = alias
    def resolve(self, spec, fromfile):
        clean = spec.split("?")[0]
        if clean.startswith("."):
            return resolve_file(os.path.normpath(os.path.join(os.path.dirname(fromfile), clean))), "rel"
        m = re.match(r'^@bitgrain/([a-z-]+)/(.*)$', clean)
        if m:
            d = self.alias.get(m.group(1))
            if d is None: return None, "alias-missing"
            return resolve_file(os.path.join(d, m.group(2))), "alias"
        if clean.startswith("/"):
            return None, "abs"
        return None, "pkg:" + (clean.split("/")[0] if not clean.startswith("@") else "/".join(clean.split("/")[:2]))
def closure(entries, resolver, skip=lambda p: False):
    seen=set(); stack=list(entries); missing=[]; pkgs=set()
    while stack:
        f=stack.pop()
        if f in seen: continue
        seen.add(f)
        if not f.endswith((".ts",".tsx",".js",".jsx",".mjs")): continue
        for s in specs(open(f, encoding="utf-8", errors="ignore").read()):
            r, kind = resolver.resolve(s, f)
            if r:
                if not skip(r): stack.append(r)
            elif kind.startswith("pkg:"): pkgs.add(kind[4:])
            elif kind != "abs": missing.append((f, s))
    return seen, missing, pkgs
