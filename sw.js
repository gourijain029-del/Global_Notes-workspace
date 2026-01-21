const CACHE_NAME = 'my-note-app-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/CSS/index.css',
  '/CSS/signup.css',
  '/CSS/styles.css',
  '/HTML/signup.html',
  '/JS/aiAssistant.js',
  '/JS/audioRecorder.js',
  '/JS/authButtons.js',
  '/JS/authPage.js',
  '/JS/constants.js',
  '/JS/db.js',
  '/JS/eventHandlers.js',
  '/JS/exportImport.js',
  '/JS/filterSearchSort.js',
  '/JS/folderManager.js',
  '/JS/formattingToolbar.js',
  '/JS/geminiAPI.js',
  '/JS/layoutManager.js',
  '/JS/loginPage.js',
  '/JS/mailFeature.js',
  '/JS/mediaManager.js',
  '/JS/noteManager.js',
  '/JS/noteOperations.js',
  '/JS/notesApp.js',
  '/JS/profileManager.js',
  '/JS/renderer.js',
  '/JS/sketchPad.js',
  '/JS/slashCommands.js',
  '/JS/smartCalendar.js',
  '/JS/storage.js',
  '/JS/themeManager.js',
  '/JS/themePresets.js',
  '/JS/utilities.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
      )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
