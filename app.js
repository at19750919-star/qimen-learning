// 九宫類象：一律引《奇門遁甲統宗》卷二原文，出處寫在每條的 s 欄。
// 說明句（lead／memo）是本頁整理的助記語，不是典籍，顯示時另作標示。
const palaceData={
  '坎一':{meta:'北 · 水',title:'坎一宫',lead:'坎主水、深處、流動與風險。',lx:[{k:'宫 · 八卦類神',t:'坎宮：北道、舟程、黑色、鹹味、漿糊、水膏、繩索、樂器、水瀉、遺精、耳腎腰疾、深聽智謀、漫事曲折。',s:'統宗卷之二〈坎宮〉'},{k:'星 · 九星類神',t:'天蓬：為水，為後，為水火、盜賊，其音為羽，入官逢盜賊，起造、移徙防火，婚姻妨翁姑，娶傷產，商賈遠方遇仇人侵害，行人即歸。兗州分野。',s:'統宗卷之二〈天蓬〉'},{k:'星 · 九星所主',t:'天蓬所主：蓬星宜安撫邊境，修築城池，不宜入官見貴、嫁娶、移徙、商賈、營建。凡徵戰將兵，辰戌丑未月日加二五八宮利為主，申亥子月日加九宮利為客。貪狼星也。',s:'統宗卷之二〈天蓬所主〉'},{k:'門 · 八門所主',t:'休門所主：休門宜面君謁貴、上官到任、嫁娶、移徙、商賈、營建，諸事皆吉，不宜行刑斷獄。',s:'統宗卷之二〈休門所主〉'}],memo:'記憶：北方寒水，坎水居一。'},
  '坤二':{meta:'西南 · 土',title:'坤二宫',lead:'坤爲地，主承載、順勢與眾多。',lx:[{k:'宫 · 八卦類神',t:'坤宮：城隍、司命、土社、谷帛、田野、倉場、雲霧、沙石、老女、道姑、脾胃、腹疾、鄉農、斗毆、思慮、牢獄、符藥丸散、醫筮算卜。',s:'統宗卷之二〈坤宮〉'},{k:'星 · 九星類神',t:'天芮：為士，為教師，為良朋益友，其音為宮，宜於秋冬，起造、嫁娶、遷徙當招官訟，或有盜侵佔，行人則歸，經商失財破侶。梁州分野。',s:'統宗卷之二〈天芮〉'},{k:'星 · 九星所主',t:'天芮所主：芮星宜崇尚道德、尊師親友、入官見貴，不宜嫁娶移徙、商賈、營建。凡將兵征伐，與任星同。巨門星也。',s:'統宗卷之二〈天芮所主〉'},{k:'門 · 八門所主',t:'死門所主：死門宜決斷、刑獄、弔喪、埋葬等事。',s:'統宗卷之二〈死門所主〉'}],memo:'記憶：大地爲坤，二宫在西南。'},
  '震三':{meta:'東 · 木',title:'震三宫',lead:'震像雷動，帶有啟動與衝擊。',lx:[{k:'宫 · 八卦類神',t:'震宮：甲乙青龍、禁廷、內翰、舟船、車馬、泰嶽、宮觀廟宇、家神林麓、妖怪、肝膽、四肢、長男、憂喜、遊獵、威聲、相貌俊偉、蒜菜、瓜菜、腥、酸、鮮味、工巧雕刻、雲龍、怪異。',s:'統宗卷之二〈震宮〉'},{k:'星 · 九星類神',t:'天衝：為雷祖天帝，為木，為武士，其音為角，宜出軍雷冤，若移徙、商賈不吉，嫁娶妨害，一年之內修造三年當有凶事，上官利武職。徐州分野。',s:'統宗卷之二〈天衝〉'},{k:'星 · 九星所主',t:'天衝所主：衝星宜征伐戰鬥、報怨酬恩，不宜上官見貴、嫁娶、移徙、商賈、營建。凡徵戰，四季申酉月加六七宮利為主，亥子寅卯月日加二五八宮利為客。祿存星也。',s:'統宗卷之二〈天衝所主〉'},{k:'門 · 八門所主',t:'傷門所主：傷門宜漁獵、討捕索債、博戲、收斂貨財，餘俱不宜。',s:'統宗卷之二〈傷門所主〉'}],memo:'記憶：東方春雷起，震木居三。'},
  '巽四':{meta:'東南 · 木',title:'巽四宫',lead:'巽爲風，有進入、流動與滲透的空間感。',lx:[{k:'宫 · 八卦類神',t:'巽宮：山林、竹舍、進退、藏匿、懸吊、安柱、繩索、縈結、工巧、機關、諸事、灣環、長安新婦、秀士、幽閒、絕煙、神廟、股肱、手足、風寒、氣症、膽肝、眼目。',s:'統宗卷之二〈巽宮〉'},{k:'星 · 九星類神',t:'天輔：為草，為民，其音角，春夏婚姻、移徙大吉，秋冬諸事不吉。荊州分野。',s:'統宗卷之二〈天輔〉'},{k:'星 · 九星所主',t:'天輔所主：輔星宜修道設教、誅凶伐暴、入官見貴、嫁娶、移徙、商賈、營建、應舉、謀望。凡將兵征伐，與衝星同。文曲星也。',s:'統宗卷之二〈天輔所主〉'},{k:'門 · 八門所主',t:'杜門所主：杜門宜捕盜、剪凶、決隱、獄形、填塞溝壑，餘俱不宜。',s:'統宗卷之二〈杜門所主〉'}],memo:'記憶：東南風入巽，四宫屬木。'},
  '中五':{meta:'中央 · 土',title:'中五宫',lead:'中央主調和與承載，本頁採中五寄坤的學習約定。',lx:[{k:'宫 · 中宫無卦',t:'甲辰在中宫，寄於坤二，天禽爲符，死門爲使。',s:'統宗卷之二〈以旬首取符使法〉'},{k:'星 · 九星類神',t:'天禽：為工，為師巫，為法士，其音為宮，宜祭祀神祗，商賈、埋葬、移徙皆吉，秋冬大利，春夏小凶。寄於坤宮，依門債戶，其神不正吉，亦非全。豫州分野。',s:'統宗卷之二〈天禽〉'},{k:'星 · 九星所主',t:'天禽所主：禽星宜祭祀、祈福、斷滅羣凶、入官見貴、賜爵賞功、應舉、謀望、嫁娶、移徙、商賈、營建。凡將兵征伐，亥子寅卯月日加三四宮利為主，辰戌丑未月日加一宮利為客。廉貞星也。',s:'統宗卷之二〈天禽所主〉'},{k:'門 · 天禽寄坤',t:'天禽：……寄於坤宮，依門債戶，其神不正吉，亦非全。',s:'統宗卷之二〈天禽〉'}],memo:'記憶：五居中央，土承萬物。'},
  '乾六':{meta:'西北 · 金',title:'乾六宫',lead:'乾爲天，主主導、規則與開創。',lx:[{k:'宫 · 八卦類神',t:'乾宮：君父、顯官、僧道、老人、寶石、銅鐵金石、絲絃、色白形圓、體堅味辛、刀砧、錘鈴、骨腦、股筋。',s:'統宗卷之二〈乾宮〉'},{k:'星 · 九星類神',t:'天心：為金，為高道，為名醫，其音為商，宜書符合藥，春夏不利修造，宜移徙、嫁娶，不可商賈，此日時晴明大吉。冀州分野。',s:'統宗卷之二〈天心〉'},{k:'星 · 九星所主',t:'天心所主：心星宜興師陳旅、誅暴伐惡、入官見貴、應舉、求謀、嫁娶、移徙、商賈、營建。凡將兵征伐，與柱星同。武曲星也。',s:'統宗卷之二〈天心所主〉'},{k:'門 · 八門所主',t:'開門所主：開門宜徵討、謀望、入官見貴、應舉、遠行、嫁娶、移徙、商賈、營建，不宜治政，有私人窺伺。',s:'統宗卷之二〈開門所主〉'}],memo:'記憶：西北爲天，乾金居六。'},
  '兑七':{meta:'西 · 金',title:'兑七宫',lead:'兑爲澤，與言語、交流和喜悅相關。',lx:[{k:'宫 · 八卦類神',t:'兌宮：破損、毀折、陰人災厄、少女、*妾、咽喉、口舌、妖邪不正、詭言虛譎、缺地、廢井、刀針銅鐵。',s:'統宗卷之二〈兌宮〉'},{k:'星 · 九星類神',t:'天柱：為金，為隱士，為修煉，其音為商，宜固守隱跡，或為陰謀，不可移徙、商賈、嫁娶，皆不吉。雍州分野。',s:'統宗卷之二〈天柱〉'},{k:'星 · 九星所主',t:'天柱所主：柱星宜修築營壘、訓練士卒，不宜入官見貴、嫁娶移徙、商賈營建。凡將兵征伐，寅卯巳午月日加九宮利主，四季申酉月日加三四宮利客。破軍星也。',s:'統宗卷之二〈天柱所主〉'},{k:'門 · 八門所主',t:'驚門所主：驚門宜掩捕盜賊、恐惑亂眾等事。',s:'統宗卷之二〈驚門所主〉'}],memo:'記憶：西方屬金，兑口居七。'},
  '艮八':{meta:'東北 · 土',title:'艮八宫',lead:'艮像山，象徵停止、界線與積累。',lx:[{k:'宫 · 八卦類神',t:'艮宮：少男、山岡、徑路、石岸、土石、瓦塊、山村、寺觀、動止不常、堅硬多節、鼻、背、手指、氣血積結、色黃味甘、進退、生死、脊背癰疽、手足瘡疥、虎豹狼狽鼠狗之物。',s:'統宗卷之二〈艮宮〉'},{k:'星 · 九星類神',t:'天任：為上始富室，其音為宮，嫁娶、生子大貴，上官謁貴全吉，惟修其不利商賈、遠行。春夏大吉。青州分野。',s:'統宗卷之二〈天任〉'},{k:'星 · 九星所主',t:'天任所主：任星宜立國邑、化人民、入官見貴、求請應與商賈、嫁娶，不宜遷徙、營建。凡將兵，亥子寅卯月日加三四宮利為主，辰戌丑未月日加一宮利為客。左輔星也。',s:'統宗卷之二〈天任所主〉'},{k:'門 · 八門所主',t:'生門所主：生門宜徵討、謀望、入官見貴、嫁娶、移徙，諸事皆吉，不宜埋葬治喪。',s:'統宗卷之二〈生門所主〉'}],memo:'記憶：東北有山，艮土居八。'},
  '離九':{meta:'南 · 火',title:'離九宫',lead:'離主光明、顯現，也容易讓事情被看見。',lx:[{k:'宫 · 八卦類神',t:'離宮：神聖、公像、閃電、星火、赤鴉、丹鳳、火竈、煙囪、燈籠、紅盒、酒食、馨香、焙炙藥物、帶殼而嘗、炊燥性熱、緊急、燻蒸、祖先、宗廟、明堂、客廳、爐鼎、火具、詩賦、詞文、眼目、心血潮熱、虛驚。',s:'統宗卷之二〈離宮〉'},{k:'星 · 九星類神',t:'天英：為火，為爐冶人，為殘患，其音為徵，宜遠行獻書，不宜商賈，主失財物，修造失火，上官有災，止宜嫁娶。揚州分野。',s:'統宗卷之二〈天英〉'},{k:'星 · 九星所主',t:'天英所主：天英宜上官見貴、應舉報書，不宜嫁娶、移徙、商賈、營建、祭祀、遠行。凡戰伐，申酉亥子月日加一宮利為主，寅卯巳午月日加六七宮利為客。右弼星也。',s:'統宗卷之二〈天英所主〉'},{k:'門 · 八門所主',t:'景門所主：景門宜上書獻策、招賢謁貴、拜職遣使、行誅、突陣、破齒等事，餘俱不宜。',s:'統宗卷之二〈景門所主〉'}],memo:'記憶：南方日光最盛，離火居九。'}
};
document.querySelectorAll('.palace').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.palace').forEach(x=>x.setAttribute('aria-pressed','false'));btn.setAttribute('aria-pressed','true');
  const d=palaceData[btn.dataset.palace];
  document.getElementById('detailMeta').innerHTML=d.meta.replace(/([木火土金水])$/,'<i class="e e-$1">$1</i>');
  document.getElementById('detailTitle').textContent=d.title;
  document.getElementById('detailText').textContent=d.lead;
  document.getElementById('detailLx').innerHTML=d.lx.map(v=>
    `<dt>${v.k}</dt><dd>${v.t}<span class="src">${v.s}</span></dd>`).join('');
  document.getElementById('detailMemory').textContent=d.memo;
}));
try{localStorage.removeItem('qimenProgress')}catch(e){}   // 不再保存進度，順手清掉舊資料
const quiz=[
  ['九宫位置','坎一宫在哪個方向？','北方，五行屬水。'],['九宫位置','離九宫在哪個方向？','南方，五行屬火。'],['九宫位置','乾六宫在哪個方向？','西北，五行屬金。'],['九宫位置','震三宫的原始星門？','天沖星、傷門。'],['五行生剋','金生什麼？又剋什麼？','金生水，金剋木。'],['五行生剋','木生什麼？又剋什麼？','木生火，木剋土。'],['十天干','丙、丁屬什麼五行？','丙、丁屬火。'],['十天干','壬、癸屬什麼五行？','壬、癸屬水。'],['八門','哪一門代表工作與開創？','開門。'],['八門','哪一門代表財利與生長？','生門。'],['八門','杜門的核心狀態？','封閉、堵塞與隱藏。'],['讀盤方法','工作問題主要看哪個門？','開門；同時以日干看自己、值符看主導力量。'],['讀盤方法','找到用神之後先看什麼？','看它落在哪一宫、宫的五行，以及是否空亡。']
];
let qIndex=0,revealed=false,pool=quiz.slice();
function rebuildPool(){
  const live=(typeof window.QimenLiveQuiz==='function')?window.QimenLiveQuiz():[];
  pool=quiz.concat(live);
}
window.onQimenPan=()=>{rebuildPool();document.getElementById('quizSource').hidden=false};
function drawQuiz(){const q=pool[qIndex];document.getElementById('quizCategory').textContent=q[0];document.getElementById('quizPrompt').textContent=q[1];document.getElementById('quizAnswer').textContent='先在心裡回答，再翻牌。';document.getElementById('revealBtn').textContent='顯示答案';document.getElementById('quizSource').hidden=!q[0].startsWith('看盤');revealed=false}
document.getElementById('revealBtn').addEventListener('click',()=>{revealed=!revealed;document.getElementById('quizAnswer').textContent=revealed?pool[qIndex][2]:'先在心裡回答，再翻牌。';document.getElementById('revealBtn').textContent=revealed?'收起答案':'顯示答案'});
document.getElementById('nextBtn').addEventListener('click',()=>{rebuildPool();let next=qIndex;while(next===qIndex&&pool.length>1)next=Math.floor(Math.random()*pool.length);qIndex=next;drawQuiz()});

