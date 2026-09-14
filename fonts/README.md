# 字型來源與授權

## IMingSubset（標題與盤面）
- 原始字型：I.Ming（一點明體）8.10，https://github.com/ichitenfont/I.Ming
- 授權：IPA Font License Agreement v1.0，見 `LICENSE-I.Ming.md`
- 本檔為子集化衍生版本，僅保留本站實際使用的 918 個字元；
  依 IPA FL 對衍生程式的命名要求，內嵌字型名稱已改為 `IMingSubset`。

## Noto Serif TC（內文）
- 原始字型：Noto Serif TC Variable，https://github.com/notofonts/noto-cjk
- 授權：SIL Open Font License 1.1，見 `LICENSE-NotoSerifTC.txt`
- 已抽出 wght 400 與 700 兩個字重並子集化。

## 重新產生
頁面新增文字後字型不會自動更新，需重跑子集化：
掃描 index.html / paipan.js / app.js / style.css 內所有可見字元，
以 `python -m fontTools.subset <原始字型> --text-file=<字元檔> --flavor=woff2` 產生。
