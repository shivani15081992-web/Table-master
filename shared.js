/* ==========================================================================
   SmartFix TM — Shared Core Engine (shared.js)
   Company: SmartFix
   Developer: Debapriya Sarkar (Contact: 9046356631)
   Ultra-Fast Cache-First, Atomic Sync, Audio Alert & FCM Push Engine
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDfDz5MnOvokr_MQH_sG5FxkHUGVphuOLU",
  authDomain: "the-table-master.firebaseapp.com",
  projectId: "the-table-master",
  storageBucket: "the-table-master.firebasestorage.app",
  messagingSenderId: "135597759379",
  appId: "1:135597759379:web:b5233aaa5dceec27dfa666",
  measurementId: "G-VWY05MGFR5"
};

const FCM_VAPID_KEY = "BJUBuGC_hKOAH34uj884dMmVegN80vn-mFCCcyYHvaN1KtjIk1Oiv4xUKW9s7dpBaapbPdlWdG9GZRsuJvs0qho";

let auth = null;
let db = null;
let currentCafeListener = null;

/* ==========================================================================
   SMARTFIX TM — BRAND CONSTANTS
   ========================================================================== */
window.SUPER_ADMIN_EMAIL = "debapriyasarakara@gmail.com";

window.SMARTFIX_BRAND = {
  name: "SmartFix TM",
  company: "SmartFix",
  tagline: "Enterprise Restaurant Management Suite",
  developer: "Debapriya Sarkar",
  developerPhone: "9046356631",
  primaryGold: "#F5B800",
  lightGold: "#FFE082",
  darkGold: "#C89B00",
  charcoal: "#0D0D0D",
  charcoalSoft: "#1A1A1A"
};

const DEFAULT_GOLD_SVG_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='100' fill='%231a1a1a'/><path d='M160 120v110c0 22 18 40 40 40h20a40 40 0 0 0 40-40V120M210 120v272M352 260V120a70 70 0 0 0-70 70v70c0 22 18 40 40 40h30v132' fill='none' stroke='%23e8d5a1' stroke-width='26' stroke-linecap='round' stroke-linejoin='round'/></svg>";

const SMARTFIX_CROWN_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23FFE082'/><stop offset='0.5' stop-color='%23F5B800'/><stop offset='1' stop-color='%23C89B00'/></linearGradient></defs><rect width='512' height='512' rx='110' fill='%230D0D0D'/><rect x='20' y='20' width='472' height='472' rx='95' fill='none' stroke='url(%23g)' stroke-width='5'/><circle cx='256' cy='220' r='105' fill='none' stroke='url(%23g)' stroke-width='7'/><path d='M 172 195 L 200 240 L 256 200 L 312 240 L 340 195 L 348 260 L 164 260 Z' fill='url(%23g)'/><g stroke='url(%23g)' stroke-width='11' stroke-linecap='round' fill='none'><line x1='215' y1='270' x2='215' y2='360'/><line x1='200' y1='270' x2='200' y2='295'/><line x1='230' y1='270' x2='230' y2='295'/><path d='M 200 295 Q 200 308 215 308 Q 230 308 230 295'/><line x1='295' y1='270' x2='295' y2='360'/><path d='M 295 270 Q 320 290 295 320'/></g><text x='256' y='420' fill='url(%23g)' font-family='Georgia,serif' font-size='52' font-weight='900' text-anchor='middle'>SmartFix</text><text x='256' y='452' fill='%23F5B800' font-family='Arial,sans-serif' font-size='14' font-weight='800' text-anchor='middle' letter-spacing='8'>TM</text></svg>";

/* ==========================================================================
   FIREBASE INIT
   ========================================================================== */
function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      auth = firebase.auth();
      db = firebase.firestore();
      return true;
    }
    return false;
  } catch (e) {
    console.error("Firebase Init Error:", e);
    return false;
  }
}

/* ==========================================================================
   DATE & DATA HELPERS
   ========================================================================== */
window.todayStr = function() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
};

