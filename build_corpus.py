# -*- coding: utf-8 -*-
"""把 來源/ 的典籍正文切成可查詢的條目，輸出 corpus/index.json。

原則：只切割、不改寫。每一條都帶書名、卷、篇名、檔案與行號，
網頁與生圖的文字一律引這裡的 原文，不得另行生成。
"""
import io, json, re, datetime
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "來源"
OUT = ROOT / "corpus" / "index.json"

BAOJIAN = SRC / "御定奇門遁甲寶鑒-部分.md"
YANBO = SRC / "煙波釣叟歌.md"
DUNJIA = SRC / "遁甲演義.md"
TONGZONG = SRC / "奇門遁甲統宗.md"

# OpenCC s2t 在本領域的誤轉，轉完再校回來（這幾個字在本書只可能是右邊那個）
TRAP = {"幹": "干", "醜": "丑", "兇": "凶", "鬥": "斗", "爲": "為",
        "臺": "台", "僞": "偽", "衆": "眾"}
# TRAP 反轉過頭的少數詞，再校回來
UNTRAP = {"丑陋": "醜陋", "丑惡": "醜惡", "斗爭": "鬥爭", "戰斗": "戰鬥"}

# 遁甲演義：卷別預設主題，個別篇目覆寫
DJ_DEFAULT = {"卷一": ["T7"], "卷二": ["T8"], "卷三": ["T4"]}
DJ_TOPIC = {
    "遁甲源流": ["T1"], "煙波釣叟賦": ["T1", "T7"], "黃帝陰符經": ["T1"],
    "奇門原始": ["T1"], "遁甲神機賦": ["T8"], "遁甲錯誤須檢點": ["T10"],
    "天遁": ["T9"], "地遁": ["T9"], "人遁": ["T9"], "神遁": ["T9"],
    "鬼遁": ["T9"], "風遁": ["T9"], "龍遁": ["T9"], "虎遁": ["T9"],
    "天三門地四戶": ["T9"], "地私門": ["T9"], "太沖天馬": ["T9"],
    "五行旺相休囚": ["T3", "T4"], "天乙直符吉凶神說": ["T5"], "三奇喜怒": ["T2"],
    "冬至陽遁時奇起例": ["T7"], "夏至陰遁時奇起例": ["T7"], "奇遁佈局法": ["T7"],
    "推九星分野吉凶": ["T4"], "九宮八卦": ["T6"], "九宮八卦三台之圖式": ["T6"],
    "玉女反閉訣": ["T9"], "六甲出行訣": ["T9"], "真人步斗法": ["T9"],
    "出天門入地戶過太陰居青龍法": ["T9"], "六甲陰符法": ["T9"], "禁敵法": ["T9"],
    "六甲所在神身": ["T9"], "六丁符式": ["T9"], "真人閉六戊法": ["T9"],
    "博奕勝負局": ["T10"], "遁甲利客": ["T9"], "遁甲利主": ["T9"],
}

