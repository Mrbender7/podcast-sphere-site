# podcastsphere_v1_0_0.ps1
# Podcast Sphere v1.0.0 -- Build script Android (Clean Clone)
# Target: E:\Projets\Podcastsphere
# Package: com.fhm.podcastsphere

$RepoUrl = "https://github.com/Mrbender7/podcast-sphere"
$ProjectFolder = "E:\Projets\Podcastsphere"
$UTF8NoBOM = New-Object System.Text.UTF8Encoding($False)

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Podcast Sphere v1.0.0 -- Build Android (Clean)" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# ===================================================================
# 0. Clone ou mise a jour du repo (Clean Slate)
# ===================================================================
if (Test-Path $ProjectFolder) {
    Write-Host ">>> Dossier existant, suppression pour un depart clean..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $ProjectFolder
}
Write-Host ">>> Clonage du depot..." -ForegroundColor Yellow
git clone $RepoUrl $ProjectFolder
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: git clone a echoue" -ForegroundColor Red; exit 1 }

Set-Location $ProjectFolder
[System.Environment]::CurrentDirectory = (Get-Location).Path
Write-Host ">>> Dossier de travail : $ProjectFolder" -ForegroundColor Green

# ===================================================================
# 1. Configuration Capacitor
# ===================================================================
Write-Host ">>> Configuration Capacitor..." -ForegroundColor Yellow

$ConfigJSON = @(
    '{',
    '  "appId": "com.fhm.podcastsphere",',
    '  "appName": "Podcast Sphere",',
    '  "webDir": "dist",',
    '  "server": {',
    '    "androidScheme": "https",',
    '    "cleartext": true,',
    '    "allowNavigation": ["*"]',
    '  },',
    '  "plugins": {',
    '    "LocalNotifications": {',
    '      "smallIcon": "ic_notification",',
    '      "iconColor": "#6080ff"',
    '    },',
    '    "CapacitorHttp": {',
    '      "enabled": true',
    '    }',
    '  }',
    '}'
) -join "`n"

[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "capacitor.config.json"), $ConfigJSON, $UTF8NoBOM)

# ===================================================================
# 2. Installation & Build
# ===================================================================
Write-Host ">>> Installation des dependances NPM..." -ForegroundColor Yellow
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: npm install a echoue" -ForegroundColor Red; exit 1 }

Write-Host ">>> Installation des plugins Capacitor..." -ForegroundColor Yellow
npm install @capacitor/core @capacitor/cli @capacitor/android `
    @capacitor/app @capacitor/browser @capacitor/filesystem `
    @capacitor/local-notifications @capacitor/share `
    @capawesome-team/capacitor-android-foreground-service `
    --legacy-peer-deps

Write-Host ">>> Build Vite..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: le build a echoue" -ForegroundColor Red; exit 1 }

Write-Host ">>> Ajout de la plateforme Android..." -ForegroundColor Yellow
npx cap add android

# ===================================================================
# 3. Icones de notification
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
    }
}

$DrawablePath = "android/app/src/main/res/drawable"
if (!(Test-Path $DrawablePath)) { New-Item -ItemType Directory -Path $DrawablePath -Force | Out-Null }
$FallbackSrc = "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
if (Test-Path $FallbackSrc) {
    Copy-Item $FallbackSrc "$DrawablePath/ic_notification.png" -Force
}

# ===================================================================
# 3b. Fichiers XML de securite et partages
# ===================================================================
Write-Host ">>> Generation des fichiers XML (Securite & File Paths)..." -ForegroundColor Yellow
$XmlDir = "android/app/src/main/res/xml"
if (!(Test-Path $XmlDir)) { New-Item -ItemType Directory -Path $XmlDir -Force | Out-Null }

$NetSecContent = @(
    '<?xml version="1.0" encoding="utf-8"?>',
    '<network-security-config>',
    '    <base-config cleartextTrafficPermitted="true">',
    '        <trust-anchors>',
    '            <certificates src="system" />',
    '        </trust-anchors>',
    '    </base-config>',
    '</network-security-config>'
) -join "`n"
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "$XmlDir/network_security_config.xml"), $NetSecContent, $UTF8NoBOM)

$FilePathsContent = @(
    '<?xml version="1.0" encoding="utf-8"?>',
    '<paths>',
    '    <external-path name="external_files" path="." />',
    '    <cache-path name="cache" path="." />',
    '    <files-path name="internal_files" path="." />',
    '</paths>'
) -join "`n"
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "$XmlDir/file_paths.xml"), $FilePathsContent, $UTF8NoBOM)

