import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from graph import Resolver, closure
R="/Users/diptanshumahish/personal/bg-desktop/src/renderer"
PK=["core","api","ui","engine","studio-core","platform","darkroom","studio"]
alias={p:f"{R}/packages/{p}" for p in PK}; alias["video"]=f"{R}/modules/video"
entries=[f"{R}/main.tsx",f"{R}/harness/index.ts",f"{R}/modules/video/harness/index.ts"]
seen,missing,_=closure(entries,Resolver(alias))
dry="--dry" in sys.argv; removed=0
for d in ("packages","web","products"):
    for root,_,fs in os.walk(f"{R}/{d}"):
        for f in fs:
            p=os.path.join(root,f)
            if f.endswith((".ts",".tsx")) and not f.endswith(".d.ts") and p not in seen:
                removed+=1
                if not dry: os.remove(p)
for root,dirs,fs in os.walk(R, topdown=False):
    if not os.listdir(root) and not dry: os.rmdir(root)
print("reachable",len(seen),"removed",removed)
for m in missing[:20]: print("MISSING",m)
