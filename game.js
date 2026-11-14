/* =========================================================
   1. DỮ LIỆU TỪ VỰNG
   ========================================================= */
const WORDS = [
  {w:'苹果', p:'píngguǒ',  m:'quả táo'},
  {w:'老师', p:'lǎoshī',   m:'thầy/cô giáo'},
  {w:'多少', p:'duōshao',  m:'bao nhiêu'},
  {w:'西瓜', p:'xīguā',    m:'dưa hấu'},
  {w:'找钱', p:'zhǎoqián', m:'trả lại tiền'},
  {w:'手机', p:'shǒujī',   m:'điện thoại di động'},
  {w:'咖啡', p:'kāfēi',    m:'cà phê'},
  {w:'一共', p:'yígòng',   m:'tổng cộng'},
  {w:'公斤', p:'gōngjīn',  m:'ki-lô-gam'},
  {w:'银行', p:'yínháng',  m:'ngân hàng'},
  {w:'房间', p:'fángjiān', m:'căn phòng'},
  {w:'桌子', p:'zhuōzi',   m:'cái bàn'},
  {w:'椅子', p:'yǐzi',     m:'cái ghế'},
  {w:'杯子', p:'bēizi',    m:'cái cốc / ly'},
  {w:'便宜', p:'piányi',   m:'rẻ'},
  {w:'超市', p:'chāoshì',  m:'siêu thị'},
  {w:'邮局', p:'yóujú',    m:'bưu điện'},
  {w:'东西', p:'dōngxi',   m:'đồ vật'},
  {w:'明天', p:'míngtiān', m:'ngày mai'},
  {w:'今天', p:'jīntiān',  m:'hôm nay'},
  {w:'昨天', p:'zuótiān',  m:'hôm qua'},
  {w:'早上', p:'zǎoshang', m:'buổi sáng sớm'},
  {w:'上午', p:'shàngwǔ',  m:'buổi sáng (trước 12h)'},
  {w:'中午', p:'zhōngwǔ',  m:'buổi trưa'},
  {w:'下午', p:'xiàwǔ',    m:'buổi chiều'},
  {w:'晚上', p:'wǎnshang', m:'buổi tối'},
  {w:'鸡蛋', p:'jīdàn',    m:'trứng gà'},
  {w:'你好', p:'nǐ hǎo',   m:'xin chào'},
  {w:'睡觉', p:'shuìjiào', m:'ngủ'},
  {w:'起床', p:'qǐchuáng', m:'thức dậy'},
  {w:'哪儿', p:'nǎr',      m:'ở đâu'},
  {w:'喝水', p:'hēshuǐ',   m:'uống nước'},
  {w:'吃饭', p:'chīfàn',   m:'ăn cơm'},
  {w:'早饭', p:'zǎofàn',   m:'bữa sáng'},
  {w:'晚饭', p:'wǎnfàn',   m:'bữa tối'}
];

const LEVELS = { easy:[6,6], normal:[6,8], hard:[8,8] };

/* =========================================================
   1b. GIỌNG ĐỌC GHI ÂM (file voice.mp3) ★ MỚI
   File mp3 đọc 35 từ theo đúng thứ tự WORDS.
   VOICE_SEGMENTS[i] = [giây bắt đầu, giây kết thúc] của WORDS[i],
   cắt tự động theo khoảng lặng giữa các từ.
   ========================================================= */
const VOICE_SEGMENTS = [[0.183, 0.793], [1.027, 1.556], [1.768, 2.37], [2.621, 3.204], [3.404, 4.103], [4.268, 4.851], [5.113, 5.74], [6.052, 6.518], [6.789, 7.388], [7.681, 8.313], [8.601, 9.197], [9.456, 10.019], [10.396, 10.897], [11.142, 11.611], [11.882, 12.501], [12.78, 13.444], [13.84, 14.558], [14.765, 15.28], [15.505, 16.095], [16.328, 16.908], [17.182, 17.73], [17.988, 18.611], [18.84, 19.432], [19.684, 20.253], [20.485, 21.108], [21.433, 22.023], [22.251, 22.759], [22.996, 23.565], [23.811, 24.359], [24.629, 25.224], [25.355, 25.778], [26.005, 26.616], [26.848, 27.382], [27.623, 28.154], [28.396, 28.918]];
const VOICE_MAP = {};
WORDS.forEach((x, i) => { if(VOICE_SEGMENTS[i]) VOICE_MAP[x.w] = VOICE_SEGMENTS[i]; });
const VOICE_URL = "voice.mp3";   // file ghi âm 35 từ

