package com.imobweb.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.imobweb.app.navigation.AppNavGraph
import com.imobweb.app.navigation.Routes
import com.imobweb.app.ui.splash.SplashScreen
import com.imobweb.app.ui.theme.ImobWebTheme
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as ImobWebApp

        setContent {
            ImobWebTheme(darkTheme = true) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var isCheckingSession by remember { mutableStateOf(true) }
                    var startDestination by remember { mutableStateOf(Routes.LOGIN) }

                    LaunchedEffect(Unit) {
                        val isLoggedIn = app.sessionManager.isLoggedIn()
                        // Quem já usa o app (mesmo sem login) vai direto para a Home
                        val hasLocalData = app.database.vistoriaDao().getAllOnce().isNotEmpty()
                        startDestination = if (isLoggedIn || hasLocalData) Routes.HOME else Routes.LOGIN
                        isCheckingSession = false
                        // A sincronização acontece na Home e pelo SyncWorker (agendado no Application)
                    }

                    var splashFinished by remember { mutableStateOf(false) }

                    if (!splashFinished || isCheckingSession) {
                        SplashScreen(
                            onFinished = {
                                splashFinished = true
                            }
                        )
                    } else {
                        val navController = rememberNavController()

                        AppNavGraph(
                            navController = navController,
                            repository = app.repository,
                            startDestination = startDestination
                        )
                    }
                }
            }
        }
    }
}
