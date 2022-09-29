const CACHE_NAME = "version-1"
const urlsToCache = [ '../../index.html', '../../offline.html' ];                       //conjunto de páginas que podem ser exibidas: uma para caso haja conexão, outra para caso não haja
const self = this;

//instala o service worker e reserva espaço para cachear o conteúdo das páginas
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    )
});

//escuta requisições
self.addEventListener('fetch', (event) => {                                 //pode parecer meio confuso, mas tudo o que este listener está fazendo é ver se tem conexão 
    event.respondWith(
        caches.match(event.request)                                         
            .then(() => {
                return fetch(event.request)                                 
                    .catch(() => caches.match('offline.html'))              //...e isto é o que ele faz se não observar uma conexão (o dispositivo do usuário ficou offline)
            })                                                              //o segundo fetch é para garantir que estamos pegando apenas os dados mais recentes
    )
});

//ativa o service worker
self.addEventListener('activate', (event) => {                              //toda vez que o cache for ativado, nós limpamos todos os dados de sessões anteriores
    const cacheWhiteList = [];
    cacheWhiteList.push(CACHE_NAME);                                        //cacheWhiteList contém agora todos os caches identificados por CACHE_NAME
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(                     //ao recebermos as chaves de cache, verificamos quais são da mesma identificação que CACHE_NAME
            cacheNames.map((cacheName) => {
                if(!cacheWhiteList.includes(cacheName)){                    //as que não forem são deletadas da lista de caches
                    return caches.delete(cacheName);                        //com isso, excluímos todas as informações irrelevantes ou geradas em instantes passados da aplicação
                }
            })
        ))
    )
});