/* =========================================================
   2. TRẠNG THÁI
   ========================================================= */
const S = {
  rows:0, cols:0, grid:[], selected:null, cell:60, remaining:0,
  score:0, seconds:0, timerId:null, lock:false, playing:false,
  soundOn:true, lastWord:null
};

const boardEl   = document.getElementById('board');
const boardWrap = document.getElementById('boardWrap');
const svgEl     = document.getElementById('pathLayer');
const infobar   = document.getElementById('infobar');
const vocabEl   = document.getElementById('vocab');
const overlay   = document.getElementById('overlay');
const ovText    = document.getElementById('ovText');
const scoreEl   = document.getElementById('score');
const timeEl    = document.getElementById('time');
const leftEl    = document.getElementById('left');
const levelSel  = document.getElementById('level');
const pikaEl    = document.getElementById('pika');
const pikaBubble= document.getElementById('pikaBubble');
const pikaWord  = document.getElementById('pikaWord');
const pikaSub   = document.getElementById('pikaSub');

/* =========================================================
   3. ÂM THANH
   ========================================================= */
let actx = null;
function getCtx(){
  if(!actx){
    try{ actx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ actx = null; }
  }
  if(actx && actx.state === 'suspended') actx.resume().catch(()=>{});
  return actx;
}
function beep(freq, dur, type='sine', vol=0.07){
  if(!S.soundOn) return;
  try{
    const ctx = getCtx(); if(!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  }catch(e){}
}
function sfxSelect(){ beep(720, 0.06, 'square', 0.04); }
function sfxWrong(){ beep(200, 0.13, 'sawtooth', 0.06); }
function sfxMatch(){ beep(880,0.08,'sine',0.06); setTimeout(()=>beep(1240,0.09,'sine',0.06),80); }
function sfxWin(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.18,'sine',0.08), i*130)); }

/* =========================================================
   4. TIỆN ÍCH
   ========================================================= */
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function pad2(n){ return String(n).padStart(2,'0'); }

/* =========================================================
   5. KÍCH THƯỚC Ô
   ========================================================= */
/* Ô hình chữ nhật nằm ngang để 2 chữ Hán luôn nằm trên 1 hàng */
const TILE_RATIO = 1.25;   // rộng / cao
function computeCell(){
  const maxW = Math.min(window.innerWidth - 24, 960);
  const maxH = window.innerHeight - 230;
  const hByW = maxW / ((S.cols + 2) * TILE_RATIO);
  const hByH = maxH / (S.rows + 2);
  const h = Math.floor(Math.max(26, Math.min(hByW, hByH, 68)));
  return { w: Math.floor(h * TILE_RATIO), h };
}
function applyLayout(){
  const { w, h } = computeCell();
  S.cw = w; S.ch = h; S.cell = h;
  const W = w * (S.cols + 2);
  const H = h * (S.rows + 2);
  boardEl.style.width  = W + 'px';
  boardEl.style.height = H + 'px';
  boardEl.style.gridTemplateColumns = `repeat(${S.cols + 2}, ${w}px)`;
  boardEl.style.gridTemplateRows    = `repeat(${S.rows + 2}, ${h}px)`;
  // cỡ chữ vừa khít 2 chữ trên một hàng
  const fs = Math.floor(Math.min((w - 14) / 2.1, h * 0.52));
  boardEl.style.setProperty('--fs', Math.max(10, fs) + 'px');
  boardWrap.style.width  = W + 'px';
  boardWrap.style.height = H + 'px';
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.setAttribute('width', W);
  svgEl.setAttribute('height', H);
}

/* =========================================================
   6. BÀN CHƠI
   ========================================================= */
