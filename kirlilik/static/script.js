const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const openSurveyBtn = document.getElementById('open-survey');
const surveyModal = document.getElementById('survey-modal');
const closeSurveyBtn = document.getElementById('close-survey');
const surveyForm = document.getElementById('survey-form');
const newGoalInput = document.getElementById('new-goal');
const addGoalBtn = document.getElementById('add-goal');
const goalListEl = document.getElementById('goal-list');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const streakEl = document.getElementById('streak');
const badgesEl = document.getElementById('badges');
const findRecyclingBtn = document.getElementById('find-recycling');
const wastePhoto = document.getElementById('waste-photo');
const classifyResult = document.getElementById('classify-result');
const tipCards = document.getElementById('tip-cards');

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createMessageEl(role, html) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'bot' ? '♻️' : '🙋‍♂️';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = html;

  if (role === 'bot') {
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
  } else {
    wrap.appendChild(bubble);
    wrap.appendChild(avatar);
  }

  return wrap;
}

function typingEl() {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  bubble.appendChild(typing);
  const wrap = document.createElement('div');
  wrap.className = 'msg bot';
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '♻️';
  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  return wrap;
}

async function sendToBot(body) {
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

function renderQuickReplies(list) {
  const row = document.querySelector('.quick-row');
  if (!row) return;
  row.innerHTML = '';
  (list || []).forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.dataset.payload = q.payload;
    btn.textContent = q.title;
    row.appendChild(btn);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

async function handlePayload(payload) {
  const loader = typingEl();
  chatWindow.appendChild(loader);
  scrollToBottom();
  try {
    const data = await sendToBot({ payload });
    loader.remove();
    const botMsg = createMessageEl('bot', (data.text || '').replace(/\n/g, '<br>'));
    chatWindow.appendChild(botMsg);
    renderQuickReplies(data.quick_replies);
    scrollToBottom();
  } catch (e) {
    loader.remove();
    chatWindow.appendChild(createMessageEl('bot', 'Bir şeyler ters gitti. Lütfen tekrar dener misin?'));
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  chatWindow.appendChild(createMessageEl('user', escapeHtml(text)));
  userInput.value = '';
  scrollToBottom();

  const loader = typingEl();
  chatWindow.appendChild(loader);
  scrollToBottom();
  try {
    const smart = text.startsWith('/smart ');
    const endpoint = smart ? '/smart_chat' : '/chat';
    const body = smart ? { message: text.replace('/smart ', '') } : { message: text };
    const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    const data = await res.json();
    loader.remove();
    const botMsg = createMessageEl('bot', (data.text || '').replace(/\n/g, '<br>'));
    chatWindow.appendChild(botMsg);
    renderQuickReplies(data.quick_replies);
    scrollToBottom();
  } catch (e) {
    loader.remove();
    chatWindow.appendChild(createMessageEl('bot', 'Bağlantı hatası. Birazdan tekrar dene.'));
  }
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  const payload = btn.dataset.payload;
  handlePayload(payload);
});

// Prefill: encourage user to press a chip on mobile first
setTimeout(() => scrollToBottom(), 50);

// PWA register SW
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/sw.js').catch(() => {});
}

// Survey
function getProfile() {
  try { return JSON.parse(localStorage.getItem('kira_profile') || '{}'); } catch { return {}; }
}
function saveProfile(p) { localStorage.setItem('kira_profile', JSON.stringify(p)); }

openSurveyBtn?.addEventListener('click', () => {
  surveyModal.classList.remove('hidden');
});
closeSurveyBtn?.addEventListener('click', () => {
  surveyModal.classList.add('hidden');
});
surveyForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(surveyForm).entries());
  saveProfile(data);
  surveyModal.classList.add('hidden');
  // Inject tailored suggestion
  const hint = `Profiline göre öneri: ${data.goal === 'Kompost başlat' ? 'Kompost rehberini' : 'Geri dönüşüm 101'} bölümüne göz at.`;
  chatWindow.appendChild(createMessageEl('bot', hint));
  scrollToBottom();
});

// Goals tracking
function getGoals() {
  try { return JSON.parse(localStorage.getItem('kira_goals') || '[]'); } catch { return []; }
}
function saveGoals(goals) { localStorage.setItem('kira_goals', JSON.stringify(goals)); }
function getMeta() { try { return JSON.parse(localStorage.getItem('kira_meta') || '{}'); } catch { return {}; } }
function saveMeta(meta) { localStorage.setItem('kira_meta', JSON.stringify(meta)); }

function renderGoals() {
  const goals = getGoals();
  goalListEl.innerHTML = '';
  goals.forEach((g, idx) => {
    const li = document.createElement('li');
    const left = document.createElement('div'); left.className = 'left';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!g.done;
    const span = document.createElement('span'); span.textContent = g.text;
    left.appendChild(cb); left.appendChild(span);
    const del = document.createElement('button'); del.className = 'pill'; del.textContent = 'Sil';
    li.appendChild(left); li.appendChild(del);
    goalListEl.appendChild(li);
    cb.addEventListener('change', () => { goals[idx].done = cb.checked; saveGoals(goals); updateProgress(); });
    del.addEventListener('click', () => { goals.splice(idx,1); saveGoals(goals); renderGoals(); updateProgress(); });
  });
}

function updateProgress() {
  const goals = getGoals();
  const total = goals.length || 1;
  const done = goals.filter(g => g.done).length;
  const pct = Math.round((done / total) * 100);
  progressFill.style.width = pct + '%';
  progressText.textContent = pct + '% tamamlandı';
  // streak
  const meta = getMeta();
  const today = new Date().toDateString();
  if (done > 0) {
    if (meta.lastDoneDay !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      meta.streak = (meta.lastDoneDay === yesterday ? (meta.streak || 0) + 1 : 1);
      meta.lastDoneDay = today;
      saveMeta(meta);
    }
  }
  streakEl.textContent = meta.streak || 0;
  renderBadges(done, meta.streak || 0);
}