# 篇名 → 主題（T1–T10，見 主題清單.md）。純分類，不涉內容生成。
TOPIC = {
    "奇門源流": ["T1"], "遁甲總論": ["T1"], "凡例": ["T1", "T10"],
    "釋奇": ["T2"], "釋儀": ["T2"], "釋門": ["T3"], "釋星": ["T4"],
    "釋九宮之色": ["T6"], "釋八神": ["T5"], "釋八卦分八節": ["T6"],
    "釋九宮": ["T6"], "釋虛中合宮": ["T6"], "釋六儀遁六甲": ["T2", "T7"],
    "釋符頭": ["T7"], "釋直符直使": ["T5", "T7"], "辨三氏奇門": ["T7"],
    "釋陰陽刑德開闔": ["T9"], "釋三甲": ["T9"], "釋三奇得使": ["T8"],
    "釋三奇遊六儀": ["T8"], "釋玉女守門": ["T8"], "釋迫": ["T3", "T8"],
    "釋五不遇時": ["T8"], "釋奇墓奇制與日時幹墓同兇": ["T8"],
    "釋六儀擊刑": ["T8"], "釋遊三避五": ["T9"], "釋反吟伏吟": ["T8"],
    "釋天輔時與五合時同吉異理": ["T8"], "釋天網": ["T8"], "釋貪合受制": ["T8"],
    "釋天將陰陽干支所屬": ["T5"], "釋地將順逆氣支所屬": ["T5"], "釋直辰": ["T7"],
    "釋三門四戶": ["T9"], "釋天馬": ["T9"], "釋地私門": ["T9"],
    "釋亭亭白奸": ["T9"], "釋氣應": ["T10"], "釋勃格飛伏": ["T8"],
    "釋庚丙同刑異破": ["T8"], "釋二吉四凶": ["T3"], "釋日干門戶神名": ["T9"],
    "釋出軍運籌": ["T9"], "釋止宿閉戊": ["T9"], "釋六甲安營": ["T9"],
    "釋戰關背向": ["T9"], "釋六甲出征遠行": ["T9"],
    "註釋煙波釣叟歌": ["T1", "T7"], "遁甲隱公歌": ["T1"],
    "漢陰居士歌": ["T1", "T7"], "神機賦": ["T8"], "指迷賦摘": ["T8"],
    "專征賦摘": ["T9"], "混合百神": ["T8"],
}

SONGS = ["註釋煙波釣叟歌", "遁甲隱公歌", "漢陰居士歌",
         "神機賦", "指迷賦摘", "專征賦摘", "混合百神"]


def read(p):
    return io.open(p, encoding="utf-8").read().split("\n")


def sections(lines):
    """回傳 [(篇名, 起行, 迄行)]，1-based，含頭不含尾。"""
    marks = []
    for i, l in enumerate(lines, 1):
        m = re.match(r"^【(.+?)】\s*$", l)
        if m:
            marks.append((m.group(1), i))
            continue
        s = l.strip()
        for name in SONGS:
            if s.startswith(name):
                marks.append((name, i))
                break
    out = []
    for k, (name, a) in enumerate(marks):
        b = marks[k + 1][1] if k + 1 < len(marks) else len(lines) + 1
        out.append((name, a, b))
    return out


_CC = None


def trad(t):
    """簡體轉繁，再校回領域誤轉字。原文以 來源/ 的檔案為準。"""
    global _CC
    if _CC is None:
        import opencc
        _CC = opencc.OpenCC("s2t")
    t = _CC.convert(t)
    for a, b in TRAP.items():
        t = t.replace(a, b)
    for a, b in UNTRAP.items():
        t = t.replace(a, b)
    return t


