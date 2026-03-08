# podcastsphere_v1_0_0.ps1
# Podcast Sphere v1.0.0 — Build script for Android (Capacitor 8)
# Target: E:\Projets\Podcastsphere
# Package: com.fhm.podcastsphere
# Date: 8 mars 2026

$RepoUrl = "https://github.com/Mrbender7/podcast-sphere"
$ProjectFolder = "E:\Projets\Podcastsphere"
$UTF8NoBOM = New-Object System.Text.UTF8Encoding($False)

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Podcast Sphere v1.0.0 — Build Android APK" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ===================================================================
# 0. Clone or update repo
# ===================================================================
if (Test-Path $ProjectFolder) {
    Write-Host ">>> Dossier existant, suppression..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $ProjectFolder
}
git clone $RepoUrl $ProjectFolder
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: git clone echoue" -ForegroundColor Red; exit 1 }
Set-Location $ProjectFolder
[System.Environment]::CurrentDirectory = (Get-Location).Path

# ===================================================================
# 1. Capacitor config
# ===================================================================
Write-Host ">>> Configuration Capacitor..." -ForegroundColor Yellow
$ConfigJSON = @"
{
  "appId": "com.fhm.podcastsphere",
  "appName": "Podcast Sphere",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "allowNavigation": ["*"]
  },
  "plugins": {
    "LocalNotifications": {
      "smallIcon": "ic_notification",
      "iconColor": "#6080ff"
    },
    "CapacitorHttp": {
      "enabled": true
    }
  }
}
"@
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "capacitor.config.json"), $ConfigJSON, $UTF8NoBOM)

# ===================================================================
# 2. Install & Build
# ===================================================================
Write-Host ">>> Installation des dependances..." -ForegroundColor Yellow
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: npm install echoue" -ForegroundColor Red; exit 1 }

Write-Host ">>> Installation des plugins Capacitor..." -ForegroundColor Yellow
npm install @capacitor/core @capacitor/cli @capacitor/android `
    @capacitor/app @capacitor/browser @capacitor/filesystem `
    @capacitor/local-notifications @capacitor/share `
    @capawesome-team/capacitor-android-foreground-service `
    --legacy-peer-deps

Write-Host ">>> Build Vite..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: build echoue" -ForegroundColor Red; exit 1 }

Write-Host ">>> Ajout plateforme Android..." -ForegroundColor Yellow
npx cap add android

# ===================================================================
# 3. Notification icons (fallback from launcher icons)
# ===================================================================
Write-Host ">>> Generation des icones de notification..." -ForegroundColor Yellow

$sizes = @{ "mdpi"=24; "hdpi"=36; "xhdpi"=48; "xxhdpi"=72; "xxxhdpi"=96 }
foreach ($density in $sizes.Keys) {
    $dir = "android/app/src/main/res/drawable-$density"
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $src = "android/app/src/main/res/mipmap-$density/ic_launcher_foreground.png"
    if (!(Test-Path $src)) {
        $src = "android/app/src/main/res/mipmap-$density/ic_launcher.png"
    }
    if (Test-Path $src) {
        Copy-Item $src "$dir/ic_notification.png" -Force
        Write-Host "    Copie $density -> ic_notification.png" -ForegroundColor DarkGray
    }
}

$DrawablePath = "android/app/src/main/res/drawable"
if (!(Test-Path $DrawablePath)) { New-Item -ItemType Directory -Path $DrawablePath -Force | Out-Null }
$FallbackSrc = "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
if (Test-Path $FallbackSrc) {
    Copy-Item $FallbackSrc "$DrawablePath/ic_notification.png" -Force
}

# ===================================================================
# 3b. Network security config (allow cleartext for some podcast streams)
# ===================================================================
Write-Host ">>> Generation network_security_config.xml..." -ForegroundColor Yellow
$XmlDir = "android/app/src/main/res/xml"
if (!(Test-Path $XmlDir)) { New-Item -ItemType Directory -Path $XmlDir -Force | Out-Null }

