# PWA Features & Validation Guide

Complete guide to TextiSur's Progressive Web App features and validation.

## PWA Features Implemented

### 1. **Installable**
- ✅ Web App Manifest configured
- ✅ Service Worker registered
- ✅ Served over HTTPS (required for production)
- ✅ Custom install prompt with smart timing
- ✅ Icons for all platforms (Android, iOS, Desktop)

**How to Install**:
- **Desktop**: Click install icon in address bar or banner prompt
- **Android Chrome**: Tap "Add to Home Screen" or use banner prompt
- **iOS Safari**: Share → "Add to Home Screen"

### 2. **Offline Support**
- ✅ Offline fallback page (`/offline.html`)
- ✅ Cached pages and assets
- ✅ Network-first strategy for dynamic content
- ✅ Cache-first for images and static assets

**Test Offline**:
1.  Open app in browser
2.  Navigate to a few pages
3.  Open DevTools → Network → Check "Offline"
4.  Try navigating - cached pages should still load
5.  New pages show offline fallback

### 3. **Caching Strategies**

Configured via Workbox in `next.config.ts`:

| Resource Type | Strategy | Cache Duration |
|--------------|----------|----------------|
| Images (jpg, png, webp) | Cache First | 24 hours |
| Fonts | Stale While Revalidate | 7 days |
| CSS/JS | Stale While Revalidate | 24 hours |
| API calls (GET) | Network First | 24 hours |
| Next.js data | Stale While Revalidate | 24 hours |
| Google Fonts | Cache First | 365 days |

**View Cache**:
- DevTools → Application → Cache Storage  - Inspect cached resources

### 4. **Push Notifications**
- ✅ Push notification handler in service worker
- ✅ Notification click handling
- ✅ VAPID keys configured (already existed)
- ✅ Badge icons for notifications

**Test Notifications**:
```javascript
// In browser console (when app is running):
navigator.serviceWorker.ready.then(function(registration) {
  registration.showNotification('Test', {
    body: 'This is a test notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png'
  });
});
```

### 5. **App Updates**
- ✅ Service worker update detection
- ✅ Toast notification when update available
- ✅ One-click reload to update

**How It Works**:
1.  New deploy detected by service worker
2.  Toast appears: "Nueva versión disponible"
3.  Click "Actualizar"
4.  App reloads with new version

### 6. **App Shortcuts**

Configured in `manifest.webmanifest`:
- Productos
- Mi Carrito
- Mis Pedidos
- Mensajes

**Access Shortcuts** (Android):
- Long-press app icon
- Shortcuts appear in context menu

### 7. **Web Share API**
- ✅ Share target configured in manifest
- Allows sharing TO the app from other apps

---

## PWA Validation

### Lighthouse Audit

**Run Lighthouse** (Chrome DevTools):
1.  Open TextiSur in Chrome
2.  Open DevTools (F12)
3.  Go to "Lighthouse" tab
4.  Select "Progressive Web App" category
5.  Click "Analyze page load"

**Target Score**: 100/100

