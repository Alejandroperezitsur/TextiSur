# Android APK Build Guide - TextiSur

Complete guide to build and deploy the TextiSur Android APK.

## Prerequisites

### Required Software

1.  **Node.js**: v18+ (already installed)
2.  **Android Studio**: Download from https://developer.android.com/studio
3.  **JDK**: Version 11 or 17 (bundled with Android Studio)
4.  **Gradle**: (bundled with Android Studio)

### Android Studio Setup

1.  **Download & Install Android Studio**:
    - Visit: https://developer.android.com/studio
    - Install for Windows
    - During installation, ensure "Android SDK" and "Android Virtual Device" are selected

2.  **Configure SDK**:
    - Open Android Studio
    - Go to `Tools` → `SDK Manager`
    - Install:
      - Android SDK Platform 33 (Android 13)
      - Android SDK Build-Tools 33.0.0+
      - Android SDK Command-line Tools
      - Android Emulator

3.  **Set Environment Variables** (Windows):
    ```bash
    # Add these to System Environment Variables
    ANDROID_SDK_ROOT = C:\Users\<YourUsername>\AppData\Local\Android\Sdk
    JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
    
    # Add to PATH:
    %ANDROID_SDK_ROOT%\platform-tools
    %ANDROID_SDK_ROOT%\cmdline-tools\latest\bin
    %JAVA_HOME%\bin
    ```

4.  **Verify Installation**:
    ```bash
    java --version
    # Should show JDK 11 or 17
    
    adb --version
    # Should show Android Debug Bridge version
    ```

---

## Step-by-Step Build Process

### Step 1: Build Next.js for Static Export

Since Capacitor needs static files, we need to export the Next.js app:

```bash
# Build the Next.js application
npm run build

# Note: The build creates an 'out' directory with static files
# Capacitor will use these files
```

> **Important**: If you get errors about dynamic routes or API routes, you may need to configure Next.js for static export. The current config should handle this.

### Step 2: Initialize Capacitor (First Time Only)

```bash
# Initialize Capacitor
npx cap init "TextiSur" "com.textisur.app" --web-dir=out

# This creates capacitor.config.ts (already created)
```

### Step 3: Add Android Platform

```bash
# Add Android platform
npx cap add android

# This creates the android/ directory with all native Android files
```

### Step 4: Sync Web App with Native App

Every time you make changes to your web app, sync:

```bash
# Method 1: Build and sync together
npm run cap:sync:android

# Method 2: Manual sync (if already built)
npx cap sync android
```

This copies your built app from `out/` to the Android project's `assets` folder.

### Step 5: Open in Android Studio

```bash
# Open the Android project in Android Studio
npx cap open android

# Or manually:
# Open Android Studio → Open → Select: TextiSur/android folder
```

### Step 6: Configure Android Project

In Android Studio:

1.  **Set Package Name** (should already be `com.textisur.app`)
2.  **Update `AndroidManifest.xml`** (if needed):
    - Location: `android/app/src/main/AndroidManifest.xml`
    - Verify permissions are present
3.  **Configure Icons**:
    - Copy icons to `android/app/src/main/res/mipmap-*/`
4.  **Set App Name**:
    - Edit `android/app/src/main/res/values/strings.xml`:
    ```xml
    <string name="app_name">TextiSur</string>
    ```

### Step 7: Build Debug APK

**Option A: Using npm script**:
```bash
npm run android:build
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

**Option B: Using Android Studio**:
1.  In Android Studio, select `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2.  Wait for build to complete
3.  Click "locate" in the notification to find the APK

**Option C: Using Command Line**:
```bash
cd android
./gradlew assembleDebug
# On Windows: gradlew.bat assembleDebug
cd ..
```

Output location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 8: Test on Emulator

**Create Emulator** (first time):
1.  In Android Studio: `Tools` → `Device Manager`
2.  Click `Create Device`
3.  Select `Pixel 5` or similar
4.  Select System Image: `Android 13 (API 33)`
5.  Finish

**Run on Emulator**:
```bash
npm run cap:run:android

# Or in Android Studio: Click the green "Run" button
```

### Step 9: Install on Physical Device

