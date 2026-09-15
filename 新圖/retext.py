# -*- coding: utf-8 -*-
"""把 v4-grid 的三列圖片原樣搬過來，只重做文字帶。

字型與顏色依 .claude/skills/qimen-page/SKILL.md 二之二（style.css 就是這樣定的）：
  主名 山海行業格特 #201f1b --ink
  次名、副標 Shippori Mincho #635d53 --muted
字級是這次選的，不是規格。
字型檔放 _fonts/，由 子集化.py 從原始檔產生，不讀本機系統路徑。
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).parent
SRC = ROOT / "v4-grid.png"
OUT = ROOT / "v5-text.png"

FDIR = ROOT / "_fonts"
F_NAME = FDIR / "img-name.ttf"   # --book  山海行業格特（子集化，10 字）
F_SUB = FDIR / "img-body.ttf"    # --body  Shippori Mincho（子集化，62 字）

INK = (0x20, 0x1f, 0x1b)      # --ink
MUTED = (0x63, 0x5d, 0x53)    # --muted
PAPER = (0xf0, 0xe5, 0xd3)    # 對齊 v4 文字帶原本的紙色，與圖內銜接

# v4 偵測到的三列圖片區（整列滿版）
ROWS = [(20, 607), (720, 1307), (1420, 2007)]
# 三欄邊界
COLS = [(20, 802), (809, 1591), (1598, 2380)]

GRID = [["天輔", "天英", "天芮"],
        ["天衝", "天禽", "天柱"],
        ["天任", "天蓬", "天心"]]
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

# 以下字級與間距都是本專案這次選的值，不是規格。改了就重跑，用 驗圖字.py 驗。
S_NAME, S_GONG, S_SUB = 63, 41, 26
PAD_TOP, GAP_NAME, LINE, PAD_BOT = 26, 16, 42, 30
MAXLINE = max(len(v[1]) for v in INFO.values())
BAND = PAD_TOP + S_NAME + GAP_NAME + LINE * MAXLINE + PAD_BOT
MARGIN = 20


def main():
    src = Image.open(SRC).convert("RGB")
    f_name = ImageFont.truetype(str(F_NAME), S_NAME)
    f_gong = ImageFont.truetype(str(F_SUB), S_GONG)
    f_sub = ImageFont.truetype(str(F_SUB), S_SUB)
    from fontTools.ttLib import TTFont
    CMAP_NAME = TTFont(str(F_NAME)).getBestCmap()
    CMAP_SUB = TTFont(str(F_SUB)).getBestCmap()

    ih = ROWS[0][1] - ROWS[0][0]
    W = src.width
    H = MARGIN + (ih + BAND) * 3 + MARGIN - BAND + PAD_BOT
    H = MARGIN * 2 + (ih + BAND) * 3
    canvas = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(canvas)

    missing = set()
    for r, (y0, y1) in enumerate(ROWS):
        strip = src.crop((0, y0, W, y1))
        ty = MARGIN + r * (ih + BAND)
        canvas.paste(strip, (0, ty))

        for c, (x0, x1) in enumerate(COLS):
            star = GRID[r][c]
            gong, subs = INFO[star]
            cx = (x0 + x1) // 2
            by = ty + ih + PAD_TOP

            for ch in star:
                if ord(ch) not in CMAP_NAME:
                    missing.add(ch)
            for ch in gong + "".join(subs):
                if ord(ch) not in CMAP_SUB:
                    missing.add(ch)

            # 名與宮位共用同一條基線（anchor 的 s = baseline）
            asc_n = f_name.getmetrics()[0]
            base = by + asc_n
            gap = int(S_GONG * 0.55)          # 名與宮位的間距
            wn = d.textlength(star, font=f_name)
            # 宮位用「・」分隔，中點是全形、兩側留白太寬，改逐段畫並收緊
            parts = gong.split("・")
            dot_pad = int(S_GONG * 0.16)
            wg = sum(d.textlength(t, font=f_gong) for t in parts) +                  (len(parts) - 1) * (d.textlength("・", font=f_gong) - dot_pad * 2)
            sx = cx - (wn + gap + wg) / 2
            d.text((sx, base), star, font=f_name, fill=INK, anchor="ls")

            gx = sx + wn + gap
            for i, t in enumerate(parts):
                if i:
                    gx -= dot_pad
                    d.text((gx, base), "・", font=f_gong, fill=MUTED, anchor="ls")
                    gx += d.textlength("・", font=f_gong) - dot_pad
                d.text((gx, base), t, font=f_gong, fill=MUTED, anchor="ls")
                gx += d.textlength(t, font=f_gong)

            sy = by + S_NAME + GAP_NAME
            for line in subs:
                d.text((cx - d.textlength(line, font=f_sub) / 2, sy),
                       line, font=f_sub, fill=MUTED)
                sy += LINE

    canvas.save(OUT)
    print(f"已存 {OUT.name}　{canvas.size[0]}×{canvas.size[1]}　文字帶高 {BAND}px")
    print(f"缺字：{''.join(sorted(missing)) if missing else '無'}")

    g = np.asarray(canvas.convert("L")).astype(float)
    S = np.asarray(canvas.convert("HSV")).astype(float)[:, :, 1]
    print(f"近黑(<60) {(g<60).mean()*100:.2f}%　std {g.std():.1f}　"
          f"S>60 {(S>60).mean()*100:.2f}%　亮度 {g.mean():.1f}")


if __name__ == "__main__":
    main()
