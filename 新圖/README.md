# 新圖／九星圖 3×3

成品：`v5-text.png`（2400×2332）

## 怎麼做出來的

```
_v4/p1..p9.jpg          Grok 分格生成的九張畫心（4:3）
   ↓  Grok compose.py   拼成 3×3
v4-grid.png             畫風定稿（使用者 2026-09-16 確認）
   ↓  retext.py         把三列畫心原樣搬過來，只重做文字帶
v5-text.png             文字定稿
   ↓  驗圖字.py         驗圖上的字
```

畫風不要再調。`v4-grid.png` 四項數值對舊基準：
近黑 5.61% ／ std 57.4 ／ S>60 16.78% ／ 亮度 180.4。

## 九格位置

《統宗》卷之一〈陰陽二遁順逆起例〉附〈九星值符圖〉，上南下北，橫豎斜皆十五：

```
天輔巽四木   天英離九火   天芮坤二土
天衝震三木   天禽中五土   天柱兌七金
天任艮八土   天蓬坎一水   天心乾六金
```

## 文字

副標照《統宗》卷之二各星本條原文，連續一句不拆行：

```
天蓬  為水，為後，為水火、盜賊
天芮  為士，為教師，為良朋益友
天衝  為雷祖天帝，為木，為武士
天輔  為草，為民。宜修道設教      ← 後半出〈天輔所主〉，用句號分隔
天禽  為工，為師巫，為法士
天心  為金，為高道，為名醫
天柱  為金，為隱士，為修煉
天任  為上始富室                ← 原文疑有訛字（「上始」不通），照錄不臆補
天英  為火，為爐冶人，為殘患
```

## 字型

依 `.claude/skills/qimen-page/SKILL.md` 二之二：

| 角色 | 字型 | 級數 | 顏色 |
|---|---|---|---|
| 星名 | 山海行業格特（`--book`） | 63px | `--ink` #201f1b |
| 宮位・五行 | Shippori Mincho（`--body`） | 41px | `--muted` #635d53 |
| 副標 | Shippori Mincho | 26px | `--muted` #635d53 |

級數 ＝ 網頁字階 × 2.03（圖寬 2400 對 `.section` 的 1180）。

`_fonts/img-name.ttf`、`img-body.ttf` 是子集化後的成品，**進版控**。
原始檔不進版控，各機自備：

- 山海行業格特：`%LOCALAPPDATA%\Microsoft\Windows\Fonts\ShanHaiXingYeGeTeW-2.ttf`
- Shippori Mincho：Google Fonts，`curl` 下載
  `https://fonts.gstatic.com/s/shipporimincho/v17/VdGGAZweH5EbgHY6YExcZfDoj0BA2w.ttf`

改文案後要重跑子集化，否則新字會變豆腐。
**注意**：PIL 的 `getmask().getbbox()` 對缺字會回傳豆腐方框的 bbox，測不出缺字，
要查 `TTFont(...).getBestCmap()`。

## 驗證

```
python 新圖/驗圖字.py
```

把預期字串用同一支字型重畫，跟圖上對應區塊做 IoU 比對（容忍 1px 抗鋸齒），
再把每句副標拿去比對 `corpus/index.json`。目前 27／27 段吻合。

**它不檢查**：對齊、間距、行距、畫面內容。那些還要人看。