**Enable Developer Mode** on your Android phone:
1.  Go to `Settings` → `About Phone`
2.  Tap `Build Number` 7 times
3.  Go back → `Developer Options`
4.  Enable `USB Debugging`

**Install APK**:

**Method A: Via ADB**:
```bash
# Connect phone via USB
adb devices
# Should list your device

# Install
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Method B: Via File Transfer**:
1.  Copy `app-debug.apk` to your phone
2.  Open file manager on phone
3.  Tap the APK file
4.  Allow "Install from unknown sources" if prompted
5.  Install

### Step 10: Build Release APK for Production

**Generate Signing Key** (first time only):
```bash
keytool -genkey -v -keystore textisur-release-key.keystore -alias textisur -keyalg RSA -keysize 2048 -validity 10000

# Follow prompts:
# - Enter keystore password (save this!)
# - Re-enter password
# - Enter your details
# - Confirm
```

**Configure Signing in Android Studio**:
1.  `Build` → `Generate Signed Bundle / APK`
2.  Select `APK`
3.  Choose your keystore file
4.  Enter keystore password and key alias
5.  Select `release` build variant
6.  Finish

**Or via Gradle**:

Create `android/keystore.properties`:
```properties
storeFile=../textisur-release-key.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=textisur
keyPassword=YOUR_KEY_PASSWORD
```

Build:
```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Step 11: Build AAB for Play Store

**AAB (Android App Bundle)** is required for Google Play Store:

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Common Issues & Solutions

### Issue: "SDK location not found"

**Solution**: Create `android/local.properties`:
```properties
sdk.dir=C\:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
```

### Issue: Build fails with "Gradle Sync Failed"

**Solution**:
1.  In Android Studio: `File` → `Invalidate Caches and Restart`
2.  Delete `android/.gradle` and `android/app/build` folders
3.  Sync again

### Issue: "next export" not working

**Solution**: Add to `next.config.ts`:
```typescript
output: 'export',
images: {
  unoptimized: true
}
```

### Issue: App crashes on startup

**Solution**: Check logs:
```bash
adb logcat | grep -i textisur
```

Common causes:
- Missing permissions in AndroidManifest.xml
- Network security config issues
- WebView compatibility

### Issue: White screen on app launch

**Solution**: 
1.  Ensure `out/` directory has built files
2.  Check `capacitor.config.ts` has correct `webDir: 'out'`
3.  Run `npx cap sync android` again

---

## Testing Checklist

Before distributing your APK:

- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] Home page loads correctly
- [ ] Navigation works
- [ ] Product images load
- [ ] Cart functionality works
- [ ] Stripe payments work (test mode)
- [ ] WebSocket connections establish (messages)
- [ ] Push notifications work
- [ ] Camera/photo picking works (if implemented)
- [ ] Geolocation works (if implemented)
- [ ] App persists data (localStorage)
- [ ] App reopens to last page
- [ ] Deep links work (if configured)
- [ ] App icon displays correctly
- [ ] Splash screen appears

---

## File Locations Reference

- **APK (Debug)**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **APK (Release)**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB (Release)**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Keystore**: `textisur-release-key.keystore` (keep this safe!)
- **Android Manifest**: `android/app/src/main/AndroidManifest.xml`
- **App Icon**: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- **Splash Screen**: `android/app/src/main/res/drawable/splash.xml`

---

## Quick Commands Reference

```bash
# Full build pipeline
npm run build && npx cap sync android && npx cap open android

# Quick sync after code changes
npm run cap:sync:android

# Open in Android Studio
npm run cap:open:android

# Build debug APK
npm run android:build

# Build release AAB
cd android && ./gradlew bundleRelease

# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat
```

---

## Next Steps

1.  **Test thoroughly** on multiple devices
2.  **Optimize performance**: Check bundle size, lazy loading
3.  **Add deep linking**: Configure for product URLs
4.  **Set up Play Store listing**: Screenshots, description, privacy policy
5.  **Submit to Google Play**: Upload AAB file
6.  **Monitor crashes**: Use Firebase Crashlytics

---

**Need Help?**
- Capacitor Docs: https://capacitorjs.com/docs
- Android Docs: https://developer.android.com/docs
- Stack Overflow: Tag with `capacitor` and `android`
