@echo off
:: ============================================================
:: KhetMap — Android APK Build Script
:: ============================================================
:: Prerequisites:
::   1. JDK 17 installed (run: winget install EclipseAdoptium.Temurin.17.JDK)
::   2. ANDROID_HOME set to your Android SDK path
::   3. JAVA_HOME set to your JDK 17 path
:: ============================================================
cd /d "%~dp0"

echo.
echo ========================================
echo  KhetMap — Building Android APK
echo ========================================
echo.

:: Check prerequisites
where javac >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] JDK not found. Install JDK 17 first:
    echo   winget install EclipseAdoptium.Temurin.17.JDK
    echo.
    echo Or download from: https://adoptium.net/temurin/releases/?version=17
    pause
    exit /b 1
)

if "%ANDROID_HOME%"=="" (
    echo [ERROR] ANDROID_HOME not set.
    echo Set it to your Android SDK path, e.g.:
    echo   set ANDROID_HOME=%%LOCALAPPDATA%%\Android\Sdk
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)

echo [2/4] Building web app...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vite build failed
    pause
    exit /b 1
)

echo [3/4] Syncing to Android...
call npx cap copy android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cap sync failed
    pause
    exit /b 1
)

echo [4/4] Building debug APK...
cd android
call gradlew assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gradle build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo  SUCCESS! APK built at:
echo  android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.
echo Install on your phone:
echo   adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