function buildBoard(rows, cols){
  S.rows = rows; S.cols = cols;
  const pairCount = rows * cols / 2;
  const pool = shuffle([...WORDS]).slice(0, pairCount);
  let idx = 0;
  const chosen = [];
  while(chosen.length < pairCount){ chosen.push(pool[idx % pool.length]); idx++; }

  const tiles = [];
  chosen.forEach(t => {
    tiles.push({w:t.w, p:t.p, m:t.m});
    tiles.push({w:t.w, p:t.p, m:t.m});
  });
  shuffle(tiles);

  S.grid = [];
  for(let r=0;r<rows+2;r++) S.grid.push(new Array(cols+2).fill(null));
  let k = 0;
  for(let r=1;r<=rows;r++) for(let c=1;c<=cols;c++) S.grid[r][c] = tiles[k++];

  S.remaining = pairCount; S.selected = null; S.lock = false;
  render(); buildVocab(); updateHUD();
}

function render(){
  boardEl.innerHTML = '';
  for(let r=1;r<=S.rows;r++){
    for(let c=1;c<=S.cols;c++){
      const t = S.grid[r][c];
      if(!t) continue;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'tile';
      el.textContent = t.w;
      el.title = `${t.w} · ${t.p} · ${t.m}`;
      el.style.gridRow = String(r + 1);
      el.style.gridColumn = String(c + 1);
      el.addEventListener('click', () => onTileClick(r, c));
      t.el = el;
      boardEl.appendChild(el);
    }
  }
  applyLayout();
}

/* =========================================================
   7. THUẬT TOÁN NỐI
   ========================================================= */
function isEmpty(r, c){
  if(r < 0 || r >= S.rows + 2 || c < 0 || c >= S.cols + 2) return false;
  return S.grid[r][c] === null;
}
function lineClearH(r, c1, c2){
  const a = Math.min(c1, c2), b = Math.max(c1, c2);
  for(let c = a + 1; c < b; c++) if(S.grid[r][c]) return false;
  return true;
}
function lineClearV(c, r1, r2){
  const a = Math.min(r1, r2), b = Math.max(r1, r2);
  for(let r = a + 1; r < b; r++) if(S.grid[r][c]) return false;
  return true;
}
function canConnect(a, b){
  if(a.r === b.r && a.c === b.c) return null;
  if(a.r === b.r && lineClearH(a.r, a.c, b.c)) return [[a.r,a.c],[b.r,b.c]];
  if(a.c === b.c && lineClearV(a.c, a.r, b.r)) return [[a.r,a.c],[b.r,b.c]];
  if(isEmpty(a.r, b.c) && lineClearH(a.r, a.c, b.c) && lineClearV(b.c, a.r, b.r))
    return [[a.r,a.c],[a.r,b.c],[b.r,b.c]];
  if(isEmpty(b.r, a.c) && lineClearV(a.c, a.r, b.r) && lineClearH(b.r, a.c, b.c))
    return [[a.r,a.c],[b.r,a.c],[b.r,b.c]];
  for(let c = 0; c < S.cols + 2; c++){
    if(c === a.c || c === b.c) continue;
    if(!isEmpty(a.r, c) || !isEmpty(b.r, c)) continue;
    if(lineClearH(a.r, a.c, c) && lineClearV(c, a.r, b.r) && lineClearH(b.r, c, b.c))
      return [[a.r,a.c],[a.r,c],[b.r,c],[b.r,b.c]];
  }
  for(let r = 0; r < S.rows + 2; r++){
    if(r === a.r || r === b.r) continue;
    if(!isEmpty(r, a.c) || !isEmpty(r, b.c)) continue;
    if(lineClearV(a.c, a.r, r) && lineClearH(r, a.c, b.c) && lineClearV(b.c, r, b.r))
      return [[a.r,a.c],[r,a.c],[r,b.c],[b.r,b.c]];
  }
  return null;
}

/* =========================================================
   8. GIỌNG ĐỌC  ★ ĐỒNG BỘ VỚI FILE GHI ÂM
   Ưu tiên: đoạn ghi âm luvvoice → (nếu lỗi / từ không có trong file)
   giọng tổng hợp zh-CN của trình duyệt.
   ========================================================= */
let voiceBuf = null, voicePromise = null, voiceSrc = null;

function loadVoiceBuffer(){
  if(voiceBuf) return Promise.resolve(voiceBuf);
  if(voicePromise) return voicePromise;
  const ctx = getCtx();
  if(!ctx) return Promise.resolve(null);
  voicePromise = fetch(VOICE_URL)
    .then(res => { if(!res.ok) throw new Error('Không tải được ' + VOICE_URL); return res.arrayBuffer(); })
    .then(data => new Promise(resolve => {
      ctx.decodeAudioData(data, buf => { voiceBuf = buf; resolve(buf); }, () => resolve(null));
    }))
    .catch(() => null);
  return voicePromise;
}

