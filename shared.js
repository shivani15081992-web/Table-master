/* ==========================================================================
   FIREBASE CONFIG & SHARED STATE
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
  } catch(e) {
    console.error("Firebase init failed:", e);
    return false;
  }
}

window.todayStr = function() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
};

window.RESTAURANT_DATA = {
  cafeId: 'default_cafe', name: 'TableMaster Bistro', phone: '', address: '',
  masterPin: '1234', gstRate: 0, serviceRate: 0,
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

function bindCafeCloudListener(cafeId, onUpdateCallback) {
  if (!db || !cafeId) return;
  if (currentCafeListener) { try { currentCafeListener(); } catch(e){} }

  const badge = document.getElementById('sync-status');
  if (badge) { badge.className = 'sync-badge syncing'; badge.innerHTML = '🔄 Connecting...'; }

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
      try { localStorage.setItem('tmpro_cafe_cache_' + cafeId, JSON.stringify(window.RESTAURANT_DATA)); } catch(e){}
    }
    if (badge) { badge.className = 'sync-badge online'; badge.innerHTML = '☁️ Online'; }
    if (typeof onUpdateCallback === 'function') onUpdateCallback();
  }, (err) => {
    console.warn("Firestore sync warning:", err);
    if (badge) { badge.className = 'sync-badge syncing'; badge.innerHTML = '⚡ Local Mode'; }
    if (typeof onUpdateCallback === 'function') onUpdateCallback();
  });
}

window.cloudSave = function() {
  const data = window.getData();
  if (!data || !data.cafeId || !db) return;
  try { localStorage.setItem('tmpro_cafe_cache_' + data.cafeId, JSON.stringify(data)); } catch(e){}
  const badge = document.getElementById('sync-status');
  if (badge) { badge.className = 'sync-badge syncing'; badge.innerHTML = '🔄 Syncing...'; }

  db.collection("cafes").doc(data.cafeId).set(data, { merge: true }).then(() => {
    if (badge) { badge.className = 'sync-badge online'; badge.innerHTML = '☁️ Online'; }
  }).catch(err => {
    console.error("Cloud save failed:", err);
    if (badge) { badge.className = 'sync-badge syncing'; badge.innerHTML = '⚠️ Error'; }
  });
};

/* ==========================================================================
   i18n TRANSLATION DICTIONARY
   ========================================================================== */