window.RESTAURANT_DATA = {
  cafeId: 'default_cafe', name: 'SmartFix Bistro', phone: '', address: '',
  masterPin: '1234', gstRate: 0, serviceRate: 0, logo: '', googleReview: '',
  plan: 'trial', subscriptionStatus: 'active',
  trialStartDate: null, trialEndsAt: null,
  premiumUntil: null, premiumPlan: null, premiumStartedAt: null,
  tables: [
    { id: 't1', name: 'T-01', seats: 2, status: 'available', booking: null },
    { id: 't2', name: 'T-02', seats: 4, status: 'available', booking: null },
    { id: 't3', name: 'T-03', seats: 4, status: 'available', booking: null },
    { id: 't4', name: 'T-04', seats: 6, status: 'available', booking: null }
  ],
  menu: [
    { id: 'm1', name: 'Special Chicken Biryani', category: 'Main Course', price: 190 },
    { id: 'm2', name: 'Cold Coffee with Ice Cream', category: 'Beverages', price: 90 },
    { id: 'm3', name: 'Crispy French Fries', category: 'Snacks', price: 80 }
  ],
  platforms: [
    { id: 'plt_swiggy', name: 'Swiggy', commissionRate: 20 },
    { id: 'plt_zomato', name: 'Zomato', commissionRate: 22 }
  ],
  platformPayouts: [], orders: [], expenses: [], staff: [], deviceTokens: []
};

window.CURRENT_USER_ROLE = sessionStorage.getItem('tmpro_role_mode') || 'owner';
window.getData = function() { return window.RESTAURANT_DATA || {}; };

/* ==========================================================================
   SUBSCRIPTION / PLAN STATUS HELPERS
   ========================================================================== */
window.getCafePlanStatus = function(cafe) {
  if (!cafe) return 'trial';
  if (cafe.subscriptionStatus === 'suspended') return 'suspended';
  if (cafe.plan === 'premium' && cafe.premiumUntil && new Date(cafe.premiumUntil) > new Date()) return 'premium';
  if (cafe.plan === 'trial' && cafe.trialEndsAt && new Date(cafe.trialEndsAt) > new Date()) return 'trial';
  if (cafe.plan === 'premium' && cafe.premiumUntil) return 'expired';
  if (cafe.plan === 'trial' && cafe.trialEndsAt) return 'expired';
  return 'trial';
};

