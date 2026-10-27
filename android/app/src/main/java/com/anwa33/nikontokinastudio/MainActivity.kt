package com.anwa33.nikontokinastudio

import android.graphics.Color
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.Theme_NikonTokinaStudio)
        super.onCreate(savedInstanceState)

        val webView = WebView(this)
        webView.setBackgroundColor(Color.BLACK)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.databaseEnabled = true
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.webViewClient = WebViewClient()

        setContentView(webView)
        webView.loadUrl("file:///android_asset/nikon_d3400_tokina_studio.html")
    }
}