const I18N = {
  en: {
    navHome: "Home", navPOS: "Order", navKitchen: "Kitchen", navBills: "Bills", navPlatforms: "Online Portals", navExpenses: "Expenses", navReports: "Reports", navMenu: "Menu",
    todaySales: "Today's Total Sales", totalOrders: "Today's Orders", activeKOT: "Active Kitchen KOT",
    newOrder: "New Order (POS)", newOrderSub: "Take customer order", kitchenLive: "Kitchen Live", kitchenLiveSub: "orders preparing",
    billsAndPrint: "Bills & Print", billsAndPrintSub: "UPI QR payment", reportsAndProfit: "Profit & Reports", reportsAndProfitSub: "Sales vs Expenses",
    dailyExpenses: "Expenses Log", dailyExpensesSub: "Kitchen market & supplies", floorMap: "Floor Table Map", addTable: "+ Add Table", allQR: "📱 All QRs", seater: "Seater",
    searchPlaceholder: "🔍 Search dishes or category...", selectDishWarning: "Please select a table or channel first!", selectedItems: "items selected",
    confirmOrderKOT: "Confirm Order (Send KOT) →", orderConfirmation: "Order Confirmation & Quantities", table: "Channel / Table", subtotal: "Subtotal",
    tax: "Tax / GST", serviceCharge: "Service Charge", grandTotal: "Total Due", sendToKitchen: "Send Order to Kitchen",
    liveKitchenDisplay: "Live Kitchen Monitor", runningOrders: "running orders", noKOT: "No active orders in kitchen!", readyToServe: "Ready to Serve ✓",
    markServed: "Mark as Served ✓", readyToServeHeader: "Ready to Serve",
    billingHistory: "Bills Management", noBills: "No bills found for selected filter", printUPIReceipt: "Receipt / UPI QR",
    digitalMenuCard: "Digital Menu Card", addNewDish: "+ Add New Item", dishName: "Dish Name", category: "Category", price: "Price (₹)",
    save: "Save", delete: "Delete", confirmDelete: "Are you sure you want to delete this?", expenseTitle: "Add Expense", expenseDesc: "Expense Description",
    amount: "Amount", restaurantSettings: "Restaurant Settings", restaurantName: "Restaurant Name", phone: "Phone Number", address: "Address",
    upiId: "UPI ID (For Scan & Pay)", googleReviewUrl: "Google Review URL", gstRate: "GST Rate (%)", serviceRate: "Service Charge (%)",
    uploadLogo: "Upload Restaurant Logo", printThermalReceipt: "Print Bill (Thermal Receipt)", scanToPay: "Scan to Pay via UPI",
    reviewPrompt: "Leave us a review on Google", thankYou: "Thank you for dining with us! Visit again.", netProfit: "Net Profit", netLoss: "Net Loss",
    sales: "Sales", expenses: "Expenses", filterToday: "Today", filterWeek: "This Week", filterMonth: "This Month", filterCustom: "Custom Date",
    filterAll: "All Time", topSelling: "Top Selling Items", dailyBreakdown: "Daily Breakdown", exportCSV: "📥 Export CSV", date: "Date", profit: "Profit",
    staffMgmt: "Staff & Role Switch", role: "Role", masterPinPrompt: "Enter 4-Digit Master PIN:",
    onlinePlatformsTitle: "Online Partners Ledger", addPlatform: "+ Add Partner",
    platformName: "Platform Name", commission: "Commission %", recordPayout: "Receive Settlement", totalGross: "Total Gross Value",
    netPayable: "Net After Commission", received: "Received Payout", pendingDue: "Pending Due", filterPlatform: "Filter Channel",
    allPlatforms: "All Delivery Channels", unPaidOnly: "Unpaid Only",
    editBillNotice: "Delete or adjust unwanted items. The bill total will auto recalculate.",
    editItemsTitle: "Edit Bill Items", newTotal: "New Total",
    bookTable: "Table Reservation", reserve: "Confirm Booking", bookInfo: "Booking Details", reservedStatus: "RESERVED",
    customerName: "Customer Name", bookingTime: "Time / Note", releaseBooking: "Release Booking",
    editTable: "Edit Table Details"
  },
  bn: {
    navHome: "হোম", navPOS: "অর্ডার", navKitchen: "কিচেন", navBills: "বিলিং", navPlatforms: "অনলাইন পোর্টাল", navExpenses: "খরচের খাতা", navReports: "রিপোর্ট", navMenu: "মেনু",
    todaySales: "আজকের মোট বিক্রি", totalOrders: "আজকের মোট অর্ডার", activeKOT: "চলতি কিচেন KOT",
    newOrder: "নতুন অর্ডার (POS)", newOrderSub: "কাস্টমার অর্ডার এন্ট্রি", kitchenLive: "কিচেন লাইভ", kitchenLiveSub: "টি অর্ডার তৈরি হচ্ছে",
    billsAndPrint: "বিল ও প্রিন্ট", billsAndPrintSub: "QR দিয়ে UPI পেমেন্ট", reportsAndProfit: "লাভ-ক্ষতি ও রিপোর্ট", reportsAndProfitSub: "বিক্রি ও খরচের হিসাব",
    dailyExpenses: "খরচের খাতা", dailyExpensesSub: "বাজার ও ভেন্ডর হিসাব", floorMap: "ইন্টারেক্টিভ টেবিল ম্যাপ", addTable: "+ টেবিল যোগ", allQR: "📱 সব QR", seater: "সিটার",
    searchPlaceholder: "🔍 খাবার বা মেনু সার্চ করুন...", selectDishWarning: "দয়া করে টেবিল অথবা অনলাইন চ্যানেল সিলেক্ট করুন!", selectedItems: "টি আইটেম সিলেক্টেড",
    confirmOrderKOT: "অর্ডার নিশ্চিত করুন (KOT) →", orderConfirmation: "অর্ডার ও পরিমাণের তালিকা", table: "চ্যানেল / টেবিল", subtotal: "সাবটোটাল",
    tax: "ট্যাক্স / GST", serviceCharge: "সার্ভিস চার্জ", grandTotal: "সর্বমোট দেয় টাকা", sendToKitchen: "রান্নাঘরে অর্ডার পাঠান (Send KOT)",
    liveKitchenDisplay: "লাইভ কিচেন মনিটর (KOT)", runningOrders: "রানিং অর্ডার", noKOT: "কিচেনে কোনো পেন্ডিং অর্ডার নেই!", readyToServe: "খাবার প্রস্তুত (Ready) ✓",
    markServed: "সার্ভ করা হয়েছে (Served) ✓", readyToServeHeader: "সার্ভ করার জন্য প্রস্তুত",
    billingHistory: "বিলিং ও হিসেব খাতা", noBills: "নির্দিষ্ট ফিল্টারে কোনো বিল পাওয়া যায়নি", printUPIReceipt: "রসিদ / UPI QR",
    digitalMenuCard: "ডিজিটাল মেনু কার্ড", addNewDish: "+ নতুন খাবার যোগ", dishName: "খাবারের নাম", category: "ক্যাটাগরি", price: "মূল্য (টাকা)",
    save: "সংরক্ষণ করুন", delete: "মুছুন", confirmDelete: "আপনি কি এটি মুছে ফেলতে চান?", expenseTitle: "খরচ এন্ট্রি", expenseDesc: "খরচের বিবরণ",
    amount: "টাকা", restaurantSettings: "রেস্তোরাঁ সেটিংস", restaurantName: "রেস্তোরাঁর নাম", phone: "মোবাইল নম্বর", address: "ঠিকানা",
    upiId: "UPI ID", googleReviewUrl: "গুগল রিভিউ লিঙ্ক", gstRate: "GST রেট (%)", serviceRate: "সার্ভিস চার্জ (%)",
    uploadLogo: "রেস্তোরাঁর লোগো আপলোড", printThermalReceipt: "বিল প্রিন্ট করুন", scanToPay: "Scan to Pay via UPI",
    reviewPrompt: "গুগলে আপনার মূল্যবান রিভিউ দিন", thankYou: "আমাদের এখানে আসার জন্য ধন্যবাদ! আবার আসবেন।", netProfit: "নিট লাভ", netLoss: "নিট ক্ষতি",
    sales: "মোট বিক্রি", expenses: "মোট খরচ", filterToday: "আজকে", filterWeek: "এই সপ্তাহ", filterMonth: "এই মাস", filterCustom: "কাস্টম তারিখ",
    filterAll: "সব সময়", topSelling: "জনপ্রিয় খাবার", dailyBreakdown: "দৈনিক তালিকা", exportCSV: "📥 CSV ডাউনলোড", date: "তারিখ", profit: "লাভ",
    staffMgmt: "স্টাফ ও ভূমিকা", role: "দায়িত্ব", masterPinPrompt: "৪-ডিজিট মাস্টার পিন দিন:",
    onlinePlatformsTitle: "অনলাইন পার্টনার লেজার", addPlatform: "+ পার্টনার যোগ",
    platformName: "প্ল্যাটফর্মের নাম", commission: "কমিশন %", recordPayout: "পেমেন্ট জমা নিন", totalGross: "মোট অর্ডার ভ্যালু",
    netPayable: "কমিশন বাদে প্রাপ্য", received: "পেমেন্ট রিসিভড", pendingDue: "বকেয়া ব্যালেন্স", filterPlatform: "চ্যানেল ফিল্টার",
    allPlatforms: "সব ডেলিভারি পার্টনার", unPaidOnly: "শুধু বাকি (Unpaid)",
    editBillNotice: "কাস্টমার কোন আইটেম না চাইলে সরাসরি মুছুন। বিলের মোট টাকা অটো আপডেট হবে।",
    editItemsTitle: "আইটেম এডিট", newTotal: "নতুন মোট",
    bookTable: "টেবিল বুকিং", reserve: "রিজার্ভ করুন", bookInfo: "বুকিং তথ্য", reservedStatus: "বুকড / রিজার্ভড",
    customerName: "কাস্টমারের নাম", bookingTime: "সময় / বিশেষ নোট", releaseBooking: "বুকিং বাতিল / ফ্রি করুন",
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
  if (nameEl) nameEl.innerText = data.name || 'TableMaster Pro';
  const roleEl = document.getElementById('active-user-role');
  if (roleEl) roleEl.innerText = (window.CURRENT_USER_ROLE || 'owner').toUpperCase();
}

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

/* Service Worker Registration */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration skipped:', err));
}