def dunjia(items):
    """遁甲演義：以『短句無標點』行為篇名切段，卷別由「卷一/二/三」標記帶入。"""
    lines = read(DUNJIA)
    start = next(i for i, l in enumerate(lines, 1) if l.strip() == "---") + 1
    heads, juan = [], ""
    for i, l in enumerate(lines[start:], start + 1):
        s = trad(l.strip())
        if not s or len(s) > 14 or re.search(r"[，。；：、（）()0-9]", s):
            continue
        if re.fullmatch(r"卷[一二三四]", s):
            juan = s
            continue
        if s == "前言":
            juan = ""
        heads.append((s, i, juan))
    # 整段不可切的區塊：起始篇名 → 結束於哪個篇名（不含）
    BLOCK = {"九星所屬": "五行旺相休囚"}
    skip_to = None
    bu, last, pend = "", "", None
    def emit(name, juan, bu, a, body, topic=None):
        items.append({
            "id": "演義-" + (juan + "-" if juan else "") + name,
            "書": "遁甲演義", "卷": juan, "部": bu, "篇": name,
            "主題": topic or DJ_TOPIC.get(name, DJ_DEFAULT.get(juan, ["T1"])),
            "檔": str(DUNJIA.relative_to(ROOT)).replace("\\", "/"),
            "行": a, "原文": body,
        })
    for k, (name, a, juan) in enumerate(heads):
        if skip_to:
            if name == skip_to:
                skip_to = None
            else:
                continue
        if name in BLOCK:
            end = BLOCK[name]
            j = next((x[1] for x in heads[k + 1:] if x[0] == end), len(lines) + 1)
            emit(name, juan, "", a, trad(clean(lines[a:j - 1])))
            bu, pend, skip_to = name, None, end
            continue
        b = heads[k + 1][1] if k + 1 < len(heads) else len(lines) + 1
        body = trad(clean(lines[a:b - 1]))
        if juan != last:
            bu, last, pend = "", juan, None
        if not body:
            # 連續數行只有標題沒正文（如「九星所屬」下的星名別號），
            # 首行當「部」，其餘併為該部的正文
            if pend is None:
                pend = [name, a, []]
            else:
                pend[2].append(name)
            continue
        if pend:
            if pend[2]:
                emit(pend[0], juan, "", pend[1], chr(10).join(pend[2]))
            bu, pend = pend[0], None
        items.append({
            "id": "演義-" + (juan + "-" if juan else "") + name,
            "書": "遁甲演義", "卷": juan, "部": bu, "篇": name,
            "主題": DJ_TOPIC.get(name, DJ_DEFAULT.get(juan, ["T1"])),
            "檔": str(DUNJIA.relative_to(ROOT)).replace("\\", "/"),
            "行": a, "原文": body,
        })


# 統宗：篇名 → 主題；其餘依卷別預設
TZ_DEFAULT = {"卷之一": ["T7"], "卷之二": ["T7"], "卷之三": ["T9"],
              "卷之十": ["T8"], "卷之十一": ["T8"], "卷之十二": ["T8"]}
TZ_TOPIC = {
    "序": ["T1"], "奇門遁甲統宗源流": ["T1"], "凡例": ["T1", "T10"],
    "奇門秘訣總賦": ["T1"], "遁甲起例": ["T7"], "論超接之法": ["T7"],
    "又法": ["T7"], "超接訣": ["T7"], "又訣": ["T7"], "置閏法": ["T7"],
    "奇門四十格": ["T8"], "八節應八門旺相": ["T3"], "九星旺相": ["T4"],
    "迫": ["T3"], "論八門執事歌": ["T3"], "陰陽二遁順逆起例": ["T7"],
    "值符值使訣": ["T5", "T7"], "年家孤虛方位": ["T9"], "三奇神咒": ["T9"],
    "三奇六儀": ["T2"], "奇門妙秘賦": ["T1"], "八卦定圖": ["T6"],
    "三奇喜怒": ["T2"], "八卦類神": ["T6"], "九星類神": ["T4"],
    "八神類神": ["T5"], "天干類神": ["T2"], "地支類神": ["T6"],
    "下營法": ["T9"], "迷路法": ["T9"], "涉險法": ["T9"], "出入山中法": ["T9"],
    "逃避法": ["T9"], "九星吉凶歌": ["T4"], "行兵雜摘": ["T9"],
    "奇門演卦": ["T10"], "值符值使演卦例": ["T10"], "門方演卦例": ["T10"],
    "主客雌雄": ["T9"], "陣勢得失": ["T9"], "節候": ["T6"],
    "六親克應": ["T10"], "六神克應": ["T10"], "八卦克應": ["T10"],
    "地支克應": ["T10"],
}


def tz_label_topic(label, fallback):
    """『X所主』『X類神』這類條目，主題由標題本身決定，不隨所在段落。"""
    if label.endswith("所主"):
        return ["T3"] if "門" in label else ["T4"]
    if label.endswith("類神"):
        return {"八卦": ["T6"], "地支": ["T6"], "九星": ["T4"],
                "八神": ["T5"], "天干": ["T2"]}.get(label[:2], fallback)
    return fallback


