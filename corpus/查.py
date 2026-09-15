# -*- coding: utf-8 -*-
"""查典籍語料：corpus/查.py <關鍵字> [-t T3] [-n 20] [-f]

  -t  只查某主題（T1–T10）
  -n  最多列幾條（預設 10）
  -f  印全文（預設只印前 80 字）

查不到就是查不到，不要自己補。
"""
import io, json, sys
from pathlib import Path

D = json.load(io.open(Path(__file__).parent / "index.json", encoding="utf-8"))


def argv():
    """Windows 主控台的 argv 會被 cp950 吃掉中文，改從 Win32 寬字元 API 取回。"""
    if sys.platform != "win32":
        return sys.argv[1:]
    import ctypes
    from ctypes import wintypes
    k, sh = ctypes.windll.kernel32, ctypes.windll.shell32
    k.GetCommandLineW.restype = wintypes.LPCWSTR
    k.GetCommandLineW.argtypes = []
    sh.CommandLineToArgvW.restype = ctypes.POINTER(wintypes.LPWSTR)
    sh.CommandLineToArgvW.argtypes = [wintypes.LPCWSTR, ctypes.POINTER(ctypes.c_int)]
    n = ctypes.c_int()
    p = sh.CommandLineToArgvW(k.GetCommandLineW(), ctypes.byref(n))
    a = [p[i] for i in range(n.value)]
    return a[2:] if len(a) > 1 and a[1].endswith("查.py") else a[1:]


def main(argv):
    skip = {i + 1 for i, a in enumerate(argv) if a in ("-t", "-n")}
    kw = [a for i, a in enumerate(argv) if not a.startswith("-") and i not in skip]
    topic = argv[argv.index("-t") + 1] if "-t" in argv else None
    n = int(argv[argv.index("-n") + 1]) if "-n" in argv else 10
    full = "-f" in argv
    out = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    hits = []
    for x in D["條目"]:
        if topic and topic not in x["主題"]:
            continue
        hay = x["原文"] + x.get("篇", "") + x.get("條", "") + x.get("部", "")
        if all(k in hay for k in kw):
            hits.append(x)

    out.write("命中 %d 條%s\n\n" % (len(hits), "" if len(hits) <= n else "（列前 %d）" % n))
    for x in hits[:n]:
        loc = "《%s》%s%s%s" % (x["書"], x["卷"],
                               x.get("部", "") and "・" + x["部"], x.get("篇", ""))
        if x.get("條"):
            loc += "・" + x["條"]
        body = x["原文"] if full else x["原文"][:80] + ("…" if len(x["原文"]) > 80 else "")
        out.write("[%s] %s（%s:%s）\n%s\n\n" % (x["id"], loc, x["檔"], x["行"], body))
    out.flush()


if __name__ == "__main__":
    av = argv()
    if not av:
        print(__doc__)
    else:
        main(av)
