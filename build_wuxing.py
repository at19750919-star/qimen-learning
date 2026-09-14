# -*- coding: utf-8 -*-
"""把五行大字、卦象與成員清單合成到底圖上，輸出 assets/wuxing-relations.png。

底圖由生圖模型產生（assets/wuxing-bg-sq.png）；
版面座標來自 wuxing-editor.html 匯出的 wuxing-layout.json，
由本腳本精確重繪，避免生圖模型排版錯字與偏移。
"""
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).parent
BG = ROOT / "assets" / "wuxing-bg-sq.png"
OUT = ROOT / "assets" / "wuxing-relations.png"
LAYOUT = ROOT / "wuxing-layout.json"
REGISTRY = json.loads((ROOT / "fonts-registry.json").read_text(encoding="utf-8"))


def font_file(key):
    """由字型代號取得實際檔案路徑，找不到就回退 I.明體"""
    return REGISTRY.get(key, REGISTRY["iming"])["file"]

INK = (32, 31, 27)
MUTED = (113, 107, 96)
HALO = True          # 在字底下鋪柔邊紙色，避免被意象吃掉

DEFAULT_COLOR = {"木": "#49664d", "火": "#9d2821", "土": "#9b7a3d",
                 "金": "#201f1b", "水": "#2d4870"}
ORDER = ["木", "火", "土", "金", "水"]      # 與編輯器色票順序一致


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def apply_tone(im, tone, paper):
    """把編輯器的 saturate / brightness / hue-rotate / opacity 套到底圖"""
    from PIL import ImageEnhance
    sat, bri, hue, opa = (tone.get(k, d) for k, d in
                          (("sat", 100), ("bri", 100), ("hue", 0), ("opa", 100)))
    if hue:
        h, s_, v = im.convert("HSV").split()
        h = h.point(lambda p: int((p + hue * 255 / 360) % 256))
        im = Image.merge("HSV", (h, s_, v)).convert("RGB")
    if sat != 100:
        im = ImageEnhance.Color(im).enhance(sat / 100)
    if bri != 100:
        im = ImageEnhance.Brightness(im).enhance(bri / 100)
    if opa != 100:
        im = Image.blend(Image.new("RGB", im.size, paper), im, opa / 100)
    return im


def feather(im, px, paper):
    """四邊往紙色淡出，與編輯器的 mask 漸層等價"""
    if px <= 0:
        return im
    W, H = im.size
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).rectangle([px, px, W - px, H - px], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(px / 2))
    return Image.composite(im, Image.new("RGB", (W, H), paper), m)

# 由上到下三爻，True 實爻 False 斷爻
GUA = {"木": [[0, 0, 1], [1, 1, 0]], "火": [[1, 0, 1]], "土": [[0, 0, 0], [1, 0, 0]],
       "金": [[1, 1, 1], [0, 1, 1]], "水": [[0, 1, 0]]}

NOTES = {"木": "生長與規劃", "火": "顯現與能量", "土": "承載與資源", "金": "阻力與規則", "水": "流動與智慧"}

ROWS = {
    "木": [("天干", "甲、乙"), ("地支", "寅、卯"), ("九宮", "震三、巽四"),
           ("九星", "天沖、天輔"), ("八門", "傷門、杜門")],
    "火": [("天干", "丙、丁"), ("地支", "巳、午"), ("九宮", "離九"),
           ("九星", "天英"), ("八門", "景門")],
    "土": [("天干", "戊、己"), ("地支", "辰、戌、丑、未"), ("九宮", "坤二、中五、艮八"),
           ("九星", "天芮、天禽、天任"), ("八門", "生門、死門")],
    "金": [("天干", "庚、辛"), ("地支", "申、酉"), ("九宮", "乾六、兌七"),
           ("九星", "天心、天柱"), ("八門", "開門、驚門")],
    "水": [("天干", "壬、癸"), ("地支", "亥、子"), ("九宮", "坎一"),
           ("九星", "天蓬"), ("八門", "休門")],
}


def short(label, value, abbr):
    """成員簡寫：九宮去尾數、九星去「天」、八門去「門」"""
    parts = value.split("、")
    if not abbr:
        return parts
    if label == "九宮":
        return [re.sub(r"[一二三四五六七八九]$", "", v) for v in parts]
    if label == "九星":
        return [re.sub(r"^天", "", v) for v in parts]
    if label == "八門":
        return [re.sub(r"門$", "", v) for v in parts]
    return parts


def baseline_for(dr, ymid, s, font):
    """讓字串墨跡中心落在 ymid 時，該字串的基線 y"""
    l, t, r, b = dr.textbbox((0, 0), s, font=font)
    return ymid - (t + b) / 2 + font.getmetrics()[0]


def draw_base(dr, x, baseline, s, font, fill, ls=0.0):
    """沿共同基線繪製，可模擬 letter-spacing。

    標籤與成員字級不同，若各自以墨跡中心對齊，小字的基線會浮在大字上方，
    中文沿基線閱讀，看起來就是「標籤偏高」。統一用基線對齊才正。
    """
    for ch in s:
        dr.text((x, baseline), ch, font=font, fill=fill, anchor="ls")
        x += dr.textlength(ch, font=font) + ls


def width_ls(dr, s, font, ls):
    return sum(dr.textlength(c, font=font) for c in s) + ls * max(0, len(s) - 1)


def gua_metrics(char_px):
    """(爻寬, 爻高, 爻間距, 卦間距)，與編輯器的 DOM 算法一致"""
    px = char_px * .62
    return px * .78, max(2, px * .105), px * .11, px * .22