def tongzong(items):
    """統宗：標題行切篇，篇內『名稱：內容』再切條，縮排行併入前一條。"""
    lines = read(TONGZONG)
    start = next(i for i, l in enumerate(lines, 1) if l.strip() == "---") + 1
    juan, pian, topic = "", "", ["T1"]
    cur = None                     # [id 標籤, 起行, [文字], 主題]

    def flush():
        if cur and any(x.strip() for x in cur[2]):
            items.append({
                "id": "統宗-" + (juan.replace("卷之", "卷") + "-" if juan else "") +
                      (cur[0] or pian),
                "書": "奇門遁甲統宗", "卷": juan, "部": pian if cur[0] else "",
                "篇": cur[0] or pian, "主題": cur[3],
                "檔": str(TONGZONG.relative_to(ROOT)).replace("\\", "/"),
                "行": cur[1], "原文": trad(clean(cur[2])),
            })

    for i, raw in enumerate(lines[start:], start + 1):
        s = raw.rstrip()
        t = trad(s.strip())
        if not t:
            continue
        m = re.fullmatch(r"奇門遁甲統宗(卷之[一二三四五六七八九十]+)", t)
        if m:
            flush(); cur = None
            juan, pian, topic = m.group(1), "", TZ_DEFAULT.get(m.group(1), ["T1"])
            continue
        if t in ("奇門遁甲統宗", "奇門遁甲統宗目錄") or t.startswith("卷之"):
            continue               # 書名與目錄不入條目
        head = (len(t) <= 14 and not re.search(r"[\s，。；：、（）()*0-9]", t)
                and not raw.startswith(" "))
        lab = re.match(r"^([^\s：，。]{2,12})：", t) if not raw.startswith(" ") else None
        if head:
            flush(); pian = t
            topic = TZ_TOPIC.get(t, TZ_DEFAULT.get(juan, ["T1"]))
            cur = [None, i, [], topic]
        elif lab:
            flush()
            cur = [lab.group(1), i, [t], tz_label_topic(lab.group(1), topic)]
        elif cur:
            cur[2].append(t)
        else:
            cur = [None, i, [t], topic]
    flush()


def clean(lines):
    return "\n".join(x.rstrip() for x in lines).strip()