// ── 章節分頁（導覽列即分頁鈕）────────────────────────────
// 不保存狀態：重整就回到第一章。
const chapLinks=[...document.querySelectorAll('.nav-links a[href^="#"]')];
const chapSecs=chapLinks.map(a=>document.getElementById(a.getAttribute('href').slice(1)))
                        .filter(Boolean);
const allBtn=document.getElementById('chapAll');
let showAll=false;
function showChapter(id){
  showAll=false; allBtn.setAttribute('aria-pressed','false');
  chapLinks.forEach(a=>a.classList.toggle('on',a.getAttribute('href').slice(1)===id));
  chapSecs.forEach(sec=>sec.hidden=(sec.id!==id));
  scrollTo({top:0});
}
chapLinks.forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href').slice(1);
  if(chapSecs.some(s=>s.id===id)){e.preventDefault();showChapter(id);}
}));
allBtn.addEventListener('click',()=>{
  showAll=!showAll;
  allBtn.setAttribute('aria-pressed',String(showAll));
  if(showAll)chapSecs.forEach(sec=>sec.hidden=false);
  else showChapter((chapLinks.find(a=>a.classList.contains('on'))||chapLinks[0])
                   .getAttribute('href').slice(1));
});
showChapter(chapSecs[0].id);

// ── 玖節的子分頁 ──────────────────────────────────────────
document.querySelectorAll('.subtabs [role="tab"],.symbol-tabs [role="tab"]').forEach(tab=>{
  tab.addEventListener('click',()=>{
    const bar=tab.closest('[role="tablist"]');
    bar.querySelectorAll('[role="tab"]').forEach(t=>{
      t.setAttribute('aria-selected',String(t===tab));
      document.getElementById(t.getAttribute('aria-controls')).hidden=(t!==tab);
    });
  });
});