function stopVoice(){
  if(voiceSrc){ try{ voiceSrc.stop(); }catch(e){} voiceSrc = null; }
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
}

let voices = [];
function loadVoices(){ if('speechSynthesis' in window) voices = window.speechSynthesis.getVoices(); }
if('speechSynthesis' in window){ loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }

function ttsSpeak(text){
  if(!('speechSynthesis' in window)) return;
  try{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.8; u.pitch = 1.05; u.volume = 1;
    const v = voices.find(x => /zh[-_]?CN/i.test(x.lang)) ||
              voices.find(x => /zh[-_]?Hans/i.test(x.lang)) ||
              voices.find(x => /^zh/i.test(x.lang));
    if(v) u.voice = v;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

let speakToken = 0;
function speak(text){
  if(!S.soundOn) return;
  const token = ++speakToken;
  stopVoice();
  talkAnim();
  const seg = VOICE_MAP[text];
  if(!seg){ ttsSpeak(text); return; }

  loadVoiceBuffer().then(buf => {
    if(token !== speakToken || !S.soundOn) return;   // đã có lệnh đọc mới hơn
    if(!buf){ ttsSpeak(text); return; }
    try{
      const ctx = getCtx();
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      g.gain.value = 1;
      src.buffer = buf;
      src.connect(g); g.connect(ctx.destination);
      const [s, e] = seg;
      src.start(0, s, Math.max(0.05, e - s));
      voiceSrc = src;
      src.onended = () => { if(voiceSrc === src) voiceSrc = null; };
    }catch(e){ ttsSpeak(text); }
  });
}

function talkAnim(){
  pikaEl.classList.remove('talking');
  void pikaEl.offsetWidth;
  pikaEl.classList.add('talking');
  setTimeout(() => pikaEl.classList.remove('talking'), 800);
}

/* Giải mã file ghi âm ngay lần chạm đầu tiên (trình duyệt cần cử chỉ người dùng) */
function primeAudio(){
  getCtx();
  loadVoiceBuffer();
  window.removeEventListener('pointerdown', primeAudio);
  window.removeEventListener('keydown', primeAudio);
}
window.addEventListener('pointerdown', primeAudio);
window.addEventListener('keydown', primeAudio);

/* =========================================================
   9. LINH VẬT PHẢN ỨNG
   ========================================================= */
let pikaSayTimer = null;
function pikaReact(kind){
  pikaEl.classList.remove('react-select','react-happy','react-sad','happy');
  void pikaEl.offsetWidth;
  if(kind === 'select') pikaEl.classList.add('react-select');
  if(kind === 'happy'){
    pikaEl.classList.add('react-happy','happy');
    setTimeout(() => pikaEl.classList.remove('happy'), 950);
  }
  if(kind === 'sad') pikaEl.classList.add('react-sad');
}
function pikaSay(main, sub){
  pikaWord.textContent = main || '?';
  pikaSub.textContent  = sub || '';
  pikaBubble.classList.add('show');
  clearTimeout(pikaSayTimer);
  pikaSayTimer = setTimeout(() => pikaBubble.classList.remove('show'), 2800);
}

/* =========================================================
   10. XỬ LÝ CLICK
   ========================================================= */
function deselectAll(){
  document.querySelectorAll('.tile.sel').forEach(e => e.classList.remove('sel'));
  S.selected = null;
}

function onTileClick(r, c){
  if(S.lock || !S.playing) return;
  const t = S.grid[r][c];
  if(!t || !t.el) return;

  if(S.selected && S.selected.r === r && S.selected.c === c){
    t.el.classList.remove('sel');
    S.selected = null;
    pikaSay('?', 'Chọn một từ nhé!');
    return;
  }

  if(!S.selected){
    S.selected = {r, c};
    t.el.classList.add('sel');
    showWordInfo(t);
    pikaReact('select');
    pikaSay(t.w, t.p + ' · ' + t.m);
    sfxSelect();
    speak(t.w);                         // ★ đọc từ khi chọn
    return;
  }

  const s  = S.selected;
  const ta = S.grid[s.r][s.c];
  if(!ta || !ta.el){ deselectAll(); return; }

  if(ta.w === t.w){
    const path = canConnect(s, {r, c});
    if(path){ doMatch(s, {r, c}, path); return; }
  }

  S.lock = true;
  t.el.classList.add('sel');
  ta.el.classList.add('wrong');
  t.el.classList.add('wrong');
  sfxWrong();
  showWordInfo(t);
  pikaReact('sad');
  pikaSay('Thử lại nhé!', t.w + ' · ' + t.p);
  setTimeout(() => speak(t.w), 150);   // ★ đọc từ vừa chạm (thẻ mới được chọn)

  setTimeout(() => {
    if(ta.el) ta.el.classList.remove('sel','wrong');
    if(t.el)  t.el.classList.remove('wrong');
    S.lock = false;
    S.selected = {r, c};
    if(t.el) t.el.classList.add('sel');
  }, 340);
}

function doMatch(a, b, path){
  S.lock = true;
  const ta = S.grid[a.r][a.c];
  const tb = S.grid[b.r][b.c];

  drawPath(path);
  sfxMatch();

  S.lastWord = ta.w;
  speak(ta.w);                          // ★ đọc bằng file ghi âm
  pikaReact('happy');
  pikaSay(ta.w, '✓ ' + ta.p + ' · ' + ta.m);

  if(ta.el) ta.el.classList.add('matched');
  if(tb.el) tb.el.classList.add('matched');

  S.score += 10;
  S.remaining--;

  setTimeout(() => {
    if(ta.el) ta.el.remove();
    if(tb.el) tb.el.remove();
    S.grid[a.r][a.c] = null;
    S.grid[b.r][b.c] = null;
    S.selected = null;
    S.lock = false;
    updateHUD();
    if(S.remaining === 0){
      winGame();
    } else if(!findPair()){
      infobar.innerHTML = '🔀 <b>Hết nước đi!</b> Tự động xáo trộn lại bàn...';
      setTimeout(() => shuffleBoard(true), 400);
    }
  }, 300);
}

function drawPath(points){
  const pts = points.map(([r, c]) => `${(c + 0.5) * S.cw},${(r + 0.5) * S.ch}`).join(' ');
  const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  pl.setAttribute('points', pts);
  svgEl.appendChild(pl);
  setTimeout(() => pl.remove(), 620);
}

/* =========================================================
   11. TÌM NƯỚC ĐI & XÁO TRỘN
   ========================================================= */
function remainingTiles(){
  const list = [];
  for(let r = 1; r <= S.rows; r++)
    for(let c = 1; c <= S.cols; c++)
      if(S.grid[r][c]) list.push({r, c, w:S.grid[r][c].w});
  return list;
}
function findPair(){
  const list = remainingTiles();
  for(let i = 0; i < list.length; i++){
    for(let j = i + 1; j < list.length; j++){
      if(list[i].w !== list[j].w) continue;
      const p = canConnect({r:list[i].r, c:list[i].c}, {r:list[j].r, c:list[j].c});
      if(p) return [list[i], list[j], p];
    }
  }
  return null;
}
function shuffleBoard(auto = false){
  if(!S.playing) return;
  let tries = 0;
  do{
    const positions = [], tiles = [];
    for(let r = 1; r <= S.rows; r++)
      for(let c = 1; c <= S.cols; c++)
        if(S.grid[r][c]){ positions.push({r, c}); tiles.push(S.grid[r][c]); }
    shuffle(tiles);
    positions.forEach(p => S.grid[p.r][p.c] = null);
    positions.forEach((p, i) => S.grid[p.r][p.c] = tiles[i]);
    tries++;
  } while(!findPair() && tries < 60);
  S.selected = null; S.lock = false;
  render();
  if(auto) infobar.innerHTML = '🔀 Đã xáo trộn lại bàn chơi!';
}

/* =========================================================
   12. GỢI Ý
   ========================================================= */
function hint(){
  if(!S.playing || S.lock) return;
  const p = findPair();
  if(!p){
    infobar.innerHTML = '😅 Không còn cặp nào nối được — hãy bấm <b>Xáo trộn</b>!';
    return;
  }
  const [a, b] = p;
  [a, b].forEach(x => {
    const el = S.grid[x.r][x.c] && S.grid[x.r][x.c].el;
    if(el){ el.classList.add('hint'); setTimeout(() => el.classList.remove('hint'), 1700); }
  });
  beep(1000, 0.07, 'triangle', 0.05);
  infobar.innerHTML = '💡 Đã khoanh 2 thẻ giống nhau — hãy tìm đường nối nhé!';
}

/* =========================================================
   13. HUD
   ========================================================= */
function updateHUD(){
  scoreEl.textContent = S.score;
  leftEl.textContent  = S.remaining;
  timeEl.textContent  = pad2(Math.floor(S.seconds / 60)) + ':' + pad2(S.seconds % 60);
}
function showWordInfo(t){
  infobar.innerHTML = `🔊 <b>${t.w}</b> &nbsp;·&nbsp; ${t.p} &nbsp;·&nbsp; ${t.m}`;
}

/* =========================================================
   14. ĐỒNG HỒ & KẾT THÚC
   ========================================================= */
function startTimer(){
  clearInterval(S.timerId);
  S.timerId = setInterval(() => { S.seconds++; updateHUD(); }, 1000);
}
function winGame(){
  S.playing = false;
  clearInterval(S.timerId);
  sfxWin();
  pikaReact('happy');
  pikaSay('太棒了!', 'Bạn giỏi quá!');
  setTimeout(() => speak('太棒了'), 500);   // không có trong file → giọng trình duyệt
  const mm = Math.floor(S.seconds / 60), ss = S.seconds % 60;
  ovText.innerHTML = `⏱ Thời gian: <b>${pad2(mm)}:${pad2(ss)}</b><br>⭐ Điểm: <b>${S.score}</b>`;
  overlay.classList.remove('hidden');
}

/* =========================================================
   15. TỪ VỰNG (chạm thẻ để nghe) ★
   ========================================================= */
function buildVocab(){
  const usedSet = new Set();
  for(let r = 1; r <= S.rows; r++)
    for(let c = 1; c <= S.cols; c++)
      if(S.grid[r][c]) usedSet.add(S.grid[r][c].w);
  const list = WORDS.filter(x => usedSet.has(x.w));
  vocabEl.innerHTML = list.map(x => `
    <div class="vcard" data-w="${x.w}" title="Chạm để nghe">
      <div class="hz">${x.w}</div>
      <div class="py">${x.p}</div>
      <div class="mn">${x.m}</div>
    </div>`).join('');
}
vocabEl.addEventListener('click', e => {
  const card = e.target.closest('.vcard');
  if(!card) return;
  vocabEl.querySelectorAll('.vcard.playing').forEach(x => x.classList.remove('playing'));
  card.classList.add('playing');
  setTimeout(() => card.classList.remove('playing'), 700);
  speak(card.dataset.w);
});

/* =========================================================
   16. KHỞI ĐỘNG
   ========================================================= */
function newGame(){
  clearInterval(S.timerId);
  S.seconds = 0; S.score = 0; S.selected = null; S.lock = false; S.playing = true;
  overlay.classList.add('hidden');
  const [rows, cols] = LEVELS[levelSel.value];
  buildBoard(rows, cols);
  infobar.innerHTML = '👆 Chạm vào một thẻ để nghe, xem phiên âm và nghĩa của từ';
  startTimer();
  setTimeout(() => pikaSay('Xin chào!', 'Chọn 2 từ giống nhau nhé!'), 500);
}

document.getElementById('btnNew').addEventListener('click', newGame);
document.getElementById('btnHint').addEventListener('click', hint);
document.getElementById('btnShuffle').addEventListener('click', () => shuffleBoard(false));
document.getElementById('ovBtn').addEventListener('click', newGame);
levelSel.addEventListener('change', newGame);
document.getElementById('btnVocab').addEventListener('click', () => vocabEl.classList.toggle('show'));
document.getElementById('btnSound').addEventListener('click', (e) => {
  S.soundOn = !S.soundOn;
  e.currentTarget.textContent = S.soundOn ? '🔊' : '🔇';
  if(!S.soundOn) stopVoice();
});

pikaEl.addEventListener('click', () => {
  if(S.lastWord){
    speak(S.lastWord);
    pikaReact('select');
    pikaSay(S.lastWord, '🔊 Nghe lại nè!');
  }
});

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applyLayout, 120);
});

newGame();