$NetSecContent = @'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "$XmlDir/network_security_config.xml"), $NetSecContent, $UTF8NoBOM)

# ===================================================================
# 3c. File provider paths (for downloads & share)
# ===================================================================
Write-Host ">>> Generation file_paths.xml..." -ForegroundColor Yellow

$FilePathsContent = @'
<?xml version="1.0" encoding="utf-8"?>
<paths>
    <external-path name="external_files" path="." />
    <cache-path name="cache" path="." />
    <files-path name="internal_files" path="." />
</paths>
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "$XmlDir/file_paths.xml"), $FilePathsContent, $UTF8NoBOM)

# ===================================================================
# 4. MANIFEST — Permissions & components
# ===================================================================
$ManifestPath = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $ManifestPath) {
    Write-Host ">>> Manifest: Injection des permissions..." -ForegroundColor Yellow
    $ManifestContent = Get-Content $ManifestPath -Raw

    # --- Standard permissions ---
    $PermsList = @(
        "android.permission.INTERNET",
        "android.permission.WAKE_LOCK",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.ACCESS_NETWORK_STATE"
    )

    $PermsToAdd = ""
    foreach ($perm in $PermsList) {
        if ($ManifestContent -notmatch [regex]::Escape($perm)) {
            $PermsToAdd += "    <uses-permission android:name=`"$perm`" />`n"
            Write-Host "    + Permission: $perm" -ForegroundColor DarkGray
        }
    }
    if ($PermsToAdd.Length -gt 0) {
        $ManifestContent = $ManifestContent -replace '(<manifest[^>]*>)', "`$1`n$PermsToAdd"
    }

    # --- Storage permissions (with maxSdkVersion for legacy) ---
    $StoragePerms = @(
        '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
        '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
        '<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />'
    )
    foreach ($storagePerm in $StoragePerms) {
        $permName = [regex]::Match($storagePerm, 'android:name="([^"]+)"').Groups[1].Value
        if ($ManifestContent -notmatch [regex]::Escape($permName)) {
            $ManifestContent = $ManifestContent -replace '(<manifest[^>]*>)', "`$1`n    $storagePerm"
            Write-Host "    + Permission: $permName" -ForegroundColor DarkGray
        }
    }

    # --- Application attributes ---
    if ($ManifestContent -notmatch 'usesCleartextTraffic') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:usesCleartextTraffic="true"'
    }
    if ($ManifestContent -notmatch 'android:appCategory') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:appCategory="audio"'
    }
    if ($ManifestContent -notmatch 'networkSecurityConfig') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:networkSecurityConfig="@xml/network_security_config"'
    }

    # Disable auto backup
    $ManifestContent = [regex]::Replace($ManifestContent, 'android:allowBackup="[^"]*"', 'android:allowBackup="false"')
    if ($ManifestContent -notmatch 'android:allowBackup=') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:allowBackup="false"'
    }
    $ManifestContent = [regex]::Replace($ManifestContent, 'android:fullBackupContent="[^"]*"', 'android:fullBackupContent="false"')
    if ($ManifestContent -notmatch 'android:fullBackupContent=') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:fullBackupContent="false"'
    }

    # --- Foreground service components (capawesome) ---
    if ($ManifestContent -notmatch 'NotificationActionBroadcastReceiver') {
        $ServiceDecl = @"

        <receiver android:name="io.capawesome.capacitorjs.plugins.foregroundservice.NotificationActionBroadcastReceiver" android:exported="false" />
        <service android:name="io.capawesome.capacitorjs.plugins.foregroundservice.AndroidForegroundService" android:foregroundServiceType="mediaPlayback" android:exported="false" />
"@
        $ManifestContent = $ManifestContent -replace '(</activity>)', "`$1`n$ServiceDecl"
    }

    # --- FileProvider for downloads/share ---
    if ($ManifestContent -notmatch 'capacitor\.android\.FileProvider') {
        $FileProviderDecl = @"

        <provider
            android:name="com.getcapacitor.android.FileProvider"
            android:authorities="`${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
"@
        $ManifestContent = $ManifestContent -replace '(</activity>)', "`$1`n$FileProviderDecl"
    }

    [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $ManifestPath), $ManifestContent, $UTF8NoBOM)
    Write-Host "    Manifest mis a jour" -ForegroundColor Green
}

