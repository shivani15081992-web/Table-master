/* ==========================================================================
   TableMaster Pro — Background Push Notification Service Worker
   Developer: Debapriya Sarkar (9046356631)
   ========================================================================== */

importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDfDz5MnOvokr_MQH_sG5FxkHUGVphuOLU",
  authDomain: "the-table-master.firebaseapp.com",
  projectId: "the-table-master",
  storageBucket: "the-table-master.firebasestorage.app",
  messagingSenderId: "135597759379",
  appId: "1:135597759379:web:b5233aaa5dceec27dfa666"
});

const messaging = firebase.messaging();

// ব্যাকগ্রাউন্ডে পুশ মেসেজ রিসিভ করার লিসেনার (স্ক্রিন লক বা অফ থাকলেও এটি জেগে ওঠে)
messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification ? payload.notification.title : 'TableMaster Alert';
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : 'You have a new update.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [250, 100, 250, 100, 250], // ফোন জোরালোভাবে ভাইব্রেট করবে
    tag: payload.data ? payload.data.orderId : 'order-alert',
    renotify: true,
    data: {
      url: payload.data && payload.data.targetUrl ? payload.data.targetUrl : 'index.html'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// নোটিফিকেশনে ট্যাপ করলে সংশ্লিষ্ট পেজ খুলে যাওয়া
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : 'index.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
