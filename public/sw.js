self.addEventListener("push", function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || "/icons/icon-192x192.png",
            badge: "/icons/badge-72x72.png",
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: "1",
                url: data.url || "/",
            },
            actions: [
                {
                    action: "explore",
                    title: "Ver",
                },
            ],
        };

        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    // Handle click action
    if (event.action === "explore") {
        // Specific action logic if needed
    }

    // Open the URL
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
            const url = event.notification.data.url;

            // If a window is already open, focus it.
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && "focus" in client) {
                    return client.focus();
                }
            }

            // Otherwise open a new window.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Handle subscription change (e.g. user refreshes permission or browser rotates keys)
self.addEventListener("pushsubscriptionchange", function (event) {
    event.waitUntil(
        self.registration.pushManager.getSubscription()
            .then(function (newSubscription) {
                if (!newSubscription) return;

                // Send new subscription to backend
                return fetch("/api/notifications/subscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        oldEndpoint: event.oldSubscription ? event.oldSubscription.endpoint : null,
                        newSubscription: newSubscription
                    })
                });
            })
    );
});
