# -*- coding: utf-8 -*-
"""3x3 洛書拼版：九張 4:3 橫幅 + 字型疊字 → 新圖/v4-grid.png

依據：《統宗》卷之一〈陰陽二遁順逆起例〉附〈九星值符圖〉
      天輔巽四 天英離九 天芮坤二 / 天衝震三 天禽中五 天柱兌七 / 天任艮八 天蓬坎一 天心乾六
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

ROOT = Path(r"C:\Users\at197\OneDrive\Desktop\專案-進行中\奇門遁甲\新圖")
V4 = ROOT / "_v4"
OUT = ROOT / "v4-grid.png"

# p1..p9 對應 _scenes.txt 順序
STAR = {1: "天蓬", 2: "天芮", 3: "天衝", 4: "天輔", 5: "天禽",
        6: "天心", 7: "天柱", 8: "天任", 9: "天英"}
INFO = {  # 星 -> (宮位·五行, 第二行, 第三行)
    "天蓬": ("坎一・水", "為水、為後", "為水火、盜賊"),
    "天芮": ("坤二・土", "為士、為教師", "為良朋益友"),
    "天衝": ("震三・木", "為雷祖天帝", "為木、為武士"),
    "天輔": ("巽四・木", "為草、為民", "宜修道設教"),
    "天禽": ("中五・土", "為工、為師巫", "為法士"),
    "天心": ("乾六・金", "為金、為高道", "為名醫"),
    "天柱": ("兌七・金", "為金、為隱士", "為修煉"),
    "天任": ("艮八・土", "為上始富室", ""),
    "天英": ("離九・火", "為火、為爐冶人", "為殘患"),
}
GRID = [[4, 9, 2], [3, 5, 7], [8, 1, 6]]  # 洛書，上南下北

BG = (234, 224, 205)  # #eae0cd
INK = (0x31, 0x2A, 0x1F)
GREY = (0x84, 0x7B, 0x6A)

W, H = 2400, 2140
GAP = 4
MARGIN_X, MARGIN_Y = 20, 20
CW = 784
IH = 588  # 4:3
TH = 108
CH = IH + TH  # 696
# 20+784+4+784+4+784+20 = 2400
# 20+696+4+696+4+696+20 = 2140


def metrics(arr):
    g = arr.mean(axis=2)
    hsv = np.array(Image.fromarray(arr).convert("HSV"))
    dark = float((g < 60).mean() * 100)
    std = float(g.std())
    sat = float((hsv[:, :, 1] > 60).mean() * 100)
    bright = float(g.mean())
    return dark, std, sat, bright


def adjust(arr, paper=198.0, deepen=1.28, sat_t=30, sat_g=1.32):
    hsv = np.array(Image.fromarray(arr).convert("HSV")).astype(np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    below = v < paper
    v2 = np.where(below, np.clip(paper - (paper - v) * deepen, 0, 255), v)
    tinted = (s > sat_t) & (v2 < 210)
    s2 = np.where(tinted, np.minimum(s * sat_g, 255), s)
    hsv2 = np.stack([h, s2, np.clip(v2, 0, 255)], axis=-1).astype(np.uint8)
    return np.array(Image.fromarray(hsv2, mode="HSV").convert("RGB"))


def crop43(im):
    """Take the largest 4:3 window, preferring the ink-heavy region."""
    w, h = im.size
    target = 4 / 3
    if abs((w / h) - target) < 0.02:
        return im
    if w / h > target:
        nw = int(h * target)
        g = np.asarray(im.convert("L")).astype(float)
        ink = (g < 150).mean(axis=0)
        k = np.ones(nw) / nw
        score = np.convolve(ink, k, mode="valid")
        x0 = int(np.argmax(score))
        return im.crop((x0, 0, x0 + nw, h))
    nh = int(w / target)
    g = np.asarray(im.convert("L")).astype(float)
    ink = (g < 150).mean(axis=1)
    k = np.ones(nh) / nh
    score = np.convolve(ink, k, mode="valid")
    y0 = int(np.argmax(score))
    return im.crop((0, y0, w, y0 + nh))


def load_panel(i):
    im = Image.open(V4 / f"p{i}.jpg").convert("RGB")
    return crop43(im)


def draw_centered(draw, text, cx, y, font, fill, tracking=0):
    if not text:
        return
    if tracking and len(text) > 1:
        widths = [font.getbbox(ch)[2] - font.getbbox(ch)[0] for ch in text]
        total = sum(widths) + tracking * (len(text) - 1)
        x = cx - total / 2
        for ch, ww in zip(text, widths):
            draw.text((x, y), ch, font=font, fill=fill)
            x += ww + tracking
    else:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw / 2, y), text, font=font, fill=fill)


def lift_paper(arr, floor=130, lift=6):
    hsv = np.array(Image.fromarray(arr).convert("HSV")).astype(np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    v2 = np.where(v > floor, np.minimum(v + lift, 255), v)
    hsv2 = np.stack([h, s, v2], axis=-1).astype(np.uint8)
    return np.array(Image.fromarray(hsv2, mode="HSV").convert("RGB"))


def compose(paper, deepen, sat_t, sat_g, paper_lift=0):
    canvas = Image.new("RGB", (W, H), BG)
    title_font = ImageFont.truetype(r"C:\Windows\Fonts\mingliu.ttc", 40, index=1)
    sub_font = ImageFont.truetype(r"C:\Windows\Fonts\msjhl.ttc", 22, index=0)
    draw = ImageDraw.Draw(canvas)

    for r, row in enumerate(GRID):
        for c, idx in enumerate(row):
            im = load_panel(idx)
            arr = adjust(np.array(im), paper, deepen, sat_t, sat_g)
            panel = Image.fromarray(arr).resize((CW, IH), Image.Resampling.LANCZOS)
            x = MARGIN_X + c * (CW + GAP)
            y = MARGIN_Y + r * (CH + GAP)
            canvas.paste(panel, (x, y))

            star = STAR[idx]
            gong, l2, l3 = INFO[star]
            cx = x + CW / 2
            title = f"{star}　{gong}"
            ty = y + IH + 12
            draw_centered(draw, title, cx, ty, title_font, INK)
            ty += 46
            draw_centered(draw, l2, cx, ty, sub_font, GREY)
            ty += 30
            draw_centered(draw, l3, cx, ty, sub_font, GREY)
    if paper_lift:
        canvas = Image.fromarray(lift_paper(np.array(canvas), 130, paper_lift))
    return canvas


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    trials = [
        (210.0, 1.50, 26, 1.30, 6),
        (210.0, 1.50, 26, 1.30, 5),
        (208.0, 1.48, 28, 1.28, 6),
        (206.0, 1.44, 28, 1.30, 6),
        (210.0, 1.50, 26, 1.32, 6),
    ]
    target = (6.76, 57.3, 17.18, 176.9)
    best = None
    for t in trials:
        im = compose(*t)
        full = metrics(np.array(im))
        score = (abs(full[0] - target[0])
                 + abs(full[1] - target[1]) / 6
                 + abs(full[2] - target[2]) / 2
                 + abs(full[3] - target[3]) / 8)
        print(f"params={t}  dark={full[0]:.2f} std={full[1]:.1f} "
              f"S={full[2]:.2f} L={full[3]:.1f}  score={score:.2f}")
        if best is None or score < best[0]:
            best = (score, t, im, full)
    score, t, im, full = best
    im.save(OUT, "PNG")
    print("SAVED", OUT, im.size, "best", t)
    print(f"FULL  dark<60={full[0]:.2f}%  std={full[1]:.1f}  "
          f"S>60={full[2]:.2f}%  L={full[3]:.1f}")
