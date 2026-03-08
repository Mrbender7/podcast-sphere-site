# podcastsphere_v1_0_0.ps1
# Podcast Sphere v1.0.0 — Build script for Android (Capacitor)
# Target: E:\Projets\Podcastsphere
# Package: com.fhm.podcastsphere

$RepoUrl = "https://github.com/Mrbender7/podcast-sphere"
$ProjectFolder = "E:\Projets\Podcastsphere"
$UTF8NoBOM = New-Object System.Text.UTF8Encoding($False)

Write-Host ">>> Podcast Sphere v1.0.0 — Build Android" -ForegroundColor Cyan

# ===================================================================
# 0. Clone or update repo
# ===================================================================
if (Test-Path $ProjectFolder) {
    Write-Host ">>> Dossier existant, suppression..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $ProjectFolder
}
git clone $RepoUrl $ProjectFolder
cd $ProjectFolder
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
  "server": { "androidScheme": "https", "allowNavigation": ["*"] }
}
"@
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "capacitor.config.json"), $ConfigJSON, $UTF8NoBOM)

# ===================================================================
# 2. Install & Build
# ===================================================================
Write-Host ">>> Installation des dependances et build..." -ForegroundColor Yellow
npm install --legacy-peer-deps
npm install @capacitor/core @capacitor/cli @capawesome-team/capacitor-android-foreground-service @capacitor/app @capacitor/local-notifications @capacitor/share
npm run build
npm install @capacitor/android
npx cap add android

# ===================================================================
# 3. Notification icons (fallback from launcher icons)
# ===================================================================
Write-Host ">>> Generation des icones de notification..." -ForegroundColor Yellow

$sizes = @{ "mdpi"=24; "hdpi"=36; "xhdpi"=48; "xxhdpi"=72; "xxxhdpi"=96 }
foreach ($density in $sizes.Keys) {
    $dir = "android/app/src/main/res/drawable-$density"
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }
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
if (!(Test-Path $DrawablePath)) { New-Item -ItemType Directory -Path $DrawablePath -Force }
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
# 4. MANIFEST — Permissions (simplified, no Android Auto/Cast)
# ===================================================================
$ManifestPath = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $ManifestPath) {
    Write-Host ">>> Manifest: Injection des permissions..." -ForegroundColor Yellow
    $ManifestContent = Get-Content $ManifestPath -Raw

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

    # usesCleartextTraffic
    if ($ManifestContent -notmatch 'usesCleartextTraffic') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:usesCleartextTraffic="true"'
    }

    # appCategory="audio"
    if ($ManifestContent -notmatch 'android:appCategory') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:appCategory="audio"'
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

    # networkSecurityConfig
    if ($ManifestContent -notmatch 'networkSecurityConfig') {
        $ManifestContent = $ManifestContent -replace '<application', '<application android:networkSecurityConfig="@xml/network_security_config"'
    }

    # Foreground service components (capawesome)
    $ServiceDecl = @"
    <receiver android:name="io.capawesome.capacitorjs.plugins.foregroundservice.NotificationActionBroadcastReceiver" />
    <service android:name="io.capawesome.capacitorjs.plugins.foregroundservice.AndroidForegroundService" android:foregroundServiceType="mediaPlayback" />
"@
    $ManifestContent = $ManifestContent -replace '(<application[^>]*>)', "`$1`n$ServiceDecl"

    [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $ManifestPath), $ManifestContent, $UTF8NoBOM)
}

# ===================================================================
# 5. Gradle — No ExoPlayer, no Cast, no MediaCompat
# ===================================================================
# No additional Gradle dependencies needed for podcast mode.
# Audio is played via HTML5 Audio in the WebView.
Write-Host ">>> Gradle: Aucune dependance native supplementaire requise" -ForegroundColor Green

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
        createSilentChannel();
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

    private void createSilentChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "podcast_playback",
                "Podcast Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Podcast Sphere playback controls");
            channel.setSound(null, null);
            channel.enableVibration(false);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
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

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Podcast Sphere v1.0.0 — Build termine!" -ForegroundColor Green
Write-Host " Dossier: $ProjectFolder" -ForegroundColor Green
Write-Host " Package: $ActualPackage" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host ">>> Ouvrez Android Studio:" -ForegroundColor Cyan
Write-Host "    npx cap open android" -ForegroundColor White
