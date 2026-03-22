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

# -- LA CORRECTION EST ICI --
Write-Host ">>> Nettoyage et ajout de la plateforme Android..." -ForegroundColor Yellow
if (Test-Path "android") {
    Write-Host "    Dossier 'android' detecte depuis Git. Suppression pour un build propre..." -ForegroundColor DarkGray
    Remove-Item -Recurse -Force "android"
}

npx cap add android
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR CRITIQUE: npx cap add android a echoue" -ForegroundColor Red; exit 1 }

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
# 3c. Android Auto automotive_app_desc.xml
# ===================================================================
Write-Host ">>> Copie de automotive_app_desc.xml..." -ForegroundColor Yellow
$AutoDescSrc = "android-auto/res/xml/automotive_app_desc.xml"
if (Test-Path $AutoDescSrc) {
    Copy-Item $AutoDescSrc "$XmlDir/automotive_app_desc.xml" -Force
    Write-Host "    automotive_app_desc.xml copie" -ForegroundColor Green
}

# ===================================================================
# 3d. Podcast placeholder image for Android Auto
# ===================================================================
Write-Host ">>> Copie du placeholder podcast..." -ForegroundColor Yellow
$PlaceholderSrc = "src/assets/station-placeholder.png"
if (Test-Path $PlaceholderSrc) {
    Copy-Item $PlaceholderSrc "$DrawablePath/podcast_placeholder.png" -Force
    Write-Host "    podcast_placeholder.png copie" -ForegroundColor Green
}

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
        '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />',
        '<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation" />',
        '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />'
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

    # Foreground service receiver + service
    if ($ManifestContent -notmatch 'NotificationActionBroadcastReceiver') {
        $AppInjections += @(
            '        <receiver android:name="io.capawesome.capacitorjs.plugins.foregroundservice.NotificationActionBroadcastReceiver" android:exported="false" />',
            '        <service android:name="io.capawesome.capacitorjs.plugins.foregroundservice.AndroidForegroundService" android:foregroundServiceType="mediaPlayback" android:exported="false" />'
        ) -join "`n"
        $AppInjections += "`n"
    }

    # FileProvider
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
        $AppInjections += "`n"
    }

    # PodcastBrowserService (Android Auto)
    if ($ManifestContent -notmatch 'PodcastBrowserService') {
        $AppInjections += @(
            '',
            '        <service',
            '            android:name="com.fhm.podcastsphere.PodcastBrowserService"',
            '            android:foregroundServiceType="mediaPlayback"',
            '            android:exported="true">',
            '            <intent-filter>',
            '                <action android:name="android.media.browse.MediaBrowserService" />',
            '            </intent-filter>',
            '        </service>'
        ) -join "`n"
        $AppInjections += "`n"
    }

    # MediaToggleReceiver
    if ($ManifestContent -notmatch 'MediaToggleReceiver') {
        $AppInjections += @(
            '',
            '        <receiver',
            '            android:name="com.fhm.podcastsphere.MediaToggleReceiver"',
            '            android:exported="false">',
            '            <intent-filter>',
            '                <action android:name="com.fhm.podcastsphere.MEDIA_TOGGLE" />',
            '            </intent-filter>',
            '        </receiver>'
        ) -join "`n"
        $AppInjections += "`n"
    }

    # MediaButtonReceiver
    if ($ManifestContent -notmatch 'MediaButtonReceiver') {
        $AppInjections += @(
            '',
            '        <receiver',
            '            android:name="androidx.media.session.MediaButtonReceiver"',
            '            android:exported="true">',
            '            <intent-filter>',
            '                <action android:name="android.intent.action.MEDIA_BUTTON" />',
            '            </intent-filter>',
            '        </receiver>'
        ) -join "`n"
        $AppInjections += "`n"
    }

    # CastOptionsProvider meta-data
    if ($ManifestContent -notmatch 'CastOptionsProvider') {
        $AppInjections += @(
            '',
            '        <meta-data',
            '            android:name="com.google.android.gms.cast.framework.OPTIONS_PROVIDER_CLASS_NAME"',
            '            android:value="com.fhm.podcastsphere.CastOptionsProvider" />'
        ) -join "`n"
        $AppInjections += "`n"
    }

    # Android Auto automotive_app_desc meta-data
    if ($ManifestContent -notmatch 'automotive_app_desc') {
        $AppInjections += @(
            '',
            '        <meta-data',
            '            android:name="com.google.android.gms.car.application"',
            '            android:resource="@xml/automotive_app_desc" />'
        ) -join "`n"
        $AppInjections += "`n"
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
Write-Host ">>> Configuration Gradle (targetSdk + dependencies)..." -ForegroundColor Yellow
$BuildGradlePath = "android/app/build.gradle"
if (Test-Path $BuildGradlePath) {
    $GradleContent = Get-Content $BuildGradlePath -Raw
    $GradleContent = $GradleContent -replace 'targetSdk\s*=?\s*\d+', 'targetSdk = 34'

    $NativeDeps = @(
        "implementation 'com.google.android.exoplayer:exoplayer-core:2.19.1'",
        "implementation 'com.google.android.exoplayer:exoplayer-ui:2.19.1'",
        "implementation 'androidx.media:media:1.7.0'",
        "implementation 'com.google.android.gms:play-services-cast-framework:21.4.0'",
        "implementation 'androidx.mediarouter:mediarouter:1.7.0'"
    )

    foreach ($dep in $NativeDeps) {
        $depArtifact = [regex]::Match($dep, "'([^']+)'").Groups[1].Value
        $depName = $depArtifact.Split(':')[0..1] -join ':'
        if ($GradleContent -notmatch [regex]::Escape($depName)) {
            $GradleContent = $GradleContent -replace '(dependencies\s*\{)', "`$1`n    $dep"
        }
    }

    [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $BuildGradlePath), $GradleContent, $UTF8NoBOM)
    Write-Host "    Gradle mis a jour avec succes" -ForegroundColor Green
}

