package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.MainContainer
import com.example.ui.screens.RegisterScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.PeaceMindViewModel

class MainActivity : ComponentActivity() {

    // Initialize the Shared Viewmodel safely via lazy delegated factory
    private val viewModel: PeaceMindViewModel by viewModels {
        PeaceMindViewModel.Factory(application)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // Observe the shared dark-mode toggle state
            val darkModesActive by viewModel.darkModeEnabled.collectAsState()
            val currentUser by viewModel.currentUser.collectAsState()

            MyApplicationTheme(darkTheme = darkModesActive) {
                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    val navController = rememberNavController()

                    // Automated Session Routing (Matches Firebase Auth State Listener behavior)
                    LaunchedEffect(currentUser) {
                        val currentRoute = navController.currentBackStackEntry?.destination?.route
                        if (currentUser != null) {
                            if (currentRoute != "main") {
                                navController.navigate("main") {
                                    popUpTo(0) { inclusive = true }
                                }
                            }
                        } else {
                            if (currentRoute != "login" && currentRoute != "register") {
                                navController.navigate("login") {
                                    popUpTo(0) { inclusive = true }
                                }
                            }
                        }
                    }

                    NavHost(
                        navController = navController,
                        startDestination = if (currentUser != null) "main" else "login"
                    ) {
                        composable("login") {
                            LoginScreen(
                                viewModel = viewModel,
                                onNavigateToRegister = {
                                    navController.navigate("register")
                                },
                                onLoginSuccess = {
                                    // Managed safely by automated LaunchedEffect session block above
                                }
                            )
                        }

                        composable("register") {
                            RegisterScreen(
                                viewModel = viewModel,
                                onNavigateToLogin = {
                                    navController.navigate("login") {
                                        popUpTo("register") { inclusive = true }
                                    }
                                },
                                onRegisterSuccess = {
                                    // Managed safely by automated LaunchedEffect session block above
                                }
                            )
                        }

                        composable("main") {
                            MainContainer(
                                viewModel = viewModel,
                                onLogoutNavigate = {
                                    // Managed safely by automated LaunchedEffect session block above
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
