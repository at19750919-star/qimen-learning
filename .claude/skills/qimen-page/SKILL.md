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

## 三、交件前

```
node --check paipan.js app.js
grep -oE "font-size:[0-9.]+px" style.css
```

回報時列出本次新增內容的出處；沒有出處的單獨列出。
