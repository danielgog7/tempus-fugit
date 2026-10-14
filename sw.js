/* Tempus Fugit: funciona offline. Muda VERSAO quando atualizares os ficheiros. */
const VERSAO='tempus-v2';
const BASE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const url=new URL(r.url);
  // Página: rede primeiro, sem cache HTTP (atualizações chegam logo), cache local se estiver offline
  if(r.mode==='navigate'){e.respondWith(fetch(r.url,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(VERSAO).then(c=>c.put('index.html',cp));return res;}).catch(()=>caches.match('index.html')));return;}
  // Tipos de letra e restantes ficheiros: cache primeiro, atualiza em segundo plano
  if(url.origin===location.origin||url.host.endsWith('fonts.googleapis.com')||url.host.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(VERSAO).then(c=>c.put(r,cp));}return res;}).catch(()=>hit);return hit||net;}));
  }
});
