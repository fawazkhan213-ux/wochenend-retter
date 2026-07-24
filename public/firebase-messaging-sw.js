// Firebase Cloud Messaging service worker for Wochenend-Retter push reminders.
// This is separate from any app-shell PWA service worker and is loaded by the
// Firebase JS SDK when the browser subscribes for push notifications.

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD3qCwBbWkZa3gbuBZJUoQufjms9gnhdcU",
  projectId: "wochenend-retter",
  messagingSenderId: "897485430720",
  appId: "1:897485430720:web:9713bea11153110fb53225",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "Wochenend-Retter";
  const body = (payload.notification && payload.notification.body) || "";
  const url = (payload.data && payload.data.url) || "/";
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});