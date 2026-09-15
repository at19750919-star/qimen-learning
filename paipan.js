/* 時家轉盤奇門・拆補法 一鍵排盤 + 斷局
   排盤邏輯移植自 qimen.skill / qimen_paipan.py（純計算，無外部依賴） */
(function () {
  'use strict';

  // ==================== 基礎資料 ====================
  var TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var SANQI_LIUYI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
  var LUOSHU_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var LUOSHU_REVERSE = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  var ZHUAN_ORDER = [1, 8, 3, 4, 9, 2, 7, 6];

  var JIUXING = { 1: '天蓬', 2: '天芮', 3: '天沖', 4: '天輔', 5: '天禽', 6: '天心', 7: '天柱', 8: '天任', 9: '天英' };
  var JIUXING_WUXING = { 天蓬: '水', 天芮: '土', 天沖: '木', 天輔: '木', 天禽: '土', 天心: '金', 天柱: '金', 天任: '土', 天英: '火' };
  // 九星吉凶：《遁甲演義》卷三引《三元經》「輔禽心星爲上吉，衝任次吉理須明。
  // 大凶天蓬與天芮，小凶天柱及天英。」
  var JIUXING_JIXIONG = { 天蓬: '凶', 天芮: '凶', 天沖: '吉', 天輔: '吉', 天禽: '吉', 天心: '吉', 天柱: '凶', 天任: '吉', 天英: '凶' };
  // 九星取象：《奇門遁甲統宗》卷二〈天蓬〉〈天芮〉…〈天英〉九條原文摘句
  var JIUXING_YI = { 天蓬: '爲水、爲盜賊', 天芮: '爲士、爲教師', 天沖: '爲武士', 天輔: '爲草、爲民', 天禽: '爲工、爲師巫', 天心: '爲高道、爲名醫', 天柱: '爲隱士、爲修煉', 天任: '爲富室', 天英: '爲爐冶人、爲殘患' };

  var BAMEN = { 1: '休門', 2: '死門', 3: '傷門', 4: '杜門', 9: '景門', 6: '開門', 7: '驚門', 8: '生門' };
  var BAMEN_WUXING = { 休門: '水', 死門: '土', 傷門: '木', 杜門: '木', 景門: '火', 開門: '金', 驚門: '金', 生門: '土' };
  // 八門吉凶：寶鑒卷一〈漢陰居士歌〉「開休生對杜景死，傷對驚兮皆有悔，三門最吉五門凶」
  // 統宗卷之二〈奇門妙祕賦〉「趨三吉門避五凶」。典籍只分三吉五凶，無「中」這一級
  var BAMEN_JIXIONG = { 開門: '吉', 休門: '吉', 生門: '吉', 傷門: '凶', 杜門: '凶', 景門: '凶', 死門: '凶', 驚門: '凶' };
  // 八門執事：《奇門遁甲統宗》卷一〈論八門執事歌〉
  // 「欲求財利往生方，葬獵須知死路強。徵戰遠行開門吉，休門見貴最爲良。
  //   捉賊驚門無不獲，杜門無事好逃藏。索債須防傷上去，思量飲酒景門高。」
  var BAMEN_YI = { 休門: '見貴', 生門: '求財利', 傷門: '索債', 杜門: '逃藏', 景門: '飲酒思量', 死門: '葬獵', 驚門: '捉賊', 開門: '徵戰遠行' };

  var BASHEN_YANG = ['值符', '螣蛇', '太陰', '六合', '勾陳', '朱雀', '九地', '九天'];
  var BASHEN_YIN = ['值符', '螣蛇', '太陰', '六合', '白虎', '玄武', '九地', '九天'];
  var BASHEN_JIXIONG = { 值符: '吉', 螣蛇: '凶', 太陰: '吉', 六合: '吉', 勾陳: '凶', 朱雀: '凶', 白虎: '凶', 玄武: '凶', 九地: '吉', 九天: '吉' };
  // 八神：《遁甲演義》卷三〈天乙直符吉凶神說〉；勾陳、朱雀依《統宗》卷二〈勾陳（下有白虎）〉〈朱雀（下有玄武）〉
  var BASHEN_YI = { 值符: '天乙之神、事急宜從此出', 螣蛇: '虛詐之神', 太陰: '陰佑之神', 六合: '護衛之神', 勾陳: '剛勇之神、主兵戈戰鬥', 朱雀: '刑戮讒之神', 白虎: '凶惡之神', 玄武: '小盜之神', 九地: '堅牢之神、屯兵固守', 九天: '威扞之神、揚兵佈陣' };

  var GONG_NAME = { 1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫', 5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '離九宫' };
  var GONG_SHORT = { 1: '坎一', 2: '坤二', 3: '震三', 4: '巽四', 5: '中五', 6: '乾六', 7: '兑七', 8: '艮八', 9: '離九' };
  var GONG_FANGWEI = { 1: '北', 2: '西南', 3: '東', 4: '東南', 5: '中', 6: '西北', 7: '西', 8: '東北', 9: '南' };
  var GONG_WUXING = { 1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火' };
  // 典籍：寶鑒〈釋反吟伏吟〉「凡星門各有定位，若加臨於對沖之位，即為反吟。如蓬加英」；
  // 統宗〈奇門四十格〉「反吟　星加對宮」；演義〈反吟格〉只舉坎一↔離九，其餘寫「餘八同宮」。
  // 推導：典籍只明列一組，其餘三組是依統宗「九星值符圖」的九宮方位取正對面。
  // 「合十」是本專案給這個關係取的簡稱，語料庫無此詞。
  var DUICHONG = { 1: 9, 9: 1, 2: 8, 8: 2, 3: 7, 7: 3, 4: 6, 6: 4 };

  var DIZHI_GONG = { 子: 1, 丑: 8, 寅: 8, 卯: 3, 辰: 4, 巳: 4, 午: 9, 未: 2, 申: 2, 酉: 7, 戌: 6, 亥: 6 };

  var LIUJIA = [
    { 旬首: '甲子', 隱儀: '戊', 旬空: ['戌', '亥'] },
    { 旬首: '甲戌', 隱儀: '己', 旬空: ['申', '酉'] },
    { 旬首: '甲申', 隱儀: '庚', 旬空: ['午', '未'] },
    { 旬首: '甲午', 隱儀: '辛', 旬空: ['辰', '巳'] },
    { 旬首: '甲辰', 隱儀: '壬', 旬空: ['寅', '卯'] },
    { 旬首: '甲寅', 隱儀: '癸', 旬空: ['子', '丑'] }
  ];

  var YANGDUN_JU = {
    冬至: [1, 7, 4], 小寒: [2, 8, 5], 大寒: [3, 9, 6],
    立春: [8, 5, 2], 雨水: [9, 6, 3], 驚蟄: [1, 7, 4],
    春分: [3, 9, 6], 清明: [4, 1, 7], 穀雨: [5, 2, 8],
    立夏: [4, 1, 7], 小滿: [5, 2, 8], 芒種: [6, 3, 9]
  };
  var YINDUN_JU = {
    夏至: [9, 3, 6], 小暑: [8, 2, 5], 大暑: [7, 1, 4],
    立秋: [2, 5, 8], 處暑: [1, 4, 7], 白露: [9, 3, 6],
    秋分: [7, 1, 4], 寒露: [6, 9, 3], 霜降: [5, 8, 2],
    立冬: [6, 9, 3], 小雪: [5, 8, 2], 大雪: [4, 7, 1]
  };

  var JIEQI_NAMES = [
    '春分', '清明', '穀雨', '立夏', '小滿', '芒種',
    '夏至', '小暑', '大暑', '立秋', '處暑', '白露',
    '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
    '冬至', '小寒', '大寒', '立春', '雨水', '驚蟄'
  ];

  var GAN_WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  var SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  var KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  var SANQI = { 乙: '日奇', 丙: '月奇', 丁: '星奇' };
  // 入墓：木墓未(坤二)、火土墓戌(乾六)、金墓丑(艮八)、水墓辰(巽四)
  // 三奇入墓：乙奇臨二宫、丙丁奇臨六宫。
  // 《御定奇門遁甲寶鑒》卷一〈釋奇墓奇制與日時幹墓同兇〉：「乙奇臨二宫，丙奇、丁奇臨六宫也……墓則氣絕」
  // 典籍只言三奇之墓，不及其餘六儀，故本表只有乙丙丁。
  var QIMU = { 乙: 2, 丙: 6, 丁: 6 };

  function mod(n, m) { return ((n % m) + m) % m; }

  // ==================== 節氣 ====================
  function jieqiJD(year, angle) {
    var y = year + (angle / 360.0) * 1.0;
    // 基準爲 2000 年春分（JD 2451624.670）。上游 qimen_paipan.py 誤用 1999 年春分，
    // 導致整份節氣表往前偏一年、進而排錯局數，此處已修正。
    var jd0 = 2451624.670 + 365.2422 * (y - 2000);
    var t = (jd0 - 2451545.0) / 36525.0;
    var L = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    var M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    var Mr = M * Math.PI / 180;
    var C = (1.914602 - 0.004817 * t) * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
    var sunLon = mod(L + C, 360);
    var diff = angle - sunLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return jd0 + diff / 360.0 * 365.2422;
  }

  function jdToParts(jd) {
    jd += 0.5;
    var z = Math.trunc(jd);
    var f = jd - z;
    var a;
    if (z < 2299161) { a = z; }
    else { var alpha = Math.trunc((z - 1867216.25) / 36524.25); a = z + 1 + alpha - Math.trunc(alpha / 4); }
    var b = a + 1524;
    var c = Math.trunc((b - 122.1) / 365.25);
    var d = Math.trunc(365.25 * c);
    var e = Math.trunc((b - d) / 30.6001);
    var day = b - d - Math.trunc(30.6001 * e) + f;
    var month = e < 14 ? e - 1 : e - 13;
    var year = month > 2 ? c - 4716 : c - 4715;
    var dayInt = Math.trunc(day);
    var frac = day - dayInt;
    var hour = Math.trunc(frac * 24);
    var minute = Math.trunc((frac * 24 - hour) * 60);
    return { y: year, m: month, d: dayInt, h: hour, mi: minute, ts: Date.UTC(year, month - 1, dayInt, hour, minute) };
  }

  function jieqiOfYear(year) {
    var list = [];
    for (var i = 0; i < 24; i++) {
      var p = jdToParts(jieqiJD(year, i * 15));
      list.push({ name: JIEQI_NAMES[i], ts: p.ts, y: p.y, m: p.m, d: p.d });
    }
    list.sort(function (a, b) { return a.ts - b.ts; });
    return list;
  }

  function getCurrentJieqi(ts, year) {
    var all = jieqiOfYear(year - 1).concat(jieqiOfYear(year));
    all.sort(function (a, b) { return a.ts - b.ts; });
    var cur = all[0];
    for (var i = 0; i < all.length; i++) {
      if (ts >= all[i].ts) cur = all[i]; else break;
    }
    return cur;
  }

  // ==================== 干支 ====================
  function yearGanzhi(year) { return [TIANGAN[mod(year - 4, 10)], DIZHI[mod(year - 4, 12)]]; }

  function monthGanzhi(year, month, day, jieqiList) {
    var jieMonths = ['立春', '驚蟄', '清明', '立夏', '芒種', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
    var curTs = Date.UTC(year, month - 1, day);
    var monthIdx = 0;
    for (var i = 0; i < jieqiList.length; i++) {
      var jq = jieqiList[i];
      if (jieMonths.indexOf(jq.name) >= 0 && curTs >= jq.ts) monthIdx = jieMonths.indexOf(jq.name);
    }
    var yg = mod(year - 4, 10);
    var start = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
    return [TIANGAN[mod(start[yg] + monthIdx, 10)], DIZHI[mod(monthIdx + 2, 12)], monthIdx];
  }

  function dayGanzhi(year, month, day) {
    // 2024-02-04 是戊戌日（60 甲子序 34）。上游 qimen_paipan.py 誤標爲甲子日，
    // 使日柱整體偏 34 天，連帶旬首、值符值使、三元局數全錯，此處已修正。
    // 校驗基準：1949-10-01 甲子日，往後 27154 天 → 34；往後 28107 天 → 27（辛卯，2026-09-14）。
    var base = Date.UTC(2024, 1, 4);
    var diff = Math.round((Date.UTC(year, month - 1, day) - base) / 86400000);
    var idx = mod(diff + 34, 60);
    return [TIANGAN[idx % 10], DIZHI[idx % 12], idx];
  }

  function hourGanzhi(dayGan, hour) {
    var dgi = TIANGAN.indexOf(dayGan);
    var startMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
    var ziGan = startMap[dgi];
    var zhiIdx = mod(Math.floor((hour + 1) / 2), 12);
    return [TIANGAN[mod(ziGan + zhiIdx, 10)], DIZHI[zhiIdx]];
  }

  function findXunshou(gan, zhi) {
    var g = TIANGAN.indexOf(gan);
    var z = DIZHI.indexOf(zhi);
    var xunZhi = DIZHI[mod(z - g, 12)];
    for (var i = 0; i < LIUJIA.length; i++) if (LIUJIA[i].旬首 === '甲' + xunZhi) return LIUJIA[i];
    return LIUJIA[0];
  }

  // ==================== 排盤 ====================
  function determineJu(jieqiName, dayIdx) {
    var isYang = Object.prototype.hasOwnProperty.call(YANGDUN_JU, jieqiName);
    var isYin = Object.prototype.hasOwnProperty.call(YINDUN_JU, jieqiName);
    if (!isYang && !isYin) return [1, true, 0];
    // 三元符頭。上游 qimen_paipan.py 這張表兩處錯：六個「己」符頭的甲子序全部多算 1
    // （己卯是 15 不是 16…），且把己丑己未當中元、己巳己亥當下元，中下元顛倒。此處爲正解：
    //   上元 甲子0 己卯15 甲午30 己酉45／中元 甲寅50 己巳5 甲申20 己亥35／下元 甲辰40 己未55 甲戌10 己丑25
    var yuanMap = { 0: 0, 15: 0, 30: 0, 45: 0, 50: 1, 5: 1, 20: 1, 35: 1, 40: 2, 55: 2, 10: 2, 25: 2 };
    var yuan = 0;
    for (var back = 0; back < 5; back++) {
      var check = mod(dayIdx - back, 60);
      if (Object.prototype.hasOwnProperty.call(yuanMap, check)) { yuan = yuanMap[check]; break; }
    }
    return isYang ? [YANGDUN_JU[jieqiName][yuan], true, yuan] : [YINDUN_JU[jieqiName][yuan], false, yuan];
  }

  function buDipan(juNum, isYang) {
    var dipan = {};
    var order = isYang ? LUOSHU_ORDER : LUOSHU_REVERSE;
    var start = order.indexOf(juNum);
    for (var i = 0; i < SANQI_LIUYI.length; i++) dipan[order[mod(start + i, 9)]] = SANQI_LIUYI[i];
    return dipan;
  }

  function gongOfGan(dipan, gan) {
    for (var g = 1; g <= 9; g++) if (dipan[g] === gan) return g;
    return 2;
  }

  function buTianpan(dipan, xun, shiGan) {
    var zhifuGong = gongOfGan(dipan, xun.隱儀);
    var zhifuXing = JIUXING[zhifuGong];
    var shiGanGong = gongOfGan(dipan, shiGan);
    if (zhifuGong === 5) zhifuGong = 2;
    if (shiGanGong === 5) shiGanGong = 2;
    var origPos = ZHUAN_ORDER.indexOf(zhifuGong); if (origPos < 0) origPos = 0;
    var targetPos = ZHUAN_ORDER.indexOf(shiGanGong); if (targetPos < 0) targetPos = 0;
    var shift = targetPos - origPos;
    var xing = {}, gan = {};
    for (var i = 0; i < ZHUAN_ORDER.length; i++) {
      var gong = ZHUAN_ORDER[i];
      var src = ZHUAN_ORDER[mod(i - shift, 8)];
      xing[gong] = JIUXING[src];
      gan[gong] = dipan[src] || '';
    }
    xing[5] = '天禽';
    gan[5] = dipan[5] || dipan[2] || '';
    // 天禽恒隨天芮：天芮轉到哪宫，天禽同宫。
    var qinGong = 2;
    for (var k = 0; k < ZHUAN_ORDER.length; k++) if (xing[ZHUAN_ORDER[k]] === '天芮') qinGong = ZHUAN_ORDER[k];
    return { xing: xing, gan: gan, zhifuXing: zhifuXing, zhifuOrig: zhifuGong, zhifuTarget: shiGanGong, qinGong: qinGong };
  }

  function buRenpan(xun, shiZhi, zhifuOrig, isYang) {
    var zhishiMen = BAMEN[zhifuOrig] || '死門';
    var orig = zhifuOrig === 5 ? 2 : zhifuOrig;
    var origPos = ZHUAN_ORDER.indexOf(orig); if (origPos < 0) origPos = 0;
    var steps = mod(DIZHI.indexOf(shiZhi) - DIZHI.indexOf(xun.旬首[1]), 12);
    // 值使隨時宫：自值符原宫起，依時辰在旬中的序數，陽遁順數、陰遁逆數。
    // 數的是洛書九宫序 1→2→…→9，不是八宫實體環；落中五則寄坤二。
    var startNum = zhifuOrig === 5 ? 2 : zhifuOrig;
    var targetNum = mod(startNum - 1 + (isYang ? steps : -steps), 9) + 1;
    if (targetNum === 5) targetNum = 2;
    var targetPos = ZHUAN_ORDER.indexOf(targetNum); if (targetPos < 0) targetPos = 0;
    var renpan = {};
    for (var i = 0; i < ZHUAN_ORDER.length; i++) {
      var src = ZHUAN_ORDER[mod(i - (targetPos - origPos), 8)];
      renpan[ZHUAN_ORDER[i]] = BAMEN[src] || '';
    }
    return { renpan: renpan, zhishiMen: zhishiMen, zhishiGong: ZHUAN_ORDER[targetPos] };
  }

  function buShenpan(zhifuTarget, isYang) {
    var shen = isYang ? BASHEN_YANG : BASHEN_YIN;
    var t = zhifuTarget === 5 ? 2 : zhifuTarget;
    var start = ZHUAN_ORDER.indexOf(t); if (start < 0) start = 0;
    var out = {};
    for (var i = 0; i < shen.length; i++) {
      var pos = isYang ? mod(start + i, 8) : mod(start - i, 8);
      out[ZHUAN_ORDER[pos]] = shen[i];
    }
    return out;
  }

  function paipan(year, month, day, hour) {
    var ts = Date.UTC(year, month - 1, day, hour);
    var yz = yearGanzhi(year);
    var jqList = jieqiOfYear(year);
    var mz = monthGanzhi(year, month, day, jqList);
    var dz = dayGanzhi(year, month, day);
    var hz = hourGanzhi(dz[0], hour);
    var curJq = getCurrentJieqi(ts, year);
    var ju = determineJu(curJq.name, dz[2]);
    var juNum = ju[0], isYang = ju[1], yuan = ju[2];
    var xun = findXunshou(hz[0], hz[1]);
    var dipan = buDipan(juNum, isYang);
    var tp = buTianpan(dipan, xun, hz[0]);
    var rp = buRenpan(xun, hz[1], tp.zhifuOrig, isYang);
    var sp = buShenpan(tp.zhifuTarget, isYang);

    var kongGong = [];
    xun.旬空.forEach(function (z) { var g = DIZHI_GONG[z]; if (kongGong.indexOf(g) < 0) kongGong.push(g); });

    var res = {
      四柱: { 年柱: yz[0] + yz[1], 月柱: mz[0] + mz[1], 日柱: dz[0] + dz[1], 時柱: hz[0] + hz[1] },
      日干: dz[0], 月支: mz[1], 時干: hz[0], 時支: hz[1],
      節氣: curJq.name, 三元: ['上元', '中元', '下元'][yuan],
      陰陽遁: isYang ? '陽遁' : '陰遁', 局數: juNum, isYang: isYang,
      旬首: xun.旬首, 隱儀: xun.隱儀,
      值符星: tp.zhifuXing, 值符落宫: tp.zhifuTarget, 天禽宫: tp.qinGong,
      值使門: rp.zhishiMen, 值使落宫: rp.zhishiGong,
      空亡地支: xun.旬空, 空亡宫位: kongGong,
      九宫: {}
    };

    for (var g = 1; g <= 9; g++) {
      if (g === 5) {
        res.九宫[5] = { 宫名: GONG_NAME[5], 短名: GONG_SHORT[5], 方位: '中', 宫五行: '土', 地盤干: dipan[5] || '', 天盤干: '', 九星: '', 八門: '', 八神: '', 空亡: false, 中宫: true };
        continue;
      }
      res.九宫[g] = {
        宫名: GONG_NAME[g], 短名: GONG_SHORT[g], 方位: GONG_FANGWEI[g], 宫五行: GONG_WUXING[g],
        地盤干: dipan[g] || '', 天盤干: tp.gan[g] || '', 九星: tp.xing[g] || '',
        八門: rp.renpan[g] || '', 八神: sp[g] || '', 空亡: kongGong.indexOf(g) >= 0
      };
    }
    return res;
  }

  // ==================== 斷局 ====================
  // 取用神：一律回到典籍原文，說明欄即出處。
  // 統宗卷一〈論八門執事歌〉、卷二各門所主條與各神條；演義卷三〈天乙直符吉凶神說〉。
  var YONGSHEN = {
    綜合: { 神: '值符', 說明: '直符天乙之神，事急宜從此方而出（演義〈天乙直符吉凶神說〉）' },
    求財: { 門: '生門', 干: '戊', 說明: '欲求財利往生方（統宗〈論八門執事歌〉）' },
    事業: { 門: '開門', 神: '值符', 說明: '開門宜徵討、謀望、入官見貴、應舉（統宗〈開門所主〉）' },
    見貴: { 門: '休門', 神: '值符', 說明: '休門見貴最爲良（統宗〈論八門執事歌〉）' },
    考試: { 門: '景門', 星: '天輔', 說明: '景門宜上書獻策、招賢謁貴、拜職遣使（統宗〈景門所主〉）' },
    婚姻: { 神: '六合', 說明: '六合旺相則爲爵祿、榮慶、婚姻、和合、胎產（統宗〈六合〉）' },
    訴訟: { 門: '傷門', 說明: '傷門宜漁獵、討捕索債；驚門宜掩捕盜賊（統宗〈傷門所主〉〈驚門所主〉）' },
    葬事: { 門: '死門', 說明: '死門宜決斷、刑獄、弔喪、埋葬等事（統宗〈死門所主〉）' },
    藏匿: { 門: '杜門', 神: '太陰', 說明: '杜門無事好逃藏；太陰之下可以伏兵（統宗〈論八門執事歌〉、演義卷三）' },
    出行: { 門: null, 說明: '值使順逆遁宫去，以值使門爲用神看落宫方位（煙波釣叟歌）' },
    疾病: { 星: '天芮', 說明: '天心爲高道、爲名醫（統宗〈天心〉）；天芮爲病星係後世通說，本站語料庫查無出處' }
  };

  // 格局表。每一條都標出處；t 天盤干、d 地盤干、men 八門、shen 八神。
  // 特殊值：'@甲' 指旬首所遁之儀（盤上的甲）、'@日干'、'@時干'、'@值符' 指值符星所在宫。
  var GEJU = [
    // ── 吉格 ──
    { t: '@甲', d: '丙', name: '青龍返首', level: 3, src: '演義卷一《黃帝陰符經》「甲加丙兮龍返首」',
      txt: '甲加丙爲青龍返首，利見大人，舉兵利客，百事皆吉。' },
    { t: '丙', d: '@甲', name: '飛鳥跌穴', level: 3, src: '演義卷一《黃帝陰符經》「丙加甲兮鳥跌穴」',
      txt: '丙加甲爲飛鳥跌穴，事情落地成形，主動出擊有利。' },
    { t: '丙', d: '戊', men: '生門', name: '天遁', level: 3, src: '演義卷一《黃帝陰符經》「生丙合戊爲天遁」；統宗卷一〈奇門四十格〉',
      txt: '生門臨丙奇、地盤戊，天遁大吉，宜隱而後動、用兵。' },
    { t: '乙', d: '己', men: '開門', name: '地遁', level: 3, src: '演義卷一《黃帝陰符經》「地遁乙合開加己」；統宗〈奇門四十格〉「地遁 開門與乙奇臨己」',
      txt: '開門臨乙奇、地盤己，地遁大吉，宜託人代辦、安墳。' },
    { t: '丁', men: '休門', shen: '太陰', name: '人遁', level: 3, src: '演義卷一《黃帝陰符經》「休承丁合太陰人」；統宗〈奇門四十格〉「人遁 休門與丁奇臨太陰」',
      txt: '休門臨丁奇、又逢太陰，人遁大吉，宜託人情、安營。' },
    { t: '丁', d: '@甲', name: '陰陽化氣', level: 2, src: '寶鑒卷一〈釋二吉四凶〉「丁甲相加，爲陰陽化氣……利爲百事」',
      txt: '丁加甲爲陰陽化氣，二吉之一，不必合奇門亦吉。' },
    { t: '丁', d: '乙', name: '龍鳳呈祥', level: 2, src: '寶鑒卷一〈釋二吉四凶〉「丁乙相加，爲龍鳳呈祥」',
      txt: '丁加乙爲龍鳳呈祥，二吉之一，一切謀爲俱吉。' },
    // ── 凶格：二吉四凶之四凶 ──
    { t: '@甲', d: '乙', name: '二龍戰野', level: -2, src: '寶鑒卷一〈釋二吉四凶〉「甲乙相加，爲二龍戰野……百事不利」',
      txt: '甲加乙爲二龍戰野，同類相爭，百事不利。' },
    { t: '庚', d: '辛', name: '二虎爭雄', level: -2, src: '寶鑒卷一〈釋二吉四凶〉「庚辛相加，爲二虎爭雄」',
      txt: '庚加辛爲二虎爭雄，兩強相持，百事不利。' },
    { t: '@甲', d: '戊', name: '青龍困頓', level: -2, src: '寶鑒卷一〈釋二吉四凶〉「甲戊相加，爲青龍困頓」',
      txt: '甲加戊爲青龍困頓，動彈不得，百事不利。' },
    // 庚加壬同時是小格；寶鑒凡例「有兩說三說者並存之」，故兩名並列，
    // 但分數只算一次，這條 level 設 0。
    { t: '庚', d: '壬', name: '白虎迍邅', level: 0, src: '寶鑒卷一〈釋二吉四凶〉「庚壬相加，爲白虎迍邅」',
      txt: '庚加壬又名白虎迍邅，行止皆滯（與小格同一組合，兩說並存）。' },
    // ── 凶格：六庚諸格 ──
    { t: '庚', d: '癸', name: '大格', level: -3, src: '陰符經「加癸路中大格宜」；統宗〈奇門四十格〉「大格 庚臨六癸」',
      txt: '庚加癸爲大格，路途阻絕，忌遠行與簽約。' },
    { t: '庚', d: '壬', name: '小格', level: -2, src: '陰符經「加壬之時爲小格」；統宗〈奇門四十格〉「小格 庚臨壬」',
      txt: '庚加壬爲小格，往返皆滯，事情拖而不決。' },
    { t: '庚', d: '己', name: '刑格', level: -3, src: '陰符經「加己爲刑道上格」；統宗〈奇門四十格〉「刑格 庚臨六己」',
      txt: '庚加己爲刑格（又名上格），道路刑傷，百事不宜。' },
    { t: '庚', d: '@日干', name: '伏干格', level: -2, src: '陰符經「庚加日干爲伏干」；統宗〈奇門四十格〉「伏干 庚臨日干」',
      txt: '庚加日干爲伏干格，事壓在自己身上，主客皆不利。' },
    { t: '@日干', d: '庚', name: '飛干格', level: -2, src: '陰符經「日干加庚飛干格」；統宗〈奇門四十格〉「飛干格 日干臨庚」',
      txt: '日干加庚爲飛干格，自投於阻，動則受制。' },
    { t: '庚', xing: '@值符', name: '伏宫格', level: -2, src: '陰符經「庚加直符天乙伏」；統宗〈奇門四十格〉「伏宫 庚臨值符」',
      txt: '庚臨值符爲伏宫格，主事者受困，宜野戰不宜城守。' },
    { d: '庚', xing: '@值符', name: '飛宫格', level: -2, src: '陰符經「直符加庚天乙飛」；統宗〈奇門四十格〉',
      txt: '值符加庚爲飛宫格，上下失序，人事不一。' },
    { t: '庚', d: '丙', name: '太白入熒', level: -2, src: '陰符經「太白入熒賊即來」；統宗〈奇門四十格〉「太白入熒 六庚加丙奇」',
      txt: '庚加丙爲太白入熒，賊欲來，主外患突至，宜先防。' },
    { t: '丙', d: '庚', name: '火入金鄉', level: -2, src: '陰符經「火入金鄉賊即去」；統宗〈奇門四十格〉「火入金鄉 丙奇加六庚」',
      txt: '丙加庚爲火入金鄉，賊將去，事得解而耗財傷身。' },
    // ── 凶格：奇儀相剋 ──
    { t: '乙', d: '辛', name: '青龍逃走', level: -2, src: '陰符經「乙加辛兮龍逃走」；統宗〈奇門四十格〉「龍逃走 乙奇遇辛」',
      txt: '乙加辛爲青龍逃走，下屬拐帶、財物走失。' },
    { t: '辛', d: '乙', name: '白虎猖狂', level: -2, src: '陰符經「辛加乙兮虎猖狂」；統宗〈奇門四十格〉「虎猖狂 辛遇乙奇」',
      txt: '辛加乙爲白虎猖狂，遠行有險，家宅不寧。' },
    { t: '丁', d: '癸', name: '朱雀投江', level: -2, src: '陰符經「丁加癸兮雀入江」；統宗〈奇門四十格〉「雀投江 丁奇見癸」',
      txt: '丁加癸爲朱雀投江，文書信息沉沒，音訊不通。' },
    { t: '癸', d: '丁', name: '螣蛇妖矯', level: -1, src: '陰符經「癸加丁兮蛇躍蹺」；統宗〈奇門四十格〉「蛇妖矯 癸見丁奇」',
      txt: '癸加丁爲螣蛇妖矯，事多纏繞驚疑，凶中帶轉機。（陰符經作「躍蹺」，統宗四十格作「妖矯」；本頁從統宗）' },
    { t: '丁', d: '辛', name: '朱雀入獄', level: -2, src: '寶鑒卷一〈混合百神〉「六丁交辛；朱雀入獄」',
      txt: '丁加辛爲朱雀入獄，官人刑囚，常人枷鎖，文書契約不利。' },
    // ── 凶格：天網地羅 ──
    { t: '癸', d: '@時干', name: '天網四張', level: -2, src: '陰符經「天網四張時加癸」；統宗〈奇門四十格〉「天網四張 六癸臨時干」',
      txt: '六癸臨時干爲天網四張，無路可走，宜靜守。' },
    { t: '壬', d: '@時干', name: '地羅遮蔽', level: -2, src: '統宗〈奇門四十格〉「地羅遮蔽 六壬臨時干」',
      txt: '六壬臨時干爲地羅遮蔽，前路遮擋，不宜前進。' }
  ];

  // 三奇臨吉門（乙丙丁 + 開休生）
  var SANQI_MEN = { 乙: '日奇臨門，貴人助力', 丙: '月奇臨門，威權顯赫', 丁: '星奇臨門，文書吉利' };
  var JI_MEN = ['開門', '休門', '生門'];
  // 九星原始宫位，判反吟用
  var XING_ORIG = { 天蓬: 1, 天芮: 2, 天沖: 3, 天輔: 4, 天禽: 5, 天心: 6, 天柱: 7, 天任: 8, 天英: 9 };

  // 旺相休囚廢：依《御定奇門遁甲寶鑒》卷一〈釋氣應〉
  // 「皆以我生之月為旺，我同之月為相，我克之月為休，克我之月為囚，生我之月為廢」
  // 原書例：水星旺於寅卯、相於亥子、休於四五月、囚於辰戌丑未、廢於申酉。
  // 格局比對。'@甲' 取旬首所遁之儀（盤上見儀即是甲）。
  function matchGe(g, cell, pan) {
    function want(v) {
      if (v === '@甲') return pan.隱儀;
      if (v === '@日干') return pan.日干;
      if (v === '@時干') return pan.時干;
      return v;
    }
    if (g.t && cell.天盤干 !== want(g.t)) return false;
    if (g.d && cell.地盤干 !== want(g.d)) return false;
    if (g.men && cell.八門 !== g.men) return false;
    if (g.shen && cell.八神 !== g.shen) return false;
    if (g.xing === '@值符' && cell.九星 !== pan.值符星) return false;
    return !!(g.t || g.d || g.xing);
  }

  function wangshuai(wuxing, yueling) {
    if (SHENG[wuxing] === yueling) return { s: '旺', v: 2, txt: '我生之月爲旺' };
    if (wuxing === yueling) return { s: '相', v: 1, txt: '我同之月爲相' };
    if (KE[wuxing] === yueling) return { s: '休', v: -0.5, txt: '我剋之月爲休' };
    if (KE[yueling] === wuxing) return { s: '囚', v: -1.5, txt: '剋我之月爲囚' };
    return { s: '廢', v: -2, txt: '生我之月爲廢' };
  }

  function yuelingWuxing(yuezhi) {
    if ('寅卯'.indexOf(yuezhi) >= 0) return '木';
    if ('巳午'.indexOf(yuezhi) >= 0) return '火';
    if ('申酉'.indexOf(yuezhi) >= 0) return '金';
    if ('亥子'.indexOf(yuezhi) >= 0) return '水';
    return '土';
  }

  function relation(a, b) {
    if (a === b) return '比和';
    if (SHENG[a] === b) return '生';
    if (SHENG[b] === a) return '被生';
    if (KE[a] === b) return '剋';
    if (KE[b] === a) return '被剋';
    return '無';
  }

  function findGong(pan, key, val) {
    for (var g = 1; g <= 9; g++) if (pan.九宫[g] && pan.九宫[g][key] === val) return g;
    return null;
  }

  function duanju(pan, shixiang, birthYear) {
    var cfg = YONGSHEN[shixiang] || YONGSHEN.綜合;
    var yl = yuelingWuxing(pan.月支);

    // 1. 定用神落宫
    var ysName, ysGong, ysKind;
    if (shixiang === '出行') { ysName = pan.值使門; ysGong = pan.值使落宫; ysKind = '門'; }
    else if (cfg.門) { ysName = cfg.門; ysGong = findGong(pan, '八門', cfg.門); ysKind = '門'; }
    else if (cfg.星) { ysName = cfg.星; ysGong = findGong(pan, '九星', cfg.星); ysKind = '星'; }
    else if (cfg.神) { ysName = cfg.神; ysGong = findGong(pan, '八神', cfg.神); ysKind = '神'; }
    if (!ysGong) { ysName = pan.值符星; ysGong = pan.值符落宫; ysKind = '星'; }
    var cell = pan.九宫[ysGong];

    // 日干宫（甲不入地盤，以旬首隱儀代之）
    var rgGan = pan.日干 === '甲' ? pan.隱儀 : pan.日干;
    var rgGong = findGong(pan, '地盤干', rgGan) || pan.值符落宫;

    var score = 0, lines = [];

    // 2. 落宫旺衰
    var ysWuxing = ysKind === '門' ? BAMEN_WUXING[ysName] : (ysKind === '星' ? JIUXING_WUXING[ysName] : cell.宫五行);
    var ws = wangshuai(ysWuxing, yl);
    score += ws.v;
    lines.push({
      h: '一・取用神',
      p: '所問「' + shixiang + '」取' + ysKind + '爲用：<b>' + ysName + '</b>，落' + cell.宫名 + '（' + cell.方位 + '・' + ew(cell.宫五行) + '）。' + cfg.說明 + '。'
    });
    lines.push({
      h: '二・落宫旺衰',
      p: '用神五行屬' + ysWuxing + '，月令' + pan.月支 + '月屬' + yl + '，' + ws.txt + '，爲<b>' + ws.s + '</b>。' +
        (cell.空亡 ? '<span class="bad">此宫逢旬空</span>，事情落空、名實不符，需待出空之期再論。' : '此宫不空，事有著落。')
    });
    if (cell.空亡) score -= 2.5;

    // 3. 格局
    var gjTxt = [], gjFound = false;
    for (var i = 0; i < GEJU.length; i++) {
      var g = GEJU[i];
      if (matchGe(g, cell, pan)) {
        gjTxt.push('<b>' + g.name + '</b>：' + g.txt +
          '<span class="ge-src">〔' + g.src + '〕</span>');
        score += g.level * 0.85;
        gjFound = true;
      }
    }
    if (cell.天盤干 && cell.天盤干 === cell.地盤干) { gjTxt.push('<b>伏吟（干）</b>：天地盤同干，事情原地打轉。<i>典籍伏吟只講星門加本位，此條查無出處</i>。'); score -= 1.5; gjFound = true; }
    if (XING_ORIG[cell.九星] === ysGong) { gjTxt.push('<b>星伏吟</b>：' + cell.九星 + '回到本宫，環境凝滯不動。'); score -= 1; gjFound = true; }
    else if (XING_ORIG[cell.九星] === DUICHONG[ysGong]) { gjTxt.push('<b>星反吟</b>：' + cell.九星 + '自對沖宫而來，事情反覆變動。'); score -= 1.2; gjFound = true; }
    if (SANQI_MEN[cell.天盤干] && JI_MEN.indexOf(cell.八門) >= 0) {
      gjTxt.push('<b>三奇臨吉門</b>：' + SANQI_MEN[cell.天盤干] + '（' + cell.天盤干 + '臨' + cell.八門 + '）。');
      score += 1.5; gjFound = true;
    }
    if (QIMU[cell.天盤干] === ysGong) {
      gjTxt.push('<b>三奇入墓</b>：' + cell.天盤干 + '奇臨' + cell.宫名 + '，氣絕受困，動即有凶。' +
        '<span class="ge-src">〔寶鑒卷一〈釋奇墓奇制與日時幹墓同兇〉〕</span>');
      score -= 2; gjFound = true;
    }
    if (SANQI[cell.天盤干]) { gjTxt.push('<b>' + SANQI[cell.天盤干] + '</b>：三奇' + cell.天盤干 + '臨宫，得助有貴。'); score += 1.5; gjFound = true; }
    if (!gjFound) gjTxt.push('天盤' + (cell.天盤干 || '—') + ' 加 地盤' + (cell.地盤干 || '—') + '，未成特殊格局，依門星神本義論之。');
    lines.push({ h: '三・干支格局', p: gjTxt.join('<br>') });

    // 4. 門星神
    var menJx = BAMEN_JIXIONG[cell.八門], xingJx = JIUXING_JIXIONG[cell.九星], shenJx = BASHEN_JIXIONG[cell.八神];
    score += menJx === '吉' ? 2 : (menJx === '凶' ? -2 : 0);
    score += xingJx === '吉' ? 1.5 : (xingJx === '凶' ? -1.5 : 0);
    score += shenJx === '吉' ? 1 : -1;
    // 迫＝門剋宮。寶鑒卷一〈釋迫〉「迫者；門制其宮也」；煙波釣叟歌「宮制其門不為迫，門制其宮是迫雄」
    // （寶鑒〈註釋煙波釣叟歌〉另有一句方向相反，但同段所列 13 例仍全是門剋宮，不據）
    var menPo = KE[BAMEN_WUXING[cell.八門]] === cell.宫五行;
    if (menPo) score -= 1.5;
    lines.push({
      h: '四・門星神',
      p: '門：<b>' + cell.八門 + '</b>（' + menJx + '・' + BAMEN_YI[cell.八門] + '）　' +
        '星：<b>' + cell.九星 + '</b>（' + xingJx + '・' + JIUXING_YI[cell.九星] + '）　' +
        '神：<b>' + cell.八神 + '</b>（' + shenJx + '・' + BASHEN_YI[cell.八神] + '）<br>' +
        (menPo ? '<span class="bad">門剋宫爲迫</span>，吉門被迫則吉事不成，凶門被迫則凶災愈甚。' : '門不剋宫，不為迫。')
    });

    // 5. 生剋
    var rgCell = pan.九宫[rgGong];
    var rel = relation(rgCell.宫五行, cell.宫五行);
    var relTxt;
    if (rel === '比和') { score += 0.5; relTxt = '兩宫比和，我與事同氣，平順但無額外助力。'; }
    else if (rel === '生') { score += 1; relTxt = '日干宫生用神宫，我付出、事得利，須耗己方資源。'; }
    else if (rel === '被生') { score += 1.5; relTxt = '用神宫生日干宫，事來就我，主得利、受惠。'; }
    else if (rel === '剋') { score += 0.5; relTxt = '日干宫剋用神宫，我能掌控此事，可主動推進。'; }
    else { score -= 1.5; relTxt = '用神宫剋日干宫，事壓制我，勉強爲之有損。'; }
    lines.push({
      h: '五・我與事',
      p: '日干' + pan.日干 + (pan.日干 === '甲' ? '（甲遁' + pan.隱儀 + '）' : '') + '落' + rgCell.宫名 + '（' + ew(rgCell.宫五行) + '），用神在' + cell.宫名 + '（' + ew(cell.宫五行) + '）。' + relTxt
    });

    // 6. 年命落宫（選填）
    var nmGong = null, nmZhi = null;
    if (birthYear) {
      nmZhi = DIZHI[mod(birthYear - 4, 12)];
      nmGong = DIZHI_GONG[nmZhi];
      var nmCell = pan.九宫[nmGong];
      var nmRel = relation(nmCell.宫五行, cell.宫五行);
      var nmTxt;
      if (nmRel === '被生') { score += 1.2; nmTxt = '用神宫生年命宫，此事於本人有實益，受益者是你自己。'; }
      else if (nmRel === '生') { score += 0.6; nmTxt = '年命宫生用神宫，須由你出力灌注，成事但耗己。'; }
      else if (nmRel === '比和') { score += 0.4; nmTxt = '年命宫與用神宫比和，人與事同調，無助亦無礙。'; }
      else if (nmRel === '剋') { score += 0.4; nmTxt = '年命宫剋用神宫，你能壓得住此事，主動權在你。'; }
      else { score -= 1.2; nmTxt = '用神宫剋年命宫，此事反噬本人，得不償失。'; }
      if (nmCell.空亡) { score -= 1; nmTxt += '又年命落空，本人心不在此，意願浮動。'; }
      lines.push({
        h: '六・年命落宫',
        p: birthYear + '年生，年支' + nmZhi + '，年命落<b>' + nmCell.宫名 + '</b>（' + nmCell.方位 + '・' + ew(nmCell.宫五行) + '）：' +
          nmCell.八神 + '・' + nmCell.九星 + '・' + nmCell.八門 + '。' + nmTxt +
          (nmGong === rgGong ? '　年命與日干同宫，人事合一，所斷更準。' : '')
      });
    }

    var verdict, vclass;
    if (score >= 4) { verdict = '大吉'; vclass = 'good'; }
    else if (score >= 1.5) { verdict = '吉'; vclass = 'good'; }
    else if (score > -1.5) { verdict = '平'; vclass = 'mid'; }
    else if (score > -4) { verdict = '凶'; vclass = 'bad'; }
    else { verdict = '大凶'; vclass = 'bad'; }

    var advice;
    if (score >= 1.5) advice = '可行。取' + cell.方位 + '方爲吉方，用' + cell.八門.charAt(0) + '門之事推進；配合' + cell.九星 + '之象，宜' + BAMEN_YI[cell.八門].slice(0, 2) + '。';
    else if (score > -1.5) advice = '成敗參半。宜先補足用神所缺——' + (cell.空亡 ? '待出空之後再動' : (ws.s === '囚' || ws.s === '廢' ? '等待用神轉旺之月令' : '謀定而後動')) + '，不宜倉促。';
    else advice = '不宜強求。' + (cell.空亡 ? '用神落空，另擇時日重起一局。' : '用神受制，改換方式或另尋他途爲上。');

    return { verdict: verdict, vclass: vclass, score: Math.round(score * 10) / 10, lines: lines, advice: advice, ysName: ysName, ysGong: ysGong, rgGong: rgGong, nmGong: nmGong, nmZhi: nmZhi, fangwei: cell.方位 };
  }

  // ==================== 繪製 ====================
  var LAYOUT = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  // 五行上色：顏色即語意，與五行歸屬圖同一組礦物色
  function ew(x) { return '木火土金水'.indexOf(x) < 0 ? x : '<i class="e e-' + x + '">' + x + '</i>'; }

  function renderPan(pan, duan, shixiang) {
    var html = '';
    LAYOUT.forEach(function (row) {
      row.forEach(function (g) {
        var c = pan.九宫[g];
        if (c.中宫) {
          html += '<div class="pp-cell pp-center">' +
            '<div class="pp-ju">' + pan.陰陽遁 + ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][pan.局數] + '局</div>' +
            '<div class="pp-cinfo">' + pan.節氣 + '・' + pan.三元 + '</div>' +
            '<div class="pp-cinfo">時家轉盤・拆補法</div>' +
            '<div class="pp-cinfo">' + pan.旬首 + '旬・遁' + pan.隱儀 + '</div>' +
            '<div class="pp-cnote">中五地盤' + (c.地盤干 || '—') + '</div>' +
            '<div class="pp-cnote">天禽隨芮寄' + (GONG_SHORT[pan.天禽宫] || '坤二') + '</div></div>';
          return;
        }
        var tags = [];
        if (g === pan.值符落宫) tags.push('值符');
        if (g === pan.值使落宫) tags.push('值使');
        if (c.空亡) tags.push('空亡');
        if (g === duan.rgGong) tags.push('日干・自身');
        if (duan.nmGong === g) tags.push('年命・' + duan.nmZhi);
        if (g === duan.ysGong) tags.push(duan.ysName + '・' + shixiang);
        html += '<div class="pp-cell' + (c.空亡 ? ' is-kong' : '') + '">' +
          '<div class="pp-gong">' + c.宫名 + '・' + c.方位 + '・' + ew(c.宫五行) + '</div>' +
          '<div class="pp-shen">' + c.八神 + '</div>' +
          '<div class="pp-rows">' +
          '<div class="pp-row"><span>九星</span><b>' + c.九星 + '</b><span>天盤</span><b class="pp-tian">' + c.天盤干 + '</b></div>' +
          '<div class="pp-row"><span>八門</span><b>' + c.八門 + '</b><span>地盤</span><b class="pp-di">' + c.地盤干 + '</b></div>' +
          '</div>' +
          (tags.length ? '<div class="pp-tags">' + tags.map(function (t) { return '<i>' + t + '</i>'; }).join('') + '</div>' : '<div class="pp-tags"></div>') +
          '</div>';
      });
    });
    return html;
  }

  function renderDuan(d) {
    var html = '<div class="pp-verdict ' + d.vclass + '"><span class="pp-vlabel">總評</span><b>' + d.verdict + '</b><i>權重 ' + d.score + '</i></div>';
    html += '<div class="pp-steps">' + d.lines.map(function (l) {
      return '<div class="pp-step"><h4>' + l.h + '</h4><p>' + l.p + '</p></div>';
    }).join('') + '</div>';
    html += '<div class="pp-advice"><span>斷曰</span><p>' + d.advice + '</p></div>';
    return html;
  }

  // ==================== 綁定 ====================
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function init() {
    var dateEl = document.getElementById('ppDate');
    var hourEl = document.getElementById('ppHour');
    var matterEl = document.getElementById('ppMatter');
    var birthEl = document.getElementById('ppBirth');
    var goBtn = document.getElementById('ppGo');
    var nowBtn = document.getElementById('ppNow');
    var out = document.getElementById('ppOut');
    if (!goBtn) return;

    function setNow() {
      var n = new Date();
      dateEl.value = n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate());
      hourEl.value = String(n.getHours());
    }

    function run() {
      var parts = (dateEl.value || '').split('-');
      if (parts.length !== 3) { setNow(); parts = dateEl.value.split('-'); }
      var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
      var h = parseInt(hourEl.value, 10);
      if (!y || !m || !d || isNaN(h)) return;
      var by = parseInt(birthEl.value, 10);
      if (!by || by < 1900 || by > 2100) by = null;
      var pan = paipan(y, m, d, h);
      var duan = duanju(pan, matterEl.value, by);
      lastPan = pan; lastDuan = duan; lastMatter = matterEl.value;
      if (typeof window.onQimenPan === 'function') window.onQimenPan();
      var hourLabel = hourEl.options[hourEl.selectedIndex].text;
      var pillars = [['年柱', pan.四柱.年柱], ['月柱', pan.四柱.月柱], ['日柱', pan.四柱.日柱], ['時柱', pan.四柱.時柱]];
      out.innerHTML =
        '<div class="pp-head">' +
        '<div class="pp-title">奇門遁甲・' + matterEl.value + '局</div>' +
        '<div class="pp-sub">' + y + '年' + m + '月' + d + '日　' + hourLabel + '時｜台灣時間</div>' +
        '<div class="pp-pillars">' + pillars.map(function (p) {
          return '<div class="pp-pillar"><span>' + p[0] + '</span><b>' + p[1] + '</b></div>';
        }).join('') + '</div>' +
        '<div class="pp-summary">值符：' + pan.值符星 + '落' + GONG_SHORT[pan.值符落宫] +
        '　　值使：' + pan.值使門 + '落' + GONG_SHORT[pan.值使落宫] +
        '　　旬空：' + pan.空亡地支.join('、') + '</div></div>' +
        '<div class="pp-grid">' + renderPan(pan, duan, matterEl.value) + '</div>' +
        '<div class="pp-legend"><span>上南下北・左東右西</span><span>' +
        (by ? by + '年年命按立春後取' + duan.nmZhi + '；立春前出生需另核' : '未填出生年，未計年命落宫') + '</span></div>' +
        '<div class="pp-duan"><h3>斷局</h3>' + renderDuan(duan) + '</div>' +
        '<p class="pp-disclaimer">排盤採時家轉盤奇門・拆補法；節氣爲近似天文演算法，交節前後一日請自行覆核。斷局爲規則式推演，供學習對照，不取代現實判斷。</p>';
      out.hidden = false;
    }

    setNow();
    goBtn.addEventListener('click', run);
    nowBtn.addEventListener('click', function () { setNow(); run(); });
  }

  // 十八局地盤示範：跟排盤器共用 buDipan
  function initDipan() {
    var yinyang = document.getElementById('dpYinyang');
    var juEl = document.getElementById('dpJu');
    var out = document.getElementById('dpGrid');
    var cap = document.getElementById('dpCaption');
    if (!yinyang) return;

    function draw() {
      var isYang = yinyang.value === '陽遁';
      var ju = parseInt(juEl.value, 10);
      var dipan = buDipan(ju, isYang);
      out.innerHTML = LAYOUT.map(function (row) {
        return row.map(function (g) {
          var gan = dipan[g] || '';
          var isStart = gan === '戊';
          return '<div class="dp-cell' + (g === 5 ? ' dp-mid' : '') + (isStart ? ' dp-start' : '') + '">' +
            '<span class="dp-gong">' + GONG_SHORT[g] + '</span>' +
            '<b>' + gan + '</b>' +
            (isStart ? '<span class="dp-mark">起</span>' : '') + '</div>';
        }).join('');
      }).join('');
      cap.textContent = isYang
        ? '陽遁' + ju + '局：戊起坎一起算的第 ' + ju + ' 宫，六儀三奇依洛書順飛（1→2→3…→9→1）。'
        : '陰遁' + ju + '局：戊落第 ' + ju + ' 宫，六儀三奇依洛書逆飛（9→8→7…→1→9）。';
    }
    yinyang.addEventListener('change', draw);
    juEl.addEventListener('change', draw);
    draw();
  }

  // 動態題庫：從「最近排出的那一盤」出題，答案跟盤面同源
  var lastPan = null, lastDuan = null, lastMatter = '';
  window.QimenLiveQuiz = function () {
    if (!lastPan) return [];
    var p = lastPan, d = lastDuan;
    var kongNames = p.空亡宫位.map(function (g) { return GONG_NAME[g]; }).join('、');
    var ysCell = p.九宫[d.ysGong];
    var qs = [
      ['看盤・值使', '這一盤的值使是哪個門，落在哪一宫？', p.值使門 + '，落' + GONG_NAME[p.值使落宫] + '。值使看事情的走向。'],
      ['看盤・值符', '這一盤的值符是哪顆星，落在哪一宫？', p.值符星 + '，落' + GONG_NAME[p.值符落宫] + '。值符看全局主導力量。'],
      ['看盤・空亡', '這一盤哪些宫位落空亡？', kongNames + '（旬空' + p.空亡地支.join('、') + '）。盤上打斜線的就是。'],
      ['看盤・遁甲', '這一盤的甲遁在哪個儀？', p.旬首 + '旬，甲遁' + p.隱儀 + '。要找甲就看' + p.隱儀 + '落哪一宫。'],
      ['看盤・用神', '問「' + lastMatter + '」取什麼爲用神，落在哪一宫？', d.ysName + '，落' + ysCell.宫名 + '（' + ysCell.方位 + '・' + ysCell.宫五行 + '）。'],
      ['看盤・同宫', d.ysName + '所在那一宫的門、星、神各是什麼？', '門' + ysCell.八門 + '、星' + ysCell.九星 + '、神' + ysCell.八神 + '。'],
      ['看盤・起局', '這個時辰是陰遁還是陽遁？第幾局？爲什麼？', p.陰陽遁 + p.局數 + '局。節氣' + p.節氣 + '、' + p.三元 + '，查十八局表而得。']
    ];
    return qs;
  };

  function boot() { init(); initDipan(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.QimenPaipan = { paipan: paipan, duanju: duanju, buDipan: buDipan, GEJU: GEJU };
})();