def gua_height(char_px, trigrams):
    _, bar, gap, stack = gua_metrics(char_px)
    return len(trigrams) * (3 * bar + 2 * gap) + (len(trigrams) - 1) * stack


def draw_gua(dr, x, y, char_px, trigrams, ink=INK):
    w, bar, gap, stack = gua_metrics(char_px)
    split = w * .20
    for t in trigrams:
        for solid in t:
            if solid:
                dr.rectangle([x, y, x + w, y + bar], fill=ink)
            else:
                half = (w - split) / 2
                dr.rectangle([x, y, x + half, y + bar], fill=ink)
                dr.rectangle([x + w - half, y, x + w, y + bar], fill=ink)
            y += bar + gap
        y += stack - gap


def main():
    cfg = json.loads(LAYOUT.read_text(encoding="utf-8"))
    sep, abbr = cfg.get("sep", ""), cfg.get("abbr", True)
    sp = cfg.get("spacing", {})
    LH_D, CG_D, LS_D = sp.get("lh", 1.45), sp.get("cg", .70), sp.get("ls", .16)

    FB = font_file(cfg.get("fontBig", "iming"))
    FLST = font_file(cfg.get("fontList", "iming"))

    im = Image.open(BG).convert("RGB")
    W, H = im.size
    paper = tuple(int(c) for c in im.resize((1, 1)).getpixel((0, 0)))
    tone_cfg = cfg.get("tone", {})
    im = apply_tone(im, tone_cfg, paper)
    im = feather(im, tone_cfg.get("fea", 0), paper)

    cols = cfg.get("colors") or [DEFAULT_COLOR[n] for n in ORDER]
    COLOR = {n: hexrgb(cols[i]) for i, n in enumerate(ORDER)}
    C_LBL = hexrgb(cfg.get("cLbl", "#716b60"))
    C_VAL = hexrgb(cfg.get("cVal", "#201f1b"))
    C_GUA = hexrgb(cfg.get("cGua", "#201f1b"))

    if HALO:
        halo = Image.new("L", (W, H), 0)
        hd = ImageDraw.Draw(halo)
        for it in cfg["items"]:
            cx, cy = it["x"] * W, it["y"] * H
            rx, ry = W * .075, H * .058
            hd.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=175)
        halo = halo.filter(ImageFilter.GaussianBlur(round(H * .022)))
        im = Image.composite(Image.new("RGB", (W, H), paper), im, halo)

    dr = ImageDraw.Draw(im)

    for it in cfg["items"]:
        name = it["name"]
        cx, cy = it["x"] * W, it["y"] * H
        char_px = it["size"] * H
        big = ImageFont.truetype(FB, round(char_px))

        # ---- 字＋卦象視為一組，整組置中於 (cx, cy) ----
        gw = gua_metrics(char_px)[0]
        cw = dr.textlength(name, font=big)
        gap = char_px * .10
        x0 = cx - (cw + gap + gw) / 2

        l, t, r, b = dr.textbbox((0, 0), name, font=big)
        dr.text((x0 - l, cy - (t + b) / 2), name, font=big, fill=COLOR[name])
        draw_gua(dr, x0 + cw + gap, cy - gua_height(char_px, GUA[name]) / 2,
                 char_px, GUA[name], C_GUA)

        # ---- 一句話註解 ----
        nt = it.get("note")
        if nt:
            npx = nt["size"] * H
            fn = ImageFont.truetype(FLST, round(npx))
            txt = NOTES[name]
            w = width_ls(dr, txt, fn, .06 * npx)
            draw_base(dr, nt["x"] * W - w / 2,
                      baseline_for(dr, nt["y"] * H, txt, fn), txt, fn, COLOR[name], .06 * npx)

        # ---- 成員清單，整塊置中於 list 座標 ----
        ls_cfg = it["list"]
        lp = ls_cfg["size"] * H
        lbl_px = ls_cfg.get("lb", ls_cfg["size"] * .84) * H
        LH = ls_cfg.get("lh", LH_D)
        CG = ls_cfg.get("cg", CG_D)
        LS = ls_cfg.get("ls", LS_D)
        LLS = ls_cfg.get("lls", 0.0)          # 標籤字距，可為負
        fv = ImageFont.truetype(FLST, round(lp))
        fl = ImageFont.truetype(FLST, round(lbl_px))
        rows = [(a, sep.join(short(a, v, abbr))) for a, v in ROWS[name]]

        lw = max(width_ls(dr, a, fl, LLS * lbl_px) for a, _ in rows)
        vw = max(width_ls(dr, v, fv, LS * lp) for _, v in rows)
        row_h = LH * lp
        row_gap = max(0.0, LH - 1.25) * lp   # CSS 的 row-gap 不會是負值，這裡同樣夾住
        bw = lw + CG * lp + vw
        bh = len(rows) * row_h + (len(rows) - 1) * row_gap
        bx = it["list"]["x"] * W - bw / 2
        by = it["list"]["y"] * H - bh / 2

        for i, (lbl, v) in enumerate(rows):
            ymid = by + i * (row_h + row_gap) + row_h / 2      # 該行的垂直中心
            base = baseline_for(dr, ymid, v, fv)      # 以成員為準定基線
            draw_base(dr, bx, base, lbl, fl, C_LBL, LLS * lbl_px)
            draw_base(dr, bx + lw + CG * lp, base, v, fv, C_VAL, LS * lp)

    im.save(OUT)
    print(f"{OUT.name}  {W}x{H}  {OUT.stat().st_size/1024:.0f} KB")


if __name__ == "__main__":
    main()