# ===================================================================
# 5. Gradle — targetSdk 34
# ===================================================================
Write-Host ">>> Verification Gradle targetSdk..." -ForegroundColor Yellow
$BuildGradlePath = "android/app/build.gradle"
if (Test-Path $BuildGradlePath) {
    $GradleContent = Get-Content $BuildGradlePath -Raw
    # Ensure targetSdk is 34 for Google Play
    $GradleContent = $GradleContent -replace 'targetSdk\s*=?\s*\d+', 'targetSdk = 34'
    [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $BuildGradlePath), $GradleContent, $UTF8NoBOM)
    Write-Host "    targetSdk = 34" -ForegroundColor Green
}

# ===================================================================
# 6. MainActivity — WebView settings + notification channel
# ===================================================================
Write-Host ">>> Generation MainActivity.java..." -ForegroundColor Yellow

$JavaSrcBase = "android/app/src/main/java"
$MainActFile = Get-ChildItem -Path $JavaSrcBase -Filter "MainActivity.*" -Recurse | Select-Object -First 1
$PackageDir = $MainActFile.DirectoryName

$ActualPackage = "com.fhm.podcastsphere"
if ($MainActFile) {
    $MainContent = Get-Content $MainActFile.FullName -Raw
    if ($MainContent -match 'package\s+([\w.]+)') {
        $ActualPackage = $Matches[1]
    }
}

$MainActivityJava = @"
package $ActualPackage;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();
    }

    @Override
    protected void onResume() {
        super.onResume();
        WebView wv = getBridge().getWebView();
        if (wv != null) {
            WebSettings ws = wv.getSettings();
            ws.setMediaPlaybackRequiresUserGesture(false);
            ws.setDomStorageEnabled(true);
            ws.setDatabaseEnabled(true);
            ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm == null) return;

            // Playback controls channel (silent)
            NotificationChannel playback = new NotificationChannel(
                "podcast_playback",
                "Lecture Podcast",
                NotificationManager.IMPORTANCE_LOW
            );
            playback.setDescription("Controles de lecture Podcast Sphere");
            playback.setSound(null, null);
            playback.enableVibration(false);
            playback.setShowBadge(false);
            nm.createNotificationChannel(playback);

            // Downloads channel
            NotificationChannel downloads = new NotificationChannel(
                "podcast_downloads",
                "Telechargements",
                NotificationManager.IMPORTANCE_LOW
            );
            downloads.setDescription("Telechargement des episodes");
            downloads.setSound(null, null);
            downloads.enableVibration(false);
            nm.createNotificationChannel(downloads);
        }
    }
}
"@
$MainActivityPath = Join-Path $PackageDir "MainActivity.java"
[System.IO.File]::WriteAllText($MainActivityPath, $MainActivityJava, $UTF8NoBOM)
Write-Host "    MainActivity.java genere ($ActualPackage)" -ForegroundColor Green

# Delete any .kt version
$KtVersion = Join-Path $PackageDir "MainActivity.kt"
if (Test-Path $KtVersion) { Remove-Item $KtVersion -Force; Write-Host "    Suppression MainActivity.kt" -ForegroundColor DarkGray }

# ===================================================================
# 7. Sync & Build
# ===================================================================
Write-Host ">>> Sync Capacitor et build Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: cap sync echoue" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Podcast Sphere v1.0.0 — Build termine!" -ForegroundColor Green
Write-Host " Dossier: $ProjectFolder" -ForegroundColor Green
Write-Host " Package: $ActualPackage" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host ">>> Prochaines etapes:" -ForegroundColor Cyan
Write-Host "    1. npx cap open android" -ForegroundColor White
Write-Host "    2. Build > Generate Signed APK/Bundle" -ForegroundColor White
Write-Host "    3. Tester sur appareil physique" -ForegroundColor White
Write-Host ""