function renderBadges(done, streak) {
  const have = [];
  if (done >= 3) have.push('Yeşil Başlangıç');
  if (done >= 7) have.push('Atık Avcısı');
  if (streak >= 3) have.push('Seri 3+');
  if (streak >= 7) have.push('Seri 7+');
  badgesEl.innerHTML = '';
  have.forEach(b => { const el = document.createElement('span'); el.className='badge'; el.textContent=b; badgesEl.appendChild(el); });
}

addGoalBtn?.addEventListener('click', () => {
  const text = (newGoalInput.value || '').trim();
  if (!text) return;
  const goals = getGoals(); goals.push({ text, done: false }); saveGoals(goals);
  newGoalInput.value=''; renderGoals(); updateProgress();
});

renderGoals(); updateProgress();

// Plan templates
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.plan');
  if (!btn) return;
  const plan = btn.dataset.plan;
  const textMap = {
    exam: 'Sınav haftası planı: 1) Matara hazır 2) Dışarı kahvede termos 3) Atıştırmalıkta az ambalaj 4) Geri dönüşüm kutusu görünür',
    dorm: 'Yurtta yaşam planı: 1) Bez çanta+file 2) Matarayı doldur 3) Ortak alana geri dönüşüm kutusu 4) Paket servis azalt',
    family: 'Aile evi planı: 1) Mutfakta ayrıştırma 2) Kompost kutusunu planla 3) Haftalık pazar listesi 4) Tek kullanımlıkları değiştir'
  };
  chatWindow.appendChild(createMessageEl('bot', textMap[plan]));
  scrollToBottom();
});

// Map: Overpass query for recycling around user
async function findNearbyRecycling(lat, lon) {
  const radius = 1500; // meters
  const query = `data=[out:json];(node["amenity"="recycling"](around:${radius},${lat},${lon}););out center;`;
  const url = 'https://overpass-api.de/api/interpreter?' + query;
  const r = await fetch(url);
  const j = await r.json();
  return (j.elements || []).map(e => ({ lat: e.lat, lon: e.lon, name: e.tags && (e.tags.name || 'Geri dönüşüm noktası') }));
}

let map, markers = [];
function ensureMap() {
  if (!map) {
    map = L.map('leaflet-map').setView([41.015137, 28.97953], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  }
}

findRecyclingBtn?.addEventListener('click', async () => {
  ensureMap();
  if (!navigator.geolocation) { alert('Konum desteği yok'); return; }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    map.setView([latitude, longitude], 15);
    markers.forEach(m => m.remove()); markers = [];
    L.marker([latitude, longitude]).addTo(map).bindPopup('Konumun');
    try {
      const list = await findNearbyRecycling(latitude, longitude);
      list.forEach(p => { markers.push(L.marker([p.lat, p.lon]).addTo(map).bindPopup(p.name)); });
    } catch (e) { alert('Noktalar alınamadı, sonra tekrar dene.'); }
  }, () => alert('Konum izni gerekiyor'));
});

// Image classify placeholder
wastePhoto?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  classifyResult.textContent = 'Analiz ediliyor...';
  // Placeholder simple heuristic by filename
  const name = file.name.toLowerCase();
  let bin = 'Genel';
  if (/glass|cam/.test(name)) bin = 'Cam';
  else if (/paper|kagit|karton/.test(name)) bin = 'Kağıt';
  else if (/metal|aluminum|teneke/.test(name)) bin = 'Metal';
  else if (/plastic|plastik|pet/.test(name)) bin = 'Plastik';
  else if (/food|organik|banana|apple|sebze/.test(name)) bin = 'Organik';
  classifyResult.textContent = `Tahmin: ${bin} kutusu (beta)`;
});

// Tips cards with share
const tips = [
  { title: 'Matara ile su al', img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1200&auto=format&fit=crop', text: 'Tek kullanımlık şişeyi azalt.' },
  { title: 'Bez çanta taşı', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop', text: 'Poşetsiz alışveriş yap.' },
  { title: 'Kahveni termosla al', img: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1200&auto=format&fit=crop', text: 'Hem sıcak kalır hem atık yok.' }
];

function renderTipCards() {
  tipCards.innerHTML = '';
  tips.forEach(t => {
    const c = document.createElement('div'); c.className='card-item';
    const img = document.createElement('img'); img.src = t.img; img.alt = t.title;
    const h = document.createElement('strong'); h.textContent = t.title;
    const p = document.createElement('div'); p.className='muted'; p.textContent = t.text;
    const actions = document.createElement('div'); actions.className='actions';
    const share = document.createElement('button'); share.className='pill'; share.textContent='Paylaş';
    share.addEventListener('click', async () => {
      const data = { title: t.title, text: `${t.title} – ${t.text}`, url: location.href };
      if (navigator.share) { await navigator.share(data).catch(()=>{}); }
      else { navigator.clipboard.writeText(`${t.title} – ${t.text} ${location.href}`); alert('Panoya kopyalandı'); }
    });
    actions.appendChild(share);
    c.appendChild(img); c.appendChild(h); c.appendChild(p); c.appendChild(actions);
    tipCards.appendChild(c);
  });
}
renderTipCards();

// Local notifications (while page open)
async function requestNotif() {
  if (!('Notification' in window)) return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

// Example reminder for matara after 10s
requestNotif().then(granted => {
  if (granted) {
    setTimeout(() => new Notification('Kira', { body: 'Matara yanında mı? 💧' }), 10000);
  }
});