def build():
    lines = read(BAOJIAN)
    items = []
    seen = set()
    for name, a, b in sections(lines):
        if name in seen:
            continue                      # 合併檔內同名重複，取首見
        seen.add(name)
        body = clean(lines[a:b - 1])
        if not body:
            continue
        base = {
            "書": "御定奇門遁甲寶鑒", "卷": "卷一", "篇": name,
            "主題": TOPIC.get(name, []),
            "檔": str(BAOJIAN.relative_to(ROOT)).replace("\\", "/"),
        }
        if name == "混合百神":
            head, cur, curname = [], [], None
            for j, raw in enumerate(lines[a:b - 1], a + 1):
                s = raw.strip()
                m = re.match(r"^(六[甲乙丙丁戊己庚辛壬癸]加[甲乙丙丁戊己庚辛壬癸])[；;：:]", s)
                if m:
                    if curname:
                        items.append(dict(base, id="寶鑒-混合百神-" + curname,
                                          目="混合百神", 條=curname,
                                          行=cur[0], 原文=clean(cur[1])))
                    curname, cur = m.group(1), (j, [s])
                elif curname:
                    if s.startswith("昔日舉要"):
                        items.append(dict(base, id="寶鑒-混合百神-" + curname,
                                          目="混合百神", 條=curname,
                                          行=cur[0], 原文=clean(cur[1])))
                        curname, cur = "跋", (j, [s])
                    elif s:
                        cur[1].append(s)
                elif s:
                    head.append(s)
            if curname:
                items.append(dict(base, id="寶鑒-混合百神-" + curname,
                                  目="混合百神", 條=curname,
                                  行=cur[0], 原文=clean(cur[1])))
            if head:
                items.append(dict(base, id="寶鑒-混合百神-序", 目="混合百神",
                                  條="序", 行=a, 原文=clean(head)))
        elif name == "註釋煙波釣叟歌":
            # 原頁有軟斷行（術語自成一行），以空行分段、段內併回一行才是完整句
            n, buf, at = 0, [], None
            def flush():
                nonlocal n, buf, at
                if buf:
                    n += 1
                    items.append(dict(base, id="寶鑒-煙波註-%02d" % n,
                                      目="註釋煙波釣叟歌", 條="第%d節" % n,
                                      行=at, 原文="".join(buf)))
                buf, at = [], None
            for j, raw in enumerate(lines[a:b - 1], a + 1):
                s = raw.strip()
                if s:
                    if at is None:
                        at = j
                    buf.append(s)
                else:
                    flush()
            flush()
        else:
            items.append(dict(base, id="寶鑒-" + name, 行=a, 原文=body))

    dunjia(items)
    tongzong(items)

    yb = read(YANBO)
    start = next(i for i, l in enumerate(yb, 1) if l.strip() == "## 正文") + 1
    verses = [(i, l.strip()) for i, l in enumerate(yb[start:], start + 1) if l.strip()]
    for k, (j, v) in enumerate(verses, 1):
        items.append({
            "id": "煙波-%03d" % k, "書": "煙波釣叟歌", "卷": "", "篇": "正文",
            "條": "第%d句" % k, "主題": ["T1", "T7"],
            "檔": str(YANBO.relative_to(ROOT)).replace("\\", "/"),
            "行": j, "原文": v,
        })

    data = {
        "產生日期": datetime.date.today().isoformat(),
        "說明": "網頁與圖上的實質內容只能引用本檔條目的『原文』；查不到就標『典籍無此條』，不得自行生成。",
        "來源書目": [
            {"書": "御定奇門遁甲寶鑒", "卷": "卷一", "狀態": "大致齊",
             "取得": "https://www.qimenpai.com/blog/933 、/1659 、/1660",
             "缺": "卷二～卷六（起例三十三則、九星八門所主、類神、吉凶格、九局圖等）未轉錄"},
            {"書": "煙波釣叟歌", "卷": "", "狀態": "完整",
             "取得": "https://zh.wikisource.org/zh-hant/煙波釣叟歌", "缺": ""},
            {"書": "奇門遁甲統宗", "卷": "卷一～卷三、卷十～卷十二", "狀態": "維基文庫本",
             "取得": "https://zh.wikisource.org/wiki/奇門遁甲統宗",
             "缺": "卷四～卷九（陰陽各九局之局圖表格）未轉錄；原頁以 * 遮蔽個別字"},
            {"書": "遁甲演義", "卷": "全四卷", "狀態": "完整",
             "取得": "https://zh.wikisource.org/wiki/遁甲演義",
             "缺": "原頁圖表缺圖；正文為簡體轉錄，索引中的原文已轉繁（來源/遁甲演義.md 保留簡體原貌）"},
        ],
        "主題": {t: n for t, n in (l.split("：", 1) for l in
                 io.open(ROOT / "主題清單.md", encoding="utf-8").read().split("\n")
                 if re.match(r"^T\d+ ", l))},
        "條目": items,
    }
    OUT.parent.mkdir(exist_ok=True)
    io.open(OUT, "w", encoding="utf-8").write(
        json.dumps(data, ensure_ascii=False, indent=1))
    from collections import Counter
    c = Counter(x["書"] for x in items)
    print("條目 %d：%s" % (len(items), dict(c)))
    ct = Counter(t for x in items for t in x["主題"])
    print("主題分佈", dict(sorted(ct.items())))
    print("未分類篇名", sorted({x["篇"] for x in items if not x["主題"]}))


if __name__ == "__main__":
    build()