**Or via CLI**:
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --only-categories=pwa --view
```

### Checklist for 100/100 Score

- [ ] Web app manifest with all required fields
- [ ] Service worker registered and active
- [ ] Start URL responds with 200 when offline
- [ ] Icons: 192x192 and 512x512 PNG
- [ ] Maskable icon for adaptive displays
- [ ] Apple touch icon for iOS
- [ ] Theme color matches design
- [ ] Viewport meta tag configured
- [ ] HTTPS in production
- [ ] Page load fast (< 3s on 3G)
- [ ] Content properly sized for viewport
- [ ] No console errors

### Manual Testing Checklist

#### Installation Testing
- [ ] **Desktop Chrome/Edge**: Install prompt appears
- [ ] **Desktop Chrome/Edge**: Click install, app opens in window
- [ ] **Desktop Chrome/Edge**: App added to Start Menu/Applications
- [ ] **Android Chrome**: "Add to Home Screen" available
- [ ] **Android Chrome**: Banner prompt appears (after 5s)
- [ ] **Android Chrome**: App icon on home screen
- [ ] **Android Chrome**: Opens in fullscreen (no browser UI)
- [ ] **iOS Safari**: "Add to Home Screen" works
- [ ] **iOS Safari**: Splash screen appears on launch

#### Offline Testing
- [ ] Navigate site while online
- [ ] Go offline (Airplane mode or DevTools)
- [ ] Previously visited pages load from cache
- [ ] Images load from cache
- [ ] Offline page shows for non-cached pages
- [ ] Auto-reconnect when back online

#### Update Testing  - [ ] Deploy new version
- [ ] Open installed app
- [ ] Update notification appears
- [ ] Click "Update"
- [ ] App reloads with new version
- [ ] Changes visible

#### Performance Testing
- [ ] First paint < 1.8s
- [ ] Time to Interactive < 3.5s
- [ ] Service worker activates < 1s
- [ ] Cached resources load instantly

#### Notification Testing
- [ ] Request permission shows native prompt
- [ ] Push notifications received
- [ ] Notification click opens correct page
- [ ] Badge icon displays in notification

#### Icon Testing
- [ ] App icon displays on home screen
- [ ] App icon displays in task switcher
- [ ] Splash screen displays on launch (Android)
- [ ] Maskable icon looks good on Android 8+
- [ ] Apple touch icon works on iOS

---

## PWA Features by Platform

| Feature | Chrome Desktop | Edge Desktop | Chrome Android | Safari iOS |
|---------|---------------|--------------|----------------|------------|
| Install | ✅ | ✅ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ✅ | ❌ |
| Background Sync | ✅ | ✅ | ✅ | ❌ |
| App Shortcuts | ✅ | ✅ | ✅ | ❌ |
| Share Target | ❌ | ❌ | ✅ | ❌ |
| Standalone Mode | ✅ | ✅ | ✅ | ✅ |

**Note**: iOS Safari has limited PWA support. For full native experience on iOS, consider building with Capacitor (similar to Android APK).

---

## Troubleshooting

### "Add to Home Screen" not appearing

**Possible Causes**:
1.  Not served over HTTPS
2.  Manifest file not linked
3.  Service worker not registered
4.  Missing required icons
5.  User already dismissed prompt recently

**Solutions**:
- Check DevTools → Application → Manifest
- Check DevTools → Application → Service Workers
- Test in Incognito mode
- Wait 5 seconds for custom prompt
- Check Console for errors

### Service Worker not updating

**Solutions**:
1.  In DevTools → Application → Service Workers
2.  Click "Unregister"
3.  Do hard reload (Ctrl+Shift+R)
4.  Check "Update on reload" checkbox

### Offline page not showing

**Solutions**:
1.  Rebuild: `npm run build`
2.  Check `public/offline.html` exists
3.  Check `next.config.ts` has `fallbacks: { document: "/offline.html" }`
4.  Clear cache and reload

### Icons not displaying

**Solutions**:
1.  Verify icon files exist in `public/icons/`
2.  Check manifest paths are correct
3.  Icons must be PNG format (not JPG)
4.  Check icon sizes match manifest
5.  Do hard reload to clear cache

---

## Production Deployment Checklist

Before deploying to production:

### HTTPS Configuration
- [ ] SSL certificate installed
- [ ] All resources loaded over HTTPS
- [ ] Mixed content warnings resolved

### Manifest
- [ ] `start_url` points to production domain
- [ ] `scope` is correct for your domain
- [ ] All icon paths are absolute or relative correctly

### Service Worker
- [ ] PWA disabled in development mode (already configured)
- [ ] Service worker caching appropriate for production traffic
- [ ] Update mechanism tested

### Performance
- [ ] Run Lighthouse in production mode
- [ ] Images optimized (WebP/AVIF)
- [ ] JavaScript bundle < 500KB (gzipped)
- [ ] First Contentful Paint < 1.8s

### Testing
- [ ] Test on real Android device
- [ ] Test on real iOS device
- [ ] Test on various Desktop browsers
- [ ] Test offline functionality
- [ ] Test update flow

---

## Monitoring & Analytics

### Track PWA Metrics

Add to analytics:
```javascript
// Track installations
window.addEventListener('beforeinstallprompt', (e) => {
  // Track prompt shown
  analytics.track('PWA_Install_Prompt_Shown');
});

window.addEventListener('appinstalled', () => {
  // Track successful install
  analytics.track('PWA_Installed');
});

// Track if running as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  analytics.track('PWA_Running_Standalone');
}
```

### Service Worker Metrics
- Cache hit rate
- Offline page views
- Update frequency
- Service worker errors

---

## Resources

- **Web.dev PWA Guide**: https://web.dev/progressive-web-apps/
- **MDN PWA Docs**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Workbox Docs**: https://developers.google.com/web/tools/workbox
- **PWA Builder**: https://www.pwabuilder.com/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
