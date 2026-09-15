# 新圖／九星圖 3×3

**圖還沒定案。** 這裡只記這一版做了什麼、檔案在哪、怎麼重跑。**不訂規則**——
等真的有一張完全沒問題的圖，再看要不要把做法寫成規格。

目前檔案：`v5-text.png`（2400×2332）

## 怎麼做出來的

```
_v4/p1..p9.jpg          Grok 分格生成的九張畫心
   ↓  _v4/compose.py    Grok 拼成 3×3
v4-grid.png             畫風經使用者確認
   ↓  retext.py         把三列畫心原樣搬過來，只重做文字帶
v5-text.png
```

畫風的量測值（`v4-grid.png` 對舊九星圖）：
近黑 5.61% ／ std 57.4 ／ S>60 16.78% ／ 亮度 180.4。

## 九格位置

《統宗》卷之一〈陰陽二遁順逆起例〉附「九星值符圖」，上南下北：

```
天輔巽四木   天英離九火   天芮坤二土
天衝震三木   天禽中五土   天柱兌七金
天任艮八土   天蓬坎一水   天心乾六金
```

## 這一版的文字

副標照《統宗》卷之二各星本條原文：

```
天蓬  為水，為後，為水火、盜賊
天芮  為士，為教師，為良朋益友
天衝  為雷祖天帝，為木，為武士
天輔  為草，為民。宜修道設教      ← 後半出〈天輔所主〉
天禽  為工，為師巫，為法士
天心  為金，為高道，為名醫
天柱  為金，為隱士，為修煉
天任  為上始富室                ← 原文疑有訛字（「上始」不通），照錄不臆補
天英  為火，為爐冶人，為殘患
```

## 字型

這一版用：星名 山海行業格特、其餘 Shippori Mincho，顏色 `--ink` / `--muted`。
字級與間距寫在 `retext.py` 裡。

`_fonts/img-name.ttf`、`img-body.ttf` 是子集化後的成品，進版控。原始檔不進版控：

- 山海行業格特：`%LOCALAPPDATA%\Microsoft\Windows\Fonts\ShanHaiXingYeGeTeW-2.ttf`
- Shippori Mincho：`https://fonts.gstatic.com/s/shipporimincho/v17/VdGGAZweH5EbgHY6YExcZfDoj0BA2w.ttf`

改文案後要重跑子集化，否則新字會變豆腐。查缺字用 `TTFont(...).getBestCmap()`，
**不要用 PIL 的 `getmask().getbbox()`**——它對缺字會回傳豆腐方框的 bbox，測不出來。