# ===================================================================
# 4. Injections propres dans l'AndroidManifest.xml
# ===================================================================
$ManifestPath = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $ManifestPath) {
    Write-Host ">>> Manifest: Injection des permissions et services..." -ForegroundColor Yellow
    $ManifestContent = Get-Content $ManifestPath -Raw

    $PermsList = @(
        '<uses-permission android:name="android.permission.INTERNET" />',
        '<uses-permission android:name="android.permission.WAKE_LOCK" />',
        '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
        '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />',
        '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
        '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
        '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
        '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
        '<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />',
        '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />'
    )

    $PermsToAdd = ""
    foreach ($perm in $PermsList) {
        $permName = [regex]::Match($perm, 'android:name="([^"]+)"').Groups[1].Value
        if ($ManifestContent -notmatch [regex]::Escape($permName)) {
            $PermsToAdd += "    $perm`n"
        }
    }
    
    if ($PermsToAdd.Length -gt 0) {
        $ManifestContent = $ManifestContent -replace '(?s)(<application)', "$PermsToAdd`n    `$1"
    }

    if ($ManifestContent -notmatch 'usesCleartextTraffic') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:usesCleartextTraffic="true"'
    }
    if ($ManifestContent -notmatch 'android:appCategory') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:appCategory="audio"'
    }
    if ($ManifestContent -notmatch 'networkSecurityConfig') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:networkSecurityConfig="@xml/network_security_config"'
    }

    $ManifestContent = [regex]::Replace($ManifestContent, 'android:allowBackup="[^"]*"', 'android:allowBackup="false"')
    if ($ManifestContent -notmatch 'android:allowBackup=') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:allowBackup="false"'
    }
    $ManifestContent = [regex]::Replace($ManifestContent, 'android:fullBackupContent="[^"]*"', 'android:fullBackupContent="false"')
    if ($ManifestContent -notmatch 'android:fullBackupContent=') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:fullBackupContent="false"'
    }

    $AppInjections = ""
    if ($ManifestContent -notmatch 'NotificationActionBroadcastReceiver') {
        $AppInjections += @(
            '        <receiver android:name="io.capawesome.capacitorjs.plugins.foregroundservice.NotificationActionBroadcastReceiver" android:exported="false" />',
            '        <service android:name="io.capawesome.capacitorjs.plugins.foregroundservice.AndroidForegroundService" android:foregroundServiceType="mediaPlayback" android:exported="false" />'
        ) -join "`n"
        $AppInjections += "`n"
    }

    if ($ManifestContent -notmatch 'capacitor\.android\.FileProvider') {
        $AppInjections += @(
            '',
            '        <provider',
            '            android:name="com.getcapacitor.android.FileProvider"',
            '            android:authorities="${applicationId}.fileprovider"',
            '            android:exported="false"',
            '            android:grantUriPermissions="true">',
            '            <meta-data',
            '                android:name="android.support.FILE_PROVIDER_PATHS"',
            '                android:resource="@xml/file_paths" />',
            '        </provider>'
        ) -join "`n"
    }

    if ($AppInjections.Length -gt 0) {
        $ManifestContent = $ManifestContent -replace '(?s)(</application>)', "$AppInjections`n    `$1"
    }

    [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $ManifestPath), $ManifestContent, $UTF8NoBOM)
    Write-Host "    Manifest mis a jour avec succes" -ForegroundColor Green
}

# ===================================================================
# 5. Configuration Gradle
# ===================================================================
Write-Host ">>> Verification Gradle targetSdk..." -ForegroundColor Yellow
$BuildGradlePath = "android/app/build.gradle"
if (Test-Path $BuildGradlePath) {
    $GradleContent = Get-Content $BuildGradlePath -Raw
    $GradleContent = $GradleContent -replace 'targetSdk\s*=?\s*\d+', 'targetSdk = 34'
    [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $BuildGradlePath), $GradleContent, $UTF8NoBOM)
}

# ===================================================================
# 6. MainActivity -- WebView settings + notification channel
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

$MainActivityJava = @(
    "package $ActualPackage;",
    "",
    'import android.app.NotificationChannel;',
    'import android.app.NotificationManager;',
    'import android.os.Build;',
    'import android.os.Bundle;',
    'import android.webkit.WebSettings;',
    'import android.webkit.WebView;',
    'import com.getcapacitor.BridgeActivity;',
    '',
    'public class MainActivity extends BridgeActivity {',
    '',
    '    @Override',
    '    protected void onCreate(Bundle savedInstanceState) {',
    '        super.onCreate(savedInstanceState);',
    '        createNotificationChannels();',
    '    }',
    '',
    '    @Override',
    '    protected void onResume() {',
    '        super.onResume();',
    '        WebView wv = getBridge().getWebView();',
    '        if (wv != null) {',
    '            WebSettings ws = wv.getSettings();',
    '            ws.setMediaPlaybackRequiresUserGesture(false);',
    '            ws.setDomStorageEnabled(true);',
    '            ws.setDatabaseEnabled(true);',
    '            ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);',
    '        }',
    '    }',
    '',
    '    private void createNotificationChannels() {',
    '        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {',
    '            NotificationManager nm = getSystemService(NotificationManager.class);',
    '            if (nm == null) return;',
    '',
    '            NotificationChannel playback = new NotificationChannel(',
    '                "podcast_playback",',
    '                "Lecture Podcast",',
    '                NotificationManager.IMPORTANCE_LOW',
    '            );',
    '            playback.setDescription("Controles de lecture Podcast Sphere");',
    '            playback.setSound(null, null);',
    '            playback.enableVibration(false);',
    '            playback.setShowBadge(false);',
    '            nm.createNotificationChannel(playback);',
    '',
    '            NotificationChannel downloads = new NotificationChannel(',
    '                "podcast_downloads",',
    '                "Telechargements",',
    '                NotificationManager.IMPORTANCE_LOW',
    '            );',
    '            downloads.setDescription("Telechargement des episodes");',
    '            downloads.setSound(null, null);',
    '            downloads.enableVibration(false);',
    '            nm.createNotificationChannel(downloads);',
    '        }',
    '    }',
    '}'
) -join "`n"

$MainActivityPath = Join-Path $PackageDir "MainActivity.java"
[System.IO.File]::WriteAllText($MainActivityPath, $MainActivityJava, $UTF8NoBOM)

$KtVersion = Join-Path $PackageDir "MainActivity.kt"
if (Test-Path $KtVersion) { Remove-Item $KtVersion -Force }

# ===================================================================
# 7. Synchronisation Finale
# ===================================================================
Write-Host ">>> Synchronisation Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: npx cap sync a echoue" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host " Succes ! Ton projet est pret pour Android Studio." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
