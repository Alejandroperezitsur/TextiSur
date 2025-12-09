@echo off
REM ================================================
REM TextiSur Android APK Build Script
REM Automated build para generar APK debug y release
REM ================================================

echo.
echo ================================================
echo TextiSur - Android APK Build Automation
echo ================================================
echo.

REM Paso 1: Verificar entorno
echo [1/6] Verificando entorno...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no encontrado
    exit /b 1
)
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java no encontrado
    exit /b 1
)
echo ✓ Entorno verificado

REM Paso 2: Generar iconos
echo.
echo [2/6] Generando iconos PWA...
cd scripts
call npm install
node generate-icons-canvas.js
cd ..
echo ✓ Iconos generados

REM Paso 3: Build Next.js
echo.
echo [3/6] Building Next.js...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Next.js build failed
    exit /b 1
)
echo ✓ Next.js build completado

REM Paso 4: Sync Capacitor
echo. 
echo [4/6] Syncing Capacitor con Android...
call npx @capacitor/cli sync android
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Capacitor sync failed
    exit /b 1
)
echo ✓ Capacitor sync completado

REM Paso 5: Build Debug APK
echo.
echo [5/6] Building debug APK...
cd android
call gradlew assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Debug APK build failed
    echo.
    echo SOLUCION:
    echo 1. Abre Android Studio
    echo 2. Abre la carpeta android/
    echo 3. Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
    cd ..
    exit /b 1
)
cd ..
echo ✓ Debug APK generado

REM Paso 6: Copiar APK
echo.
echo [6/6] Copiando APK a carpeta releases...
if not exist "releases" mkdir releases
copy "android\app\build\outputs\apk\debug\app-debug.apk" "releases\TextiSur-debug.apk"
echo ✓ APK copiado a releases\TextiSur-debug.apk

REM Resultado final
echo.
echo ================================================
echo BUILD EXITOSO!
echo ================================================
echo.
echo APK Debug: releases\TextiSur-debug.apk
echo Tamaño: 
dir "releases\TextiSur-debug.apk" | findstr "TextiSur"
echo.
echo Para instalar en dispositivo:
echo adb install releases\TextiSur-debug.apk
echo.
echo Para build release (Play Store):
echo 1. cd android
echo 2. gradlew bundleRelease
echo 3. AAB en: android\app\build\outputs\bundle\release\
echo.
echo ================================================
pause