window.getDaysRemaining = function(cafe) {
  if (!cafe) return null;
  const status = window.getCafePlanStatus(cafe);
  const expiry = (status === 'premium') ? cafe.premiumUntil : cafe.trialEndsAt;
  if (!expiry) return null;
  const ms = new Date(expiry).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

window.isCafeActive = function(cafe) {
  const s = window.getCafePlanStatus(cafe);
  return s === 'trial' || s === 'premium';
};

/* ==========================================================================
   REALTIME SYNTHESIZER SOUND ENGINE (Web Audio API)
   ========================================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

document.addEventListener('click', () => { getAudioContext(); }, { once: true });
document.addEventListener('touchstart', () => { getAudioContext(); }, { once: true });

window.playAlertTone = function(type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'approval') {
      const now = ctx.currentTime;
      [0, 0.14, 0.28].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const freq = (idx % 2 === 0) ? 1046.50 : 1318.51;
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.45, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.16);
      });
    } else if (type === 'kot') {
      const now = ctx.currentTime;
      [0, 0.22].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now + offset);
        osc.frequency.exponentialRampToValueAtTime(440, now + offset + 0.18);
        gain.gain.setValueAtTime(0.35, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } else if (type === 'ready') {
      const now = ctx.currentTime;
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const offset = idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.4, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.25);
      });
    } else if (type === 'cash') {
      const now = ctx.currentTime;
      [987.77, 1318.51].forEach((freq, idx) => {
        const offset = idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.35, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.22);
      });
    }
  } catch (err) {
    console.warn("Audio Alert Warning:", err);
  }
};

/* ==========================================================================
   FCM PUSH NOTIFICATION REGISTRATION (VAPID Key)
   ========================================================================== */
window.enableFCMNotifications = async function(roleName) {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    if (typeof firebase.messaging === 'function') {
      const messaging = firebase.messaging();
      const currentToken = await messaging.getToken({
        vapidKey: FCM_VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (currentToken && db) {
        const activeCafeId = sessionStorage.getItem('tmpro_cafe_id');
        if (activeCafeId) {
          const docRef = db.collection("cafes").doc(activeCafeId);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            const cData = docSnap.data();
            const tokens = cData.deviceTokens || [];
            const exists = tokens.find(t => t.token === currentToken);
            if (!exists) {
              tokens.push({
                token: currentToken,
                role: roleName || 'staff',
                updatedAt: new Date().toISOString()
              });
              await docRef.update({ deviceTokens: tokens });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("FCM Setup:", err);
  }
};

/* ==========================================================================
   CACHE-FIRST CLOUD LISTENER
   ========================================================================== */
function bindCafeCloudListener(cafeId, onUpdateCallback) {
  if (!db || !cafeId) return;

  const cached = localStorage.getItem('tmpro_cafe_cache_' + cafeId);
  if (cached) {
    try {
      window.RESTAURANT_DATA = Object.assign({}, window.RESTAURANT_DATA, JSON.parse(cached));
      window.RESTAURANT_DATA.cafeId = cafeId;
      if (typeof onUpdateCallback === 'function') onUpdateCallback();
    } catch(e) {}
  }

  const badge = document.getElementById('sync-status');
  if (badge) {
    badge.className = 'sync-badge online';
    badge.innerHTML = '⚡ Instant';
  }

  if (currentCafeListener) { try { currentCafeListener(); } catch(e){} }

  currentCafeListener = db.collection("cafes").doc(cafeId).onSnapshot((docSnap) => {
    if (docSnap.exists) {
      const serverData = docSnap.data();
      window.RESTAURANT_DATA = Object.assign({}, window.RESTAURANT_DATA, serverData);
      window.RESTAURANT_DATA.cafeId = cafeId;

      if (!window.RESTAURANT_DATA.tables || !window.RESTAURANT_DATA.tables.length) {
        window.RESTAURANT_DATA.tables = [
          { id: 't1', name: 'T-01', seats: 2, status: 'available', booking: null },
          { id: 't2', name: 'T-02', seats: 4, status: 'available', booking: null }
        ];
      }

      try {
        localStorage.setItem('tmpro_cafe_cache_' + cafeId, JSON.stringify(window.RESTAURANT_DATA));
      } catch(e) {}
    }

    if (badge) {
      badge.className = 'sync-badge online';
      badge.innerHTML = '☁️ Live';
    }
    if (typeof onUpdateCallback === 'function') onUpdateCallback();
  }, (err) => {
    console.warn("Firestore sync warning:", err);
    if (badge) {
      badge.className = 'sync-badge online';
      badge.innerHTML = '⚡ Local Mode';
    }
    if (typeof onUpdateCallback === 'function') onUpdateCallback();
  });
}

window.cloudSave = function() {
  const data = window.getData();
  if (!data || !data.cafeId || !db) return;

  try {
    localStorage.setItem('tmpro_cafe_cache_' + data.cafeId, JSON.stringify(data));
  } catch(e){}

  const badge = document.getElementById('sync-status');
  if (badge) { badge.className = 'sync-badge syncing'; badge.innerHTML = '🔄 Syncing...'; }

  db.collection("cafes").doc(data.cafeId).set(data, { merge: true }).then(() => {
    if (badge) { badge.className = 'sync-badge online'; badge.innerHTML = '☁️ Live'; }
  }).catch(err => {
    console.error("Cloud save failed:", err);
    if (badge) { badge.className = 'sync-badge syncing'; badge.innerHTML = '⚠️ Offline Saved'; }
  });
};

/* ==========================================================================
   SYSTEM SETTINGS (Pricing) LOADER — for index.html landing page
   ========================================================================== */
window.loadPricingSettings = async function() {
  const defaults = { trialDays: 30, sixMonthPrice: 2999, oneYearPrice: 4999 };
  try {
    if (!db) return defaults;
    const snap = await db.collection("systemSettings").doc("pricing").get();
    if (snap.exists) {
      const s = snap.data();
      return {
        trialDays: s.trialDays || defaults.trialDays,
        sixMonthPrice: s.sixMonthPrice || defaults.sixMonthPrice,
        oneYearPrice: s.oneYearPrice || defaults.oneYearPrice
      };
    }
  } catch (err) {
    console.warn("Pricing settings load failed:", err);
  }
  return defaults;
};

/* ==========================================================================
   DYNAMIC i18n
   ========================================================================== */
const I18N = {
  en: {
    todaySales: "Today's Total Sales", totalOrders: "Today's Orders", activeKOT: "Active Kitchen KOT",
    newOrder: "New Order (POS)", newOrderSub: "Take customer order", kitchenLive: "Kitchen Live",
    reportsAndProfit: "Profit & Reports", floorMap: "Floor Table Map", addTable: "+ Add Table",
    seater: "Seater", confirmOrderKOT: "Confirm Order (Send KOT) →",
    editBillNotice: "Delete or adjust unwanted items. The bill total will auto recalculate.",
    editItemsTitle: "Edit Bill Items", newTotal: "New Total",
    bookTable: "Table Reservation", reserve: "Confirm Booking", releaseBooking: "Release Booking",
    editTable: "Edit Table Details"
  },
  bn: {
    todaySales: "আজকের মোট বিক্রি", totalOrders: "আজকের মোট অর্ডার", activeKOT: "চলতি কিচেন KOT",
    newOrder: "নতুন অর্ডার (POS)", newOrderSub: "কাস্টমার অর্ডার এন্ট্রি", kitchenLive: "কিচেন লাইভ",
    reportsAndProfit: "লাভ-ক্ষতি ও রিপোর্ট", floorMap: "ইন্টারেক্টিভ টেবিল ম্যাপ", addTable: "+ টেবিল যোগ",
    seater: "সিটার", confirmOrderKOT: "অর্ডার নিশ্চিত করুন (KOT) →",
    editBillNotice: "কাস্টমার কোন আইটেম না চাইলে সরাসরি মুছুন। বিলের মোট টাকা অটো আপডেট হবে।",
    editItemsTitle: "আইটেম এডিট", newTotal: "নতুন মোট",
    bookTable: "টেবিল বুকিং", reserve: "রিজার্ভ করুন", releaseBooking: "বুকিং বাতিল / ফ্রি করুন",
    editTable: "টেবিল এডিট"
  }
};

let currentLang = localStorage.getItem('tmpro_lang') || 'en';
function t(k) { return (I18N[currentLang] && I18N[currentLang][k]) ? I18N[currentLang][k] : k; }

function toggleLanguage(callback) {
  currentLang = currentLang === 'en' ? 'bn' : 'en';
  localStorage.setItem('tmpro_lang', currentLang);
  if (typeof callback === 'function') callback();
}

function updateHeaderBrand(data) {
  const nameEl = document.getElementById('txt-cafe-name');
  if (nameEl) nameEl.innerText = data.name || 'SmartFix TM';
  const roleEl = document.getElementById('active-user-role');
  if (roleEl) roleEl.innerText = (window.CURRENT_USER_ROLE || 'owner').toUpperCase();

  const logoContainer = document.getElementById('header-logo-container');
  if (logoContainer) {
    if (data.logo && data.logo.trim() !== '') {
      logoContainer.innerHTML = `<img src="${data.logo}" style="width:100%;height:100%;object-fit:cover;" alt="Logo">`;
    } else {
      logoContainer.innerHTML = `<img src="${DEFAULT_GOLD_SVG_LOGO}" style="width:100%;height:100%;object-fit:cover;" alt="Default Logo">`;
    }
  }
}

/* ==========================================================================
   QR ENGINE & TABLE UTILITIES
   ========================================================================== */
function createSafeQR(text) {
  if (!text) return '';
  try {
    if (typeof qrcode !== 'undefined') {
      const qr = qrcode(0, 'M');
      qr.addData(String(text));
      qr.make();
      return qr.createDataURL(5);
    }
  } catch (err) {
    console.warn("Local QR fallback:", err);
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
}

function generateTableQRUrl(tableId) {
  const data = window.getData();
  const currentOrigin = window.location.origin;
  const pathParts = window.location.pathname.split('/');
  pathParts.pop();
  const basePath = pathParts.join('/');
  return `${currentOrigin}${basePath}/customer.html?cafe=${encodeURIComponent(data.cafeId)}&table=${encodeURIComponent(tableId)}`;
}

function buildQRCardHtml(tableId) {
  const data = window.getData();
  const tbl = (data.tables || []).find(t => t.id === tableId);
  if (!tbl) return '';
  const url = generateTableQRUrl(tableId);
  const qrImg = createSafeQR(url);

  return `
    <div class="table-qr-card" id="qr-print-${tableId}" style="width:100%;max-width:320px;background:#fff;border:2px dashed #94a3b8;border-radius:12px;padding:16px;margin:0 auto;text-align:center;">
      <div style="font-size:15px;font-weight:800;color:#0f172a;margin-bottom:2px;">${data.name || 'Restaurant'}</div>
      <div style="font-size:24px;font-weight:800;color:#2563eb;margin-bottom:10px;">${tbl.name}</div>
      <img src="${qrImg}" style="width:180px;height:180px;display:block;margin:0 auto 10px;" alt="Table QR">
      <div style="background:#f8fafc;border-radius:8px;padding:8px 10px;text-align:left;line-height:1.4;font-size:11px;border:1px solid #e2e8f0;">
        <div style="font-weight:800;color:#0f172a;margin-bottom:3px;">📱 Scan to Order</div>
        <div>1. Open camera & scan QR code</div>
        <div>2. Enter Name & Mobile to view digital menu</div>
        <div>3. Place order directly from your phone</div>
      </div>
      <div style="font-size:9px;color:#94a3b8;margin-top:6px;font-weight:700;">Powered by SmartFix TM</div>
    </div>
  `;
}

window.showTableQR = function(tableId) {
  const tbl = (window.getData().tables || []).find(t => t.id === tableId);
  if (!tbl) return;
  const html = `
    <div style="padding:6px 0;">${buildQRCardHtml(tableId)}</div>
    <div style="display:flex;gap:6px;margin-top:12px;">
      <button class="btn-primary" onclick="printTableQR('${tableId}')">🖨️ প্রিন্ট করুন</button>
      <button class="btn-sm-outline" style="flex:0.6" onclick="copyQRUrl('${tableId}')">🔗 কপি লিংক</button>
    </div>
  `;
  openSheet('QR — ' + tbl.name, html);
};

window.printTableQR = function(tableId) {
  const card = document.getElementById('qr-print-' + tableId);
  if (!card) return;
  const printArea = document.getElementById('print-area') || document.body;
  const prevContent = printArea.innerHTML;
  printArea.innerHTML = card.outerHTML;
  setTimeout(() => {
    window.print();
    printArea.innerHTML = prevContent;
  }, 100);
};

window.copyQRUrl = function(tableId) {
  const url = generateTableQRUrl(tableId);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => alert('✅ লিংক কপি হয়েছে!:\n' + url)).catch(() => prompt('লিংক কপি করুন:', url));
  } else {
    prompt('লিংক কপি করুন:', url);
  }
};

window.showAllTableQRs = function() {
  const data = window.getData();
  const cardsHtml = (data.tables || []).map(t => `
    <div style="margin-bottom:16px;">
      ${buildQRCardHtml(t.id)}
      <button class="btn-sm-outline" style="width:100%;margin-top:6px;" onclick="printTableQR('${t.id}')">🖨️ ${t.name} প্রিন্ট</button>
    </div>
  `).join('');
  openSheet('সব টেবিলের QR', `<div style="max-height:70dvh;overflow-y:auto;">${cardsHtml || '<div style="text-align:center;padding:20px;">কোনো টেবিল নেই</div>'}</div>`);
};

/* ==========================================================================
   MODAL UTILITIES
   ========================================================================== */
function openSheet(title, html) {
  const tEl = document.getElementById('sheet-title');
  const bEl = document.getElementById('sheet-body');
  const bdEl = document.getElementById('sheet-backdrop');
  if (tEl) tEl.innerText = title;
  if (bEl) bEl.innerHTML = html;
  if (bdEl) bdEl.classList.add('active');
}

function closeSheet() {
  const bdEl = document.getElementById('sheet-backdrop');
  if (bdEl) bdEl.classList.remove('active');
}

function sheetBackdropClick(e) {
  if (e.target.id === 'sheet-backdrop') closeSheet();
}
