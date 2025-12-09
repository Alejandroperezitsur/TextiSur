# 🚀 Quick Start Guide - TextiSur PWA & APK

Get your TextiSur PWA running and generate the Android APK in minutes.

## ⚡ 3-Minute PWA Setup

### 1. Generate Icons (Choose One Method)

**Option A - Online Tool (Easiest)**:
```bash
# 1. Go to: https://www.pwabuilder.com/imageGenerator
# 2. Upload base icon from:
#    C:\Users\Alejandro\.gemini\antigravity\brain\02d09833-f884-4bc1-a9bd-dadf4f5e9ac7\textisur_icon_base_1765296111453.png
# 3. Download icon pack
# 4. Extract all files to: public/icons/
```

**Option B - Use Script**:
```bash
npm run icons:generate
```

### 2. Test PWA Locally

```bash
# Build
npm run build

# Start
npm start

# Test in Chrome - open http://localhost:3000
# Click install icon in address bar
```

### 3. Validate

```bash
# Install Lighthouse globally (first time only)
npm install -g lighthouse

# Run PWA audit
lighthouse http://localhost:3000 --only-categories=pwa --view

# Target score: 100/100 ✅
```

---

## 📱 Android APK Build (15 Minutes)

### Prerequisites
- **Android Studio**: Download from https://developer.android.com/studio
- **JDK 11/17**: Bundled with Android Studio

### Quick Build Steps

```bash
# 1. Add Android platform
npx cap add android

# 2. Build & Sync
npm run build
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio:
#    Build → Build Bundle(s) / APK(s) → Build APK(s)

# 5. APK Location:
#    android/app/build/outputs/apk/debug/app-debug.apk
```

### Test APK

**On Physical Device**:
```bash
# Enable USB Debugging on phone
# Settings → About Phone → Tap Build Number 7 times
# Back → Developer Options → Enable USB Debugging

# Connect phone and install
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**On Emulator**:
- Android Studio → Device Manager → Create Device → Pixel 5
- Drag app-debug.apk onto emulator

---

## ✅ Quick Checklist

### Before Deployment
- [ ] Icons generated and in `/public/icons/`
- [ ] PWA score 100/100 on Lighthouse
- [ ] App installs on Chrome
- [ ] Offline mode works
- [ ] Update notification tested

### Before APK Distribution
- [ ] APK installs successfully
- [ ] App launches without crash
- [ ] All features work (payments, messages, cart)
- [ ] Icons and splash screen correct

---

## 🆘 Quick Fixes

**PWA not installing**:
```bash
# Clear cache
# DevTools → Application → Clear storage → Clear site data

# Hard reload
Ctrl + Shift + R
```

**APK build fails**:
```bash
# Set Android SDK path
echo "sdk.dir=C:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk" > android/local.properties

# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

**Icons missing**:
```bash
# Verify icons exist
dir public\icons

# Should see: icon-72x72.png through icon-512x512.png
```

---

## 📚 Full Documentation

- **Complete Guide**: `docs/PWA_GUIDE.md`
- **Android Details**: `docs/ANDROID_BUILD.md`
- **Deployment Checklist**: `deployment_checklist.md`
- **Full Walkthrough**: `walkthrough.md`

---

## 🎯 Production Deployment

```bash
# 1. Deploy to hosting (Vercel/Netlify/etc)
npm run build
# Follow hosting provider's instructions

# 2. Ensure HTTPS is configured

# 3. Test PWA on live site
lighthouse https://your-domain.com --only-categories=pwa

# 4. For Play Store:
cd android
./gradlew bundleRelease
# Upload: android/app/build/outputs/bundle/release/app-release.aab
```

---

**Status**: ✅ Ready to Go!  
All code is implemented, just generate icons and build!
