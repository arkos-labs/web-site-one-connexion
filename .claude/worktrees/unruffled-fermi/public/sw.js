self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Nouvelle mission', body: 'Vous avez une nouvelle course disponible.' };

    const options = {
        body: data.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        data: data.data,
        actions: [
            { action: 'accept', title: '✅ Accepter' },
            { action: 'decline', title: '❌ Refuser' }
        ],
        vibrate: [200, 100, 200, 100, 200, 100, 400],
        tag: 'mission-notification',
        renotify: true,
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const orderData = event.notification.data;
    const urlToOpen = new URL(orderData?.url || '/', self.location.origin).href;

    const promiseChain = (async () => {
        if (action === 'accept' || action === 'decline') {
            try {
                await fetch('https://wbwxhmpjxwmsybpxycog.supabase.co/functions/v1/handle-mission-action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderData.orderId,
                        action: action,
                        driverId: orderData.driverId
                    })
                });
            } catch (err) {
                console.error('Action fetch failed:', err);
            }
        }

        const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
                return client.focus();
            }
        }

        if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
        }
    })();

    event.waitUntil(promiseChain);
});