# ===================================================================
# 6. MainActivity -- WebView settings + notification channel
# ===================================================================
Write-Host ">>> Generation MainActivity.java..." -ForegroundColor Yellow

$JavaSrcBase = "android/app/src/main/java"
$MainActFile = Get-ChildItem -Path $JavaSrcBase -Filter "MainActivity.*" -Recurse | Select-Object -First 1

if (-Not $MainActFile) {
    Write-Host "ERREUR CRITIQUE: MainActivity introuvable. Le projet Android ne s'est pas genere correctement." -ForegroundColor Red
    exit 1
}

$PackageDir = $MainActFile.DirectoryName
$ActualPackage = "com.fhm.podcastsphere"
$MainContent = Get-Content $MainActFile.FullName -Raw
if ($MainContent -match 'package\s+([\w.]+)') {
    $ActualPackage = $Matches[1]
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
    '',
    '        // Register native plugins',
    '        registerPlugin(CastPlugin.class);',
    '        registerPlugin(PodcastAutoPlugin.class);',
    '    }',
    '',
    '    @Override',
    '    public void onResume() {',
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
# 7. Copie des fichiers Java natifs
# ===================================================================
Write-Host ">>> Copie des fichiers Java natifs..." -ForegroundColor Yellow

$JavaFiles = @(
    "CastPlugin.java",
    "CastOptionsProvider.java",
    "PodcastBrowserService.java",
    "PodcastAutoPlugin.java",
    "MediaToggleReceiver.java"
)

foreach ($jf in $JavaFiles) {
    $src = "android-auto/$jf"
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $PackageDir $jf) -Force
        Write-Host "    $jf copie vers $PackageDir" -ForegroundColor Green
    } else {
        Write-Host "    ATTENTION: $src introuvable" -ForegroundColor Yellow
    }
}

# ===================================================================
# 8. Synchronisation Finale
# ===================================================================
Write-Host ">>> Synchronisation Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR: npx cap sync a echoue" -ForegroundColor Red; exit 1 }

# ===================================================================
# 9. Ouverture Android Studio
# ===================================================================
Write-Host ">>> Ouverture Android Studio..." -ForegroundColor Yellow
npx cap open android

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host " Succes ! Android Studio demarre automatiquement." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
