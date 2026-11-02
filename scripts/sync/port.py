# usage: port.py <entry-web-path>... ; copies the web closure into desktop layout, never overwriting existing desktop files unless --force
import sys, os, shutil
sys.path.insert(0, os.path.dirname(__file__))
from graph import Resolver, closure
WEB="/Users/diptanshumahish/personal/imgi"; R="/Users/diptanshumahish/personal/bg-desktop/src/renderer"
PKGS=["core","api","ui","engine","studio-core","platform","darkroom","studio"]
alias={p:f"{WEB}/packages/{p}/src" for p in PKGS}
alias["video"]=None  # desktop fork: stop at boundary
def to_desk(webpath):
    rel=os.path.relpath(webpath,WEB)
    for p in PKGS:
        pre=f"packages/{p}/src/"
        if rel.startswith(pre): return f"{R}/packages/{p}/{rel[len(pre):]}"
    if rel.startswith("apps/web/src/"): return f"{R}/web/{rel[len('apps/web/src/'):]}"
    for a in ("menus","albums","qr"):
        pre=f"apps/{a}/src/"
        if rel.startswith(pre): return f"{R}/products/{a}/{rel[len(pre):]}"
    return None
class R2(Resolver):
    def resolve(self, spec, fromfile):
        if spec.startswith("@bitgrain/video/"): return None, "video-fork"
        return super().resolve(spec, fromfile)
if __name__=="__main__":
    force="--force" in sys.argv; dry="--dry" in sys.argv
    entries=[os.path.join(WEB,a) for a in sys.argv[1:] if not a.startswith("--")]
    seen,missing,pkgs=closure(entries,R2({k:v for k,v in alias.items() if v}))
    copied=0; skipped=[]
    for f in sorted(seen):
        d=to_desk(f)
        if d is None: skipped.append(f); continue
        if os.path.exists(d) and not force: continue
        copied+=1
        if not dry:
            os.makedirs(os.path.dirname(d),exist_ok=True); shutil.copy2(f,d)
    print(f"closure {len(seen)} copied {copied}")
    if skipped: print("OUTSIDE MAP:", skipped[:20])
    real=[m for m in missing if not m[1].startswith("@bitgrain/video/")]
    if real: print("MISSING:", real[:30])
    vid=sorted({m[1] for m in missing if m[1].startswith("@bitgrain/video/")})
    if vid: print("VIDEO-FORK refs:", vid)
    print("npm:", sorted(pkgs))
