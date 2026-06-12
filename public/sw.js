/* Buzz Reminders — web notification scheduler */
const DB_NAME = 'buzz-reminders-sw';
const STORE = 'schedules';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(item) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
}

const timers = new Map();

function scheduleItem(item) {
  if (timers.has(item.id)) {
    clearTimeout(timers.get(item.id));
    timers.delete(item.id);
  }
  const delay = Math.max(0, item.dueAt - Date.now());
  const t = setTimeout(() => {
    timers.delete(item.id);
    void dbDelete(item.id);
    if (self.registration && Notification.permission === 'granted') {
      self.registration.showNotification(item.title, {
        body: 'Reminder due',
        tag: item.reminderId,
        data: { reminderId: item.reminderId },
      });
    }
  }, delay);
  timers.set(item.id, t);
}

async function restoreSchedules() {
  const items = await dbGetAll();
  for (const item of items) {
    if (item.dueAt <= Date.now()) {
      void dbDelete(item.id);
      continue;
    }
    scheduleItem(item);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(restoreSchedules());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim().then(() => restoreSchedules()));
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'SCHEDULE_REMINDER') {
    const item = {
      id: data.id,
      reminderId: data.reminderId,
      title: data.title,
      dueAt: data.dueAt,
    };
    void dbPut(item).then(() => scheduleItem(item));
  }

  if (data.type === 'CANCEL_REMINDER') {
    const id = data.id;
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }
    void dbDelete(id);
  }

  if (data.type === 'CANCEL_ALL_FOR_REMINDER') {
    void dbGetAll().then((items) => {
      for (const item of items) {
        if (item.reminderId === data.reminderId) {
          if (timers.has(item.id)) {
            clearTimeout(timers.get(item.id));
            timers.delete(item.id);
          }
          void dbDelete(item.id);
        }
      }
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const reminderId = event.notification.data?.reminderId;
  const url = reminderId ? `/reminder/${reminderId}` : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
