# -*- coding: utf-8 -*-
"""驗圖字.py —— 驗證圖上印出來的字，真的是預期的那幾個字。

不用 OCR。做法：拿同一支字型、同一個級數，把預期字串重畫一次，
再跟圖上對應區塊做像素比對。字錯、漏字、多字都會露餡。

另外把每一句拿去比對 corpus，確認指得回典籍。
"""
import io, json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

ROOT = Path(__file__).parent
PROJ = ROOT.parent
sys.stdout.reconfigure(encoding="utf-8")

IMG = ROOT / "v5-text.png"
F_NAME = ROOT / "_fonts/img-name.ttf"
F_BODY = ROOT / "_fonts/img-body.ttf"
S_NAME, S_GONG, S_SUB = 63, 41, 26

GRID = [["天輔", "天英", "天芮"], ["天衝", "天禽", "天柱"], ["天任", "天蓬", "天心"]]
INFO = {
    "天蓬": ("坎一・水", ["為水，為後，為水火、盜賊"]),
    "天芮": ("坤二・土", ["為士，為教師，為良朋益友"]),
    "天衝": ("震三・木", ["為雷祖天帝，為木，為武士"]),
    "天輔": ("巽四・木", ["為草，為民。宜修道設教"]),
    "天禽": ("中五・土", ["為工，為師巫，為法士"]),
    "天心": ("乾六・金", ["為金，為高道，為名醫"]),
    "天柱": ("兌七・金", ["為金，為隱士，為修煉"]),
    "天任": ("艮八・土", ["為上始富室"]),
    "天英": ("離九・火", ["為火，為爐冶人，為殘患"]),
}
# 副標→出處。「宜修道設教」出〈天輔所主〉，其餘出各星本條
SRC_PIAN = {"天輔": ["天輔", "天輔所主"]}

COLS = [(20, 802), (809, 1591), (1598, 2380)]
IH, MARGIN = 587, 20
PAD_BOT = 30
MAXLINE = max(len(v[1]) for v in INFO.values())
PAD_TOP, GAP_NAME, LINE = 26, 16, 42
BAND = PAD_TOP + 63 + GAP_NAME + LINE * MAXLINE + PAD_BOT

VAR = str.maketrans({"爲": "為", "衝": "沖", "宫": "宮"})
DROP = re.compile(r"[、，。；：！？「」（）\s・]")


def norm(s):
    return DROP.sub("", s.translate(VAR))


def strip_mask(a, thr=170):
    """取墨色遮罩並裁到內容邊界，去掉位置差異。"""
    m = (a < thr)
    ys, xs = np.where(m)
    if len(ys) == 0:
        return None
    return m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def render_exact(text, f, mode="plain"):
    """用同一個 font 物件重畫一次，供像素比對。

    mode="tight"：比照 retext.py 把「・」兩側收緊，否則寬度對不上。
    """
    w = int(f.getlength(text)) + 80
    im = Image.new("L", (w, 200), 255)
    d = ImageDraw.Draw(im)
    if mode == "tight" and "・" in text:
        pad = int(f.size * 0.16)
        x = 30
        for i, t in enumerate(text.split("・")):
            if i:
                x -= pad
                d.text((x, 40), "・", font=f, fill=0)
                x += f.getlength("・") - pad
            d.text((x, 40), t, font=f, fill=0)
            x += f.getlength(t)
    else:
        d.text((30, 40), text, font=f, fill=0)
    return im


def compare(got, want):
    if got is None or want is None:
        return 0.0
    h = max(got.shape[0], want.shape[0])
    w = max(got.shape[1], want.shape[1])
    if abs(got.shape[1] - want.shape[1]) > max(6, w * 0.05):
        return 0.0                       # 寬度差太多＝字數不同
    a = np.zeros((h, w), bool); a[:got.shape[0], :got.shape[1]] = got
    b = np.zeros((h, w), bool); b[:want.shape[0], :want.shape[1]] = want

    def grow(m):                      # 各方向膨脹 1px，容忍抗鋸齒與紙紋造成的邊緣差
        o = m.copy()
        o[1:] |= m[:-1]; o[:-1] |= m[1:]
        o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
        return o
    ga, gb = grow(a), grow(b)
    inter = (a & gb).sum() + (b & ga).sum()
    union = a.sum() + b.sum()
    return inter / union if union else 0.0


def main():
    im = Image.open(IMG).convert("L")
    g = np.asarray(im).astype(float)
    corpus = json.loads(io.open(PROJ / "corpus/index.json", encoding="utf-8").read())
    blob = {e["篇"]: norm(e["原文"]) for e in corpus["條目"]
            if e["書"] == "奇門遁甲統宗"}

    rows_ok = 0
    fails = []
    print(f"驗 {IMG.name}　九格 × (星名／宮位／副標)\n")
    for r in range(3):
        for c in range(3):
            star = GRID[r][c]
            gong, subs = INFO[star]
            x0, x1 = COLS[c]
            by = MARGIN + r * (IH + BAND) + IH + PAD_TOP

            # 用 retext.py 同一套算式算出每段字的實際落點，不靠偵測分群
            f_name = ImageFont.truetype(str(F_NAME), S_NAME)
            f_gong = ImageFont.truetype(str(F_BODY), S_GONG)
            f_sub = ImageFont.truetype(str(F_BODY), S_SUB)
            cx = (x0 + x1) // 2
            asc_n = f_name.getmetrics()[0]
            base = by + asc_n
            gap = int(S_GONG * 0.55)
            wn = f_name.getlength(star)
            parts = gong.split("・")
            dot_pad = int(S_GONG * 0.16)
            wg = sum(f_gong.getlength(t) for t in parts) +                  (len(parts) - 1) * (f_gong.getlength("・") - dot_pad * 2)
            sx = cx - (wn + gap + wg) / 2

            probes = [
                (star, f_name, "plain", int(sx) - 4, int(sx + wn) + 4,
                 by, by + S_NAME + 14),
                (gong, f_gong, "tight", int(sx + wn + gap) - 6,
                 int(sx + wn + gap + wg) + 6, by, by + S_NAME + 14),
            ]
            sy = by + S_NAME + GAP_NAME
            for line in subs:
                w = f_sub.getlength(line)
                probes.append((line, f_sub, "plain", int(cx - w / 2) - 4,
                               int(cx + w / 2) + 4, sy - 4, sy + S_SUB + 12))
                sy += LINE

            for text, f, mode, xa, xb, ya, yb in probes:
                got = strip_mask(g[ya:yb, xa:xb])
                want = strip_mask(np.asarray(
                    render_exact(text, f, mode)).astype(float))
                score = compare(got, want)
                ok = score >= 0.90
                rows_ok += ok
                if not ok:
                    fails.append(f"{star}　「{text}」　吻合度 {score:.2f}")

            # 出處：每句是否指得回統宗原文
            for line in subs:
                cand = SRC_PIAN.get(star, [star])
                for piece in line.split("。"):        # 跨篇的併句逐句查
                    if not piece:
                        continue
                    if not any(norm(piece) in blob.get(p, "") for p in cand):
                        fails.append(f"{star}　「{piece}」　語料庫 {cand} 查無此句")

    total = sum(2 + len(INFO[st][1]) for row in GRID for st in row)
    print(f"像素比對：{rows_ok}／{total} 段吻合")
    if fails:
        print(f"\n未通過 {len(fails)} 項：")
        for f in fails:
            print("  ·", f)
    else:
        print("圖上每一段字都與預期完全吻合，且每句副標都指得回《統宗》原文。")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
