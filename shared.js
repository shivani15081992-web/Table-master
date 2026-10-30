/* ==========================================================================
   TableMaster Pro — Shared Core Engine (shared.js)
   Developer: Debapriya Sarkar (Contact: 9046356631)
   Ultra-Fast Cache-First & Instant Sync Architecture
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

let auth = null;
let db = null;
let currentCafeListener = null;

// ইনবিল্ট গোল্ডেন ভেক্টর কাটলারি লোগো (যখন রেস্তোরাঁ নিজস্ব লোগো দেয় না)
const DEFAULT_GOLD_SVG_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='100' fill='%231a1a1a'/><path d='M160 120v110c0 22 18 40 40 40h20a40 40 0 0 0 40-40V120M210 120v272M352 260V120a70 70 0 0 0-70 70v70c0 22 18 40 40 40h30v132' fill='none' stroke='%23e8d5a1' stroke-width='26' stroke-linecap='round' stroke-linejoin='round'/></svg>";

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
    console.error("Firebase Initialization Error:", e);
    return false;
  }
}

window.todayStr = function() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
};

// গ্লোবাল স্টেট
window.RESTAURANT_DATA = {
  cafeId: 'default_cafe', name: 'TableMaster Bistro', phone: '', address: '',
  masterPin: '1234', gstRate: 0, serviceRate: 0, logo: '',
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
  platformPayouts: [], orders: [], expenses: [], staff: []
};

window.CURRENT_USER_ROLE = sessionStorage.getItem('tmpro_role_mode') || 'owner';
window.getData = function() { return window.RESTAURANT_DATA || {}; };

/* ==========================================================================
   CACHE-FIRST INSTANT CLOUD ENGINE
   (কোনো পেজ লোডিং ল্যাগ থাকবে না, মিলি-সেকেন্ডে স্ক্রিন ওপেন হবে)
   ========================================================================== */
function bindCafeCloudListener(cafeId, onUpdateCallback) {
  if (!db || !cafeId) return;

  // ১. মেমোরি / লোকাল স্টোরেজ থেকে তাৎক্ষণিক ০ সেকেন্ডে রেন্ডার
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

  // ২. ব্যাকগ্রাউন্ডে ফায়ারবেসের রিয়েল-টাইম সিঙ্ক
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
    console.warn("Firestore sync background warning:", err);
    if (badge) { 
      badge.className = 'sync-badge online'; 
      badge.innerHTML = '⚡ Local Mode'; 
    }
    if (typeof onUpdateCallback === 'function') onUpdateCallback();
  });
}

// ক্লাউডে সুরক্ষিত সেভ (ডেটা ওভাররাইট রোধ)
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

// হেডার ও লোগো রেন্ডারিং (স্মার্ট ফলব্যাক)
function updateHeaderBrand(data) {
  const nameEl = document.getElementById('txt-cafe-name');
  if (nameEl) nameEl.innerText = data.name || 'TableMaster Pro';
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

// মডাল শীট ইউটিলিটি
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

function createSafeQR(text) {
  if (!text) return '';
  try {
    const qr = qrcode(0, 'M');
    qr.addData(String(text));
    qr.make();
    return qr.createDataURL(4);
  } catch (err) { return ''; }
}

// সার্ভিস ওয়ার্কার রেজিস্টার
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration skipped:', err));
}
