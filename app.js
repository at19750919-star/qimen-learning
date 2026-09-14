const palaceData={
  '巽四':['東南 · 木','巽四宮','原始配置為天輔星、杜門。巽有進入、流動與滲透的空間感。','記憶：東南風入巽，四宮屬木。'],
  '離九':['南 · 火','離九宮','原始配置為天英星、景門。離主光明、顯現，也容易讓事情被看見。','記憶：南方日光最盛，離火居九。'],
  '坤二':['西南 · 土','坤二宮','原始配置為天芮星、死門。坤主承載、順勢與大地。','記憶：大地為坤，二宮在西南。'],
  '震三':['東 · 木','震三宮','原始配置為天沖星、傷門。震像雷動，帶有啟動與衝擊。','記憶：東方春雷起，震木居三。'],
  '中五':['中央 · 土','中五宮','中央主調和與承載。轉盤奇門中，天禽星居中五；本頁採用中五寄坤的學習約定。','記憶：五居中央，土承萬物。'],
  '兌七':['西 · 金','兌七宮','原始配置為天柱星、驚門。兌與言語、交流和喜悅相關。','記憶：西方屬金，兌口居七。'],
  '艮八':['東北 · 土','艮八宮','原始配置為天任星、生門。艮像山，象徵停止、界線與積累。','記憶：東北有山，艮土居八。'],
  '坎一':['北 · 水','坎一宮','原始配置為天蓬星、休門。坎主水、深處、流動與風險。','記憶：北方寒水，坎水居一。'],
  '乾六':['西北 · 金','乾六宮','原始配置為天心星、開門。乾主天、主導、規則與開創。','記憶：西北為天，乾金居六。']
};
document.querySelectorAll('.palace').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.palace').forEach(x=>x.setAttribute('aria-pressed','false'));btn.setAttribute('aria-pressed','true');
  const d=palaceData[btn.dataset.palace];document.getElementById('detailMeta').textContent=d[0];document.getElementById('detailTitle').textContent=d[1];document.getElementById('detailText').textContent=d[2];document.getElementById('detailMemory').textContent=d[3];
}));
document.querySelectorAll('[role="tab"]').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('[role="tab"]').forEach(t=>t.setAttribute('aria-selected','false'));tab.setAttribute('aria-selected','true');
  document.querySelectorAll('[role="tabpanel"]').forEach(p=>p.hidden=true);document.getElementById(tab.getAttribute('aria-controls')).hidden=false;
}));
const checks=[...document.querySelectorAll('[data-progress]')];
try{const saved=JSON.parse(localStorage.getItem('qimenProgress')||'{}');checks.forEach(c=>c.checked=!!saved[c.dataset.progress])}catch(e){}
function updateProgress(){const done=checks.filter(c=>c.checked).length;document.getElementById('progressFill').style.width=(done/checks.length*100)+'%';document.getElementById('progressText').textContent=`完成 ${done}／${checks.length}`;const state={};checks.forEach(c=>state[c.dataset.progress]=c.checked);try{localStorage.setItem('qimenProgress',JSON.stringify(state))}catch(e){}}
checks.forEach(c=>c.addEventListener('change',updateProgress));updateProgress();
const quiz=[
  ['九宮位置','坎一宮在哪個方向？','北方，五行屬水。'],['九宮位置','離九宮在哪個方向？','南方，五行屬火。'],['九宮位置','乾六宮在哪個方向？','西北，五行屬金。'],['九宮位置','震三宮的原始星門？','天沖星、傷門。'],['五行生剋','金生什麼？又剋什麼？','金生水，金剋木。'],['五行生剋','木生什麼？又剋什麼？','木生火，木剋土。'],['十天干','丙、丁屬什麼五行？','丙、丁屬火。'],['十天干','壬、癸屬什麼五行？','壬、癸屬水。'],['八門','哪一門代表工作與開創？','開門。'],['八門','哪一門代表財利與生長？','生門。'],['八門','杜門的核心狀態？','封閉、堵塞與隱藏。'],['讀盤方法','工作問題主要看哪個門？','開門；同時以日干看自己、值符看主導力量。'],['讀盤方法','找到用神之後先看什麼？','看它落在哪一宮、宮的五行，以及是否空亡。']
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
