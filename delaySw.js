const faceBookCache = 'faceBookCache';
let isLoading = false;
self.addEventListener('fetch', (event) => {
    const { request } = event;
    event.respondWith(handle(request));
})

function handle(request) {
    if (request.url.indexOf('www.facebook.com/tr') === -1) {
        return fetch(request);
    }
    return delayScript(request); // to be implemented
}

function backgroundLoading(request) {
    return new Promise((resolve, reject) => {
        fetch(request.url).then((fetchedResponse) => {
            return resolve(fetchedResponse);
        }).catch((error) => {
            return reject(error);
        });
    })
}

function delayScript(request) {
    caches.open(faceBookCache)
        .then((cache) => {
            return cache.match(request.url)
                .catch((error) => {
                    console.log("error match");
                    console.log(error);
                })
                .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('Returning cached response');
                    return cachedResponse;
                }
                if(!isLoading) {
                    isLoading = true;
                    backgroundLoading(request)
                        .then((response) => {
                            console.log(`Caching ${request.url}`);
                            cache.put(request.url, response.clone());
                        })
                        .catch((error) => {
                            console.log("Error to loading " + request.url);
                            console.log(error);
                        });
                }
                return delayScript(request);
            })
        }).catch((error) => {
            console.log("Error cache open", error)
        })
}
