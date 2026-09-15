#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""驗.py —— 網頁內容 × 語料庫 的機器檢查

用法：
    python 驗.py            # 跑全部，印表格
    python 驗.py -v         # 連通過的細項也印
    python 驗.py 直引       # 只跑名稱含「直引」的檢查

設計原則：這支程式不做判斷，只做比對。
它會漏掉的東西寫在檔案最後的「本程式抓不到什麼」，那些要人去看。
離開碼：全通過 0，有失敗 1。
"""
import io, json, re, sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.stdout.reconfigure(encoding="utf-8")

# ───────────────────────── 基礎 ─────────────────────────

# 以下 VARIANT／DROP／「直引至少 4 字」都是本專案選的比對口徑，不是典籍規定。
# 網頁與語料庫的字形不同源，比對前折成同一形
VARIANT = str.maketrans({
    "爲": "為", "剋": "克", "宫": "宮", "衝": "沖", "羣": "群",
    "兑": "兌", "螣": "騰", "裏": "里", "産": "產", "麽": "麼",
    "蜇": "蟄", "牀": "床", "兇": "凶", "覩": "睹",
})
# 原文裡的 * 與 □ 是原書遮字，比對時剔除
DROP = re.compile(r"[、，。；：！？「」『』（）()〈〉《》\s·．,\.\-—…□*／/　]")


def norm(s: str) -> str:
    return DROP.sub("", s.translate(VARIANT))


def load():
    d = json.loads(io.open(ROOT / "corpus/index.json", encoding="utf-8").read())
    ents = d["條目"]
    return {
        "ents": ents,
        "blob": norm("\n".join(e["原文"] for e in ents)),
        "pian": {e["篇"] for e in ents if e["篇"]},
        "by_pian": {(e["書"], e["篇"]): e for e in ents},
    }


def read(name):
    return io.open(ROOT / name, encoding="utf-8").read()


def whitelist():
    """本頁自撰、明確不是典籍的句子。一行一句，# 開頭是註解。

    每一條都是人判定的，不是算出來的。加進來前先確定它沒在冒充原文。
    """
    f = ROOT / "本頁整理.txt"
    if not f.exists():
        return set()
    out = set()
    for ln in io.open(f, encoding="utf-8"):
        ln = ln.strip()
        if ln and not ln.startswith("#"):
            out.add(norm(ln))
    return out


# 已查明的錯篇名 → 語料庫裡真正的篇。這些是「類名」，原書是分條的。
KNOWN_BAD_PIAN = {
    "八卦類神": "分條：〈坎宮〉〈坤宮〉〈震宮〉〈巽宮〉〈乾宮〉〈兌宮〉〈艮宮〉〈離宮〉",
    "九星類神": "分條：〈天蓬〉〈天芮〉〈天衝〉〈天輔〉〈天禽〉〈天心〉〈天柱〉〈天任〉〈天英〉",
    "九星所主": "分條：〈天蓬所主〉…〈天心所主〉",
    "八門所主": "分條：〈休門所主〉…〈開門所主〉",
    "八神類神": "分條：〈值符〉〈騰蛇〉〈太陰〉〈六合〉〈勾陳（下有白虎）〉〈朱雀（下有玄武）〉〈九地〉〈九天〉",
    "直符吉凶神說": "全名〈天乙直符吉凶神說〉",
    "執事歌": "全名〈論八門執事歌〉",
    "釋奇墓": "全名〈釋奇墓奇制與日時幹墓同兇〉",
    "四十格": "全名〈奇門四十格〉",
}

CHECKS = []


def check(name):
    def deco(fn):
        CHECKS.append((name, fn))
        return fn
    return deco


# ───────────────────────── 檢查項 ─────────────────────────

@check("直引逐字")
def c_quotes(C):
    """頁面「」裡的字，是否逐字出現在某條原文裡。"""
    wl = whitelist()
    fails, total = [], 0
    for fname in ("index.html", "app.js", "paipan.js"):
        txt = read(fname)
        if fname.endswith(".html"):
            txt = re.sub(r"<[^>]+>", "", txt)
        for m in re.finditer(r"「([^「」']{4,})」", txt):
            q = m.group(1)
            if "'" in q or "${" in q or "…" in q:
                continue          # 模板字串／省略號拼接，非連續原文
            nq = norm(q)
            if nq in wl:
                continue
            total += 1
            if nq not in C["blob"]:
                line = txt[: m.start()].count("\n") + 1
                fails.append(f"{fname}:{line}　「{q[:34]}」")
    return total, fails


@check("出處篇名存在")
def c_pian(C):
    """頁面標的〈篇名〉，語料庫的「篇」欄裡有沒有這個名字。"""
    fails, seen = [], set()
    for fname in ("index.html", "app.js", "paipan.js"):
        txt = read(fname)
        for m in re.finditer(r"〈([^〈〉]{2,24})〉", txt):
            p = m.group(1)
            if p in seen:
                continue
            seen.add(p)
            if p in C["pian"]:
                continue
            line = txt[: m.start()].count("\n") + 1
            if p in KNOWN_BAD_PIAN:
                hint = "→ " + KNOWN_BAD_PIAN[p]
            else:
                near = [x for x in C["pian"] if p in x or x in p]
                hint = f"→ 實際是 {'／'.join(sorted(near)[:3])}" if near else "→ 語料庫查無近似篇名"
            fails.append(f"{fname}:{line}　〈{p}〉 {hint}")
    return len(seen), fails


@check("九宮類象逐字")
def c_palace(C):
    """app.js palaceData 每條 t，是否逐字在原文裡。"""
    js = read("app.js")
    items = re.findall(r"\{k:'([^']+)',t:'([^']+)',s:'([^']+)'\}", js)
    wl = whitelist()
    fails = []
    for k, t, s in items:
        body = re.sub(r"^[^：]{2,6}：", "", t)      # 去掉「坎宮：」這種前綴
        nb = norm(body)
        if nb in wl or nb in C["blob"]:
            continue
        fails.append(f"app.js　{k}　{t[:30]}…")
    return len(items), fails


@check("十八局表")
def c_ju(C):
    """index.html 兩張局數表 × 統宗卷之一〈陰陽二遁順逆起例〉。"""
    shi = C["by_pian"].get(("奇門遁甲統宗", "陰陽二遁順逆起例"))
    if not shi:
        return 0, ["語料庫缺〈陰陽二遁順逆起例〉，無法比對"]
    # 從口訣抽「節氣…三位數字」
    han = "一二三四五六七八九"
    truth = {}
    for m in re.finditer(r"([^\W\d_]{2})([一二三四五六七八九]{3})", shi["原文"]):
        q, n = m.group(1), m.group(2)
        truth[norm(q)] = "".join(str(han.index(c) + 1) for c in n)
    # 雙氣共用一組的寫法：「冬至驚蜇一七四」→ 前面那個氣也要吃到
    for m in re.finditer(r"([^\W\d_]{2})([^\W\d_]{2})([一二三四五六七八九]{3})", shi["原文"]):
        a, b, n = m.group(1), m.group(2), m.group(3)
        v = "".join(str(han.index(c) + 1) for c in n)
        truth.setdefault(norm(a), v)
        truth.setdefault(norm(b), v)
    html = read("index.html")
    rows = re.findall(r"<tr><th>([^<]{2})</th><td>(\d)</td><td>(\d)</td><td>(\d)</td></tr>", html)
    fails = []
    for q, a, b, c in rows:
        nq = norm(q)
        if nq not in truth:
            fails.append(f"{q}：口訣裡抽不到，人工核")
        elif truth[nq] != a + b + c:
            fails.append(f"{q}：網頁 {a}{b}{c} vs 口訣 {truth[nq]}")
    return len(rows), fails


@check("對沖宮")
def c_duichong(C):
    """paipan.js DUICHONG 每一組是否為九宮的正對面。

    典籍只明列坎一↔離九（寶鑒〈釋反吟伏吟〉「蓬加英」、演義〈反吟格〉「餘八同宮」），
    其餘三組是依統宗「九星值符圖」的方位取正對面——那個方位下相加恰為 10，
    這裡用相加判定只是實作方便，「合十」不是典籍用語。
    """
    js = read("paipan.js")
    m = re.search(r"DUICHONG\s*=\s*\{([^}]*)\}", js)
    if not m:
        return 0, ["paipan.js 找不到 DUICHONG"]
    pairs = [(int(a), int(b)) for a, b in re.findall(r"(\d)\s*:\s*(\d)", m.group(1))]
    NAME = {1: "坎", 2: "坤", 3: "震", 4: "巽", 6: "乾", 7: "兌", 8: "艮", 9: "離"}
    fails = [f"{NAME.get(a,a)}{a} ↔ {NAME.get(b,b)}{b}　相加 {a+b}，應為 10"
             for a, b in pairs if a + b != 10]
    return len(pairs), fails


@check("門迫方向")
def c_menpo(C):
    """用典籍自己列的「迫」例反推方向，再看 paipan.js 算的是哪一邊。

    寶鑒〈釋迫〉、〈註釋煙波釣叟歌〉、演義〈門迫宮迫〉三處共同列出的例子。
    """
    MEN = {"開門": "金", "休門": "水", "生門": "土", "景門": "火",
           "傷門": "木", "杜門": "木", "死門": "土", "驚門": "金"}
    GONG = {1: "水", 2: "土", 3: "木", 4: "木", 6: "金", 7: "金", 8: "土", 9: "火"}
    KE = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}
    cases = [("開門", 3), ("開門", 4), ("休門", 9), ("生門", 1), ("景門", 6), ("景門", 7),
             ("傷門", 2), ("傷門", 8), ("杜門", 2), ("杜門", 8), ("死門", 1),
             ("驚門", 3), ("驚門", 4)]
    men_ke = sum(KE[MEN[m]] == GONG[g] for m, g in cases)
    gong_ke = sum(KE[GONG[g]] == MEN[m] for m, g in cases)
    truth = "門剋宮" if men_ke > gong_ke else "宮剋門"
    js = read("paipan.js")
    m = re.search(r"menPo\s*=\s*(.+)", js)
    if not m:
        return len(cases), [f"典籍 {len(cases)} 例判定迫＝{truth}（門剋宮 {men_ke}／宮剋門 {gong_ke}）；"
                            f"paipan.js 找不到 menPo"]
    expr = m.group(1)
    code = "宮剋門" if re.search(r"KE\[\s*cell\.宫五行", expr) else "門剋宮"
    fails = []
    if code != truth:
        fails.append(f"paipan.js 算的是「{code}」，典籍 {len(cases)} 例全指向「{truth}」"
                     f"（門剋宮 {men_ke} 例／宮剋門 {gong_ke} 例）")
    return len(cases), fails


@check("三元符頭")
def c_sanyuan(C):
    """index.html 三元表 × 統宗卷之二〈定三元法〉的地支規則。"""
    rule = {"上元": set("子午卯酉"), "中元": set("寅申巳亥"), "下元": set("辰戌丑未")}
    html = read("index.html")
    cells = re.findall(r"<b>([上中下]元)</b><span>([^<]+)</span>", html)
    fails, n = [], 0
    for yuan, s in cells:
        for gz in re.split(r"[・·、]", s):
            gz = gz.strip()
            if len(gz) != 2:
                continue
            n += 1
            if gz[1] not in rule[yuan]:
                fails.append(f"{yuan} 列了 {gz}，但地支「{gz[1]}」不在〈定三元法〉的 {''.join(sorted(rule[yuan]))}")
    return n, fails


@check("八門吉凶只有三吉五凶")
def c_bamen(C):
    """寶鑒〈漢陰居士歌〉「三門最吉五門凶」，典籍沒有「中」這一級。"""
    js = read("paipan.js")
    m = re.search(r"BAMEN_JIXIONG\s*=\s*\{([^}]*)\}", js)
    if not m:
        return 0, ["paipan.js 找不到 BAMEN_JIXIONG"]
    pairs = re.findall(r"(\S+?)\s*:\s*'([^']+)'", m.group(1))
    JI = {"開門", "休門", "生門"}
    fails = []
    for men, v in pairs:
        want = "吉" if men in JI else "凶"
        if v != want:
            fails.append(f"{men} 標「{v}」，〈漢陰居士歌〉三門最吉五門凶 → 應為「{want}」")
    return len(pairs), fails


@check("三奇入墓")
def c_qimu(C):
    """paipan.js QIMU × 寶鑒〈釋奇墓…〉，並提示統宗異文。"""
    js = read("paipan.js")
    m = re.search(r"QIMU\s*=\s*\{([^}]*)\}", js)
    if not m:
        return 0, ["paipan.js 找不到 QIMU"]
    got = {a: int(b) for a, b in re.findall(r"(\S+?)\s*:\s*(\d)", m.group(1))}
    baojian = {"乙": 2, "丙": 6, "丁": 6}          # 寶鑒〈釋奇墓奇制與日時幹墓同兇〉
    tongzong = {"乙": 2, "丙": 6, "丁": 8}         # 統宗〈奇門四十格〉丁奇艮宮
    fails = []
    for k, v in baojian.items():
        if got.get(k) != v:
            fails.append(f"{k}奇 → {got.get(k)}宮，寶鑒〈釋奇墓〉作 {v}宮")
    # 丁奇兩說：寶鑒乾六、統宗艮八。採哪一說都行，但頁面必須標出異文
    if got.get("丁") != tongzong["丁"]:
        html = read("index.html")
        if "丁奇" not in html or "艮宮" not in html:
            fails.append("丁奇採寶鑒的 6 宮，但頁面沒標統宗〈奇門四十格〉「丁奇艮宮」＝8 宮這個異說")
    return len(got), fails


@check("六甲隱儀")
def c_liujia(C):
    """index.html 六甲隱儀表 × 統宗卷之二〈陽遁〉逐宮舉例。"""
    yang = C["by_pian"].get(("奇門遁甲統宗", "陽遁"))
    if not yang:
        return 0, ["語料庫缺〈陽遁〉"]
    truth = dict(re.findall(r"(甲[子戌申午辰寅])([戊己庚辛壬癸])", yang["原文"]))
    truth.setdefault("甲子", "戊")
    html = read("index.html")
    rows = re.findall(r"<tr><th>(甲[子戌申午辰寅])</th><td>([戊己庚辛壬癸])</td>", html)
    fails = [f"{a} 頁面作「{b}」，〈陽遁〉作「{truth[a]}」"
             for a, b in rows if a in truth and truth[a] != b]
    return len(rows), fails


# ───────────────────────── 主程式 ─────────────────────────

def main():
    argv = [a for a in sys.argv[1:] if not a.startswith("-")]
    verbose = "-v" in sys.argv
    C = load()
    print(f"語料庫 {len(C['ents'])} 條，{len(C['pian'])} 個篇名\n")
    rows, bad = [], 0
    for name, fn in CHECKS:
        if argv and not any(a in name for a in argv):
            continue
        total, fails = fn(C)
        rows.append((name, total, total - len(fails), fails))
        bad += len(fails)

    w = max(len(r[0]) for r in rows) + 2
    print(f"{'檢查項':<{w}}{'比了':>5}{'通過':>6}{'失敗':>6}")
    print("─" * (w + 17))
    for name, total, ok, fails in rows:
        mark = "" if not fails else "  ←"
        print(f"{name:<{w}}{total:>5}{ok:>6}{len(fails):>6}{mark}")
    print("─" * (w + 17))

    for name, total, ok, fails in rows:
        if not fails:
            if verbose:
                print(f"\n【{name}】{total} 項全數通過")
            continue
        print(f"\n【{name}】{len(fails)} 項未通過")
        for f in fails:
            print(f"  · {f}")

    print(f"\n{'全部通過' if bad == 0 else f'共 {bad} 項未通過'}")
    print("""
本程式抓不到什麼（要人去看）：
  · 引文被安到別人頭上——字串在原文裡，但主詞換了
    （例：把〈勾陳（下有白虎）〉的「剛勇之神」說成白虎的）
  · 原書遮字 □ 被悄悄拿掉——比對前就剔除了，看不見
  · 斷章取義——只引前半句，條件少一個
  · 圖上的像素文字
  · 語料庫本身抄錯或缺漏""")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
