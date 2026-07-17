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
import com.imobweb.app.data.repository.SyncWorker
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
                    var showSplash by remember { mutableStateOf(true) }
                    var startDestination by remember { mutableStateOf(Routes.LOGIN) }

                    if (showSplash) {
                        SplashScreen(
                            onFinished = {
                                showSplash = false
                            }
                        )
                    } else {
                        val navController = rememberNavController()

                        LaunchedEffect(Unit) {
                            val isLoggedIn = app.sessionManager.isLoggedIn()
                            startDestination = if (isLoggedIn) Routes.HOME else Routes.LOGIN

                            // Schedule periodic sync
                            SyncWorker.schedule(this@MainActivity)

                            // Trigger immediate sync if online
                            if (isLoggedIn) {
                                SyncWorker.syncNow(this@MainActivity)
                            }
                        }

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
