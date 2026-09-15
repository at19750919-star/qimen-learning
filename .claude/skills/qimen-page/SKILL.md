---
name: qimen-page
description: 寫或改奇門遁甲學習頁（index.html / style.css / app.js）的文字內容時使用。
---

# qimen-page

## 一、內容只能有出處

```
python corpus/查.py <關鍵字> -n 5
```

- 查得到 → 照原文寫，旁邊加 `<span class="src">統宗卷之二〈八門所主〉</span>`。
- 查不到 → 寫「典籍無此條」並回報，不准用訓練知識補，不准說「傳統上」「一般認為」。
- 白話解釋用 `.note` 標示，與原文分開。

`corpus/index.json` 是唯一來源。與 `C:\Users\at197\.claude\skills\qimen\` 的表格衝突時
以典籍原文為準並告知使用者。

## 二、排版契約

```
敘述帶 .band —— h3 --fs-5(31) / .lead --fs-3(20) / 內文 --fs-2(16) / .note --fs-1(12.8)
卡片   .card —— h3 --fs-3(20) / 內文 --fs-2(16)，不設引言
```

- 同一角色全站同一字級。
- 字級只能用 `--fs-0..7`，間距只能用 `--s1..s9`，不准寫死 px。
- 顏色是語意：`--red` 結構詞／`--lead` 引言／`--ink` 結論／`--muted` 註解／`.e-木火土金水` 五行。
- 字型三個角色：`--book` 標題、`--lead-font` 引言、`--body` 內文。
  單一字重，不准用 `font-weight:700`（會被合成加粗糊掉）。

## 二之二、圖上的文字

契約延伸到圖。**圖上的字不是美術自由發揮，跟網頁同一套規格。**

`.gates-art` 的圖寬度撐滿 `.section`（`min(1180px, 100% - 48px)`）。
圖檔做 2400px 寬時顯示縮放 0.492，所以**圖上字級 ＝ 網頁字級 × 2.03**：

| 角色 | 網頁 | 圖上(2400px 寬) | 字型 | 顏色 |
|---|---|---|---|---|
| 圖上主名（星名／門名） | `--fs-5` 31 | **63px** | 山海行業格特 | `--ink` #201f1b |
| 圖上次名（宮位・五行） | `--fs-3` 20 | **41px** | 香萃刻宋 | `--muted` #635d53 |
| 圖上副標（類神短語） | `--fs-1` 12.8 | **26px** | 香萃刻宋 | `--muted` #635d53 |
| 圖的紙底 | — | — | — | `--paper` #f4efe4 |

圖檔換寬度就重算：`倍率 = 圖檔寬 / 1180`。

**字型檔**。網頁載入的是**子集化**的 woff2，只含頁面現有的字，拿去疊圖會缺字：

```
fonts/shanhai-subset.woff2    212 字   原始 ShanHaiXingYeGeTeW-2.ttf    9830 字
fonts/xiangcui-subset.woff2   965 字   原始 香萃刻宋（目前最新版）.ttf    31170 字
fonts/notoseriftc-400.woff2   924 字   原始 NotoSerifTC-VF.ttf
```

原始檔在 `C:\Users\at197\AppData\Local\Microsoft\Windows\Fonts\`。**疊圖一律用原始 ttf**，不要用 subset。

**頁面新增文字後要重跑子集化**，否則新字在網頁上會掉到 fallback 字型。

## 二之三、生圖的畫風

基準是 `新圖/v4-grid.png`。像不像**用量的**：

```
python C:/Users/at197/.claude/hooks/ref-diff.py <基準> <產出>
```

另加四項：畫心近黑(<60)%、對比 std、S>60 彩度%、平均亮度。

提示詞要**講技法，不能只給數字**——同一個數字可由不同技法達成
（厚塗和水墨都能做出 std 57）。必寫：
「不要光影明暗塑形 no cast shadows / no volumetric shading / no rim light；
墨色只出現在頭髮與深色衣袍；線條細、均勻、弱，不要粗輪廓、不要角色立繪感」。
數字要講成「貼近參考值，不是越高越好」——只給下限它會一路往上衝。

**畫風對不對由使用者判，不要自己下判斷。**
交件只給：四項數字表＋內容核對＋版面檢查＋新舊並排圖。

## 三、交件前

```
node --check paipan.js app.js
grep -oE "font-size:[0-9.]+px" style.css
```

回報時列出本次新增內容的出處；沒有出處的單獨列出。
